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
  area: Area = deepCopy(defaultNewArea); // Temporary
  showDialog_local = false;
  selectedActivity: Activity | null = null;
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showMeasurableSelectionDialog = false;
  showDeleteConfirmDialog = false;
  showSearchBar = false;
  searchInput = "";
  selectedCategoryId = "";

  // Stepper
  currentStepperPos = 1;
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
            this.currentStepperPos === 1 || this.selectedActivity !== null;
          console.log("✅ ✅ ✅ ✅ ✅ rules result = " + result);

          // <!-- TODO P1 ------ WHY IS THIS ONLY GETTING CALLED ONCE?

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
  };

  stepTitles: Map<number, string> = new Map([
    [1, "Activity"],
    [2, "Select Time"],
    [3, "Record measurables"],
    [4, "Review"],
  ]);

  /* <!-- * ------------------------------- Computed props ------------------------------> */
  get categories(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  get activityColor(): string {
    return this.selectedActivity
      ? this.categoryTagsStore.getCategoryById(this.selectedActivity.categoryId)
          .color
      : "";
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
    this.currentStepperPos = 1;
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
            v-model="currentStepperPos"
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
              @click="currentStepperPos = stepsConfig.STEP_1.id"
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
              @click="currentStepperPos = 2"
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

            <!-- ? --------------------------------------------- Step 3: Record Measurables -->
            <v-stepper-step
              step="3"
              :complete="false"
              @click="currentStepperPos = 3"
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
              @click="currentStepperPos = 4"
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
            :disabled="currentStepperPos === 1"
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
            :disabled="currentStepperPos === numberOfSteps"
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
