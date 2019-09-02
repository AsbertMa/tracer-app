<template>
    <div style="width: 500px">
        <div class="columns is-multiline">
          <div class="column is-one-third">
            <img width="100px" height="100px" :src="event.icon" />
          </div>
          <div class="column">Token: {{event.name}} </div>
          <div class="column">From: {{event.decode._from | toChecksumAddress | shortAddress}}</div>
          <div class="column">To: {{event.decode._to | toChecksumAddress | shortAddress}}</div>
          <div class="column">Value: {{event.decode._value | balance}}</div>
          <div class="column">Confirmed: {{event.confirm}}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class EventCard extends Vue {
    @Prop()
    private event: any
}
</script>
