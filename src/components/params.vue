<template>
    <form style="max-width: 600px">
        <template v-for="token in tokens">
            <div
                style="width: 200px; display: inline-block; text-align: left;"
                :key="token.address"
            >
                <label>
                    <input v-model="tokenAddress" type="checkbox" :value="token.address" />
                    <span>{{token.name}}</span>
                </label>
            </div>
        </template>
        <textarea v-model="address" style="resize: none; width: 100%" rows="10"></textarea>
        <button type="button" @click="checkCondation">OK</button>
    </form>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class Params extends Vue {
    @Prop(Array)
    private tokens?: any[]
    private address: string = ''
    private tokenAddress: string[] = []

    get accounts() {
      return this.address.trim().split(',').map(item => {
        return item.trim().toLowerCase()
      })
    }

    public checkCondation() {
      this.$emit('check', {tokens: this.tokenAddress, accounts: this.accounts})
    }
}
</script>
