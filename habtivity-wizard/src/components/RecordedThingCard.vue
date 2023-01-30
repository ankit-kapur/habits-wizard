<template>
  <v-card
    :color="area.color"
    class="mx-auto px-auto"
    max-width="450"
    elevation="20"
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
  </v-card>
</template>

<script lang="ts">
import { Area } from "@/model/pojo/main/Area";
import { RecordedThing } from "@/model/pojo/main/RecordedThing";
import { Thing } from "@/model/pojo/main/Thing";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RecordedThingCard extends Vue {
  @Prop()
  recordedThing!: RecordedThing;
  @Prop()
  thing!: Thing;
  @Prop()
  area!: Area;
}
</script>
