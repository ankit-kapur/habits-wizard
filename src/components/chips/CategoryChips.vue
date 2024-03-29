<script lang="ts">
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { getFillColor } from "@/utils/colors/ColorUtils";
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
  fillOpacityPercent = 20;

  // ------------------------------------------------ Computed props
  get shouldHaveCloseButton() {
    if (this.hasCloseButton) return this.hasCloseButton;
    else return false;
  }

  // ------------------------------------------------ Getters
  getFillColor = getFillColor;

  // ------------------------------------------------ Actions
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

<!------------------- For a colored border around the chip use this:  -->
<!-- :style="`border: 1px solid${categoryTag.color}; border-radius: 20px`" -->

<template>
  <v-card tile flat class="ma-0 pa-0">
    <v-chip
      v-for="(categoryTag, index) in categories"
      v-bind:categoryTag="categoryTag"
      v-bind:index="index"
      v-bind:key="categoryTag.id"
      :close="shouldHaveCloseButton"
      @click="onChipClick(categoryTag)"
      @click:close="onChipCloseButtonClick(categoryTag)"
      :model-value="true"
      :style="`border: 1px solid darkgray; border-radius: 20px`"
      :color="getFillColor(categoryTag.color, fillOpacityPercent)"
      class="ma-1 mt-0 ml-0 mr-1"
    >
      <v-icon
        small
        :color="categoryTag.color"
        class="ml-0 mr-2"
        style="border: 0px solid darkslategray; border-radius: 18px"
      >
        mdi-circle
      </v-icon>
      {{ categoryTag.title }}
    </v-chip>
  </v-card>
</template>
