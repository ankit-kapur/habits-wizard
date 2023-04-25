<script lang="ts">
import Activity, {
  MeasurableForActivity,
} from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import MeasurableSelector from "../selectors/MeasurableSelector.vue";

@Component({
  components: {
    MeasurableSelector: MeasurableSelector,
  },
})
export default class ConfigureMeasurablesInActivity extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activity!: Activity;
  @Prop()
  area!: Area;
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

  // ------------------------------------------------ Data
  measurables: MeasurableForActivity[] = [];
  showMeasurableSelectionDialog = false;

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
    // Nothing here for now.
  }

  onHide() {
    // Reset
    this.showMeasurableSelectionDialog = false;
  }

  // ------------------------------------------------ Computed props
  getUnselectedMeasurables(): MeasurableDefinition[] {
    const activityMeasurableIDList: string[] = this.activity.measurables.map(
      (measurableForActivity) => measurableForActivity.measurableDefinitionId
    );
    return this.area.measurableDefinitions.filter(
      (definition) => !activityMeasurableIDList.includes(definition.id)
    );
  }

  // ------------------------------------------------ Getters
  getMeasurableDefinition(measurable: MeasurableForActivity) {
    return this.area.measurableDefinitions.find(
      (definition) => definition.id === measurable.measurableDefinitionId
    );
  }

  // ------------------------------------------------ Actions
  onUpdate(measurables: MeasurableForActivity[]) {
    this.$emit("update", measurables);
  }

  removeMeasurableFromActivity(measurable: MeasurableForActivity) {
    this.activity.measurables = this.activity.measurables.filter(
      (m) => m !== measurable
    );
  }
}
</script>

<template>
  <v-card flat style="border-radius: 8px">
    <!--  -->

    <v-card-text>
      What would you like to measure when you do this activity?
    </v-card-text>

    <!-- ? ----------------- For loop on each Measurable --------------------->
    <v-card-text
      v-for="measurable in measurables"
      :key="measurable.measurableDefinitionId"
      class="pa-0 ma-0 pt-2"
    >
      <v-container>
        <v-row class="text-center">
          <!--  -->

          <v-col class="px-auto">
            <!-- ? -------------- Is Required ------------>
            <v-select v-model="measurable.isRequired"></v-select>
          </v-col>

          <v-col class="px-auto">
            <!-- ? -------------- Icon ------------>
            <v-icon> {{ getMeasurableDefinition(measurable).icon }} </v-icon>
          </v-col>

          <v-col class="px-auto">
            <!-- ? -------------- Name ------------>
            <v-icon> {{ getMeasurableDefinition(measurable).title }} </v-icon>
          </v-col>

          <v-col class="px-auto">
            <!-- ? -------------- Remove (x) ------------>
            <v-icon @click="removeMeasurableFromActivity(measurable)">
              mdi-close
            </v-icon>
          </v-col>

          <!--  -->
        </v-row>

        <!--  -->
      </v-container>
    </v-card-text>

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
      :availableMeasurables="getUnselectedMeasurables"
      :area="area"
    />

    <!--  -->
  </v-card>
</template>
