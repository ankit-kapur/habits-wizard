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
import ColorPicker from "@/components/picker/ColorPicker.vue";

/**
 * TODO P1 ----- Add validations. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
    ColorPicker: ColorPicker,
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
  categoryOriginal: CategoryTag | null = null;
  showDialog_local = false;
  showDialogForConfirmDiscard = false;
  showDeleteConfirmDialog = false;
  showColorPicker = false;

  // <!-- * ------------------------------------------- Computed props -->
  get categoriesList() {
    return [this.categoryTag_local];
  }

  get boxTitle(): string {
    if (this.dialogMode === DialogMode.VIEW) return "Category";
    else if (this.dialogMode === DialogMode.CREATE) return "New Category";
    else if (this.dialogMode === DialogMode.EDIT) return "Editing Category";
    else return "invalid case. this is a bug.";
  }

  get hasChanged() {
    return !(
      JSON.stringify(this.categoryTag_local) ===
      JSON.stringify(this.categoryOriginal)
    );
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

    // Set dialog states
    this.showDialog_local = this.showDialog;

    // Set color
    if (this.dialogMode === DialogMode.CREATE)
      this.categoryTag_local.color = this.area.color;

    this.categoryOriginal = deepCopy(this.categoryTag_local);
  }

  onHide() {
    this.showDialog_local = false; // Not sure if this is needed.
  }

  // <!-- * ---------------------------- Computed Props ---------------------------->

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
    console.log("triggerCancellation ==== " + this.hasChanged);
    if (this.hasChanged) this.showDialogForConfirmDiscard = true;
    else this.closeViaParent();
  }

  closeViaParent() {
    this.$emit("close", true);
  }

  selectedNewColor(newColor: string) {
    this.categoryTag_local.color = deepCopy(newColor);
    this.hideColorPicker();
  }

  hideColorPicker() {
    this.showColorPicker = false;
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
  <v-dialog
    max-width="500"
    overlay-opacity="0.88"
    inset
    v-model="showDialog_local"
    :persistent="hasChanged"
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
          small
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
          small
          v-if="dialogMode !== `CREATE`"
          @click="triggerDeleteAction"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-card-actions>

      <!-- ? ----------------- Box subtitle ---------------- * -->
      <!-- <v-card-text class="pa-0 ma-0">
        <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
          {{ boxSubTitle }}
        </v-card-subtitle>
      </v-card-text> -->

      <!-- ? --------------------- Preview ------------------------->
      <v-card-actions class="">
        <v-container fluid>
          <v-row>
            <CategoryChips :categories="[categoryTag_local]" />
          </v-row>
        </v-container>
        <v-spacer />
      </v-card-actions>

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

    <!-- ? ------------------------ Color picker -->
    <ColorPicker
      :isDisplayed="showColorPicker"
      :initialColor="area.color"
      :area="area"
      v-on:selected-color="selectedNewColor"
      v-on:cancel="hideColorPicker"
    />

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
  </v-dialog>
</template>
