<script lang="ts">
import { Limits } from "@/constants/Limits";
import { useAreasStore } from "@/store/AreasStore";
import { Area } from "@/model/pojo/definitions/Area";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { v4 as uuid } from "uuid";
import { deepCopy } from "deep-copy-ts";

@Component
export default class AreaDialogToEditOrCreate extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  providedArea!: Area;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  /**
   * Watches parent variable, and sync's its value to the child variable.
   */
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.showThisDialog = this.showDialog;
    console.log("this.showThisDialog ===> " + this.showThisDialog);
  }

  // Store
  areasStore = useAreasStore();

  // State
  currentArea: Area = {
    id: "",
    title: "",
    color: "",
    icon: "",
  };

  // Toggles for displays
  showThisDialog = false;
  showDiscardConfirmationDialog = false;
  showColorPicker = false;

  mdiIcons = import("@/assets/icons/mdi_icons.json");

  // ------------------------------------------------ Data
  valid = true;

  areaNameRules = [
    (v: unknown) => !!v || "Name is required",
    (v: string | unknown[]) =>
      (v && v.length <= Limits.AREA_NAME_MAX_LENGTH) ||
      `Name must be less than ${Limits.AREA_NAME_MAX_LENGTH} characters`,
  ];

  // Put some nice colors here. And hide the full color-picker.
  colorSwatches = [
    ["#FF0000", "#AA0000", "#550000"],
    ["#FFFF00", "#AAAA00", "#555500"],
    ["#00FF00", "#00AA00", "#005500"],
    ["#00FFFF", "#00AAAA", "#005555"],
    ["#0000FF", "#0000AA", "#000055"],
  ];

  // ------------------------------------------------ Mounted
  mounted() {
    console.log("🪁 🪁 🪁 Mounted ---> AreaDialogToEditOrCreate");
  }

  // Maybe don't need this?
  beforeMount() {
    this.resetToDefaultState();
  }

  // ------------------------------------------------ Methods

  saveArea(): void {
    this.currentArea.id = uuid(); // Generate a new UUID
    // Save to store.
    this.areasStore.saveArea(this.currentArea);

    this.closeThisDialog();
  }

  closeThisDialog() {
    // Reset
    this.resetToDefaultState();
    // Ask parent to update its state // close this child. (i.e. make invisible)
    this.$emit("close-dialog", false);
  }

  resetToDefaultState() {
    // Reset to DEFAULT area
    this.currentArea = deepCopy(this.providedArea);

    // Hide dialogs and windows
    this.showDiscardConfirmationDialog = false;
    this.showColorPicker = false;
  }
}

export enum DialogMode {
  CREATE,
  EDIT,
}
</script>

<template>
  <div class="">
    <!-- Dialog for NEW Area -->
    <!-- fullscreen attach="v-app" -->
    <v-bottom-sheet v-model="showThisDialog" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h4">{{ currentArea.title }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="areaForm" v-model="valid" lazy-validation>
            <v-text-field
              v-model="currentArea.title"
              :rules="areaNameRules"
              label="Title"
              required
            ></v-text-field>

            <v-color-picker
              v-show="showColorPicker"
              v-model="currentArea.color"
              dot-size="25"
              mode="hexa"
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

            <!-- TODO: Make and icon picker component -->
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="discard-button white--text"
            text
            @click="showDiscardConfirmationDialog = true"
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

    <!-- TODO: Make a custom component: ConfirmationDialog -->
    <!-- CONFIRMATION dialog for discarding a recorded thing -->
    <v-dialog v-model="showDiscardConfirmationDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>Sure you want to discard this?</span>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-actions>
          <v-btn color="primary" text @click="closeThisDialog"> Yes </v-btn>

          <v-btn
            color="primary"
            text
            @click="showDiscardConfirmationDialog = false"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
