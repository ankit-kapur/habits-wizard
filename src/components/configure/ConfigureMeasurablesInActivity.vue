<script lang="ts">
import MeasurableChips from "@/components/chips/MeasurableChips.vue";
import MeasurableWizard from "@/components/wizards/MeasurableWizard.vue";
import Activity, {
  MeasurableForActivity,
} from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useAreasStore } from "@/store/AreasStore";
import { deepCopy } from "@firebase/util";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import MeasurableSelector from "@/components/selectors/MeasurableSelector.vue";

@Component({
  components: {
    MeasurableSelector: MeasurableSelector,
    MeasurableChips: MeasurableChips,
    MeasurableWizard: MeasurableWizard,
  },
})
export default class ConfigureMeasurablesInActivity extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activity!: Activity;
  @Prop()
  areaId!: string;
  @Prop()
  isDisplayed!: boolean;

  // ------------------------------------------------ Watchers
  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();

  // ------------------------------------------------ Data
  measurables: MeasurableForActivity[] = [];
  showMeasurableSelectionDialog = false;
  showEditMeasurableDialog = false;
  selectedMeasurableId: string | null = null;

  // ------------------------------------------------ Lifecycle management
  mounted() {
    this.onShow();
    console.log("🐪 Mounted ---- ConfigureMeasurablesInActivity");
  }

  unmounted() {
    this.onHide();
    console.log("🐪 Unmounted ---- ConfigureMeasurablesInActivity");
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.areasStore.subscribeToLoadAllQuery();

    // <!-- ! --- THIS MAY NOT WORK. Moving between steps in ActivityWizard shouldn't reset this. -->
    this.measurables = deepCopy(this.activity.measurables);
  }

  onHide() {
    this.areasStore.unsubscribeAll();
    // Reset
    this.showMeasurableSelectionDialog = false;
  }

  // ------------------------------------------------ Computed props
  get area(): Area {
    return this.areasStore.getAreaById(this.areaId);
  }

  // ------------------------------------------------ Getters
  getMeasurableDefinition(measurableId: string | null) {
    if (!this.area || !measurableId) return undefined;
    return this.area.measurableDefinitions.find(
      (definition) => definition.id === measurableId
    );
  }

  getMeasurableDefinitions(measurableId: string) {
    const def = this.getMeasurableDefinition(measurableId);
    return !def ? [] : [def];
  }

  // ------------------------------------------------ Actions
  updateParentState() {
    this.$emit("update", this.measurables);
  }

  openEditMeasurableDialog(measurable: MeasurableForActivity) {
    console.log(
      "🐪 openEditMeasurableDialog ---- " + JSON.stringify(measurable)
    );
    this.selectedMeasurableId = measurable.measurableDefinitionId;
    this.showEditMeasurableDialog = true;
  }

  removeMeasurableFromActivity(measurable: MeasurableForActivity) {
    this.measurables = this.measurables.filter(
      (m) => m.measurableDefinitionId !== measurable.measurableDefinitionId
    );
    this.updateParentState();
  }

  addSelectedMeasurable(newlySelectedMeasurable: MeasurableForActivity) {
    this.measurables.push(newlySelectedMeasurable);
    this.closeMeasurableSelector();
    this.updateParentState();
  }

  closeMeasurableSelector() {
    this.showMeasurableSelectionDialog = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeEditWizard(irrelevantValue?: boolean) {
    this.selectedMeasurableId = null;
    this.showEditMeasurableDialog = false;
  }
}
</script>

<template>
  <v-card flat style="border-radius: 8px">
    <!--  -->

    <v-card-text class="pa-0 ma-0 pt-2">
      What would you like to measure when you do this activity?
    </v-card-text>

    <!-- ? ----------------- Header --------------------->
    <v-card-text
      v-show="measurables && measurables.length > 0"
      class="pa-0 ma-0 pt-3"
    >
      <v-container class="pa-0 ma-0">
        <v-row class="pa-0 ma-0 text-center">
          <v-spacer />

          <v-col class="pa-1" cols="5"> Measurable </v-col>
          <v-col class="pa-1 pr-5" cols="3"> Required? </v-col>
          <v-col class="pa-1"> Remove </v-col>

          <v-spacer />
        </v-row>
      </v-container>
    </v-card-text>

    <!-- ? ----------------- For loop on each Measurable --------------------->
    <v-card-actions
      v-show="measurables && measurables.length > 0"
      v-for="measurable in measurables"
      v-bind:key="measurable.measurableDefinitionId"
      class="pa-0 ma-0 pt-2"
    >
      <v-container class="pa-0 ma-0">
        <v-row class="pa-0 ma-0 text-center">
          <!--  -->

          <v-spacer />

          <!-- ? -------------- Measurable Chip ------------>
          <v-col
            class="pa-1 pb-0 text-left"
            cols="5"
            @click="openEditMeasurableDialog(measurable)"
          >
            <MeasurableChips
              :measurableDefinitions="
                getMeasurableDefinitions(measurable.measurableDefinitionId)
              "
            />
          </v-col>

          <!-- <v-spacer /> -->

          <v-col class="pa-1 pt-2" cols="3">
            <!-- ? -------------- Is Required ------------>
            <v-switch
              v-model="measurable.isRequired"
              hide-details="false"
              label=""
              class="ma-0 pa-0"
            >
            </v-switch>
          </v-col>

          <!-- <v-spacer /> -->

          <v-col class="pa-1">
            <!-- ? -------------- (x) Remove button ------------>
            <v-btn icon @click="removeMeasurableFromActivity(measurable)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>

          <v-spacer />

          <!--  -->
        </v-row>

        <!--  -->
      </v-container>
    </v-card-actions>

    <!-- ? ------------ (+) icon ------------ * -->
    <v-card-actions class="mt-4">
      <v-spacer />
      <v-btn outlined rounded @click="showMeasurableSelectionDialog = true">
        <v-icon class="pr-2"> mdi-plus </v-icon>
        Add
      </v-btn>
      <v-spacer />
    </v-card-actions>

    <!-- ? ------------ Selector for adding Measurables ------------ * -->
    <MeasurableSelector
      :isDisplayed="showMeasurableSelectionDialog"
      :measurablesInActivity="activity.measurables"
      :areaId="areaId"
      v-on:save-confirmed="addSelectedMeasurable"
      v-on:discard="closeMeasurableSelector"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <MeasurableWizard
      :measurableDefinition="getMeasurableDefinition(selectedMeasurableId)"
      :areaId="area.id"
      :dialog-mode="`EDIT`"
      :showDialog="showEditMeasurableDialog"
      v-on:close="closeEditWizard"
    />
    <!--  -->
  </v-card>
</template>
