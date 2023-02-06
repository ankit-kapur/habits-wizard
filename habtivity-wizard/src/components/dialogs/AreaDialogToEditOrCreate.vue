<script lang="ts">
import { Limits } from "@/constants/Limits";
import { useAreasStore } from "@/store/AreasStore";
import { Area } from "@/model/pojo/definitions/Area";
import { Component, Prop, Vue } from "vue-property-decorator";
import { v4 as uuid } from "uuid";

// TODO: Icon loader --- Make this library import work
// import VueIconPicker from "vue-icon-picker";

@Component
export default class AreaDialogToEditOrCreate extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  providedArea!: Area;

  currentArea!: Area;

  // Store
  areasStore = useAreasStore();

  // sync'd with parent (via v-model)
  showDialogForAreaEditOrCreate = true;

  readyToLoad = false;

  // ------------------------------------------------ Data
  showDiscardConfirmationDialog = false;
  valid = true;
  areaName = "";
  areaColor = "#ffffff";
  areaIcon = "";
  areaNameRules = [
    (v: unknown) => !!v || "Name is required",
    (v: string | unknown[]) =>
      (v && v.length <= Limits.AREA_NAME_MAX_LENGTH) ||
      `Name must be less than ${Limits.AREA_NAME_MAX_LENGTH} characters`,
  ];
  showColorPicker = false;

  // Put some nice colors here. And hide the full color-picker.
  colorSwatches = [
    ["#FF0000", "#AA0000", "#550000"],
    ["#FFFF00", "#AAAA00", "#555500"],
    ["#00FF00", "#00AA00", "#005500"],
    ["#00FFFF", "#00AAAA", "#005555"],
    ["#0000FF", "#0000AA", "#000055"],
  ];

  defaultNewArea = {
    id: "placeholder",
    title: "New Area",
    icon: "mdi-new-box",
    color: "#8686D6",
  };

  // ------------------------------------------------ Mounted
  mounted() {
    this.resetToDefaultArea();
    this.readyToLoad = true;
  }

  beforeUpdate() {
    this.currentArea = this.providedArea;
    this.resetToDefaultArea();
    this.readyToLoad = true;
  }

  // ------------------------------------------------ Methods
  resetToDefaultArea() {
    // Default Area
    // this.currentArea = this.providedArea
    //   ? this.providedArea
    //   : this.defaultNewArea;

    this.currentArea = this.defaultNewArea;
  }

  saveArea(): void {
    this.currentArea.id = uuid(); // Generate a new UUID
    this.areasStore.saveArea(this.currentArea); // Save.
    this.showDialogForAreaEditOrCreate = false; // Hide the bottom-sheet.
    this.resetToDefaultArea(); // Reset.
  }

  triggerDiscardConfirmation(): void {
    this.showDiscardConfirmationDialog = true;
  }

  discardAreaEdit(): void {
    this.showDiscardConfirmationDialog = false;
    this.showDialogForAreaEditOrCreate = false;
  }
}
</script>

<template>
  <!-- Dialog for NEW Area -->
  <v-bottom-sheet
    v-if="readyToLoad"
    persistent
    @input="$emit('input', $event.target.showDialogForAreaEditOrCreate)"
  >
    <v-card>
      <v-card-title>
        <span class="text-h6">{{ currentArea.title }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="areaForm" v-model="valid" lazy-validation>
          <v-text-field
            v-model="currentArea.title"
            :rules="areaNameRules"
            label="Title"
            required
          ></v-text-field>

          <!-- TODO: Icon loader --- Make this library import work -->
          <!-- <vue-icon-loader
            v-model="areaIcon"
            height="300px"
          ></vue-icon-loader> -->

          <v-color-picker
            v-if="showColorPicker"
            v-model="currentArea.color"
            dot-size="25"
            mode="hex"
            hide-inputs
            :swatches="colorSwatches"
            swatches-max-height="100"
            show-swatches
          ></v-color-picker>

          Color:
          <v-btn
            @click="showColorPicker = !showColorPicker"
            :color="currentArea.color"
          ></v-btn>

          <!-- Temporary -->
          <v-text-field
            v-model="currentArea.icon"
            label="Icon"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          class="discard-button white--text"
          text
          @click="triggerDiscardConfirmation"
        >
          Discard
        </v-btn>
        <v-btn
          class="confirm-button white--text"
          text
          :disabled="!valid"
          @click="saveArea"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
