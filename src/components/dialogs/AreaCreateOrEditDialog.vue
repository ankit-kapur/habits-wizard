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

// TODO --- Use ColorThief to pick a color-palette from the image.
//          Currently failing because npm can't install canvas.
// import ColorThief from "colorthief";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategorySelector: CategorySelector,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.showThisDialog = this.showDialog;
    if (this.providedArea != null)
      this.currentArea = deepCopy(this.providedArea);
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
      max-width="600"
      inset
      v-model="showThisDialog"
      persistent
      overlay-opacity="0.88"
      @keydown.esc="triggerCancellation"
    >
      <v-card>
        <!--------------------- Image ----------------------->
        <v-img
          :src="currentArea.imageUrl"
          height="180"
          @click="showImageEditDialog = true"
        ></v-img>

        <!-- <v-card-text>
          <v-text-field
            v-model="currentArea.imageUrl"
            label="Image URL"
            @click="showImageEditDialog = false"
          ></v-text-field
        ></v-card-text> -->

        <!-- <v-card-title>
          <span class="text-h4">{{ currentArea.title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon
            ><v-icon @click="triggerCancellation">mdi-close</v-icon></v-btn
          >
        </v-card-title> -->

        <v-card-text>
          <v-form ref="areaForm" v-model="valid" lazy-validation>
            <v-text-field
              outlined
              v-model="currentArea.title"
              :rules="areaNameRules"
              label="Area"
              required
              autofocus
              clearable
              style="font-size: 22px"
              class="mt-6"
            ></v-text-field>

            <v-text-field
              v-model="currentArea.description"
              label="Description"
              counter="200"
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

            <!-- * -------------------------------- Tag selector for category chips -->
            <CategorySelector
              :allItemsList="categoryStore.getCategoryTagsList()"
              :selectedItemIdList="currentArea.categoryTags"
              :area="currentArea"
              v-on:category-tags-changed="onCategoryTagsChanged"
            ></CategorySelector>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text class="pr-6" @click="triggerCancellation"> Cancel </v-btn>
          <v-btn text color="primary" :disabled="!valid" @click="saveArea">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- * -------------------------------- Confirm dialog for discarding -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDialog"
      :showDialog="showDiscardConfirmationDialog"
      messageToDisplay="Sure you want to discard this?"
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
