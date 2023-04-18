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

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategorySelector: CategorySelector,
    ActivitySelector: ActivitySelector,
    ColorThief: ColorThief,
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
      this.currentStepperPos = 0;
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

  /**
   * ? -------------- Color thief
   */
  imageChanged() {
    console.log("--------- IMAGE CHANGED");

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
              <v-card elevation="0" style="border-radius: 8px">
                <!-- ? ------------------------------ Image -->
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
                    @keydown.enter="imageChanged()"
                  ></v-text-field
                ></v-card-text>

                <!-- ! --------- imageChanged() ----- needs to be called in a better place.  -->

                <!-- TODO --------- Update palette and set Area color  -->

                <v-card-text class="ma-0 pa-0">
                  <v-text-field
                    label="Description"
                    v-model="currentArea.description"
                    counter="200"
                    max-length="200"
                    clearable
                  ></v-text-field>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? ---------------------------- Step 2 -->
            <v-window-item :step="2">
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

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? ---------------------------- Step 3 -->
            <v-window-item :step="3">
              <v-card elevation="0" style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <!--  -->

                  <!-- TODO --------- ActivitySelector needs to be built.  -->

                  <!-- ? -------------------------------- Activities -->
                  <ActivitySelector
                    :area="currentArea"
                    :selectedItemIdList="currentArea.activities"
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
        <v-card-actions class="pt-6">
          <!--  -->
          <!-- <v-spacer /> -->

          <!------------- Cancel -->
          <v-btn
            @click="triggerCancellation"
            rounded
            outlined
            density="comfortable"
            class="text-body-2 font-weight-light px-auto"
          >
            Cancel
          </v-btn>

          <v-spacer />

          <!------------- Save -->
          <v-btn
            @click="saveArea"
            rounded
            density="comfortable"
            :disabled="false"
            class="px-auto"
            color="primary"
            min-width="90"
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
