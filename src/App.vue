<template>
    <div id="app">
        <h1>Thor-tracer</h1>
        <Params @check="getCondations" :tokens="tokens" />
        <div>
            <ul>
                <li v-for="(e, i) in eventResult" :key="i">
                    {{e}}
                </li>
            </ul>
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
    private tokens: any[] = []

    private tracer?: Tracer
    private async beforeCreate() {
        const net = connex.thor.genesis.id === '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a' ? 'main' : 'test'
        this.tokens = await getTokens(net)
    }

    private eventList: any[] = []

    private blocks: any = {}

    private eventAbi = new abi.Event({
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "_to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    })
    get eventResult() {
        return this.eventList.map(item => {
            return {
                ...item,
                ...this.blocks[item.blockId]
            }
        })
    }
    getCondations(data: any) {
        const tokens: string[] = data.tokens
        const address: string[] = data.accounts
        this.tracer = new Tracer({
            filter: {
                transfer: false
            },
            eventFilter: (item) => {
                if (tokens.indexOf(item.address) > -1) {
                    const dec = this.eventAbi.decode(item.data, item.topics)
                    return (address.indexOf(dec['_from']) > -1 || address.indexOf(dec['_to']) > -1)
                } else {
                    return false
                }
            }
        }, connex)

        this.tracer.events.on('caught', (r: Analyze.blockResult) => {
            const blockId = r.blockId
            const temp = r.events.map(item => {
                return {
                    address: item.address,
                    txId: item.txId,
                    blockId: blockId,
                    decode: this.eventAbi.decode(item.data, item.topics)
                }
            })

            this.eventList = [...this.eventList, ...temp]
        })

        this.tracer.events.on('confirm', (data: any) => {
            this.blocks = {}
            data.forEach((item: any) => {
                this.blocks[item.blockId] = {
                    isTrunk: item.isTrunk,
                    confirm: item.confirm
                }
            })
        })
        this.tracer.start()
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
