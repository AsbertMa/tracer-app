<template>
    <form style="width: 500px; margin-left: 20px">
        <div class="has-text-left has-text-weight-bold">Tokens:</div>
        <div class="columns is-multiline">
            <div
                class="column has-text-left is-one-third"
                v-for="token in tokens"
                :key="token.address"
            >
                <label class="checkbox" :disabled="disabled">
                    <input
                        :disabled="disabled"
                        v-model="tokenAddress"
                        type="checkbox"
                        :value="token.address"
                    />
                    {{token.name}}
                </label>
            </div>
        </div>
        <div class="has-text-left has-text-weight-bold">Address (split by ','):</div>
        <textarea
            class="textarea"
            :disabled="disabled"
            v-model="address"
            style="resize: none; width: 100%"
            rows="5"
        ></textarea>
        <br />
        <button
            v-if="!disabled"
            class="button is-primary"
            :disabled="disabled"
            type="button"
            @click="checkCondation"
        >OK</button>
        <button v-if="disabled" class="button is-primary" type="button" @click="stop">Stop</button>
    </form>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
@Component
export default class Params extends Vue {
    @Prop(Array)
    private tokens?: any[]

    @Prop({ default: true })
    private stoped?: boolean

    private address: string = ''
    private tokenAddress: string[] = []

    private disabled = false

    get accounts() {
        return this.address.trim().split(',').map(item => {
            return item.trim().toLowerCase()
        })
    }

    @Watch('stoped')
    public onStopChange() {
        this.disabled = !this.stoped
    }
    public stop() {
        this.$emit('stop')
    }

    public checkCondation() {
        this.$emit('check', { tokens: this.tokenAddress, accounts: this.accounts })
        this.disabled = true
    }
}
</script>
