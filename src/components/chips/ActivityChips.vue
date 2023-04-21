<script lang="ts">
import Activity from "@/model/pojo/definitions/Activity";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
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
  getFillColor(categoryTag: CategoryTag) {
    return (
      categoryTag.color.substring(0, categoryTag.color.length - 2) +
      this.getFillOpacityHex()
    );
  }

  getFillOpacityHex() {
    const hex = Math.round((this.fillOpacityPercent / 100) * 255).toString(16);
    return hex.length > 1 ? hex : 0 + hex;
  }

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
      outlined
      v-for="(activity, index) in activities"
      v-bind:activity="activity"
      v-bind:index="index"
      v-bind:key="activity.id"
      :close="shouldHaveCloseButton"
      :close-icon="closeIcon"
      @click="onChipClick(activity)"
      @click:close="onChipCloseButtonClick(activity)"
      :model-value="true"
      :prepend-icon="activity.icon"
      :style="`border-radius: 8px`"
      :color="getCategoryColor(activity)"
      class="pl-2"
    >
      <v-icon class="ml-0 mr-2">{{ activity.icon }}</v-icon>
      {{ activity.title }}
    </v-chip>
  </v-chip-group>
</template>
