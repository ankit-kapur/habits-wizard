<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import { DialogMode } from "@/model/enum/DialogMode";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";

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
export default class CategoryWizard extends Vue {
  @Prop()
  categoryTag?: CategoryTag;
  @Prop()
  area!: Area;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  // <!-- * ------------------------------------------- Watchers -->
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log("isDialogOpen " + isDialogOpen);

    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // Workaround for when space above bottom-sheet is tapped.
  @Watch("showDialog_local")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLocalDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    if (!isDialogOpen) this.closeViaParent();
  }

  // <!-- * ------------------------------------------- Data -->
  categoryTag_local = deepCopy(defaultNewCategory);
  showDialog_local = false;
  showDialogForConfirmDiscard = false;
  showDeleteConfirmDialog = false;
  showColorPicker = false;
  showAdvancedColorPicker = false;
  swatchesMaxColumns = 5;

  // <!-- * ------------------------------------------- Computed props -->
  get categoriesList() {
    return [this.categoryTag_local];
  }

  get boxTitle(): string {
    if (this.dialogMode === DialogMode.VIEW)
      return this.categoryTag_local.title;
    else if (this.dialogMode === DialogMode.CREATE) return "New Category";
    else if (this.dialogMode === DialogMode.EDIT) return "Editing Category";
    else return "invalid case. this is a bug.";
  }

  get boxSubTitle(): string {
    if (this.dialogMode === DialogMode.VIEW)
      return "Click edit/delete buttons to modify.";
    else if (this.dialogMode === DialogMode.CREATE)
      return "Pick a name & color";
    else if (this.dialogMode === DialogMode.EDIT)
      return "Click color or name to edit.";
    else return "invalid case. this is a bug.";
  }

  // <!-- * ---------------------------- Stores ---------------------------->
  iconsStore = useIconsStore();
  categoriesStore = useCategoryTagsStore();

  // <!-- * ---------------------------- Lifecycle actions ---------------------------->
  mounted() {
    this.iconsStore.loadIcons();
    this.onShow();
    console.log("🐪 Mounted CategoryWizard");
  }

  onShow() {
    // Reset
    this.categoryTag_local = deepCopy(
      this.categoryTag ? this.categoryTag : defaultNewCategory
    );

    this.showDialog_local = this.showDialog;
    this.showAdvancedColorPicker = false;

    if (this.dialogMode === DialogMode.CREATE && this.area.dominantColor)
      this.categoryTag_local.color = this.area.dominantColor;
  }

  onHide() {
    // Not sure if this is needed.
    this.showDialog_local = false;
  }

  // <!-- * ---------------------------- Computed Props ---------------------------->
  getColorPalette(): string[][] {
    if (!this.area || !this.area.palette) return [];
    // return this.colorSwatches;

    // Initialize with empty columns.
    const swatches: string[][] = [];
    for (let i = 0; i < this.swatchesMaxColumns; i++) {
      const emptyArray: string[] = [];
      swatches.push(emptyArray);
    }

    // Fill columns
    let column = 0;
    for (var color of this.area.palette) {
      swatches[column].push(color);
      column = (1 + column) % this.swatchesMaxColumns;
    }

    return swatches;
  }

  // <!-- * ---------------------------- Behavioral actions ---------------------------->
  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.closeViaParent();
    }
    this.showDialogForConfirmDiscard = false;
  }

  triggerDeleteAction(): void {
    // <!-- TODO P1 ----- Validate that the category is not attached to any Areas. -->
    this.showDeleteConfirmDialog = true;
  }

  switchBetweenViewEditModes(): void {
    if (this.dialogMode === DialogMode.VIEW)
      this.$emit("change-mode", DialogMode.EDIT);
    else if (this.dialogMode === DialogMode.EDIT) {
      // Save because 💾 floppy-disk icon was clicked.
      this.saveCategory();
      this.$emit("change-mode", DialogMode.VIEW);
    }
  }

  respondToDeleteConfirm(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.categoriesStore.deleteCategoryTag(this.categoryTag_local);
    }
    this.showDeleteConfirmDialog = false;
    this.closeViaParent(); // Ask parent to close.
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
      this.closeViaParent();
    } else {
      console.log("🐞 showDialogForConfirmDiscard");
      this.showDialogForConfirmDiscard = true;
    }
  }

  closeViaParent() {
    this.$emit("close", true);
  }

  // <!-- * ---------------------------- Store actions ---------------------------->

  saveCategory() {
    if (this.dialogMode === DialogMode.EDIT) {
      this.categoriesStore.updateCategoryTag(this.categoryTag_local);
    } else if (this.dialogMode === DialogMode.CREATE) {
      this.categoriesStore.createCategoryTag(this.categoryTag_local);
    }
    this.closeViaParent();
  }
}
</script>

<template>
  <v-bottom-sheet
    max-width="300"
    overlay-opacity="0.88"
    inset
    v-model="showDialog_local"
    :persistent="dialogMode !== `VIEW`"
    @keydown.esc="triggerCancellation"
    @keydown.enter="saveCategory"
  >
    <v-card flat class="px-2">
      <!--  -->

      <!-- ? ----------------- Box title ---------------- * -->
      <v-card-actions class="pa-4 pb-0 ma-0">
        <v-card-title class="pa-0 text-h6 font-weight-light">
          {{ boxTitle }}
        </v-card-title>
        <v-spacer />

        <!-- ? ---------- EDIT button -->
        <v-btn
          icon
          x-small
          v-if="dialogMode !== `CREATE`"
          @click="switchBetweenViewEditModes"
        >
          <v-icon>
            {{ dialogMode === `VIEW` ? "mdi-pencil" : "mdi-floppy" }}</v-icon
          >
        </v-btn>

        <!-- ? ---------- DELETE button -->
        <v-btn
          icon
          x-small
          v-if="dialogMode !== `CREATE`"
          @click="triggerDeleteAction"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-actions>

      <!-- ? ----------------- Box subtitle ---------------- * -->
      <v-card-text class="pa-0 ma-0">
        <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
          {{ boxSubTitle }}
        </v-card-subtitle>
      </v-card-text>

      <v-divider></v-divider>

      <!-- ? ----------------- Name text-field --------------------->
      <v-card-text class="pa-0 pt-2" v-if="dialogMode !== `VIEW`">
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
                hint="Pick a short and sweet name."
                counter="15"
                class="pa-0"
              />
            </v-col>
          </v-row>

          <!--  -->
        </v-container>
      </v-card-text>

      <!-- ? ------------------ Pick a color ----------------------->
      <v-card-actions class="pl-4 pb-4 pt-0" v-if="dialogMode !== `VIEW`">
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
          <v-row v-if="dialogMode !== `VIEW`">
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

      <!-- ? ------------------ Bottom Actions ---------------------->
      <v-card-actions class="pt-4 pb-4" v-if="dialogMode !== `VIEW`">
        <!--  -->
        <v-spacer></v-spacer>

        <!-- ? ---------- Cancel and Save buttons -->
        <v-btn text @click="triggerCancellation"> Cancel </v-btn>
        <v-btn color="primary" @click="saveCategory">
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
        <v-card-text>
          <v-color-picker
            v-model="categoryTag_local.color"
            mode="hexa"
            hide-inputs
            :swatches="getColorPalette()"
            swatches-max-height="200"
            show-swatches
            :hide-canvas="!showAdvancedColorPicker"
            :hide-sliders="!showAdvancedColorPicker"
          ></v-color-picker>
        </v-card-text>

        <v-card-actions>
          <!-- <v-spacer /> -->

          <!-- ? -------------- "Show more" button -->
          <v-btn
            text
            @click="showAdvancedColorPicker = !showAdvancedColorPicker"
          >
            See {{ showAdvancedColorPicker ? `less` : `more` }}
          </v-btn>

          <v-spacer />

          <!-- ? -------------- "Save" button -->
          <v-btn color="primary" @click="showColorPicker = false"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ? ------------------------ Confirm dialogs -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDiscardDialog"
      :showDialog="showDialogForConfirmDiscard"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />
    <ConfirmationDialog
      v-on:confirm-status-change="respondToDeleteConfirm"
      :showDialog="showDeleteConfirmDialog"
      messageToDisplay="Sure want to delete this category?"
      yesButtonText="Delete"
      noButtonText="Cancel"
    />
  </v-bottom-sheet>
</template>
