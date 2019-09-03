<template>
    <div id="app">
        <h1 class="is-size-2">Thor-tracer Demo</h1>
        <div class="columns is-multiline is-centered">
            <div class="column is-8">
                <ul class="has-text-left">
                    <li v-if="start">
                        On Start:
                        <ul>
                            <li>ID: <span class="is-family-monospace has-text-weight-bold">{{start.id}}</span></li>
                            <li>Number: {{start.number}}</li>
                        </ul>
                    </li>
                    <li><br></li>
                    <li v-if="stop">
                        On Stop:
                        <ul>
                            <li>ID: <span class="is-family-monospace has-text-weight-bold">{{stop.id}}</span></li>
                            <li>Number: {{stop.number}}</li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div class="column is-8">
                <Params :stoped="stop" @check="getCondations" :tokens="tokens" @stop="stopTracer" />
            </div>
            <div class="column is-8">
                <table class="table is-fullwidth is-narrow">
                    <thead>
                        <tr>
                            <th>Token</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value</th>
                            <th>TxId</th>
                            <th>BlockID</th>
                            <th>Confirmed</th>
                            <th>Is Trunk</th>
                        </tr>
                    </thead>
                    <tbody v-if="eventResult.length">
                        <tr :style="getRowStyle(e.confirm)" v-for="(e, i) in eventResult" :key="i">
                            <td>
                                <img :src="e.icon" width="20px" alt />
                            </td>
                            <td class="is-family-monospace has-text-weight-bold">
                                <span
                                    :class="{'has-text-primary': inAccount(e.decode._from)}"
                                >{{e.decode._from | toChecksumAddress | shortAddress}}</span>
                            </td>
                            <td
                                class="is-family-monospace has-text-weight-bold"
                                :class="{'has-text-primary': inAccount(e.decode._to)}"
                            >
                                <span>{{e.decode._to | toChecksumAddress | shortAddress}}</span>
                            </td>
                            <td
                                class="is-family-monospace has-text-weight-bold"
                            >{{e.decode._value | balance}}</td>
                            <td class="is-family-monospace has-text-weight-bold">
                                <a
                                    target="_blank"
                                    :href="`https://insight.vecha.in/#/txs/${e.txId}`"
                                >{{e.txId | shortAddress}}</a>
                            </td>
                            <td
                                class="is-family-monospace has-text-weight-bold"
                            >{{e.blockId | shortAddress}}</td>
                            <td class="is-family-monospace has-text-weight-bold">{{e.confirm}}</td>
                            <td
                                :class="{'has-text-primary': e.isTrunk}"
                                class="is-family-monospace has-text-weight-bold"
                            >{{e.isTrunk}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Tracer, Analyze } from 'thor-tracer'
import Params from './components/params.vue'
import { Component, Vue } from 'vue-property-decorator'
import { getTokens } from './tokens'
import { abi } from 'thor-devkit'

@Component({
    components: {
        Params
    }
})
export default class App extends Vue {
    get eventResult() {
        return this.eventList.map(item => {
            return {
                ...item,
                ...this.blocks[item.blockId],
                name: this.tokensObj[item.address].name,
                icon: `https://vechain.github.io/token-registry/assets/${this.tokensObj[item.address].icon}`
            }
        })
    }
    private tokens: any[] = []
    private tokensObj: any = {}
    private address: string[] = []

    private start?: Connex.Thor.Status['head'] | null = null
    private stop?: Connex.Thor.Status['head'] | null = null

    private tracer?: Tracer

    private eventList: any[] = []
    private checkNum = 12

    private isStoped = true

    private blocks: any = {}

    private eventAbi = new abi.Event({
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: '_from',
                type: 'address'
            },
            {
                indexed: true,
                name: '_to',
                type: 'address'
            },
            {
                indexed: false,
                name: '_value',
                type: 'uint256'
            }
        ],
        name: 'Transfer',
        type: 'event'
    })

    public getRowStyle(num: number) {
        return `background: linear-gradient(to right, rgba(32, 156, 238, 0.2) ${num / this.checkNum * 100}%, transparent ${num / this.checkNum * 100}%);`
    }
    public inAccount(address: string) {
        return this.address.indexOf(address) > -1
    }

    public getCondations(data: any) {
        const tokens: string[] = data.tokens
        const address: string[] = data.accounts
        this.address = data.accounts
        this.tracer = new Tracer({
            filter: {
                transfer: false
            },
            eventFilter: (item) => {
                if (tokens.indexOf(item.address) > -1) {
                    const dec = this.eventAbi.decode(item.data, item.topics)
                    return address.length
                        ? (address.indexOf(dec._from) > -1 || address.indexOf(dec._to) > -1)
                        : true
                } else {
                    return false
                }
            }
        }, connex)
        this.tracer.setCheckNum(this.checkNum)
        this.bindEvent()
        this.tracer.start()
    }

    public bindEvent() {
        if (this.tracer) {
            this.tracer.events.on('caught', (r: Analyze.blockResult) => {
                const blockId = r.blockId
                const temp = r.events.map(item => {
                    return {
                        address: item.address,
                        txId: item.txId,
                        blockId,
                        decode: this.eventAbi.decode(item.data, item.topics)
                    }
                })
                this.eventList = [...this.eventList, ...temp]
            })
            this.tracer.events.on('start', (result: Connex.Thor.Status['head']) => {
                this.isStoped = false
                this.start = result
                this.stop = null
            })
            this.tracer.events.on('stop', (result: Connex.Thor.Status['head']) => {
                this.isStoped = true
                this.stop = result
            })

            this.tracer.events.on('confirm', (list: Tracer.confirmed[]) => {
                this.blocks = {}
                list.forEach((item: Tracer.confirmed) => {
                    if (!item.isTrunk || item.confirm < this.tracer!.CheckNum) {
                        this.blocks[item.blockID] = {
                            isTrunk: item.isTrunk,
                            confirm: item.confirm
                        }
                    }
                })
                const blockIDs = Object.keys(this.blocks)
                this.eventList = this.eventList.filter(item => {
                    return blockIDs.indexOf(item.blockId) > -1
                })
            })
        }
    }

    public stopTracer() {
        this.tracer!.stop()
        this.tracer!.events.removeAllListeners(['start', 'stop', 'caught', 'confirm'])
    }

    private async beforeCreate() {
        const net = connex.thor.genesis.id === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' ? 'main' : 'test'
        this.tokens = await getTokens(net)

        this.tokens.forEach(item => {
            this.tokensObj[item.address] = item
        })
    }
}
</script>

<style>
#app {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
