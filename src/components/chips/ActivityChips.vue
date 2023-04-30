<script lang="ts">
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { getFillColor } from "@/utils/colors/ColorUtils";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ActivityChips extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activities!: Activity[];
  @Prop()
  areas!: Area[]; // Areas that the given activities belong to.

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
  getColor(activity: Activity): string {
    const areaMatched = this.areas.find((area) => activity.areaId === area.id);
    if (!areaMatched) {
      console.log("🐞 This is a bug. No area matched the activity.");
      return "";
    } else return areaMatched.color;
  }
  getFillColor = getFillColor;

  // ------------------------------------------------ Actions
  onChipClick(activity: Activity) {
    this.$emit("chip-clicked", activity);
  }

  onChipCloseButtonClick(activity: Activity) {
    this.$emit("chip-closed", activity);
  }
}
</script>

<template>
  <v-card tile flat class="ma-0 pa-0">
    <v-chip
      v-for="(activity, index) in activities"
      v-bind:activity="activity"
      v-bind:index="index"
      v-bind:key="activity.id"
      :close="shouldHaveCloseButton"
      :close-icon="closeIcon"
      @click="onChipClick(activity)"
      @click:close="onChipCloseButtonClick(activity)"
      :model-value="true"
      :style="
        `border: 1px solid ` + getColor(activity) + `; border-radius: 8px`
      "
      :color="getFillColor(getColor(activity), fillOpacityPercent)"
      class="pl-1 ma-1 mr-1 mt-0 mb-2 pb-0 pt-0"
    >
      <v-icon medium class="ml-1 mt-2 mb-2 mr-2" :color="getColor(activity)">
        {{ activity.icon }}</v-icon
      >
      <span style="">{{ activity.title }}</span>
    </v-chip>
  </v-card>
</template>
