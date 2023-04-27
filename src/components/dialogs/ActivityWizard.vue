<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity, {
  MeasurableForActivity,
} from "@/model/pojo/definitions/Activity";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import IconPicker from "@/components/dialogs/IconPicker.vue";
import { deepCopy } from "deep-copy-ts";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Area } from "@/model/pojo/definitions/Area";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import CategoryChips from "../chips/CategoryChips.vue";
import ActivityChips from "../chips/ActivityChips.vue";
import { DialogMode } from "@/model/enum/DialogMode";
import ConfigureMeasurablesInActivity from "../configure/ConfigureMeasurablesInActivity.vue";

/**
 * TODO P0 ----- Step 1 & 2 should be to select an Area and Category if not provided.
 * TODO P1 ----- Add validations. Especially when a Category is not selected. Block the Save button.
 * TODO P1 ----- Validate that category selected must exist in Area. (or should it get auto-added?)
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    IconPicker: IconPicker,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
    ConfigureMeasurablesInActivity: ConfigureMeasurablesInActivity,
  },
  methods: {},
})
export default class ActivityWizard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  dialogMode!: DialogMode;
  @Prop()
  activity!: Activity;
  @Prop()
  area!: Area;
  @Prop()
  showDialog!: boolean;

  /* <!-- ? ------------------------------ Watchers ------------------------------> */
  @Watch("showDialog")
  // @Watch("activity")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log("👀 @Watch in ActivityCreateOrEdit. showDialog = " + _newValue);
    const isDialogOpen = !!_newValue;
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }
  /* <!-- ? ------------------------------ Stores ------------------------------> */
  iconsStore = useIconsStore();
  categoryTagsStore = useCategoryTagsStore();

  mounted() {
    console.log("🐪 Mounted ActivityWizard");
    this.iconsStore.loadIcons();
  }

  /* <!-- ? ------------------------------ Data ------------------------------> */
  activity_local: Activity = deepCopy(defaultNewActivity);
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showMeasurableSelectionDialog = false;
  showIconPicker = false;
  showSearchBar = false;
  searchInput = "";
  selectedCategoryId = "";

  // Stepper
  currentStepperPos = 0;
  previous_step_icon = "mdi-chevon-left";
  next_step_icon = "mdi-chevon-right";

  // TODO: Insert step for selecting an Area.
  stepTitles: Map<number, string> = new Map([
    [1, "Pick a name & icon"],
    [2, "Select Category"],
    [3, "Select Measurables"],
    [4, "Review"],
  ]);

  /* <!-- ? ------------------------------- Computed pros ------------------------------> */
  get categories(): CategoryTag[] {
    console.log(
      "🏏 ---- categories = " +
        JSON.stringify(
          this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags)
        )
    );
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  get numberOfSteps() {
    return this.stepTitles.size;
  }

  get stepperWindowTitle(): string {
    const title = this.stepTitles.get(this.currentStepperPos + 1);
    return title ? title : "";
  }

  get isInCreateMode() {
    return this.dialogMode && this.dialogMode === DialogMode.CREATE;
  }

  /* <!-- ? ------------------------------ State Management ------------------------------> */
  onShow() {
    this.categoryTagsStore.subscribeToStore(); // Subscribe to store

    // Reset
    this.resetToDefaultState();

    // Assign category
    this.selectedCategoryId = this.activity_local.categoryId;
  }

  onHide() {
    // Unsubscribe from stores.
    this.categoryTagsStore.unsubscribe(); // Unsubscribe from store
  }

  onSelectionChange() {
    if (this.selectedCategoryId.length > 0) {
      this.activity_local.categoryId = this.selectedCategoryId;
    } else {
      console.log("This is a bug 🐞");
    }
  }

  saveMeasurablesUpdate(measurables: MeasurableForActivity[]) {
    this.activity_local.measurables = measurables;
  }

  resetToDefaultState() {
    // Reset Activity.
    this.activity_local = deepCopy(
      this.activity ? this.activity : defaultNewActivity
    );

    this.activity_local.areaId = this.area.id;
    console.log(
      "🐞 area ======" +
        JSON.stringify(this.area.id) +
        ". areaId ======= " +
        JSON.stringify(this.area.id)
    );

    this.currentStepperPos = 0; // Stepper
  }

  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.discard();
    }
    this.showDialogForConfirmDiscard = false;
  }

  discard() {
    this.$emit("discard", true);
  }

  saveActivity() {
    this.$emit("save-confirmed", this.activity_local);
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.activity_local) === JSON.stringify(this.activity) ||
      JSON.stringify(this.activity_local) === JSON.stringify(defaultNewActivity)
    ) {
      this.discard();
    } else {
      this.showDialogForConfirmDiscard = true;
    }
  }

  /* <!-- ? ----------------------------- Icon picker ------------------------------> */
  newIconSelected(newIcon: string) {
    console.log("---- newIconSelected (PARENT) = " + newIcon);
    this.activity_local.icon = newIcon;
    this.closeIconPicker(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeIconPicker(state: boolean) {
    this.showIconPicker = false;
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
      v-model="showDialog"
      inset
      max-width="400"
      overlay-opacity="0.88"
      persistent
      @keydown.esc="triggerCancellation"
    >
      <!-- @keydown.enter="saveActivity" -->
      <v-card flat class="px-2">
        <!--  -->
        <!-- ? ---------------------------------- Top panel --------------------------------- * -->

        <v-card-actions class="pa-3 pb-0 ma-0">
          <!-- ? ----------------- Box title ---------------- * -->
          <v-card-title class="pa-0 text-h6 font-weight-light">
            {{ isInCreateMode ? `New` : `Edit` }} Activity
          </v-card-title>
          <v-spacer />
          <!-- ? ------------- (x) Close button --------------->
          <v-icon @click="triggerCancellation">mdi-close</v-icon>
        </v-card-actions>

        <!-- ? ----------------- Box subtitle ---------------- * -->
        <v-card-text class="px-3 pt-1 pb-3 ma-0">
          <v-card-subtitle class="pa-0 text-body-2 font-weight-light">
            Step {{ currentStepperPos + 1 }}: {{ stepperWindowTitle }}
          </v-card-subtitle>
        </v-card-text>

        <v-divider></v-divider>

        <!-- ? ------------------------- Stepper Window -------------------------->
        <v-card-text class="pa-3 ma-0">
          <v-window v-model="currentStepperPos">
            <!--  -->

            <!-- ? --------------------------------------------- Step 1: Name & Icon -->
            <v-window-item :step="1">
              <!--  -->

              <v-card flat style="border-radius: 8px">
                <!-- ? ----------------- Name text-field --------------------->
                <v-card-text class="pa-0 ma-0 pt-2">
                  <v-container>
                    <!--  -->

                    <v-row class="text-center">
                      <v-col cols="2" class="pa-0 ma-0 pt-1">
                        <!-- ? -------------- Hint -->
                        <p class="mt-1 mb-0 text-captionfont-weight-light">
                          Icon
                        </p>

                        <!-- ? -------------- Icon-->
                        <v-icon
                          x-large
                          @click="showIconPicker = true"
                          class="px-auto pt-0 mr-20 mt-0"
                        >
                          {{ activity_local.icon }}
                        </v-icon>
                      </v-col>
                      <v-col class="px-auto pb-0">
                        <!--  -->
                        <!-- ? -------------- Text field ------------>
                        <v-text-field
                          label="Name"
                          v-model="activity_local.title"
                          outlined
                          clearable
                          placeholder="Activity name"
                          hint="Something short and sweet."
                          counter="15"
                          class="pa-0"
                        />
                      </v-col>
                    </v-row>

                    <!--  -->
                  </v-container>
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? --------------------------------------------- Step 2: Category selection -->
            <v-window-item :step="2">
              <v-card flat style="border-radius: 8px">
                <v-card-text class="ma-0 pa-0">
                  <!--  -->

                  <!-- <span class="pl-0 pt-5 mb-1 text-caption font-weight-light">
                    Select a Category
                  </span> -->

                  <!-- TODO ----- Use CategorySelector component here. 
                                  Make it work for a single category. -->

                  <!-- * ---------------- Tag selector for category chips -->
                  <v-autocomplete
                    auto-select-first
                    chips
                    label=""
                    v-model="selectedCategoryId"
                    :items="categories"
                    item-text="title"
                    item-value="id"
                    hint="Click to select a category"
                    persistent-hint
                    hide-selected
                    @input="searchInput = ''"
                    :search-input.sync="searchInput"
                    @keydown.enter.native.prevent
                    @change="onSelectionChange"
                    :menu-props="{
                      closeOnContentClick: false,
                      closeOnClick: true,
                      openOnClick: false,
                    }"
                    color="primary"
                    class=""
                  >
                    <!-- Notes about the modifiers above in <v-autocomplete> -->
                    <!--      @input will reset the text-input to '' once tag is selected -->
                    <!--      search-input.sync will bind the text-input to our variable -->

                    <!-- * ------------ When no tags match ------------ * -->
                    <template v-slot:no-data>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            No categories matched.
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>

                    <!-- * ------------ Chips component ------------ * -->
                    <template v-slot:selection="data">
                      <CategoryChips
                        :categories="[data.item]"
                        :hasCloseButton="false"
                      />
                    </template>

                    <!-- * ------------ List item in dropdown ------------ * -->
                    <!-- eslint-disable vue/no-unused-vars -->
                    <!-- eslint-disable vue/no-v-text-v-html-on-component -->
                    <template v-slot:item="{ item, attrs, on }">
                      <v-list-item
                        v-on="on"
                        v-bind="attrs"
                        #default="{ active }"
                      >
                        <v-list-item-content>
                          <v-list-item-title>
                            <v-row no-gutters align="center">
                              <!--  -->

                              <v-icon small class="pr-4" :color="item.color">
                                mdi-circle
                              </v-icon>

                              <span>{{ item.title }}</span>

                              <v-spacer></v-spacer>
                            </v-row>
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>

                    <!-- ? ------------ (+) icon ------------ * -->
                    <!-- TODO: @click should display CreateCategory dialog -->
                    <!-- eslint-disable vue/no-v-text-v-html-on-component -->
                    <template v-slot:append-outer>
                      <v-icon v-text="'mdi-plus-circle-outline'"></v-icon>
                    </template>

                    <!--  -->
                  </v-autocomplete>

                  <!--  -->
                </v-card-text>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? --------------------------------------------- Step 3: Measurables -->
            <v-window-item :step="3">
              <!--  -->

              <ConfigureMeasurablesInActivity
                :activity="activity_local"
                :area="area"
                :isDisplayed="showDialog"
                v-on:update="saveMeasurablesUpdate"
              />
            </v-window-item>

            <!-- ? --------------------------------------------- Step 4 -->
            <v-window-item :step="4">
              <!--  -->

              <v-card flat style="border-radius: 8px">
                <!-- ? --------------------- Preview ------------------------->
                <v-card-actions class="">
                  <v-container>
                    <v-row>
                      <span
                        class="mr-4 ml-1 mb-1 text-caption font-weight-light"
                      >
                        Preview
                      </span>
                      <ActivityChips
                        :activities="[activity_local]"
                        :categories="categories"
                        :hasCloseButton="false"
                      />
                    </v-row>
                  </v-container>
                  <v-spacer />
                </v-card-actions>

                <!--  -->
              </v-card>
            </v-window-item>

            <!-- ? ---- Window ends here -->
          </v-window>
        </v-card-text>

        <v-divider />

        <!-- ? ------------------------------ Buttons for window navigation -->
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
                    border: (isCurrentStep(n) ? '1' : '0') + 'px black solid',
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

        <!-- ? ------------------ Save / Cancel ---------------- * -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="triggerCancellation"> Cancel </v-btn>
          <v-btn color="primary" @click="saveActivity">
            {{ isInCreateMode ? `Create` : `Save` }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- * ------------------------ Dialogs  -------------------------->

      <!-- ? ---------------- Confirm discard  ------------------->
      <ConfirmationDialog
        v-on:confirm-status-change="respondToConfirmDiscardDialog"
        :showDialog="showDialogForConfirmDiscard"
        messageToDisplay="Sure you want to discard this?"
        yesButtonText="Discard"
        noButtonText="Cancel"
      />

      <!-- ? ---------------- Icon Picker  ------------------->
      <IconPicker
        :showDialog="showIconPicker"
        :initialSearchPrefix="activity_local.title"
        v-on:icon-selected="newIconSelected"
        v-on:icon-picker-cancelled="closeIconPicker"
      ></IconPicker>
    </v-bottom-sheet>
  </div>
</template>
