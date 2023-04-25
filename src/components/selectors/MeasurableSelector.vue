<script lang="ts">
import MeasurableChips from "@/components/chips/MeasurableChips.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import MeasurableWizard from "@/components/wizards/MeasurableWizard.vue";
import { defaultNewMeasurable } from "@/constants/DefaultMeasurables";
import { Area } from "@/model/pojo/definitions/Area";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { useAreasStore } from "@/store/AreasStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component({
  components: {
    MeasurableWizard: MeasurableWizard,
    ConfirmationDialog: ConfirmationDialog,
    MeasurableChips: MeasurableChips,
  },
})
export default class MeasurableSelector extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area!: Area;
  @Prop()
  availableMeasurables!: MeasurableDefinition[];
  @Prop()
  isDisplayed!: boolean;

  // ------------------------------------------------ Watchers
  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
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
  selectedMeasurable: MeasurableDefinition | null = null;
  isRequired = false;
  newMeasurable: MeasurableDefinition = deepCopy(defaultNewMeasurable);

  // ------------------------------------------------ Computed

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
    this.areasStore.subscribeToLoadAllQuery();
  }

  onHide() {
    this.areasStore.unsubscribeAll();
  }

  // ------------------------------------------------ Methods
  createNewMeasurable(measurableDefinition: MeasurableDefinition) {
    const updatedArea = deepCopy(this.area);
    updatedArea.measurableDefinitions.push(measurableDefinition);
    // Save to store
    this.areasStore.updateArea(updatedArea);
    // Hide dialog
    this.closeWizardDialogs();
  }

  triggerEditDialog(measurableDefinition: MeasurableDefinition) {
    console.log("triggerEditDialog");
    this.selectedMeasurable = measurableDefinition;
    this.showEditMeasurableDialog = true;
  }

  triggerDeleteDialog(measurableDefinition: MeasurableDefinition) {
    console.log("triggerDeleteDialog");
    this.selectedMeasurable = measurableDefinition;
    this.showDeleteMeasurableDialog = true;
  }

  saveExistingMeasurable(measurableDefinition: MeasurableDefinition) {
    console.log("Saving existing measurable");
    // Save to store
    this.areasStore.updateMeasurableDefinition(
      measurableDefinition,
      this.area.id
    );
    // Hide dialog
    this.closeWizardDialogs();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeWizardDialogs(irrelevantValue?: boolean) {
    console.log("Discarding");
    this.showCreateMeasurableDialog = false;
    this.showEditMeasurableDialog = false;

    this.selectedMeasurable = deepCopy(defaultNewMeasurable);
  }

  // Delete
  respondToConfirmDeleteDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.areasStore.deleteMeasurableDefinition(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.selectedMeasurable!.id,
        this.area.id
      );
    }
    this.showDeleteMeasurableDialog = false;
  }
}
</script>

<template>
  <div>
    <v-card flat>
      <!-- * ---------------- Chips -->
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-2 text-h6 font-weight-light">
          Add a Measurable
        </v-card-title>
        <v-card-subtitle class="pa-2 pt-3 text-caption font-weight-light">
          Select from the list, or create a new one.
        </v-card-subtitle>

        <!-- * ------------------------ Selection chips  -------------------------->
        <v-select
          chips
          deletable-chips
          label="Select a Measurable"
          v-model="selectedMeasurable"
          :items="availableMeasurables"
          item-text="title"
          item-value="id"
          :menu-props="{
            closeOnContentClick: false,
            closeOnClick: true,
            openOnClick: false,
          }"
          :disabled="showEditMeasurableDialog"
          color="primary"
          class="pt-2 px-2"
        >
          <!-- * ------------ Chips component ------------ * -->
          <template v-slot:selection="data">
            <MeasurableChips
              :measurableDefinitions="[data.item]"
              :hasCloseButton="true"
              :closeIcon="`mdi-close`"
              v-on:chip-clicked="triggerEditDialog"
              v-on:chip-closed="triggerDeleteDialog"
            />
          </template>

          <!-- * ------------ List item in dropdown ------------ * -->
          <!-- eslint-disable vue/no-unused-vars -->
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <template v-slot:item="{ item, attrs, on }">
            <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
              <v-list-item-content>
                <v-list-item-title>
                  <v-row no-gutters align="center">
                    <span>{{ item.emoji }}</span>
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

      <!--  -->
    </v-card>

    <!-- * ------------------------ New popup  -------------------------->
    <MeasurableWizard
      :measurableDefinition="newMeasurable"
      :area="area"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateMeasurableDialog"
      v-on:save-confirmed="createNewMeasurable"
      v-on:discard="closeWizardDialogs"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <MeasurableWizard
      :measurableDefinition="selectedMeasurable"
      :area="area"
      :dialog-mode="`EDIT`"
      :showDialog="showEditMeasurableDialog"
      v-on:save-confirmed="saveExistingMeasurable"
      v-on:discard="closeWizardDialogs"
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
  </div>
</template>
