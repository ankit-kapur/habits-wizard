<script lang="ts">
import ActivityChips from "@/components/chips/ActivityChips.vue";
import ActivitySelector from "@/components/chips/ActivitySelector.vue";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import {
  defaultNewActivity,
  defaultNewArea,
  defaultNewEventRecord,
} from "@/constants/DefaultDataForForms";
import { DialogMode } from "@/model/enum/DialogMode";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import EventRecord from "@/model/pojo/records/EventRecord";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

/**
 * TODO P1 ----- Add validations. Especially when a Category is not selected. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
    ActivitySelector: ActivitySelector,
  },
  methods: {},
})
export default class RecordWizard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;
  @Prop()
  eventRecord?: EventRecord;

  /* <!-- ? ------------------------------ Watchers ------------------------------> */
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log("👀 @Watch in RecordWizard. showDialog = " + _newValue);
    const isDialogOpen = !!_newValue;
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

  /* <!-- ? ------------------------------ Stores ------------------------------> */
  iconsStore = useIconsStore();
  categoryTagsStore = useCategoryTagsStore();
  activitiesStore = useActivitiesStore();

  mounted() {
    console.log("🐪 Mounted RecordWizard");
    this.onShow();
  }

  /* <!-- ? ------------------------------ Data ------------------------------> */
  eventRecord_local: EventRecord = deepCopy(defaultNewEventRecord);
  activity_local: Activity = deepCopy(defaultNewActivity);
  area: Area = deepCopy(defaultNewArea()); // Temporary
  showDialog_local = false;
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showMeasurableSelectionDialog = false;
  showDeleteConfirmDialog = false;
  showSearchBar = false;
  searchInput = "";
  selectedCategoryId = "";

  // Stepper
  currentStepperPos = 0;
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";

  // TODO P2: Insert step for selecting an Area.
  stepTitles: Map<number, string> = new Map([
    [1, "Pick an Activity"],
    [2, "Select Time"],
    [3, "Record measurables"],
    [4, "Review"],
  ]);

  /* <!-- ? ------------------------------- Computed pros ------------------------------> */
  get categories(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  get numberOfSteps() {
    return this.stepTitles.size;
  }

  get stepperWindowTitle(): string {
    const title = this.stepTitles.get(this.currentStepperPos + 1);
    return title ? title : "";
  }

  // <!-- * ---------------------------- Lifecycle ---------------------------->
  onShow() {
    this.categoryTagsStore.subscribeToStore(); // Subscribe to store

    // Reset
    this.resetToDefaultState();
    this.showDialog_local = this.showDialog;

    // Assign category
    this.selectedCategoryId = this.activity_local.categoryId;
  }

  onHide() {
    // Unsubscribe from stores.
    this.categoryTagsStore.unsubscribe();

    // Not sure if this is needed.
    this.showDialog_local = false;
  }

  onSelectionChange() {
    if (this.selectedCategoryId.length > 0) {
      this.activity_local.categoryId = this.selectedCategoryId;
    } else {
      console.log("This is a bug 🐞");
    }
  }

  switchBetweenViewEditModes(): void {
    if (this.dialogMode === DialogMode.VIEW)
      this.$emit("change-mode", DialogMode.EDIT);
    else if (this.dialogMode === DialogMode.EDIT) {
      // Save because 💾 floppy-disk icon was clicked.
      this.saveEventRecord();
      this.$emit("change-mode", DialogMode.VIEW);
    }
  }

  resetToDefaultState() {
    // Stepper
    this.currentStepperPos = 0;
  }

  respondToDiscardConfirm(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.closeViaParent();
    }
    this.showDialogForConfirmDiscard = false;
  }

  closeViaParent() {
    this.$emit("close", true);
  }

  // <!-- * ---------------------------- Validations ---------------------------->
  isValidEventRecord() {
    // TODO ---- Actually validate
    return true;
  }

  // <!-- * ---------------------------- Store actions ---------------------------->
  saveEventRecord() {
    // TODO ---- Save

    this.closeViaParent();
  }

  // <!-- * ---------------------------- Cancel ---------------------------->
  get hasChanged() {
    return !(
      JSON.stringify(this.eventRecord_local) ===
        JSON.stringify(this.eventRecord) ||
      JSON.stringify(this.eventRecord_local) ===
        JSON.stringify(defaultNewEventRecord)
    );
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (this.hasChanged) {
      this.showDialogForConfirmDiscard = true;
    } else {
      this.closeViaParent();
    }
  }

  /* <!-- * ----------------------------- Delete actions ------------------------------> */

  triggerDeleteAction(): void {
    // <!-- TODO P2 ----- Validate its safe to delete -->
    this.showDeleteConfirmDialog = true;
  }

  respondToDeleteConfirmDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.activitiesStore.deleteActivity(this.activity_local);
    }
    this.showDeleteConfirmDialog = false;
    this.closeViaParent(); // Ask parent to close.
  }

  /* <!-- ? ------------------------------ Stepper ------------------------------> */
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

  getStepPositionColor(stepNumber: number): string {
    // TODO: Green if step completed.
    return this.isCurrentStep(stepNumber) ? "primary" : "darkgray";
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getStepPositionIcon(stepNumber: number) {
    // TODO: Success or Error icon if validation fails.
    return "mdi-record";
  }
}
</script>

<template>
  <div class="">
    <v-bottom-sheet
      v-model="showDialog_local"
      inset
      max-width="400"
      overlay-opacity="0.88"
      :persistent="hasChanged"
      @keydown.esc="triggerCancellation"
      @keydown.enter="saveEventRecord"
    >
      <!-- @keydown.enter="saveActivity" -->
      <v-card flat class="px-2">
        <!--  -->
        <!-- ? ---------------------------------- Top panel --------------------------------- * -->

        <v-card-actions class="pa-3 pt-5 pb-4 ma-0">
          <!-- ? ----------------- Box title ---------------- * -->
          <v-card-title
            class="pa-0 text-h5 font-weight-light"
            style="color: purple"
          >
            <span :color="`primary`"> Record an event </span>
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
              {{ dialogMode === `EDIT` ? "mdi-floppy" : "mdi-pencil" }}</v-icon
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

          <!-- ? ---------- CLOSE button -->
          <v-btn
            icon
            medium
            v-if="dialogMode === `CREATE`"
            @click="closeViaParent"
            color="primary"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>

          <!--  -->
        </v-card-actions>

        <v-divider />

        <!-- ? ----------------- Box subtitle ---------------- * -->
        <v-card-actions class="pa-3 ma-0">
          <v-card-subtitle
            class="pa-0 text-h6 font-weight-light"
            style="color: grey"
          >
            Step {{ currentStepperPos + 1 }}: {{ stepperWindowTitle }}
          </v-card-subtitle>

          <v-spacer />

          <!-- ? ----------------- Filter --------------------->
          <!-- TODO P2 ----- Show a dialog for selecting an Area and/or Category -->
          <v-btn icon v-if="currentStepperPos == 0">
            <v-icon>mdi-filter</v-icon>
          </v-btn>

          <!--  -->
        </v-card-actions>

        <!-- <v-divider /> -->

        <!-- ? ------------------------- Stepper Window -------------------------->
        <v-card-text class="pa-3 ma-0">
          <v-window v-model="currentStepperPos">
            <!--  -->

            <!-- ? --------------------------------------------- Step 1: Activity selection -->
            <v-window-item :step="1">
              <ActivitySelector :isDisplayed="showDialog" />
            </v-window-item>

            <!-- ? --------------------------------------------- Step 2: Time selection -->
            <v-window-item :step="2">
              <!--  -->

              <!-- TODO ----- if Activity has time-tracking (i.e. has a Duration-type measurable) -->
              <!-- Then ask for a start time. Otherwise skip step 2 entirely. -->

              <!-- TODO ----- show options: -->
              <!--      1. Not started -->
              <!--      2. Started -->
              <!--      3. Completed already -->

              <!--  -->
            </v-window-item>

            <!-- ? --------------------------------------------- Step 3: Record Measurables -->
            <v-window-item :step="3">
              <!--  -->

              <!-- TODO ----- Should be optional. Can enter later. -->
              <!-- Then ask for a start time. Otherwise skip step 2 entirely. -->

              <!--  -->
            </v-window-item>

            <!-- ? --------------------------------------------- Step 4: Review -->
            <v-window-item :step="4">
              <!--  -->
              <!-- WIP -->
              <!--  -->
            </v-window-item>

            <!-- ? ---- Window ends here -->
          </v-window>
        </v-card-text>

        <v-divider />

        <!-- ? ----------- Buttons for window navigation -------------->
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
              <!-- ? ---------------- Step button -->
              <v-btn :input-value="active" icon @click="toggle">
                <v-icon
                  :color="getStepPositionColor(n)"
                  :style="{
                    border: (isCurrentStep(n) ? '0' : '0') + 'px black solid',
                    'border-radius': '12px',
                  }"
                >
                  {{ getStepPositionIcon(n) }}
                </v-icon>
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

        <!-- ? ------------------ Bottom Actions ---------------------->
        <v-card-actions class="pt-4 pb-4">
          <v-spacer></v-spacer>

          <!-- ? ---------- Cancel and Save buttons -->
          <v-btn text @click="triggerCancellation"> Cancel </v-btn>
          <v-btn
            color="primary"
            @click="saveEventRecord"
            :diabled="isValidEventRecord"
          >
            {{ `Save` }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- * ------------------------ Dialogs  -------------------------->

      <!-- ? ---------------- Confirm discard  ------------------->
      <ConfirmationDialog
        v-on:confirm-status-change="respondToDiscardConfirm"
        :showDialog="showDialogForConfirmDiscard"
        messageToDisplay="Sure you want to discard this?"
        yesButtonText="Discard"
        noButtonText="Cancel"
      />

      <ConfirmationDialog
        v-on:confirm-status-change="respondToDeleteConfirmDialog"
        :showDialog="showDeleteConfirmDialog"
        messageToDisplay="Sure want to delete this?"
        yesButtonText="Delete"
        noButtonText="Cancel"
      />
    </v-bottom-sheet>
  </div>
</template>
