<script lang="ts">
import { Area } from "@/model/pojo/definitions/Area";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ColorPicker extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  isDisplayed!: boolean;
  @Prop()
  initialColor!: string;
  @Prop()
  area!: Area;

  /* <!-- ? ------------------------------ Data ------------------------------> */
  selectedColor = "#ffffff";
  isDisplayed_local = false;
  showColorPicker = false;
  showAdvancedColorPicker = false;
  swatchesMaxColumns = 5;

  /* <!-- ? ------------------------------ Watchers ------------------------------> */
  @Watch("isDisplayed")
  onDisplayChanged(_newValue: string) {
    console.log("👀 @Watch in ColorPicker. isDisplayed = " + _newValue);
    const isDialogOpen = !!_newValue;
    if (isDialogOpen) {
      this.resetState();
    }
    this.isDisplayed_local = this.isDisplayed;
  }

  // Workaround for when space above dialog is tapped.
  @Watch("isDisplayed_local")
  onLocalDisplayChanged(_newValue: boolean) {
    console.log("👀 @Watch in ColorPicker. isisDisplayed_local = " + _newValue);
    if (_newValue == false) this.closeViaParent;
  }

  /* <!-- ? ------------------------------ Lifecycle ------------------------------> */
  resetState() {
    this.showAdvancedColorPicker = false;
    this.selectedColor = deepCopy(this.initialColor);
  }

  saveSelectedColor() {
    this.$emit("selected-color", this.selectedColor);
  }

  closeViaParent() {
    this.$emit("cancel", false);
  }

  /* <!-- ? ------------------------------ Computed props ------------------------------> */
  // get isDisplayed_local() {
  //   if (this.isDisplayed) {
  //     // Reset on display.
  //     this.showAdvancedColorPicker = false;
  //     this.selectedColor = deepCopy(this.initialColor);
  //   }
  //   return this.isDisplayed;
  // }

  // set isDisplayed_local(newValue: boolean) {
  //   if (newValue == false) this.closeViaParent;
  // }

  /* <!-- ? ------------------------------ Methods ------------------------------> */
  getColorPalette(): string[][] {
    if (!this.area || !this.area.colorPalette) return [];
    // return this.colorSwatches;

    // Initialize with empty columns.
    const swatches: string[][] = [];
    for (let i = 0; i < this.swatchesMaxColumns; i++) {
      const emptyArray: string[] = [];
      swatches.push(emptyArray);
    }

    // Fill columns
    let column = 0;
    for (var color of this.area.colorPalette) {
      swatches[column].push(color);
      column = (1 + column) % this.swatchesMaxColumns;
    }

    // TODO P1 ---- Get shades of area.color from ColorUtils.

    return swatches;
  }
}
</script>

<template>
  <!-- ? ----------------------- Color picker dialog -->
  <v-dialog v-model="isDisplayed_local">
    <v-card class="pa-2 pt-4">
      <!--  -->

      <!-- ? ----------------------- Close button -->
      <v-card-actions>
        <v-spacer />
        <v-icon @click="closeViaParent">mdi-close</v-icon>
      </v-card-actions>

      <!-- ? ----------------------- Color picker -->
      <v-card-text>
        <v-color-picker
          v-model="selectedColor"
          mode="hexa"
          hide-inputs
          :swatches="getColorPalette()"
          swatches-max-height="200"
          show-swatches
          :hide-canvas="!showAdvancedColorPicker"
          :hide-sliders="!showAdvancedColorPicker"
        ></v-color-picker>
      </v-card-text>

      <v-card-actions>
        <!-- <v-spacer /> -->

        <!-- ? -------------- "Show more" button -->
        <v-btn text @click="showAdvancedColorPicker = !showAdvancedColorPicker">
          See {{ showAdvancedColorPicker ? `less` : `more` }}
        </v-btn>

        <v-spacer />

        <!-- ? -------------- "Save" button -->
        <v-btn color="primary" @click="saveSelectedColor"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
