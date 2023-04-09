<script lang="ts">
import { Limits } from "@/constants/Limits";
import { useAreasStore } from "@/store/AreasStore";
import { Area } from "@/model/pojo/definitions/Area";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { deepCopy } from "deep-copy-ts";
import ConfirmationDialog from "./ConfirmationDialog.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
  },
})
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
  @Watch("providedArea")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.currentArea = deepCopy(this.providedArea);
    this.showThisDialog = this.showDialog;
  }

  // Store
  areasStore = useAreasStore();

  // State
  currentArea: Area = {
    id: "",
    title: "",
    color: "",
    imageUrl: "",
    categoryTags: [],
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

  // Maybe don't need this?
  beforeMount() {
    this.resetToDefaultState();
  }

  // ------------------------------------------------ Methods

  saveArea(): void {
    if (this.dialogMode === DialogMode.CREATE) {
      this.areasStore.createArea(this.currentArea);
    } else {
      this.areasStore.updateArea(this.currentArea);
    }
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

  confirmDiscardAction() {
    // If no changes, discard without confirmation
    if (JSON.stringify(this.providedArea) == JSON.stringify(this.currentArea)) {
      this.closeThisDialog();
    } else {
      this.showDiscardConfirmationDialog = true;
    }
  }

  respondToConfirmDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.closeThisDialog();
    }
    this.showDiscardConfirmationDialog = false;
  }
}

export enum DialogMode {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
}
</script>

<template>
  <div class="" v-if="showThisDialog">
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

            <v-text-field
              v-model="currentArea.description"
              label="Description"
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

            <v-text-field
              v-model="currentArea.imageUrl"
              label="Image URL"
              required
            ></v-text-field>

            <v-text-field
              v-model="currentArea.description"
              label="Description"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="discard-button white--text"
            text
            @click="confirmDiscardAction"
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

    <!-- CONFIRMATION dialog for discarding a recorded thing -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDialog"
      :showDialog="showDiscardConfirmationDialog"
      messageToDisplay="Sure you want to discard this?"
    />
  </div>
</template>
