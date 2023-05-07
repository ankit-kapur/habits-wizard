<script lang="ts">
import MeasurableChips from "@/components/chips/MeasurableChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import MeasurableWizard from "@/components/wizards/MeasurableWizard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import { MeasurableForActivity } from "@/model/pojo/definitions/Activity";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { useAreasStore } from "@/store/AreasStore";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import MyEmoji from "@/components/chips/MyEmoji.vue";

@Component({
  components: {
    MeasurableWizard: MeasurableWizard,
    ConfirmationDialog: ConfirmationDialog,
    MeasurableChips: MeasurableChips,
    MyEmoji: MyEmoji,
  },
})
export default class MeasurableSelector extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  measurablesInActivity!: MeasurableForActivity[];
  @Prop()
  areaId!: string;
  @Prop()
  alreadySelected!: MeasurableDefinition[];
  @Prop()
  isDisplayed!: boolean;

  // ------------------------------------------------ Watchers
  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in MeasurableSelector. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();

  // ------------------------------------------------ Data
  showCreateMeasurableDialog = false;
  showEditMeasurableDialog = false;
  showDeleteMeasurableDialog = false;
  selectedMeasurableId: string | null = null;
  isRequired = false;

  // ------------------------------------------------ Computed
  get area(): Area {
    return this.areasStore.getAreaById(this.areaId);
  }

  get selectedMeasurable(): MeasurableDefinition | undefined {
    if (!this.selectedMeasurableId) return undefined;
    return this.availableMeasurables.find(
      (m) => m.id === this.selectedMeasurableId
    );
  }

  /**
   * Returns all the Measurables in the Area that are not already in the Activity.
   */
  get availableMeasurables(): MeasurableDefinition[] {
    if (!this.areaId) return [];

    const activityMeasurableIDList: string[] = this.measurablesInActivity.map(
      (measurableForActivity) => measurableForActivity.measurableDefinitionId
    );

    return this.areasStore
      .getMeasurablesInArea(this.areaId)
      .filter(
        (definition) => !activityMeasurableIDList.includes(definition.id)
      );
  }

  // loadAvailableMeasurables() {
  //   const activityMeasurableIDList: string[] = this.measurablesInActivity.map(
  //     (measurableForActivity) => measurableForActivity.measurableDefinitionId
  //   );

  //   console.log("🐞 AREA = " + JSON.stringify(this.getArea()));

  //   this.availableMeasurables = this.getArea().measurableDefinitions.filter(
  //     (definition) => !activityMeasurableIDList.includes(definition.id)
  //   );
  // }

  // ------------------------------------------------ Lifecycle management
  mounted() {
    this.onShow();
    console.log("🐪 Mounted ---- MeasurableSelector");
  }

  unmounted() {
    this.onHide();
    console.log("🐪 Unmounted ---- MeasurableSelector");
  }

  onShow() {
    this.areasStore.subscribeToStore();
  }

  onHide() {
    this.areasStore.unsubscribe();
    this.resetState();
  }

  resetState() {
    this.selectedMeasurableId = null; // Reset
  }

  // ------------------------------------------------ Methods
  triggerEditDialog(measurableDefinition: MeasurableDefinition) {
    console.log("triggerEditDialog");
    this.selectedMeasurableId = measurableDefinition.id;
    this.showEditMeasurableDialog = true;
  }

  triggerDeleteDialog(measurableDefinition: MeasurableDefinition) {
    console.log("triggerDeleteDialog");
    this.selectedMeasurableId = measurableDefinition.id;
    this.showDeleteMeasurableDialog = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeWizardDialogs(irrelevantValue?: boolean) {
    console.log("Discarding");
    this.resetState();
    this.showCreateMeasurableDialog = false;
    this.showEditMeasurableDialog = false;
  }

  // Delete
  respondToConfirmDeleteDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.areasStore.deleteMeasurableDefinition(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedMeasurableId!,
        this.areaId
      );
    }
    this.showDeleteMeasurableDialog = false;
  }

  addNewlyCreatedMeasurable(newMeasurableId: string) {
    // this.me
    this.selectedMeasurableId = newMeasurableId;

    // <!-- TODO P2 --------- This is not working. Selection in v-select should reflect the newly created thing -->

    console.log("CHANGED newMeasurableId = " + newMeasurableId);

    console.log(
      "availableMeasurables = " + JSON.stringify(this.availableMeasurables)
    );
  }

  discard() {
    this.$emit("discard", true);
  }

  confirmSelection() {
    if (this.selectedMeasurableId) {
      const newlySelectedMeasurable: MeasurableForActivity = {
        measurableDefinitionId: this.selectedMeasurableId,
        isRequired: this.isRequired,
      };
      this.$emit("save-confirmed", newlySelectedMeasurable);
    } else {
      console.log("This is a bug 🐞");
    }
  }
}
</script>

<template>
  <v-bottom-sheet
    v-model="isDisplayed"
    inset
    max-width="400"
    overlay-opacity="0.88"
    persistent
    @keydown.esc="discard"
  >
    <v-card flat>
      <!-- * ---------------- Chips -->
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-2 text-h6 font-weight-light">
          Add a Measurable
        </v-card-title>
        <!-- <v-card-subtitle class="pa-2 pt-3 text-caption font-weight-light">
          Select from the list, or create a new one.
        </v-card-subtitle> -->

        <!-- * ------------------------ Dropdown  -------------------------->
        <!-- :disabled="!isInEditMode" -->
        <v-select
          chips
          deletable-chips
          label="Select from the list, or create a new one."
          v-model="selectedMeasurableId"
          :items="availableMeasurables"
          item-text="title"
          item-value="id"
          :menu-props="{
            closeOnContentClick: false,
            closeOnClick: true,
            openOnClick: false,
          }"
          color="primary"
          class="pt-2 px-2"
        >
          <!-- * ------------ Chips component ------------ * -->
          <template v-slot:selection="data">
            <MeasurableChips
              :measurableDefinitions="[data.item]"
              :hasCloseButton="true"
              :closeIcon="`mdi-delete`"
              v-on:chip-clicked="triggerEditDialog"
              v-on:chip-closed="triggerDeleteDialog"
              @mousedown.prevent
            />
          </template>

          <!-- * ------------ (+) Create button in the list ------------ * -->
          <template v-slot:prepend-item>
            <v-list-item
              ripple
              @mousedown.prevent
              @click="showCreateMeasurableDialog = true"
            >
              <v-list-item-action>
                <v-icon> mdi-plus </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title> <span> Create </span> </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2"></v-divider>
          </template>

          <!-- * ------------ List item in dropdown ------------ * -->
          <!-- eslint-disable vue/no-unused-vars -->
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <template v-slot:item="{ item, attrs, on }">
            <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
              <!--  -->

              <v-list-item-action>
                <MyEmoji :emojiString="item.baseUnitEmoji" />
              </v-list-item-action>

              <v-list-item-content>
                <v-list-item-title>
                  <v-row no-gutters align="center">
                    <span>{{ item.title }}</span>
                    <v-spacer></v-spacer>
                  </v-row>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <!--  -->
        </v-select>
      </v-card-text>

      <v-card-text>
        <v-switch
          v-model="isRequired"
          hide-details
          inset
          label="Required"
        ></v-switch>
      </v-card-text>

      <!-- ? ------------ (+) icon ------------ * -->
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn outlined rounded @click="showCreateMeasurableDialog = true">
          <v-icon class="pr-2"> mdi-plus </v-icon>
          Create
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <v-divider />

      <!-- ? ------------------ Save / Cancel ---------------------->
      <v-card-actions class="pt-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn text @click="discard"> Cancel </v-btn>
        <v-btn
          color="primary"
          @click="confirmSelection"
          :disabled="!selectedMeasurableId"
        >
          Select
        </v-btn>
      </v-card-actions>

      <!--  -->
    </v-card>

    <!-- * ------------------------ New popup  -------------------------->
    <MeasurableWizard
      :areaId="area.id"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateMeasurableDialog"
      v-on:close="closeWizardDialogs"
      v-on:new-measurable-created="addNewlyCreatedMeasurable"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <MeasurableWizard
      :measurableDefinition="selectedMeasurable"
      :areaId="area.id"
      :dialog-mode="`EDIT`"
      :showDialog="showEditMeasurableDialog"
      v-on:close="closeWizardDialogs"
    />

    <!-- * ------------------------ Delete popup  -------------------------->
    <!-- Trigger when the (x) button is clicked on a chip -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDeleteDialog"
      :showDialog="showDeleteMeasurableDialog"
      messageToDisplay="Sure you want to delete this?"
      yesButtonText="Delete"
      noButtonText="Cancel"
    />
  </v-bottom-sheet>
</template>
