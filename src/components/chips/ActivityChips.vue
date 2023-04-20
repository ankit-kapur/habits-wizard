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

  // ------------------------------------------------ Data
  fillOpacity = 27;

  // ------------------------------------------------ Methods
  getCategoryColor(categoryId: string): string {
    const categoryMatched = this.categories.find(
      (category) => category.id === categoryId
    );
    if (!categoryMatched)
      console.log("🐞 This is a bug. No category matched the ID.");
    return categoryMatched ? categoryMatched.color : "";
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
      :model-value="true"
      :prepend-icon="activity.icon"
      :style="`border-radius: 8px`"
      :color="getCategoryColor(activity.categoryId)"
      class="pl-2"
    >
      <v-icon class="ml-0 mr-2">{{ activity.icon }}</v-icon>
      {{ activity.title }}
    </v-chip>
  </v-chip-group>
</template>
