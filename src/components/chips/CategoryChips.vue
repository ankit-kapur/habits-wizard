<script lang="ts">
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CategoryChips extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  categories!: CategoryTag[];
  @Prop()
  hasCloseButton?: boolean;
  @Prop()
  closeIcon?: string;

  // ------------------------------------------------ Data
  fillOpacity = 27;

  // ------------------------------------------------ Methods
  get shouldHaveCloseButton() {
    if (this.hasCloseButton) return this.hasCloseButton;
    else return false;
  }
  onChipClick(categoryTag: CategoryTag) {
    console.log("onChipClick for " + JSON.stringify(categoryTag));
    this.$emit("chip-clicked", categoryTag);
  }

  onChipCloseButtonClick(categoryTag: CategoryTag) {
    console.log("onChipCloseButtonClick for " + JSON.stringify(categoryTag));
    this.$emit("chip-closed", categoryTag);
  }
}
</script>

<template>
  <v-chip-group column multiple>
    <v-chip
      v-for="(categoryTag, index) in categories"
      v-bind:categoryTag="categoryTag"
      v-bind:index="index"
      v-bind:key="categoryTag.id"
      :close="shouldHaveCloseButton"
      @click="onChipClick(categoryTag)"
      @click:close="onChipCloseButtonClick(categoryTag)"
      :model-value="true"
      :style="`border: 1px solid${categoryTag.color}; border-radius: 20px`"
      :color="
        categoryTag.color.substring(0, categoryTag.color.length - 2) +
        fillOpacity
      "
    >
      <v-icon
        x-large
        :color="categoryTag.color"
        small
        class="ml-0 mr-2"
        style="border: 0px solid darkslategray; border-radius: 20px"
      >
        mdi-circle
      </v-icon>
      {{ categoryTag.title }}
    </v-chip>
  </v-chip-group>
</template>
