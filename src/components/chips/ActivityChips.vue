<script lang="ts">
import Activity from "@/model/pojo/definitions/Activity";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { getFillColor } from "@/utils/colors/ColorUtils";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ActivityChips extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activities!: Activity[];
  @Prop()
  categories!: CategoryTag[];

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
  getFillColor = getFillColor;
  getCategoryColor(activity: Activity): string {
    const categoryId: string = activity.categoryId;
    const categoryMatched = this.categories.find(
      (category) => category.id === categoryId
    );
    if (!categoryMatched) {
      console.log(
        "🐞 This is a bug. No category matched the ID: " +
          categoryId +
          ". Activity = " +
          JSON.stringify(activity)
      );
    }
    return categoryMatched ? categoryMatched.color : "";
  }

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
  <v-chip-group column multiple>
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
        `border: 1px solid ` +
        getCategoryColor(activity) +
        `; border-radius: 8px`
      "
      :color="getFillColor(getCategoryColor(activity), fillOpacityPercent)"
      class="pl-1 ma-1 mr-1 mt-0 mb-2 pb-0 pt-0"
    >
      <v-icon
        medium
        class="ml-1 mt-2 mb-2 mr-2"
        :color="getCategoryColor(activity)"
      >
        {{ activity.icon }}</v-icon
      >
      <span style="">{{ activity.title }}</span>
    </v-chip>
  </v-chip-group>
</template>
