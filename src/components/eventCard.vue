<template>
  <div>
    <ul>
      <li>Token: {{event.name}}</li>
      <li>From: {{event.decode._from}}</li>
      <li>To: {{event.decode._to}}</li>
      <li>Value: {{event.decode._value}}</li>
      <li>Confirmed: {{event.confirm}}</li>
    </ul>
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
