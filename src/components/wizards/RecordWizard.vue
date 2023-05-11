<script lang="ts">
import ActivityChips from "@/components/chips/ActivityChips.vue";
import ActivitySelector from "@/components/chips/ActivitySelector.vue";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import TimePicker from "@/components/picker/TimePicker.vue";
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
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { useEventRecordsStore } from "@/store/EventRecordsStore";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

/**
 * TODO P1 ----- Add validations.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
    ActivitySelector: ActivitySelector,
    TimePicker: TimePicker,
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
  onPropertyChanged(_newValue: string) {
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
  onLocalDisplayStateChange(_newValue: string) {
    const isDialogOpen = !!_newValue;
    if (!isDialogOpen) this.closeViaParent();
  }

  /* <!-- ? ------------------------------ Stores ------------------------------> */
  iconsStore = useIconsStore();
  areasStore = useAreasStore();
  categoriesStore = useCategoryTagsStore();
  activitiesStore = useActivitiesStore();
  eventRecordsStore = useEventRecordsStore();

  mounted() {
    console.log("🐪 Mounted RecordWizard");
    this.onShow();
  }

  /* <!-- ? ------------------------------ Data ------------------------------> */
  eventRecord_local: EventRecord = deepCopy(defaultNewEventRecord);
  activity_local: Activity = deepCopy(defaultNewActivity);
  area: Area = deepCopy(defaultNewArea); // Temporary
  showDialog_local = false;
  selectedActivity: Activity | null = null;
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showMeasurableSelectionDialog = false;
  showDeleteConfirmDialog = false;
  showSearchBar = false;
  searchInput = "";

  // Time-related
  timingProgressSelection = ""; // Whether in the past or in progress or yet to start.
  durationInMinutes = 1;

  // Stepper
  stepperPosition = 1;
  disabledSteps: number[] = [];
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";

  // <!-- TODO P0 ------ 🚨 🚨 🚨 DISABLE CLICK IN STEP IF PREVIOUS STEP IS NOT COMPLETE 🚨 🚨 🚨

  stepsConfig = {
    STEP_1: {
      id: 1,
      title: "Activity",
      isComplete: function (selectedActivity) {
        return selectedActivity !== null;
      },
      rules: [
        () => {
          const result =
            this.stepperPosition === 1 || this.selectedActivity !== null;
          console.log("✅ ✅ ✅ ✅ ✅ rules result = " + result);

          /* <!-- TODO P1 ------ WHY IS THIS ONLY GETTING CALLED ONCE? --> */

          return result;
        },
      ],
    },
    STEP_2: {
      id: 2,
      title: "Time",
      isComplete: function (
        selectedActivity: Activity,
        eventRecord: EventRecord
      ) {
        // TODO P0 ----- Decide logic.
        console.log("" + selectedActivity + eventRecord);
        return true;
      },
      rules: [() => true],
    },
    STEP_3: {
      id: 3,
      title: "Duration",
      isComplete: function (
        selectedActivity: Activity,
        eventRecord: EventRecord
      ) {
        // TODO P0 ----- Decide logic.
        return (
          (selectedActivity?.hasTimeMeasurable && eventRecord.completionTime) ||
          (selectedActivity?.hasDurationMeasurable &&
            eventRecord.startTime &&
            eventRecord.durationInSeconds)
        );
      },
      rules: [() => true],
    },
    STEP_4: {
      id: 4,
      title: "Metrics",
      isComplete: function (
        selectedActivity: Activity,
        eventRecord: EventRecord
      ) {
        // <!-- TODO P1 ------- All REQUIRED measurables must be provided. -->
        return selectedActivity !== null && eventRecord !== null;
      },
      rules: [() => true],
    },
  };

  /* <!-- * ------------------------------- Computed props ------------------------------> */
  get categories(): CategoryTag[] {
    return this.categoriesStore.getCategoriesByIDs(this.area.categoryIDList);
  }

  get areas(): Area[] {
    return this.areasStore.getAll();
  }

  get isInCreateMode() {
    return this.dialogMode && this.dialogMode === DialogMode.CREATE;
  }

  get numberOfSteps() {
    return Object.keys(this.stepsConfig).length;
  }

  get activityColor(): string {
    const areaMatched = this.areas.find(
      (area) => this.selectedActivity?.areaId === area.id
    );
    return areaMatched ? areaMatched.color : "";
  }

  // <!-- * ---------------------------- Lifecycle ---------------------------->
  onShow() {
    // Subscribe to stores
    this.areasStore.subscribeToStore();
    this.categoriesStore.subscribeToStore();

    // Reset
    this.resetToDefaultState();
    this.showDialog_local = this.showDialog;

    // Edit mode
    if (this.dialogMode === DialogMode.EDIT) {
      // Disable "Activity" and "Status" steps
      this.disabledSteps.push(
        this.stepsConfig.STEP_1.id,
        this.stepsConfig.STEP_2.id
      );

      // Don't start at 1st step.
      this.moveToNextStep();
    }
  }

  onHide() {
    // Unsubscribe from stores.
    this.areasStore.unsubscribe();
    this.categoriesStore.unsubscribe();

    // Not sure if this is needed.
    this.showDialog_local = false;
  }

  onActivitySelect(providedActivity: Activity) {
    this.selectedActivity = providedActivity;

    this.disabledSteps = []; // Reset
    if (!this.selectedActivity) return; // If nothing's selected.

    if (!this.selectedActivity.hasTimeMeasurable) {
      this.disabledSteps.push(this.stepsConfig.STEP_2.id); // Skip step-2 (Time)
    }

    if (!this.selectedActivity.hasDurationMeasurable) {
      this.disabledSteps.push(this.stepsConfig.STEP_3.id); // Skip step-3 (Duration)
    }

    // Move to next step
    if (this.selectedActivity) this.moveToNextStep();
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
    this.stepperPosition = 1;
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
    return false;
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
    // TODO P2 ----- Validate its safe to delete
    this.showDeleteConfirmDialog = true;
  }

  respondToDeleteConfirmDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.eventRecordsStore.deleteEventRecord(this.eventRecord_local);
    }
    this.showDeleteConfirmDialog = false;
    this.closeViaParent(); // Ask parent to close.
  }

  /* <!-- * ------------------------------ Stepper ------------------------------> */
  moveToStep(destination: number) {
    if (!this.selectedActivity) return; // Disallow if no Activity is selected.
    if (destination >= this.numberOfSteps) {
      this.stepperPosition = this.numberOfSteps;
    } else if (destination < 0) {
      this.stepperPosition = this.numberOfSteps - 1;
    } else {
      this.stepperPosition = destination;
    }
  }

  moveToNextStep() {
    let newStep = 1 + this.stepperPosition;
    while (this.disabledSteps.includes(newStep)) newStep++; // Skip over disabled steps
    this.moveToStep(newStep);
  }

  moveToPreviousStep() {
    let newStep = this.stepperPosition - 1;
    while (this.disabledSteps.includes(newStep)) newStep--; // Skip over disabled steps
    this.moveToStep(newStep);
  }

  isCurrentStep(stepNumber: number) {
    return this.stepperPosition == stepNumber - 1;
  }

  /* <!-- * ------------------------------ Stepper ------------------------------> */
  setStartTime(selectedTime: string) {
    console.log(selectedTime); // 24H Format: "13:59"
    // TODO P0: Need to make a date-picker component as well.
  }

  setCompletionTime(selectedTime: string) {
    console.log(selectedTime);
    // TODO: Same as above.
  }

  isStepDisabled(stepNumber: number) {
    return this.disabledSteps.includes(stepNumber);
  }

  /**
   * Shows a strikethrough line if step is disabled.
   */
  getStepTitleStyle(stepNumber: number) {
    return this.isStepDisabled(stepNumber)
      ? "text-decoration: line-through"
      : "";
  }

  onStepClick(stepNumber: number) {
    if (!this.selectedActivity && stepNumber != 1) return; // Disallow if no Activity is selected.
    if (!this.disabledSteps.includes(stepNumber))
      this.stepperPosition = stepNumber;
  }
}
</script>

<template>
  <div class="">
    <v-bottom-sheet
      v-model="showDialog_local"
      inset
      max-width="600"
      overlay-opacity="0.88"
      :persistent="hasChanged"
      @keydown.esc="triggerCancellation"
    >
      <v-card flat class="px-2">
        <!--  -->
        <!-- ? ---------------------------------- Top bar --------------------------------- * -->

        <v-card-actions class="pa-3 pt-5 pb-4 ma-0">
          <!-- ? ----------------- Box title ---------------- * -->
          <v-card-title
            class="pa-0 text-h5 font-weight-light"
            style="color: purple"
          >
            {{ isInCreateMode ? `New` : `Editing` }} Record
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

        <!-- * ------------------------------------- Stepper ----------------------------------->
        <v-card-text class="pa-0 ma-0">
          <v-stepper
            v-model="stepperPosition"
            vertical
            elevation="0"
            class="pb-4"
          >
            <!--  -->

            <!-- ? --------------------------------------------- Step 1 ------- Activity selection -->
            <v-stepper-step
              :step="stepsConfig.STEP_1.id"
              :complete="stepsConfig.STEP_1.isComplete(selectedActivity)"
              :rules="stepsConfig.STEP_1.rules"
              @click="onStepClick(stepsConfig.STEP_1.id)"
              class=""
            >
              <!--  -->

              <!-- ? ---------- Title -->
              <span class="text-h6 font-weight-light">{{
                stepsConfig.STEP_1.title
              }}</span>

              <!-- ? ---------- Subtitle -->
              <span
                v-if="selectedActivity !== null"
                class="text-caption font-weight-light"
              >
                <br />
                <!-- Selected -->
                <!-- Color by category -->
                <span
                  v-bind:style="{
                    color: activityColor,
                  }"
                >
                  <v-icon x-small :color="activityColor">
                    {{ selectedActivity.icon }}
                  </v-icon>
                  {{ selectedActivity.title }}</span
                >
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_1.id" class="pa-1">
              <!--  -->

              <v-card flat max-width="88%" class="pl-1 pa-0 ma-0">
                <!--  -->

                <ActivitySelector
                  :isDisplayed="showDialog"
                  v-on:selection-changed="onActivitySelect"
                />

                <!--  -->
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 2 ------- Time -->
            <v-stepper-step
              :step="stepsConfig.STEP_2.id"
              :complete="false"
              @click="onStepClick(stepsConfig.STEP_2.id)"
              class=""
            >
              <!-- ? ---------- Title -->
              <span
                class="text-h6 font-weight-light"
                :style="getStepTitleStyle(stepsConfig.STEP_2.id)"
              >
                {{ stepsConfig.STEP_2.title }}</span
              >

              <!-- ? ---------- Subtitle -->
              <span
                v-if="eventRecord_local.eventState !== null"
                class="text-caption font-weight-light"
              >
                <br />
                <!-- TODO P1 ------ Show selected time here. Start time (if hasDurationMeasurable) or Completion time (if hasTimeDuration) -->
                <span> WIP </span>
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_2.id" class="pa-1">
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <v-container>
                  <!--  -->

                  <!------- Case 1: NO duration measurable ------->
                  <!--  -->
                  <v-row v-if="!selectedActivity?.hasDurationMeasurable">
                    <v-col cols="6" class="pa-auto">
                      <span class="pb-0" style="color: gray">
                        Completed at
                      </span>

                      <!-- ? ------------------------ COMPLETION TIME picker -->
                      <TimePicker
                        :isDisplayed="showDialog"
                        v-on:time-selected="setCompletionTime"
                      />
                      <!-- titleText="Completion Time" -->
                    </v-col>
                  </v-row>

                  <!------- Case 2: Has Duration measurable ------->
                  <div v-if="selectedActivity?.hasDurationMeasurable">
                    <v-row>
                      <v-col class="pa-auto">
                        <!--  -->
                        <span>Status</span>

                        <v-radio-group v-model="timingProgressSelection">
                          <v-radio label="Not started" value="notStarted" />
                          <v-radio label="In progress" value="inProgress" />
                          <v-radio label="Done already" value="doneAlready" />
                        </v-radio-group>
                      </v-col>
                    </v-row>

                    <!-- TODO P2 --- When "Not started" is selected, show "START NOW" button and skip duration screen -->
                    <v-row>
                      <v-col cols="6" class="pa-auto">
                        <span class="pb-0" style="color: gray">
                          Started at
                        </span>

                        <!-- ? ------------------------ START TIME picker -->
                        <TimePicker
                          :isDisplayed="showDialog"
                          v-on:time-selected="setStartTime"
                        />
                      </v-col>
                    </v-row>

                    <!--  -->
                  </div>

                  <!--  -->
                </v-container>
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 3 ------- Duration -->
            <v-stepper-step
              :step="stepsConfig.STEP_3.id"
              :complete="false"
              @click="onStepClick(stepsConfig.STEP_3.id)"
              class=""
            >
              <!-- ? ---------- Title -->
              <span
                class="text-h6 font-weight-light"
                :style="getStepTitleStyle(stepsConfig.STEP_3.id)"
              >
                {{ stepsConfig.STEP_3.title }}</span
              >

              <!-- ? ---------- Subtitle -->
              <span
                v-if="eventRecord_local.durationInSeconds !== null"
                class="text-caption font-weight-light"
              >
                <br />
                <!-- TODO P1 ------ Show duration here -->
                <span> WIP. Show duration here </span>
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_3.id" class="pa-1">
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <v-container>
                  <!--  -->

                  <!-- TODO P2 --- Only -->
                  <v-row v-if="timingProgressSelection !== `doneAlready`">
                    <span class="pb-0 ma-auto" style="color: gray">
                      In progress
                    </span>
                    <span class="pb-0 ma-auto" style="color: gray">
                      WIP. Show time elapsed here (live timer)
                    </span>
                  </v-row>

                  <!-- ? ----- Only shown if DONE -->
                  <v-row v-if="timingProgressSelection === `doneAlready`">
                    <!--  -->

                    <!-- ? ------------ DURATION -->
                    <v-col cols="4" class="pa-auto">
                      <span class="pb-4" style="color: gray">Duration</span>

                      <v-row>
                        <v-col cols="10">
                          <v-text-field
                            v-model="durationInMinutes"
                            hide-details
                            single-line
                            title="Duration (in minutes)"
                            type="number"
                            class="ma-0 pa-0 pt-1"
                          />

                          <!-- TODO P1 --- Clicking on "minutes" should allow changing to hours -->
                          <span>minutes</span>
                        </v-col>
                      </v-row>
                    </v-col>

                    <!-- ? ------------ OR -->
                    <v-col
                      cols="1"
                      v-if="selectedActivity?.hasDurationMeasurable"
                      class="mr-2 pa-auto ma-0 d-flex justify-center align-center"
                    >
                      <span class="pb-4" style="color: gray">OR</span>
                    </v-col>

                    <!-- ? ------------ Time picker for COMPLETION TIME -->
                    <v-col cols="6" class="pa-auto">
                      <span class="pb-0" style="color: gray">
                        Completed at
                      </span>

                      <TimePicker
                        :isDisplayed="showDialog"
                        v-on:time-selected="setCompletionTime"
                      />
                    </v-col>

                    <!--  -->
                  </v-row>

                  <!--  -->
                </v-container>
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 4 ------- Metrics -->
            <v-stepper-step
              :step="stepsConfig.STEP_4.id"
              :complete="false"
              @click="onStepClick(stepsConfig.STEP_4.id)"
              class=""
            >
              <!-- ? ---------- Title -->
              <span
                class="text-h6 font-weight-light"
                :style="getStepTitleStyle(stepsConfig.STEP_4.id)"
              >
                {{ stepsConfig.STEP_4.title }}</span
              >

              <!-- ? ---------- Subtitle -->
              <span
                v-if="eventRecord_local.durationInSeconds !== null"
                class="text-caption font-weight-light"
              >
                <br />
                <!-- TODO P2 ------ Show how many required measurables have been provided v/s missing. -->
                <span> WIP. </span>
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_4.id" class="pa-1">
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <!--  -->

                <!-- TODO ------------ Implement -->
                <!-- Make a new component. 2 sections: Required and Optional -->

                <!--  -->
              </v-card>
            </v-stepper-content>

            <!-- ? ---- Window ends here -->
          </v-stepper>
        </v-card-text>

        <!-- * ----------- Buttons for window navigation -------------->
        <v-card-actions class="px-0 pb-4 justify-space-between">
          <!--  -->

          <!-- ? ----------- Previous -->
          <v-btn
            text
            :disabled="stepperPosition === 1"
            @click="moveToPreviousStep()"
            class="px-3"
          >
            <v-icon> mdi-chevron-left </v-icon>
            <span>Previous</span>
          </v-btn>

          <v-spacer />

          <!-- ? ----------- Next -->
          <v-btn
            text
            :disabled="stepperPosition === numberOfSteps"
            @click="moveToNextStep()"
            class="px-3"
          >
            <span>Next</span>
            <v-icon> mdi-chevron-right </v-icon>
          </v-btn>

          <!--  -->
        </v-card-actions>

        <v-divider />

        <!-- ? ------------------ Bottom Actions (Cancel & Save) ---------------------->
        <v-card-actions class="pt-4 pb-4">
          <v-spacer></v-spacer>

          <!-- ? ---------- Cancel and Save buttons -->
          <v-btn text @click="triggerCancellation"> Cancel </v-btn>
          <v-btn
            color="primary"
            @click="saveEventRecord"
            :disabled="!isValidEventRecord()"
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
