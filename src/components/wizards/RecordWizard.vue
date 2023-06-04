<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
import ActivityChips from "@/components/chips/ActivityChips.vue";
import ActivitySelector from "@/components/chips/ActivitySelector.vue";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import TimeDatePicker from "@/components/picker/TimeDatePicker.vue";
import {
  defaultNewArea,
  defaultNewEventRecord,
} from "@/constants/DefaultDataForForms";
import { DialogMode } from "@/model/enum/DialogMode";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import EventRecord from "@/model/pojo/records/EventRecord";
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { useEventRecordsStore } from "@/store/EventRecordsStore";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import {
  addDuration,
  durationDiff,
  getDurationSince,
  getPrettyDuration,
  getPrettyTimestamp,
  getTimeWithRelativeDate,
  subtractDuration,
} from "@/utils/time/TimestampConversionUtils";
import { IMPLICIT_MEASURABLE_ID_LIST } from "@/constants/DefaultMeasurables";
import MetricsForm from "@/components/forms/MetricsForm.vue";

/**
 * TODO P1 ----- Add validations.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
    ActivitySelector: ActivitySelector,
    TimeDatePicker: TimeDatePicker,
    MetricsForm: MetricsForm,
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

  @Watch("eventRecord_local.metrics")
  onEventRecordLocalChange(_newValue: Map<string, string>) {
    //
    // TODO: Why is this only getting called on load?

    console.log(
      "🐳 eventRecord_local WAS CHANGED: " + JSON.stringify(_newValue)
    );
  }

  /* <!-- ? ------------------------------ Stores ------------------------------> */
  iconsStore = useIconsStore();
  areasStore = useAreasStore();
  categoriesStore = useCategoryTagsStore();
  // activitiesStore = useActivitiesStore();
  eventRecordsStore = useEventRecordsStore();

  mounted() {
    console.log("🐪 Mounted RecordWizard");
    this.onShow();
  }

  /* <!-- ? ------------------------------ Data ------------------------------> */
  eventRecord_local: EventRecord = deepCopy(defaultNewEventRecord);
  // activity_local: Activity = deepCopy(defaultNewActivity);
  area: Area = deepCopy(defaultNewArea); // Temporary
  showDialog_local = false;
  selectedActivity: Activity | null = null;
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showMeasurableSelectionDialog = false;
  showDeleteConfirmDialog = false;
  showSearchBar = false;
  searchInput = "";
  visitedSteps: number[] = [];

  // Time-related
  timingProgressSelection = "notStarted"; // Whether in the past or in progress or yet to start.
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
      rules: [() => true],
    },
    STEP_3: {
      id: 3,
      title: "Duration",
      rules: [() => true],
    },
    STEP_4: {
      id: 4,
      title: "Metrics",
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

  timeElapsed = "";

  calculateTimeElapsed() {
    window.setInterval(() => {
      this.timeElapsed = this.getDurationSince(
        this.eventRecord_local.startTime
      );
    }, 1000); // Refreshes every 1 second.
  }

  get durationDisplayText(): string {
    console.log("⏳ Inside durationDisplayText");
    let text = this.getPrettyDuration(this.eventRecord_local.durationInSeconds);
    if (!text) text = "Click to enter duration";
    return text;
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

    // Keeps updating time-elapsed
    this.calculateTimeElapsed();
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

    // Reset
    this.disabledSteps = [];
    this.visitedSteps = [];
    if (!this.selectedActivity) return; // If nothing's selected.

    // Update area
    this.area = this.areasStore.getAreaById(this.selectedActivity.areaId);

    const hasTime = this.selectedActivity.hasTimeMeasurable;
    const hasDuration = this.selectedActivity.hasDurationMeasurable;

    // Disable steps if needed.
    if (!hasTime) {
      this.disabledSteps.push(this.stepsConfig.STEP_2.id); // Skip step-2 (Time)
    }
    if (!hasDuration) {
      this.disabledSteps.push(this.stepsConfig.STEP_3.id); // Skip step-3 (Duration)
    }

    console.log("!!!! hasTime = " + hasTime);
    console.log("!!!! hasDuration = " + hasDuration);

    // Set default timestamps
    // if (hasTime) {
    //   if (hasDuration) {
    //     if (!this.eventRecord_local.startTime)
    //       this.eventRecord_local.startTime = new Date().valueOf();
    //   } else {
    //     if (!this.eventRecord_local.completionTimeEpoch)
    //       this.eventRecord_local.completionTimeEpoch = new Date().valueOf();
    //   }
    // }

    if (hasDuration) {
      this.eventRecord_local.durationInSeconds = 5 * 60; // 5 mins
      if (hasTime) {
        this.eventRecord_local.completionTimeEpoch = new Date(
          new Date().getTime() + 5 * 60 * 1000
        ).valueOf();
      }
    }
    // Bounce to trigger reactive variables to update.
    this.eventRecord_local = deepCopy(this.eventRecord_local);

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
    this.visitedSteps = [];

    // Reset fields
    this.selectedActivity = null;
    if (this.dialogMode === DialogMode.CREATE) {
      this.eventRecord_local = deepCopy(defaultNewEventRecord);
    }

    this.eventRecord_local = deepCopy(defaultNewEventRecord);
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
  isSaveButtonEnabled() {
    if (!this.selectedActivity) return false;
    if (
      this.timingProgressSelection === "notStarted" &&
      this.visitedSteps.includes(this.stepsConfig.STEP_2.id)
    )
      return true;

    // Every step must either be complete or disabled.
    let completedStepsCount = 0;
    [...Array(this.numberOfSteps)].forEach(
      (_, i) => (completedStepsCount += this.isStepComplete(i) ? 1 : 0)
    );

    // Note: Last step (Metrics) doesn't need to be complete. Even required params can be provided later.
    return (
      this.numberOfSteps - 1 === this.disabledSteps.length + completedStepsCount
    );
  }

  isStepComplete(stepNumber: number): boolean {
    // Disabled steps should never show as Complete.
    let result = !this.disabledSteps.includes(stepNumber);

    const isVisited = this.visitedSteps.includes(stepNumber);
    const hasDuration =
      this.selectedActivity && this.selectedActivity!.hasDurationMeasurable;
    const notStartedCase = this.timingProgressSelection === "notStarted";
    const startedInThePast =
      this.timingProgressSelection === "inProgress" ||
      this.timingProgressSelection === "doneAlready";

    switch (stepNumber) {
      case 1: {
        result &&= this.selectedActivity !== null;
        break;
      }
      case 2: {
        // Time

        // TODO: Make this logic work

        // result &&=
        //   isVisited &&
        //   ((hasDuration && isStartTimeSet) ||
        //     (!hasDuration && isCompletionTimeSet));

        return true;
        break;
      }
      case 3: {
        // Duration
        if (this.selectedActivity === null) {
          result = false;
          break;
        }
        result &&=
          !hasDuration ||
          (hasDuration && isVisited && (notStartedCase || startedInThePast));
        break;
      }
      case 4: {
        // Metrics
        const requiredMetricIDs: string[] = this.getRequiredMeasurables().map(
          (m) => m.id
        );

        // What's been recorded so far.
        let recordedMetricIDs: string[] = [];
        this.eventRecord_local.metrics.forEach((key) =>
          recordedMetricIDs.push(key)
        );
        recordedMetricIDs = Object.keys(this.eventRecord_local.metrics);

        result &&=
          this.selectedActivity !== null &&
          requiredMetricIDs.every((m) => recordedMetricIDs.includes(m));
        break;
      }
      default: {
        return false;
      }
    }
    return result;
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

    // TODO P0: change above validation to be generic for all steps
    //       i.e. if (!isComplete(steps 1 to destination)) ===> then return

    if (destination >= this.numberOfSteps) {
      this.stepperPosition = this.numberOfSteps;
    } else if (destination < 0) {
      this.stepperPosition = this.numberOfSteps - 1;
    } else {
      this.stepperPosition = destination;
    }

    // Mark as visited
    console.log("MARKING AS VISITED ---> " + this.stepperPosition);
    this.visitedSteps.push(this.stepperPosition);
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
  updateStartTimestamp(epochTime: number) {
    console.log("UPDATING >>>>> Start time in epoch: " + epochTime);
    this.eventRecord_local.startTime = epochTime;

    // ----- Update COMPLETION time, based on duration
    if (
      this.selectedActivity?.hasDurationMeasurable &&
      this.eventRecord_local.durationInSeconds
    ) {
      this.eventRecord_local.completionTimeEpoch = addDuration(
        this.eventRecord_local.startTime,
        this.eventRecord_local.durationInSeconds
      );
    }

    this.eventRecord_local = deepCopy(this.eventRecord_local); // Force reactive variables to update
  }

  updateCompletionTimestamp(epochTime: number) {
    console.log("UPDATING >>>>> Completion time in epoch: " + epochTime);
    this.eventRecord_local.completionTimeEpoch = epochTime;

    // ----- Update DURATION
    if (this.selectedActivity?.hasDurationMeasurable) {
      // TODO P0 ----- Update Duration
      this.eventRecord_local.durationInSeconds = durationDiff(
        this.eventRecord_local.startTime!,
        this.eventRecord_local.completionTimeEpoch
      );
    }

    this.eventRecord_local = deepCopy(this.eventRecord_local); // Force reactive variables to update
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

  /* <!-- * ------------------------------ Metrics ------------------------------> */
  get metricsSubtitleText() {
    const requiredMeasurables = this.getRequiredMeasurables();
    const optionalMeasurables = this.getOptionalMeasurables();
    var text = "";
    if (requiredMeasurables.length > 0)
      text += requiredMeasurables.length + " required";
    if (requiredMeasurables.length > 0 && optionalMeasurables.length > 0)
      text += ", ";
    if (optionalMeasurables.length > 0)
      text += optionalMeasurables.length + " optional";
    return text;
  }

  getExplicitMeasurables() {
    if (!this.selectedActivity) return [];

    return this.selectedActivity.measurables.filter(
      (m) => !IMPLICIT_MEASURABLE_ID_LIST.includes(m.measurableDefinitionId)
    );
  }

  getRequiredMeasurables() {
    const idList = this.getExplicitMeasurables()
      .filter((activity) => activity.isRequired)
      .map((m) => m.measurableDefinitionId);

    return this.area.measurableDefinitions.filter((measurable) =>
      idList.includes(measurable.id)
    );
  }

  getOptionalMeasurables() {
    const idList = this.getExplicitMeasurables()
      .filter((activity) => !activity.isRequired)
      .map((m) => m.measurableDefinitionId);

    return this.area.measurableDefinitions.filter((measurable) =>
      idList.includes(measurable.id)
    );
  }

  /* <!-- * ------------------------------ Method imports ------------------------------> */
  getPrettyTimestamp = getPrettyTimestamp;
  getPrettyDuration = getPrettyDuration;
  getTimeWithRelativeDate = getTimeWithRelativeDate;
  getDurationSince = getDurationSince;
  addDuration = addDuration;
  subtractDuration = subtractDuration;
  durationDiff = durationDiff;
}
</script>

<template>
  <div class="">
    <v-bottom-sheet
      scrollable
      v-model="showDialog_local"
      inset
      max-width="400"
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
              :complete="isStepComplete(stepsConfig.STEP_1.id)"
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
                v-if="
                  selectedActivity !== null &&
                  stepperPosition != stepsConfig.STEP_1.id
                "
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
              :rules="stepsConfig.STEP_2.rules"
              :complete="isStepComplete(stepsConfig.STEP_2.id)"
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
                v-if="stepperPosition > stepsConfig.STEP_2.id"
                class="text-caption font-weight-light"
              >
                <br />
                <!-- TODO P1 ------ Show selected time here. Start time (if hasDurationMeasurable) or Completion time (if hasTimeDuration) -->
                <span v-if="!selectedActivity?.hasDurationMeasurable">
                  Completed:
                  {{
                    getTimeWithRelativeDate(
                      eventRecord_local.completionTimeEpoch
                    )
                  }}
                </span>

                <span v-if="selectedActivity?.hasDurationMeasurable">
                  Started:
                  {{ getTimeWithRelativeDate(eventRecord_local.startTime) }}
                </span>
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
                    <v-col cols="" class="pa-auto">
                      <span class="pb-0" style="color: gray">
                        Completed at
                      </span>

                      <!-- ? ------------------------ COMPLETION TIME picker -->
                      <TimeDatePicker
                        :initialTimestampEpoch="
                          eventRecord_local.completionTimeEpoch
                        "
                        v-on:timestamp-updated="updateCompletionTimestamp"
                      />
                      <!-- titleText="Completion Time" -->
                    </v-col>
                  </v-row>

                  <!------- Case 2: Has Duration measurable ------->
                  <div v-if="selectedActivity?.hasDurationMeasurable">
                    <v-row class="pb-0">
                      <v-col class="pa-0 pt-2">
                        <!--  -->

                        <v-radio-group
                          v-model="timingProgressSelection"
                          :disabled="dialogMode !== `CREATE`"
                          class="pt-0 mt-0"
                        >
                          <v-radio label="Not started" value="notStarted" />
                          <v-radio label="In progress" value="inProgress" />
                          <v-radio label="Done already" value="doneAlready" />
                        </v-radio-group>

                        <!--  -->
                      </v-col>
                    </v-row>

                    <!-- TODO P2 --- When "Not started" is selected, show "START NOW" button and skip duration screen -->
                    <v-row v-if="timingProgressSelection !== `notStarted`">
                      <v-col cols="" class="pa-0">
                        <span class="pb-0" style="color: gray">
                          Started at
                        </span>

                        <!-- ? ------------------------ START TIME picker -->
                        <TimeDatePicker
                          :initialTimestampEpoch="eventRecord_local.startTime"
                          v-on:timestamp-updated="updateStartTimestamp"
                        />
                      </v-col>
                    </v-row>

                    <v-row v-if="timingProgressSelection === `notStarted`">
                      Timer will begin once you click "Start now"
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
              :complete="isStepComplete(stepsConfig.STEP_3.id)"
              :rules="stepsConfig.STEP_3.rules"
              @click="onStepClick(stepsConfig.STEP_3.id)"
              class=""
            >
              <!-- ? ------------------------------ Title -->
              <span
                class="text-h6 font-weight-light"
                :style="getStepTitleStyle(stepsConfig.STEP_3.id)"
              >
                {{ stepsConfig.STEP_3.title }}
              </span>

              <!-- ? ------------------------------ Subtitle -->
              <span
                v-if="stepperPosition !== stepsConfig.STEP_3.id"
                class="text-caption font-weight-light"
              >
                <br />

                <span v-if="timingProgressSelection === `notStarted`">
                  Not started yet.
                </span>

                <span v-if="timingProgressSelection === `inProgress`">
                  In progress
                </span>

                <span
                  v-if="
                    eventRecord_local.durationInSeconds !== null &&
                    timingProgressSelection === `doneAlready`
                  "
                >
                  {{ getPrettyDuration(eventRecord_local.durationInSeconds) }}
                </span>

                <span
                  v-if="
                    !eventRecord_local.durationInSeconds &&
                    timingProgressSelection === `doneAlready`
                  "
                >
                  Please specify the duration.
                </span>
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_3.id" class="pa-1">
              <v-card flat max-width="85%" class="pl-4 pt-0 pa-0 ma-0">
                <v-container>
                  <!--  -->

                  <!-- ? ----- Case 1: Not started -->
                  <v-row v-if="timingProgressSelection === `notStarted`">
                    <v-col class="pa-auto">
                      <span class="pb-0 ma-auto" style="color: gray">
                        Time elapsed will show here after you click 'Start now'
                      </span>
                    </v-col>
                  </v-row>

                  <!-- ? ----- Case 2: In progress -->
                  <span v-if="timingProgressSelection === `inProgress`">
                    <!--  -->
                    <v-row>
                      <v-col cols="" class="pl-1 pt-0">
                        <span>In progress</span>
                      </v-col>
                    </v-row>

                    <!-- ? ------------ Live timer -->
                    <v-row>
                      <v-col cols="" class="pl-1 pt-0">
                        <!-- TODO P1 ---- onClick should open a dialog to enter duration -->
                        <span
                          class="pa-0 font-weight-light"
                          style="font-size: 42"
                        >
                          ⏳ {{ timeElapsed }}
                        </span>

                        <!--  -->
                      </v-col>
                    </v-row>
                  </span>

                  <!-- ? ----- Case 3: Already done -->
                  <v-row v-if="timingProgressSelection === `doneAlready`">
                    <v-row>
                      <!-- ? ------------ Duration picker -->
                      <v-col cols="" class="pa-auto">
                        <!-- TODO P1 ---- onClick should open a dialog to enter duration -->
                        <span
                          class="pa-0 font-weight-light"
                          style="font-size: 42"
                        >
                          ⏳ {{ durationDisplayText }}
                        </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <!-- ? ------------ Time picker for COMPLETION TIME -->
                      <v-col cols="" class="pa-auto">
                        <span class="pb-0" style="color: gray">
                          Completed at
                        </span>

                        <TimeDatePicker
                          :initialTimestampEpoch="
                            eventRecord_local.completionTimeEpoch
                          "
                          v-on:timestamp-updated="updateCompletionTimestamp"
                        />
                      </v-col>

                      <!--  -->
                    </v-row>
                  </v-row>

                  <!--  -->
                </v-container>
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 4 ------- Metrics -->
            <v-stepper-step
              :step="stepsConfig.STEP_4.id"
              :rules="stepsConfig.STEP_4.rules"
              :complete="isStepComplete(stepsConfig.STEP_4.id)"
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
                <span> {{ metricsSubtitleText }} </span>
              </span>

              <!--  -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_4.id" class="pa-1">
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <!--  -->
                <!-- * ---------------------------------------- Required -->
                <v-container v-if="getRequiredMeasurables().length > 0">
                  <v-row>
                    <v-col style="color: darkslategray"> Required </v-col>
                  </v-row>

                  <v-divider />

                  <MetricsForm
                    v-model="eventRecord_local.metrics"
                    :measurables="getRequiredMeasurables()"
                  />
                </v-container>

                <!-- * ---------------------------------------- Optional -->
                <v-container v-if="getOptionalMeasurables().length > 0">
                  <v-row>
                    <v-col style="color: darkslategray"> Optional </v-col>
                  </v-row>

                  <v-divider />

                  <MetricsForm
                    v-model="eventRecord_local.metrics"
                    :measurables="getOptionalMeasurables()"
                  />

                  <v-row>
                    <v-col> </v-col>
                  </v-row>
                </v-container>
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
            :disabled="!isSaveButtonEnabled()"
          >
            {{
              selectedActivity !== null &&
              selectedActivity.hasDurationMeasurable &&
              timingProgressSelection === `notStarted`
                ? `Start Now`
                : `Save`
            }}
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
