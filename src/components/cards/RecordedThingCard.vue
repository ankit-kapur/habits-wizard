<template>
  <v-card
    :color="area.color"
    class="mt-3 mx-auto px-auto"
    max-width="450"
    elevation="20"
    @click="expandCard = !expandCard"
  >
    <v-card-title>
      <v-icon large left> {{ thing.icon }} </v-icon>

      <span class="text-h6 font-weight-light">
        {{ recordedThing.title }}
      </span>
    </v-card-title>

    <v-card-text class="text-sm-3 font-weight-light">
      {{ thing.areaId }}
    </v-card-text>

    <v-expand-transition>
      <div v-if="expandCard">
        <v-card
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%"
        >
          <v-card-text class="pb-0">
            <p>
              late 16th century (as a noun denoting a place where alms were
              distributed): from medieval Latin eleemosynarius, from late Latin
              eleemosyna ‘alms’, from Greek eleēmosunē ‘compassion’
            </p>
          </v-card-text>
          <v-card-actions class="pt-0"> </v-card-actions>
        </v-card>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script lang="ts">
import { Activity } from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { RecordedThing } from "@/model/pojo/main/RecordedThing";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RecordedThingCard extends Vue {
  @Prop()
  recordedThing!: RecordedThing;
  @Prop()
  thing!: Activity;
  @Prop()
  area!: Area;

  expandCard = false;
}
</script>
