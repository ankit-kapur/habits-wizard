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
import ActivitiesInArea from "../chips/ActivitiesInArea.vue";
import ImagePicker from "@/components/picker/ImagePicker.vue";
import { DialogMode } from "@/model/enum/DialogMode";
import { setColorsFromImage } from "@/utils/colors/ColorUtils";
import ColorPicker from "@/components/picker/ColorPicker.vue";

/**
 * TODO P1 ----- Add validations. Block the Save button, mark the pages that have errors or ✅
 * Validations:
 *    - Name, description, image are required. Length limits.
 *    - At least 1 category must be selected.
 *    - Category delete should be disallowed if any Activities (in this Area) are associated with it.
 *    - At least 1 category, and 1 activity must be selected.
 *
 * TODO P2 ----- Delete should be disallowed if Activities exist.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategorySelector: CategorySelector,
    ActivitiesInArea: ActivitiesInArea,
    ImagePicker: ImagePicker,
    ColorPicker: ColorPicker,
  },
})
export default class AreaWizard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area?: Area;
  @Prop()
  isDisplayed!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  /**
   * Watches parent variable, and sync's its value to the child variable.
   */
  @Watch("isDisplayed")
  onIsDisplayedChanged(_newValue: string) {
    const isDialogOpen = !!_newValue;
    console.log("👀 @Watch in AreaWizard. isDisplayed = " + _newValue);
    this.isDisplayed_local = this.isDisplayed;
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // Workaround for when space above dialog is tapped.
  @Watch("isDisplayed_local")
  onLocalDisplayChanged(_newValue: boolean) {
    console.log("👀 @Watch in AreaWizard. isDisplayed_local = " + _newValue);
    if (_newValue === false && this.isDisplayed) {
      this.confirmDiscard(true);
    }
  }

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();
  categoryStore = useCategoryTagsStore();

  // ------------------------------------------------ Data
  // State
  area_local: Area = this.resetToDefaultState();
  originalArea: Area | null = null;
  isDisplayed_local = false;

  // Toggles for displays
  showDiscardConfirmationDialog = false;
  showCreateCategoryDialog = false;
  showImageEditDialog = false;
  showColorPicker = false;

  // Stepper
  currentStepperPos = 0;
  numberOfSteps = 3;
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";

  // Image dimensions
  IMAGE_HEIGHT = 110;

  mdiIcons = import("@/assets/icons/mdi_icons.json");

  valid = true;

  areaNameRules = [
    (v: unknown) => !!v || "Name is required",
    (v: string | unknown[]) =>
      (v && v.length <= Limits.AREA_NAME_MAX_LENGTH) ||
      `Name must be less than ${Limits.AREA_NAME_MAX_LENGTH} characters`,
  ];
  firstStepValidations = this.areaNameRules;

  // ------------------------------------------------ Computed

  // ------------------------------------------------ Lifecycle
  onShow() {
    // Subscribe to stores
    this.categoryStore.subscribeToStore();

    // Reset
    this.resetToDefaultState();

    // Write to store.
    if (this.dialogMode === DialogMode.CREATE) {
      this.areasStore.createArea(this.area_local);
    }

    this.originalArea = deepCopy(this.area_local);
  }

  onHide() {
    // Nothing for now.
  }

  mounted() {
    // Reset
    this.resetToDefaultState();
    console.log("🐪  Mounted AreaWizard");
  }

  // ------------------------------------------------ Methods
  saveArea(): void {
    // We update even for CREATE mode because onShow() creates the record.
    this.areasStore.updateArea(this.area_local);
    this.closeThisDialog();
  }

  closeThisDialog() {
    // Reset
    this.resetToDefaultState();
    // Ask parent to update its state // close this child. (i.e. make invisible)
    this.$emit("close-dialog", false);
  }

  resetToDefaultState(): Area {
    // Reset Area
    this.area_local = deepCopy(this.area ? this.area : defaultNewArea);

    // Hide dialogs and windows
    this.showDiscardConfirmationDialog = false;
    this.showColorPicker = false;

    // Stepper
    this.currentStepperPos = 0;

    if (this.dialogMode === DialogMode.CREATE) {
      // Extract initial colors from default image
      this.imageChanged(this.area_local.imageUrl);
    }

    return this.area_local;
  }

  hasChanged() {
    return (
      JSON.stringify(this.area_local) !== JSON.stringify(this.originalArea)
    );
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (this.hasChanged()) this.showDiscardConfirmationDialog = true;
    else this.confirmDiscard(true);
  }

  confirmDiscard(isConfirmed: boolean): void {
    if (isConfirmed) {
      if (this.dialogMode === DialogMode.CREATE) {
        // Delete from the store.
        console.log("DELETEING ==== " + this.area_local.id);
        this.areasStore.deleteArea(this.area_local.id);
      }
      this.closeThisDialog();
    }
    this.showDiscardConfirmationDialog = false;
  }

  onCategoryTagsChanged(updatedCategoryIDList: string[]) {
    this.area_local.categoryIDList = updatedCategoryIDList;
  }

  /* ------------------------------ Stepper ------------------------------*/
  moveToStep(destination: number): void {
    if (destination >= this.numberOfSteps) {
      this.currentStepperPos = this.numberOfSteps;
    } else if (destination < 0) {
      this.currentStepperPos = this.numberOfSteps - 1;
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

  isCurrentStep(stepNumber: number) {
    return this.currentStepperPos == stepNumber - 1;
  }

  /* ------------------------------ Image picker ------------------------------*/
  showImagePicker() {
    console.log("CLICKED");
    this.showImageEditDialog = true;
  }

  imageChanged(newImageUrl: string) {
    // if (newImageUrl === this.area_local.imageUrl) return; // No change

    this.area_local.imageUrl = newImageUrl; // Update URL
    this.showImageEditDialog = false; // Hide image-picker.

    // Extract colors from the image.
    setColorsFromImage(this.area_local);

    if (this.area_local.autoSetColorsFromImage)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.area_local.color = this.area_local.dominantColorInImage!;
  }

  /* ------------------------------ Color picker ------------------------------*/
  selectedNewColor(newColor: string) {
    console.log("selectedNewColor ======= " + newColor);
    this.area_local.color = deepCopy(newColor);
    this.hideColorPicker();
  }

  hideColorPicker() {
    this.showColorPicker = false;
  }
}
</script>

<template>
  <div class="">
    <!-- * ------------------------------------------------ Bottom sheet -->
    <v-bottom-sheet
      v-model="isDisplayed_local"
      inset
      :persistent="hasChanged()"
      max-width="400"
      overlay-opacity="0.88"
      @keydown.esc="triggerCancellation"
    >
      <v-card flat tile>
        <!--  -->

        <!-- ? ------------------------------ Title -->
        <v-card-text class="pt-2">
          <v-text-field
            label="Area"
            v-model="area_local.title"
            :rules="areaNameRules"
            hint="Click to change"
            persistent-hint
            outlined
            required
            counter="20"
            clearable
            style="font-size: 22px"
            class="mt-4"
          ></v-text-field>
        </v-card-text>

        <v-divider />

        <!-- ? ------------------------- Stepper Window -------------------------->
        <v-card-text class="mt-4">
          <v-window v-model="currentStepperPos">
            <!--  -->

            <!-- ? --------------------------------------------- Step 1 -->
            <v-window-item :step="1">
              <v-card flat style="pa-0 border-radius: 8px">
                <!-- ? ------------------------------ Image -->
                <v-card-text class="ma-0 pa-0">
                  <v-container>
                    <v-row>
                      <v-col cols="4" class="ma-0 pa-0">
                        <v-img
                          style="border-radius: 10px"
                          :src="area_local.imageUrl"
                          :width="IMAGE_HEIGHT"
                          :height="IMAGE_HEIGHT"
                          @click="showImagePicker"
                        />
                      </v-col>

                      <v-col class="ma-0 pa-0 pl-4">
                        <v-textarea
                          rows="3"
                          hint="Describe what this Area means to you."
                          label="Description"
                          v-model="area_local.description"
                          counter="200"
                          max-length="200"
                          clearable
                        />
                      </v-col>
                    </v-row>

                    <!-- ? ------------------------------ Color selection -->
                    <v-row>
                      <!--  -->

                      <!-- ? -------- Circle with color -->
                      <v-col
                        cols="4"
                        class="pl-4 d-flex justify-center align-center"
                      >
                        <span class="text-center">
                          Color
                          <br />

                          <v-icon
                            size="50"
                            :color="area_local.color"
                            @click="showColorPicker = true"
                          >
                            mdi-circle
                          </v-icon>
                        </span>
                      </v-col>

                      <v-spacer />

                      <!-- ? -------- Switch -->
                      <v-col cols="7">
                        <v-switch
                          v-model="area_local.autoSetColorsFromImage"
                          label="Auto color"
                          hint="Colors will be automatically set from the image"
                          persistent-hint
                          color=""
                        />
                        <!-- 
                          hint="Auto-set colors from image"
                          persistent-hint -->
                      </v-col>

                      <!-- ? -------- Label -->
                      <!-- <v-col cols="" class="d-flex justify-center align-center">
                        <span class="text-caption">
                          Automatically set colors from image.
                        </span>
                      </v-col> -->

                      <!--  -->
                    </v-row>

                    <!--  -->
                  </v-container>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? --------------------------------------------- Step 2 ---- Categories -->
            <v-window-item :step="2">
              <v-card flat style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <!--  -->

                  <!-- * ---------------- Tag selector for category chips -->
                  <CategorySelector
                    :area="area_local"
                    :allItemsList="categoryStore.getAll()"
                    :selectedItemIdList="area_local.categoryIDList"
                    :isDisplayed="isDisplayed"
                    v-on:category-tags-changed="onCategoryTagsChanged"
                  ></CategorySelector>

                  <!--  -->
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? --------------------------------------------- Step 3 ---- Activities -->
            <v-window-item :step="3">
              <v-card flat style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <!--  -->

                  <!-- ? -------- Activities selector -->
                  <ActivitiesInArea
                    :area="area_local"
                    :isDisplayed="isDisplayed"
                  >
                  </ActivitiesInArea>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!--  -->
          </v-window>
        </v-card-text>

        <!-- ? ------------------------------ Buttons for window navigation -->
        <v-card-actions class="justify-space-between">
          <!--  -->

          <!------------- Previous -->
          <v-btn icon @click="moveToPreviousStep()">
            <v-icon> mdi-chevron-left </v-icon>
          </v-btn>

          <v-spacer />

          <v-item-group
            v-model="currentStepperPos"
            class="text-center"
            mandatory
          >
            <v-item
              v-for="n in numberOfSteps"
              :key="`btn-${n}`"
              v-slot="{ active, toggle }"
            >
              <v-btn :input-value="active" icon @click="toggle">
                <v-icon :color="isCurrentStep(n) ? `primary` : 'darkgray'"
                  >mdi-record</v-icon
                >
              </v-btn>
            </v-item>
          </v-item-group>

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

        <!-- ? ------------------------------ Buttons for Save & Cancel -->
        <v-card-actions class="pa-4 pr-6">
          <!--  -->
          <v-spacer />

          <!------------- Cancel -->
          <v-btn
            @click="triggerCancellation"
            text
            density="comfortable"
            class="mr-4 text-body-2 px-auto"
          >
            Cancel
          </v-btn>

          <!-- <v-spacer /> -->

          <!------------- Save -->
          <v-btn
            @click="saveArea"
            density="comfortable"
            :disabled="false"
            color="primary"
            min-width="90"
            class=""
          >
            {{ dialogMode === "EDIT" ? `Save` : `Create` }}
          </v-btn>

          <!--  -->
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- * ----------------------- Dialogs  -------------------------->

    <!-- ? ------------------------ Color picker -->
    <ColorPicker
      :isDisplayed="showColorPicker"
      :initialColor="area_local.color"
      :area="area_local"
      v-on:selected-color="selectedNewColor"
      v-on:cancel="hideColorPicker"
    />

    <!-- ? ------------------------ Image picker -->
    <ImagePicker
      :showDialog="showImageEditDialog"
      :imageUrl="area_local.imageUrl"
      v-on:save="imageChanged"
      v-on:cancelled="showImageEditDialog = false"
    />

    <!-- ? ------------------------ Confirm dialogs -->
    <ConfirmationDialog
      v-on:confirm-status-change="confirmDiscard"
      :showDialog="showDiscardConfirmationDialog"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />
  </div>
</template>
