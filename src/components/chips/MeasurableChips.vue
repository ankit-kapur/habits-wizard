<script lang="ts">
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class MeasurableChips extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  measurableDefinitions!: MeasurableDefinition[];

  @Prop()
  hasCloseButton?: boolean;
  @Prop()
  closeIcon?: string;

  // ------------------------------------------------ Data
  fillOpacityPercent = 20;

  // ------------------------------------------------ Computed props
  get shouldHaveCloseButton() {
    if (this.hasCloseButton) return this.hasCloseButton;
    else return false;
  }

  // ------------------------------------------------ Getters

  // ------------------------------------------------ Actions
  onChipClick(measurableDefinition: MeasurableDefinition) {
    this.$emit("chip-clicked", measurableDefinition);
  }

  onChipCloseButtonClick(measurableDefinition: MeasurableDefinition) {
    this.$emit("chip-closed", measurableDefinition);
  }
}
</script>

<template>
  <v-chip-group column multiple>
    <v-chip
      outlined
      v-for="(measurableDefinition, index) in measurableDefinitions"
      v-bind:measurableDefinition="measurableDefinition"
      v-bind:index="index"
      v-bind:key="measurableDefinition.id"
      :close="shouldHaveCloseButton"
      :close-icon="closeIcon"
      @click="onChipClick(measurableDefinition)"
      @click:close="onChipCloseButtonClick(measurableDefinition)"
      :model-value="true"
      :prepend-icon="measurableDefinition.icon"
      :style="`border-radius: 8px`"
      :color="getCategoryColor(measurableDefinition)"
      class="pl-1 ma-1 mr-1 mt-0 mb-2 pb-0 pt-0"
    >
      {{ measurableDefinition.emoji }}
      {{ measurableDefinition.title }}
    </v-chip>
  </v-chip-group>
</template>
