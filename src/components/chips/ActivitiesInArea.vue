<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { useAreasStore } from "@/store/AreasStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ActivityWizard from "../dialogs/ActivityWizard.vue";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";
import ActivityChips from "./ActivityChips.vue";

@Component({
  components: {
    ActivityWizard: ActivityWizard,
    ConfirmationDialog: ConfirmationDialog,
    ActivityChips: ActivityChips,
  },
})
export default class ActivitiesInArea extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area!: Area;
  @Prop()
  isDisplayed!: boolean;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in ActivitiesInArea. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  activitiesStore = useActivitiesStore();
  areasStore = useAreasStore();

  // ------------------------------------------------ Data
  showCreateActivityDialog = false;
  showEditActivityDialog = false;
  showDeleteActivityDialog = false;
  selectedActivity: Activity | null = null;
  selectedItemIDs: string[] = [];
  newActivity: Activity = deepCopy(defaultNewActivity);
  searchInput = "";

  // ------------------------------------------------ Computed
  get activitiesList(): Activity[] {
    const activityList = this.activitiesStore.getActivitiesByArea(this.area.id);
    this.selectedItemIDs = activityList.map((activity) => activity.id);
    return activityList;
  }

  get areasList(): Area[] {
    return this.areasStore.getAll();
  }

  mounted() {
    this.onShow();
    console.log("🐪 🐪 🐪 Mounted ---- ActivitiesInArea");
  }

  unmounted() {
    this.onHide();
    console.log("🐪 🐪 🐪 🐪 🐪 🐪 UNMOUNTED ---- ActivitiesInArea");
  }

  // ------------------------------------------------ Methods
  onShow() {
    // Subscribe to stores
    this.activitiesStore.subscribeToStore();
    this.areasStore.subscribeToStore();

    // Reset
    this.selectedActivity = deepCopy(defaultNewActivity);
  }

  onHide() {
    // Unsubscribe from stores
    this.activitiesStore.unsubscribe();
    this.areasStore.unsubscribe();
  }

  promptForNewActivity() {
    console.log("🦎 promptForNewActivity ---" + JSON.stringify(this.area));
    this.showCreateActivityDialog = true;
  }

  triggerEditDialog(activity: Activity) {
    console.log("triggerEditDialog");
    this.selectedActivity = activity;
    this.showEditActivityDialog = true;
  }

  triggerDeleteDialog(activity: Activity) {
    console.log("triggerDeleteDialog");
    this.selectedActivity = activity;
    this.showDeleteActivityDialog = true;
  }

  closeActivityDialog() {
    this.showCreateActivityDialog = false;
    this.showEditActivityDialog = false;
  }

  // Delete
  respondToConfirmDeleteDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.activitiesStore.deleteActivity(this.selectedActivity!);
    }
    this.showDeleteActivityDialog = false;
  }
}
</script>

<template>
  <div>
    <v-card flat>
      <!--  -->

      <!-- * ---------------- Chips -->
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-2 text-h6 font-weight-light">
          Activities
        </v-card-title>
        <v-card-subtitle class="pa-2 pt-3 text-caption font-weight-light">
          Click to edit, or create a new one.
        </v-card-subtitle>

        <ActivityChips
          :activities="activitiesList"
          :areas="areasList"
          :hasCloseButton="true"
          :closeIcon="`mdi-delete`"
          v-on:chip-clicked="triggerEditDialog"
          v-on:chip-closed="triggerDeleteDialog"
        />

        <!-- * ------------------------ Auto-complete for chips  -------------------------->
        <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
        <!-- removed fields: clearable -->
      </v-card-text>

      <!-- ? ------------ (+) icon ------------ * -->
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn outlined rounded @click="promptForNewActivity">
          <v-icon class="pr-2"> mdi-plus </v-icon>
          Create
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <!--  -->
    </v-card>

    <!-- * ------------------------ New popup  -------------------------->
    <ActivityWizard
      :activity="newActivity"
      :areaId="area.id"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateActivityDialog"
      v-on:close="closeActivityDialog"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <ActivityWizard
      :activity="selectedActivity"
      :areaId="area.id"
      :dialog-mode="`EDIT`"
      :showDialog="showEditActivityDialog"
      v-on:close="closeActivityDialog"
    />

    <!-- * ------------------------ Delete popup  -------------------------->
    <!-- Trigger when the (x) button is clicked on a chip -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDeleteDialog"
      :showDialog="showDeleteActivityDialog"
      messageToDisplay="Sure you want to delete this?"
      yesButtonText="Delete"
      noButtonText="Cancel"
    />
  </div>
</template>
