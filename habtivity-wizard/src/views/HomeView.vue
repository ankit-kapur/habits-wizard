<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RecordedThingCard from "@/components/RecordedThingCard.vue"; // @ is an alias to /src
import { useThingsStore } from "@/store/ThingsStore";
import { useAreasStore } from "@/store/AreasStore";
import { useRecordedThingsStore } from "@/store/RecordedThingsStore";

@Component({
  components: {
    RecordedThingCard: RecordedThingCard,
  },
})
export default class HomeView extends Vue {
  thingsStore = useThingsStore();
  areasStore = useAreasStore();
  recordedThingsStore = useRecordedThingsStore();

  mounted() {
    this.thingsStore.loadData();
    this.areasStore.loadData();
    this.recordedThingsStore.loadData();
  }
}
</script>

<template>
  <div class="home">
    Now
    <v-divider inset />
    <RecordedThingCard
      v-for="recordedThing in recordedThingsStore.getRecordedThingsByDay()"
      :key="recordedThing.id"
      :recordedThing="recordedThing"
      :thing="thingsStore.getThingById(recordedThing.thingId)"
      :area="areasStore.getAreaById(recordedThing.areaId)"
    />
  </div>
</template>

function useRecordedThingsStore() {
  throw new Error("Function not implemented.");
}
