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
import ColorThief from "colorthief";
import ImagePicker from "@/components/picker/ImagePicker.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategorySelector: CategorySelector,
    ActivitySelector: ActivitySelector,
    ColorThief: ColorThief,
    ImagePicker: ImagePicker,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log(
      "👀 @Watch in AreaCreateOrEditDialog. _newValue = " + _newValue
    );
    if (this.providedArea != null)
      this.currentArea = deepCopy(this.providedArea);
    // Stop stepper from overflowing
    if (this.currentStepperPos > this.numberOfSteps) {
      this.currentStepperPos = this.numberOfSteps;
    }
  }

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();
  categoryStore = useCategoryTagsStore();

  // ------------------------------------------------ Data
  // State
  currentArea: Area = deepCopy(defaultNewArea);

  // Toggles for displays
  showDiscardConfirmationDialog = false;
  showCreateCategoryDialog = false;
  showImageEditDialog = false;
  showColorPicker = false;
  areCategoriesLoaded = false;

  // Stepper
  currentStepperPos = 0;
  numberOfSteps = 3;
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";
  save_icon = "mdi-content-save";

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

  // ------------------------------------------------ Mounted
  mounted() {
    console.log("🐪 🐪 🐪  Loading categories");
    this.categoryStore.subscribeToStore();
    this.areCategoriesLoaded = true;
    this.resetToDefaultState();
    console.log("🐪 🐪 🐪  Mounted AreaCreateOrEditDialog");
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
    this.currentStepperPos = 0;
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

  showImagePicker() {
    console.log("CLICKED");
    this.showImageEditDialog = true;
  }

  /**
   * ? -------------- Color thief
   * ! --------- imageChanged() ----- needs to be called in a better place.  -->
   */
  imageChanged(newImageUrl: string) {
    console.log("--------- IMAGE CHANGED");

    // Update URL
    this.currentArea.imageUrl = newImageUrl;

    // Hide image-picker.
    this.showImageEditDialog = false;

    const colorThief = new ColorThief();

    // Make a temporary HTML element for the image.
    const imageElement = new Image();
    // Hack to prevent CORS errors. We use a proxy server to redirect.
    let imageURL = this.currentArea.imageUrl;
    let googleProxyURL =
      "https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=";

    imageElement.src = googleProxyURL + encodeURIComponent(imageURL);

    // Prevent CORS errors.
    imageElement.crossOrigin = "Anonymous";

    imageElement.addEventListener("load", function () {
      /**
       * * ------- Make color-thief do its thiefing.
       */
      const dominantColor = colorThief.getColor(imageElement);
      console.log("🎨 🎨 🎨 🎨 Dominant color -----> " + dominantColor);
      const palette = colorThief.getPalette(imageElement);
      console.log("🎨 🎨 🎨 🎨 Palette -----> " + palette);

      // <!-- TODO P1 --------- Write the palette into the Area. So it doesn't need to be reconstructed every time. -->
    });

    // Destroy
    imageElement.remove();
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
      v-model="showDialog"
      persistent
      overlay-opacity="0.88"
      @keydown.esc="triggerCancellation"
    >
      <!-- ? ------------------------- Stepper -------------------------->
      <v-card flat tile>
        <!-- ? ------------------------------ Title -->
        <v-card-text class="pt-2">
          <v-text-field
            label="Area"
            v-model="currentArea.title"
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

        <v-card-text>
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
                          :src="currentArea.imageUrl"
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
                          v-model="currentArea.description"
                          counter="200"
                          max-length="200"
                          clearable
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- * ---------------------------- Step 2 ------ Categories -->

            <v-window-item :step="2">
              <v-card elevation="0" style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <v-form ref="areaForm" v-model="valid" lazy-validation>
                    <!--  -->

                    <!-- * ---------------- Tag selector for category chips -->
                    <CategorySelector
                      :area="currentArea"
                      :allItemsList="categoryStore.getCategoryTagsList()"
                      :selectedItemIdList="currentArea.categoryTags"
                      :isDisplayed="showDialog"
                      v-on:category-tags-changed="onCategoryTagsChanged"
                    ></CategorySelector>

                    <!--  -->
                  </v-form>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- * ---------------------------- Step 3 ----- Activities -->

            <v-window-item :step="3">
              <v-card elevation="0" style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <!--  -->

                  <!-- ? -------- Activities selector -->
                  <ActivitySelector
                    :area="currentArea"
                    :isDisplayed="showDialog"
                  >
                  </ActivitySelector>
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
                <v-icon>mdi-record</v-icon>
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
            outlined
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

    <!-- * -------------------------------- Confirm dialog for discarding -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDialog"
      :showDialog="showDiscardConfirmationDialog"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />

    <ImagePicker
      :showDialog="showImageEditDialog"
      :imageUrl="currentArea.imageUrl"
      v-on:save="imageChanged"
      v-on:cancelled="showImageEditDialog = false"
    />
  </div>
</template>
