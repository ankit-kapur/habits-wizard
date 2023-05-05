<script lang="ts">
import MyEmoji from "@/components/chips/MyEmoji.vue";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {
    MyEmoji: MyEmoji,
  },
})
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
      :style="`border-radius: 18px`"
      class="pr-3 pl-1 ma-1"
    >
      <MyEmoji
        :emojiString="measurableDefinition.baseUnitEmoji"
        class="pt-2 pl-0"
      />

      <span class="pl-1">{{ measurableDefinition.title }}</span>
    </v-chip>
  </v-chip-group>
</template>
