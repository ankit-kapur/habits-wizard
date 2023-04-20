<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DialogMode } from "./AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import CategoryChips from "../chips/CategoryChips.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
  },
  methods: {},
})
export default class CategoryCreateOrEditDialog extends Vue {
  @Prop()
  categoryTag!: CategoryTag;
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
      "👀 @Watch in CategorySelector. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }

    console.log(
      "🐞 🐞 🐞 @Watch triggered in CategoryCreateOrEdit. showDialog ===> " +
        this.showDialog +
        ", categoryTag_local ===> " +
        JSON.stringify(this.categoryTag_local) +
        ", dialogMode = " +
        this.dialogMode
    );
  }

  // <!-- * ------------------------------------------- Stores -->
  iconsStore = useIconsStore();

  // <!-- * ------------------------------------------- Lifecycle actions -->
  mounted() {
    this.iconsStore.loadIcons();
    this.onShow();
  }

  onShow() {
    this.categoryTag_local = deepCopy(this.categoryTag); // Reset

    // if (DialogMode[this.dialogMode] === DialogMode.CREATE) {
    //   console.log(
    //     "🌹 🌹 🌹 CREATE MODE ---- this.categoryTag_local = " +
    //       JSON.stringify(this.categoryTag_local)
    //   );
    //   this.categoryTag_local = deepCopy(defaultNewCategory); // Reset
    // } else {
    //   console.log("🌹 🌹 🌹 EDIT");
    //   this.categoryTag_local = deepCopy(this.categoryTag);
    // }
  }

  onHide() {
    // Do nothing. For now.
  }

  // ------------------------------------------------ Data
  categoryTag_local = deepCopy(defaultNewCategory);
  showDialogForConfirmDiscard = false;
  showColorPicker = false;
  showAdvancedColorPicker = false;

  get categoriesList() {
    return [this.categoryTag_local];
  }

  /**
   *  TODO --------- Replace with values from the THIEF
   */
  colorSwatches = [
    ["#FF0000", "#AA0000", "#550000"],
    ["#FFFF00", "#AAAA00", "#555500"],
    ["#00FF00", "#00AA00", "#005500"],
    ["#00FFFF", "#00AAAA", "#005555"],
    ["#0000FF", "#0000AA", "#000055"],
  ];

  // ------------------------------------------------ Methods
  resetNewCategoryData() {
    this.categoryTag_local = deepCopy(defaultNewCategory);
  }

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
    this.resetNewCategoryData();
  }

  saveCategoryTag() {
    // Reset dialog box
    // Ask the parent to update.
    console.log(
      "!!!!!! ------- this.categoryTag_local = " +
        JSON.stringify(this.categoryTag_local)
    );
    this.$emit("save-confirmed", this.categoryTag_local);

    this.resetNewCategoryData();
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

      <!-- <v-list>
        <v-list-item> -->
      <!-- ? ----------------- Box heading ---------------- * -->
      <!-- <v-list-item-content>
            <v-list-item-title>Category</v-list-item-title>
            <v-list-item-subtitle>Click save to create</v-list-item-subtitle>
          </v-list-item-content> -->

      <!-- ? -------------- (x) Close button -------------- * -->
      <!-- <v-list-item-action>
            <v-btn icon>
              <v-icon @click="triggerCancellation">mdi-close</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list> -->

      <v-card-text class="pa-0 ma-0">
        <v-card-title class="pb-0 text-h6 font-weight-light">
          {{ dialogMode === "CREATE" ? `New` : `Edit` }} category
        </v-card-title>
      </v-card-text>

      <v-card-text class="pa-0 ma-0">
        <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
          Pick a name & color
        </v-card-subtitle>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="">
        <v-container fluid>
          <v-row>
            <span class="mr-4 text-caption font-weight-light">Preview</span>
          </v-row>
          <v-row>
            <CategoryChips :categories="[categoryTag_local]" />
          </v-row>
        </v-container>
        <v-spacer />
      </v-card-actions>

      <v-divider></v-divider>

      <v-card-text class="pa-0 pt-2">
        <v-container fluid>
          <!--  -->

          <!-- * -------------------- Name text-field -------------------- * -->
          <v-row>
            <v-col class="px-auto">
              <!--  -->

              <!-- ? -------------- Text field ------------>
              <v-text-field
                label="Name"
                v-model="categoryTag_local.title"
                outlined
                clearable
                placeholder="New category"
                hint="Something short and sweet."
                counter="15"
                class="pa-0"
              >
                <!-- ? -------------- Color icon ------------>
                <!-- <template v-slot:prepend>
                  <div class="px-2">
                    <v-tooltip bottom right>
                      <template v-slot:activator="{ on }">
                        <v-icon
                          v-on="on"
                          :color="categoryTag_local.color"
                          class="pr-0"
                        >
                          mdi-circle
                        </v-icon>
                      </template>
                      Click to select a color
                    </v-tooltip>
                  </div>
                </template> -->

                <!--  -->
              </v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <!-- * ------------------------------- Pick a color ---------------------------->
      <v-card-actions
        @click="showColorPicker = !showColorPicker"
        class="pl-4 pb-4"
      >
        <!--  -->
        <!-- <v-spacer /> -->

        <!-- ? -------------- Circle with color -->
        <v-icon :color="categoryTag_local.color"> mdi-circle </v-icon>

        <!-- ? -------------- Hint -->
        <span class="pl-2 text-body-2 font-weight-light">Pick a color</span>

        <v-spacer />
      </v-card-actions>

      <!-- <v-divider /> -->

      <!-- * --------------------- Save / Cancel ---------------------->
      <v-card-actions class="pt-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn text @click="triggerCancellation"> Cancel </v-btn>
        <v-btn color="primary" @click="saveCategoryTag"> Save </v-btn>
      </v-card-actions>
    </v-card>

    <!-- * ----------------------- Dialogs  -------------------------->

    <!-- ? ----------------------- Color picker -->
    <v-dialog v-model="showColorPicker">
      <!--  -->
      <v-card class="pa-2 pt-4">
        <!-- TODO P0 --------- Set palette from Area -->

        <v-card-actions>
          <v-spacer />
          <v-icon @click="showColorPicker = false">mdi-close</v-icon>
        </v-card-actions>

        <v-card-text>
          <v-color-picker
            v-model="categoryTag_local.color"
            dot-size="25"
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
          <v-spacer />

          <!-- ? -------------- "Show more" button -->
          <v-btn
            text
            @click="showAdvancedColorPicker = !showAdvancedColorPicker"
          >
            Show more
          </v-btn>

          <v-spacer />
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
