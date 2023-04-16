<script lang="ts">
import { Limits } from "@/constants/Limits";
import { useAreasStore } from "@/store/AreasStore";
import { Area } from "@/model/pojo/definitions/Area";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { deepCopy } from "deep-copy-ts";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { defaultNewArea } from "@/constants/DefaultDataForForms";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import CategorySelector from "../chips/CategorySelector.vue";
import ActivitySelector from "../chips/ActivitySelector.vue";

// TODO --- Use ColorThief to pick a color-palette from the image.
//          Currently failing because npm can't install canvas.
// import ColorThief from "colorthief";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategorySelector: CategorySelector,
    ActivitySelector: ActivitySelector,
  },
})
export default class AreaCreateOrEditDialog extends Vue {
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
  @Watch("numberOfSteps")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.showThisDialog = this.showDialog;
    if (this.providedArea != null)
      this.currentArea = deepCopy(this.providedArea);
    // Stop stepper from overflowing
    if (this.currentStepperPos > this.numberOfSteps) {
      this.currentStepperPos = this.numberOfSteps;
    }
  }

  // Store
  areasStore = useAreasStore();
  categoryStore = useCategoryTagsStore();

  // State
  currentArea: Area = deepCopy(defaultNewArea);

  // Toggles for displays
  showThisDialog = false;
  showDiscardConfirmationDialog = false;
  showCreateCategoryDialog = false;
  showImageEditDialog = false;
  showColorPicker = false;
  areCategoriesLoaded = false;

  // Stepper
  currentStepperPos = 1;
  numberOfSteps = 3;
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";
  save_icon = "mdi-content-save";

  mdiIcons = import("@/assets/icons/mdi_icons.json");

  // ------------------------------------------------ Data
  valid = true;

  areaNameRules = [
    (v: unknown) => !!v || "Name is required",
    (v: string | unknown[]) =>
      (v && v.length <= Limits.AREA_NAME_MAX_LENGTH) ||
      `Name must be less than ${Limits.AREA_NAME_MAX_LENGTH} characters`,
  ];
  firstStepValidations = this.areaNameRules;

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
    console.log("🐪 🐪 🐪  Loading categories");
    this.categoryStore.subscribeToStore();
    this.areCategoriesLoaded = true;
    this.resetToDefaultState();
    console.log("🐪 🐪 🐪  Mounted AreaCreateOrEditDialog");

    // TODO --- testing for now
    // https://github.com/null2/color-thief
    // const img = resolve(process.cwd(), 'rainbow.png');
    // ColorThief.getColor();
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
    this.currentArea = deepCopy(defaultNewArea);

    // Hide dialogs and windows
    this.showDiscardConfirmationDialog = false;
    this.showColorPicker = false;

    // Stepper
    this.currentStepperPos = 1;
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.providedArea) == JSON.stringify(this.currentArea) ||
      JSON.stringify(defaultNewArea) == JSON.stringify(this.currentArea)
    ) {
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

  onCategoryTagsChanged(updatedCategoryTagIdList: string[]) {
    this.currentArea.categoryTags = updatedCategoryTagIdList;
  }

  /* ------------------------------ Stepper ------------------------------*/
  moveToStep(destination: number): void {
    if (destination > this.numberOfSteps) {
      this.currentStepperPos = this.numberOfSteps;
    } else if (destination < 1) {
      this.currentStepperPos = 1;
    } else {
      this.currentStepperPos = destination;
    }
  }
  moveToNextStep(): void {
    this.moveToStep(1 + this.currentStepperPos);
  }
  moveToPreviousStep(): void {
    this.moveToStep(this.currentStepperPos - 1);
  }
}

export enum DialogMode {
  CREATE = "CREATE",
  EDIT = "EDIT",
}
</script>

<template>
  <div class="">
    <!-- * ------------------------------------------------ Bottom sheet -->
    <v-bottom-sheet
      max-width="500"
      inset
      v-model="showThisDialog"
      persistent
      overlay-opacity="0.88"
      @keydown.esc="triggerCancellation"
    >
      <!-- ? ------------------------- Stepper -------------------------->
      <v-stepper v-model="currentStepperPos">
        <!-- * ------- Modifiers used -->

        <!-- ? ------- Stepper header -->
        <v-stepper-header class="ma-0" :elevation="0">
          <div v-for="i in numberOfSteps" :key="`${i}-step`">
            <!-- ? -------Step definitions  -->
            <!-- :rules="firstStepValidations" -->
            <v-stepper-step
              :step="i"
              :complete="currentStepperPos > i"
              editable
              edit-icon="mdi-check"
              color="accent"
              class="ma-0"
            >
              <small>Step {{ i }}</small>
            </v-stepper-step>
          </div>
        </v-stepper-header>

        <v-stepper-items>
          <!-- ? ---------------------------- Step 1 -->
          <v-stepper-content :step="1">
            <v-card elevation="0" style="border-radius: 8px">
              <!-- ? ------------------- Title -->
              <v-card-text class="ma-0 pa-0">
                <v-text-field
                  label="Area"
                  v-model="currentArea.title"
                  :rules="areaNameRules"
                  outlined
                  required
                  counter="20"
                  clearable
                  style="font-size: 22px"
                  class="mt-4"
                ></v-text-field>
              </v-card-text>

              <!--------------------- Image ----------------------->
              <v-card-text class="ma-0 pa-0">
                <v-img
                  :src="currentArea.imageUrl"
                  height="180"
                  @click="showImageEditDialog = !showImageEditDialog"
                ></v-img>

                <!-- ? Text-field for Image URL  -->
                <v-text-field
                  v-model="currentArea.imageUrl"
                  label="Image URL"
                  v-show="showImageEditDialog"
                ></v-text-field
              ></v-card-text>

              <!-- <v-card-title>
                <span class="text-h4">{{ currentArea.title }}</span>
                <v-spacer></v-spacer>
                <v-btn icon
                  ><v-icon @click="triggerCancellation">mdi-close</v-icon></v-btn
                >
              </v-card-title> -->

              <v-card-text class="ma-0 pa-0">
                <v-text-field
                  label="Description"
                  v-model="currentArea.description"
                  counter="200"
                  max-length="200"
                  clearable
                ></v-text-field>
              </v-card-text>

              <!-- ? ---------- Buttons -->
              <v-card-actions class="pt-6">
                <!------------- Previous -->
                <v-btn icon @click="moveToPreviousStep()">
                  <v-icon> </v-icon>
                </v-btn>
                <!--  -->
                <v-spacer />

                <!-- Cancel -->
                <v-btn text class="pr-0" @click="triggerCancellation">
                  Cancel
                </v-btn>

                <v-spacer />

                <!------------- Next -->
                <v-btn
                  icon
                  color="primary"
                  :disabled="false"
                  @click="moveToNextStep()"
                >
                  <v-icon> mdi-chevron-right </v-icon>
                </v-btn>

                <!--  -->
              </v-card-actions>

              <!--  -->
            </v-card>
          </v-stepper-content>

          <!-- ? ---------------------------- Step 2 -->
          <v-stepper-content :step="2">
            <v-card elevation="0" style="border-radius: 8px">
              <v-card-text class="ma-0 pa-0">
                <v-form ref="areaForm" v-model="valid" lazy-validation>
                  <!--  -->

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

                  <!-- * -------------------------------- Tag selector for category chips -->
                  <CategorySelector
                    :allItemsList="categoryStore.getCategoryTagsList()"
                    :selectedItemIdList="currentArea.categoryTags"
                    :area="currentArea"
                    v-on:category-tags-changed="onCategoryTagsChanged"
                  ></CategorySelector>

                  <!--  -->
                </v-form>
              </v-card-text>

              <!-- ? -------------------- Buttons -->
              <v-card-actions>
                <!------------- Previous -->
                <v-btn icon @click="moveToPreviousStep()">
                  <v-icon> mdi-chevron-left </v-icon>
                </v-btn>

                <v-spacer />

                <!------------- Cancel -->
                <v-btn text class="pr-0" @click="triggerCancellation">
                  Cancel
                </v-btn>

                <v-spacer />

                <!------------- Next -->
                <v-btn
                  icon
                  color="primary"
                  :disabled="false"
                  @click="moveToNextStep()"
                >
                  <v-icon> mdi-chevron-right </v-icon>
                </v-btn>
              </v-card-actions>

              <!--  -->
            </v-card>
          </v-stepper-content>

          <!-- ? ---------------------------- Step 3 -->
          <v-stepper-content :step="3">
            <v-card elevation="0" style="border-radius: 8px">
              <v-card-text class="ma-0 pa-0">
                <!--  -->

                <!-- ? -------------------------------- Activities -->
                <ActivitySelector
                  :area="currentArea"
                  :selectedItemIdList="currentArea.activities"
                >
                </ActivitySelector>
              </v-card-text>

              <!-- ? -------------------------------- Buttons -->
              <v-card-actions>
                <!------------- Previous -->
                <v-btn icon @click="moveToPreviousStep()">
                  <v-icon> mdi-chevron-left </v-icon>
                </v-btn>

                <v-spacer />

                <!------------- Cancel -->
                <v-btn text class="pr-0" @click="triggerCancellation">
                  Cancel
                </v-btn>

                <v-spacer />

                <!------------- Previous -->
                <v-btn icon :disabled="false" @click="moveToPreviousStep()">
                  <v-icon>{{ previous_step_icon }}</v-icon>
                </v-btn>

                <!------------- Save -->
                <v-btn icon :disabled="false" @click="saveArea">
                  <v-icon>{{ save_icon }}</v-icon>
                </v-btn>
              </v-card-actions>

              <!--  -->
            </v-card>
          </v-stepper-content>

          <!--  -->
        </v-stepper-items>
      </v-stepper>
    </v-bottom-sheet>

    <!-- * -------------------------------- Confirm dialog for discarding -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDialog"
      :showDialog="showDiscardConfirmationDialog"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />

    <!-- TODO --- Make an image-lookup component -->
    <!-- <v-bottom-sheet v-model="showImageEditDialog" hide-overlay persistent>
      <v-text-field
        v-model="currentArea.imageUrl"
        label="Image URL"
        @click="showImageEditDialog = false"
      ></v-text-field
    ></v-bottom-sheet> -->
  </div>
</template>
