<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import CategoryChips from "../chips/CategoryChips.vue";
import { DialogMode } from "@/model/enum/DialogMode";

/**
 * TODO P1 ----- Add validations. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
  },
  methods: {},
})
export default class CategoryCreateOrEditDialog extends Vue {
  @Prop()
  categoryTag?: CategoryTag;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  // <!-- * ------------------------------------------- Watchers -->
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in CategoryCreateOrEdit. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // <!-- * ------------------------------------------- Data -->
  categoryTag_local = deepCopy(defaultNewCategory);
  showDialogForConfirmDiscard = false;
  showColorPicker = false;
  showAdvancedColorPicker = false;

  // <!-- * ------------------------------------------- Computed props -->
  get categoriesList() {
    return [this.categoryTag_local];
  }

  // <!-- * ------------------------------------------- Stores -->
  iconsStore = useIconsStore();

  // <!-- * ------------------------------------------- Lifecycle actions -->
  mounted() {
    this.iconsStore.loadIcons();
    this.onShow();
    console.log("🐪 Mounted CategoryCreateOrEditDialog");
  }

  onShow() {
    // Reset
    this.categoryTag_local = this.categoryTag
      ? this.categoryTag
      : defaultNewCategory;
  }

  onHide() {
    // No actions so far.
  }

  /**
   *  TODO --------- Replace with values from the Thief
   */
  colorSwatches = [
    ["#FF0000", "#AA0000", "#550000"],
    ["#FFFF00", "#AAAA00", "#555500"],
    ["#00FF00", "#00AA00", "#005500"],
    ["#00FFFF", "#00AAAA", "#005555"],
    ["#0000FF", "#0000AA", "#000055"],
  ];

  // ------------------------------------------------ Methods
  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.discard();
    } else {
      console.log("NOT DISCARDING");
    }
    this.showDialogForConfirmDiscard = false;
  }

  discard() {
    console.log("DISCARDING");
    this.$emit("discard", true);
  }

  saveCategoryTag() {
    // Reset dialog box
    // Ask the parent to update.
    this.$emit("save-confirmed", this.categoryTag_local);
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.categoryTag_local) ===
        JSON.stringify(this.categoryTag) ||
      JSON.stringify(this.categoryTag_local) ===
        JSON.stringify(defaultNewCategory)
    ) {
      console.log("🐞 discard");
      this.discard();
    } else {
      console.log("🐞 showDialogForConfirmDiscard");
      this.showDialogForConfirmDiscard = true;
    }
  }
}
</script>

<template>
  <v-bottom-sheet
    max-width="300"
    overlay-opacity="0.88"
    inset
    v-model="showDialog"
    persistent
    @keydown.esc="triggerCancellation"
    @keydown.enter="saveCategoryTag"
  >
    <v-card flat class="px-2">
      <!--  -->

      <!-- ? ----------------- Box title ---------------- * -->
      <v-card-actions class="pa-4 pb-0 ma-0">
        <v-card-title class="pa-0 text-h6 font-weight-light">
          {{ dialogMode === "CREATE" ? `New` : `Edit` }} Category
        </v-card-title>
        <v-spacer />
        <!-- ? ------------- (x) Close button --------------->
        <v-icon @click="triggerCancellation">mdi-close</v-icon>
      </v-card-actions>

      <!-- ? ----------------- Box subtitle ---------------- * -->
      <v-card-text class="pa-0 ma-0">
        <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
          Pick a name & color
        </v-card-subtitle>
      </v-card-text>

      <v-divider></v-divider>

      <!-- ? ----------------- Name text-field --------------------->
      <v-card-text class="pa-0 pt-2">
        <v-container fluid>
          <!--  -->

          <v-row>
            <v-col class="px-auto pb-0">
              <!--  -->
              <!-- ? -------------- Text field ------------>
              <v-text-field
                label="Name"
                v-model="categoryTag_local.title"
                outlined
                clearable
                placeholder="Category name"
                hint="Something short and sweet."
                counter="15"
                class="pa-0"
              />
            </v-col>
          </v-row>

          <!--  -->
        </v-container>
      </v-card-text>

      <!-- ? ------------------ Pick a color ----------------------->
      <v-card-actions class="pl-4 pb-4 pt-0">
        <v-container fluid>
          <v-row>
            <!-- ? -------------- Hint -->
            <span class="mr-4 ml-1 mb-1 text-caption font-weight-light">
              Pick a color
            </span>
          </v-row>
          <v-row>
            <!-- ? -------------- Circle with color -->
            <v-icon
              x-large
              @click="showColorPicker = true"
              :color="categoryTag_local.color"
            >
              mdi-circle
            </v-icon>
          </v-row>
        </v-container>

        <v-spacer />
      </v-card-actions>

      <v-divider />

      <!-- ? --------------------- Preview ------------------------->
      <v-card-actions class="">
        <v-container fluid>
          <v-row>
            <span class="mr-4 ml-1 mb-1 text-caption font-weight-light">
              Preview
            </span>
          </v-row>
          <v-row>
            <CategoryChips :categories="[categoryTag_local]" />
          </v-row>
        </v-container>
        <v-spacer />
      </v-card-actions>

      <!-- ? ------------------ Save / Cancel ---------------------->
      <v-card-actions class="pt-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn text @click="triggerCancellation"> Cancel </v-btn>
        <v-btn color="primary" @click="saveCategoryTag">
          {{ dialogMode === "CREATE" ? `Create` : `Save` }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- * ----------------------- Dialogs  -------------------------->

    <!-- ? ----------------------- Color picker dialog -->
    <v-dialog v-model="showColorPicker">
      <v-card class="pa-2 pt-4">
        <!--  -->

        <!-- ? ----------------------- Close button -->
        <v-card-actions>
          <v-spacer />
          <v-icon @click="showColorPicker = false">mdi-close</v-icon>
        </v-card-actions>

        <!-- ? ----------------------- Color picker -->
        <!-- TODO P0 --------- Set palette from Area -->
        <v-card-text>
          <v-color-picker
            v-model="categoryTag_local.color"
            mode="hexa"
            hide-inputs
            :swatches="colorSwatches"
            swatches-max-height="200"
            show-swatches
            :hide-canvas="showAdvancedColorPicker"
            :hide-sliders="showAdvancedColorPicker"
          ></v-color-picker>
        </v-card-text>

        <v-card-actions>
          <!-- <v-spacer /> -->

          <!-- ? -------------- "Show more" button -->
          <v-btn
            text
            @click="showAdvancedColorPicker = !showAdvancedColorPicker"
          >
            See more
          </v-btn>

          <v-spacer />

          <!-- ? -------------- "Save" button -->
          <v-btn color="primary" @click="showColorPicker = false"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ? ------------------------ Confirm discard -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDiscardDialog"
      :showDialog="showDialogForConfirmDiscard"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />
  </v-bottom-sheet>
</template>
