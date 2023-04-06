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
export default class HomePage extends Vue {
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
  <div class="">
    <!-------------- Ongoing -------------->
    <!-- TODO: Hide when nothing's ongoing -->
    <div class="mt-0">Ongoing</div>
    <v-divider />

    <!-- TODO: 💡 💡 💡 💡 💡 Make new component ====> OngoingThingCard.vue -->
    <RecordedThingCard
      :recordedThing="recordedThingsStore.getRecordedThingsByDay()[1]"
      :thing="
        thingsStore.getThingById(
          recordedThingsStore.getRecordedThingsByDay()[1].thingId
        )
      "
      :area="
        areasStore.getAreaById(
          recordedThingsStore.getRecordedThingsByDay()[1].areaId
        )
      "
    />

    <!-------------- Next -------------->
    <div class="mt-8">Next</div>
    <v-divider />

    <!-- TODO Placeholder. Replace with v-for w/ function call -->
    <RecordedThingCard
      :recordedThing="recordedThingsStore.getRecordedThingsByDay()[2]"
      :thing="
        thingsStore.getThingById(
          recordedThingsStore.getRecordedThingsByDay()[2].thingId
        )
      "
      :area="
        areasStore.getAreaById(
          recordedThingsStore.getRecordedThingsByDay()[2].areaId
        )
      "
    />

    <!-------------- Overdue -------------->
    <!-- TODO Hide when nothing's overdue -->
    <div class="mt-8">Overdue</div>
    <v-divider />
    <i> Hide when nothing's overdue </i>

    <!-------------- Afternoon -------------->
    <div class="mt-8">Afternoon</div>
    <v-divider />

    <RecordedThingCard
      v-for="recordedThing in recordedThingsStore.getRecordedThingsByDay()"
      :key="recordedThing.id"
      :recordedThing="recordedThing"
      :thing="thingsStore.getThingById(recordedThing.thingId)"
      :area="areasStore.getAreaById(recordedThing.areaId)"
    />

    <!-------------- Evening -------------->
    <div class="mt-8">Evening</div>
    <v-divider />

    <!-- TODO: Placeholder. Replace with v-for w/ function call -->
    <RecordedThingCard
      :recordedThing="recordedThingsStore.getRecordedThingsByDay()[2]"
      :thing="
        thingsStore.getThingById(
          recordedThingsStore.getRecordedThingsByDay()[2].thingId
        )
      "
      :area="
        areasStore.getAreaById(
          recordedThingsStore.getRecordedThingsByDay()[2].areaId
        )
      "
    />

    <!-------------- Night -------------->
    <div class="mt-8">Night</div>

    <!-- TODO: Placeholder. Replace with v-for w/ function call -->
    <RecordedThingCard
      :recordedThing="recordedThingsStore.getRecordedThingsByDay()[0]"
      :thing="
        thingsStore.getThingById(
          recordedThingsStore.getRecordedThingsByDay()[0].thingId
        )
      "
      :area="
        areasStore.getAreaById(
          recordedThingsStore.getRecordedThingsByDay()[0].areaId
        )
      "
    />

    <v-divider />
  </div>
</template>
