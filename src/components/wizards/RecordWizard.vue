<script lang="ts">
import ActivityChips from "@/components/chips/ActivityChips.vue";
import ActivitySelector from "@/components/chips/ActivitySelector.vue";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import TimePicker from "@/components/picker/TimePicker.vue";
import { defaultNewArea } from "@/constants/DefaultDataForForms";
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
  // eventRecord_local: EventRecord = deepCopy(defaultNewEventRecord);
  eventRecord_local: EventRecord = new EventRecord();
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

  // Stepper
  stepperPosition = 1;
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
      isComplete: () => this.selectedActivity !== null,
      rules: [() => true],
    },
    STEP_3: {
      id: 3,
      title: "Time",
      isComplete: () => this.selectedActivity !== null,
      rules: [() => true],
    },
    STEP_4: {
      id: 4,
      title: "Time",
      isComplete: () => this.selectedActivity !== null,
      rules: [() => true],
    },
  };

  stepTitles: Map<number, string> = new Map([
    [1, "Activity"],
    [2, "Select Time"],
    [3, "Record measurables"],
    [4, "Review"],
  ]);

  /* <!-- * ------------------------------- Computed props ------------------------------> */
  get categories(): CategoryTag[] {
    return this.categoriesStore.getCategoriesByIDs(this.area.categoryIDList);
  }

  get areas(): Area[] {
    return this.areasStore.getAll();
  }

  get activityColor(): string {
    const areaMatched = this.areas.find(
      (area) => this.selectedActivity?.areaId === area.id
    );
    return areaMatched ? areaMatched.color : "";
  }

  get numberOfSteps() {
    return this.stepTitles.size;
  }

  get stepperWindowTitle(): string {
    const title = this.stepTitles.get(this.stepperPosition + 1);
    return title ? title : "";
  }

  // <!-- * ---------------------------- Lifecycle ---------------------------->
  onShow() {
    // Subscribe to stores
    this.areasStore.subscribeToStore();
    this.categoriesStore.subscribeToStore();

    // Reset
    this.resetToDefaultState();
    this.showDialog_local = this.showDialog;
  }

  onHide() {
    // Unsubscribe from stores.
    this.areasStore.unsubscribe();
    this.categoriesStore.unsubscribe();

    // Not sure if this is needed.
    this.showDialog_local = false;
  }

  activitySelectionChanged(providedActivity: Activity) {
    this.selectedActivity = providedActivity;
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
        JSON.stringify(new EventRecord())
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
    if (destination >= this.numberOfSteps) {
      this.stepperPosition = this.numberOfSteps;
    } else if (destination < 0) {
      this.stepperPosition = this.numberOfSteps - 1;
    } else {
      this.stepperPosition = destination;
    }
  }

  moveToNextStep() {
    this.moveToStep(1 + this.stepperPosition);
  }

  moveToPreviousStep() {
    this.moveToStep(this.stepperPosition - 1);
  }

  isCurrentStep(stepNumber: number) {
    return this.stepperPosition == stepNumber - 1;
  }

  /* <!-- * ------------------------------ Stepper ------------------------------> */
  updateStartTime() {
    // TODO
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
        <!-- <v-card-actions class="pa-3 ma-0">
          <v-card-subtitle
            class="pa-0 text-h6 font-weight-light"
            style="color: grey"
          >
            Step {{ currentStepperPos }}: {{ stepperWindowTitle }}
          </v-card-subtitle>

          <v-spacer />
        </v-card-actions> -->

        <!-- <v-divider /> -->

        <!-- * ------------------------------------- Stepper ----------------------------------->
        <v-card-text class="pa-0 ma-0">
          <v-stepper
            v-model="stepperPosition"
            vertical
            elevation="0"
            class="pb-4"
          >
            <!--  -->

            <!-- ? --------------------------------------------- Step 1: Activity selection -->
            <v-stepper-step
              :step="stepsConfig.STEP_1.id"
              :complete="stepsConfig.STEP_1.isComplete(selectedActivity)"
              :rules="stepsConfig.STEP_1.rules"
              @click="stepperPosition = stepsConfig.STEP_1.id"
              class=""
            >
              <!--  -->

              <!-- ? ---------- Title -->
              <span class="text-h6 font-weight-light">{{
                stepsConfig.STEP_1.title
              }}</span>

              <!-- ? ---------- Sub-title -->
              <span
                v-if="selectedActivity !== null"
                class="text-caption font-weight-light"
              >
                <br />
                Selected
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
                  v-on:selection-changed="activitySelectionChanged"
                />

                <!--  -->
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 2: Time selection -->
            <v-stepper-step
              :step="stepsConfig.STEP_2.id"
              :complete="false"
              @click="stepperPosition = 2"
              class=""
            >
              <span class="text-h6 font-weight-light">
                {{ stepsConfig.STEP_2.title }}</span
              >
              <!-- <small>When did you do this event?</small> -->
            </v-stepper-step>

            <v-stepper-content :step="stepsConfig.STEP_2.id" class="pa-1">
              <!-- ? ----------------- Filter --------------------->
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <!--  -->

                <span>Have you completed it already? </span>

                <v-radio-group v-model="timingProgressSelection">
                  <v-radio label="Already done" value="alreadyDone" />
                  <v-radio label="In progress" value="inProgress" />
                  <v-radio label="Not started" value="notStarted" />
                </v-radio-group>

                <!-- ? ------------ Time picker -->
                <TimePicker
                  titleText="Start Time"
                  :isDisplayed="showDialog"
                  v-on:time-selected="updateStartTime"
                />

                <!-- TODO ----- if Activity has time-tracking (i.e. has a Duration-type measurable) -->
                <!-- Then ask for a start time. Otherwise skip step 2 entirely. -->

                <!-- TODO ----- show options: -->
                <!--      1. Not started -->
                <!--      2. Started -->
                <!--      3. Completed already -->

                <!--  -->
              </v-card>
            </v-stepper-content>

            <!-- ? --------------------------------------------- Step 3: Record Measurables -->
            <v-stepper-step
              step="3"
              :complete="false"
              @click="stepperPosition = 3"
              class=""
            >
              <span class="text-h6 font-weight-light">Measurables</span>
            </v-stepper-step>

            <v-stepper-content step="3" class="pa-1">
              <!-- ? ----------------- Filter --------------------->
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <!--  -->

                <v-text-field
                  outlined
                  placeholder="Under construction"
                ></v-text-field>

                <!-- TODO ----- Should be optional. Can enter later. -->
                <!-- Then ask for a start time. Otherwise skip step 2 entirely. -->

                <!--  -->
              </v-card>
            </v-stepper-content>
            <!--  -->

            <!-- ? --------------------------------------------- Step 4: Review -->
            <v-stepper-step
              step="4"
              :complete="false"
              @click="stepperPosition = 4"
              class=""
            >
              <span class="text-h6 font-weight-light">Review</span>
              <!-- <small>When did you do this event?</small> -->
            </v-stepper-step>

            <!-- TODO ------- Don't think I need a review step. 
              Subtitles of steps should show what's selected. -->

            <v-stepper-content step="4" class="pa-1">
              <!-- ? ----------------- Filter --------------------->
              <v-card flat max-width="85%" class="pl-3 pa-0 ma-0">
                <!--  -->

                <v-text-field
                  outlined
                  placeholder="Under construction"
                ></v-text-field>

                <!-- TODO ----- if Activity has time-tracking (i.e. has a Duration-type measurable) -->
                <!-- Then ask for a start time. Otherwise skip step 2 entirely. -->

                <!-- TODO ----- show options: -->
                <!--      1. Not started -->
                <!--      2. Started -->
                <!--      3. Completed already -->

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

        <!-- ? ------------------ Bottom Actions ---------------------->
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
