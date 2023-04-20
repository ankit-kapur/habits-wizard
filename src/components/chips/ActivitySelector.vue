<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ActivityCreateOrEditDialog from "../dialogs/ActivityCreateOrEditDialog.vue";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";

@Component({
  components: {
    ActivityCreateOrEditDialog: ActivityCreateOrEditDialog,
    ConfirmationDialog: ConfirmationDialog,
  },
})
export default class ActivitySelector extends Vue {
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
      "👀 @Watch in ActivitySelector. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  activitiesStore = useActivitiesStore();

  // ------------------------------------------------ Data
  showCreateActivityDialog = false;
  showEditActivityDialog = false;
  showDeleteActivityDialog = false;
  selectedActivity: Activity | null = null;
  selectedItemIdList_local: string[] = [];
  newActivity: Activity = deepCopy(defaultNewActivity);
  searchInput = "";

  // ------------------------------------------------ Computed
  get activitiesList(): Activity[] {
    return this.activitiesStore.getActivitiesByArea(this.area.id);
  }

  mounted() {
    this.onShow();
    console.log("🐪 🐪 🐪 Mounted ---- ActivitySelector");
  }

  unmounted() {
    this.activitiesStore.unsubscribe();
    console.log("🐪 🐪 🐪 🐪 🐪 🐪 UNMOUNTED ---- ActivitySelector");
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.activitiesStore.subscribeToStore(); // Subscribe to store
  }

  onHide() {
    this.activitiesStore.unsubscribe(); // Unsubscribe from store
  }

  promptForNewActivity() {
    // Checks if the searchInput text matches something from the dropdown.
    if (
      this.activitiesList.filter((e) => e.title.startsWith(this.searchInput))
        .length == 0
    ) {
      this.newActivity.title = this.searchInput;
      this.showCreateActivityDialog = true;
    }
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  createNewActivity(newActivity: Activity) {
    console.log("Saving new category");

    // TODO P0 -------- Get Category ID here for Create.

    const categoryId = "";

    const newId: string = this.activitiesStore.createActivity(
      newActivity,
      this.area.id,
      categoryId
    );
    this.selectedItemIdList_local.push(newId);
    this.showCreateActivityDialog = false;
  }

  triggerEditDialog(categoryTag: Activity) {
    console.log("triggerEditDialog");
    this.selectedActivity = categoryTag;
    this.showEditActivityDialog = true;
  }

  triggerDeleteDialog(categoryTag: Activity) {
    console.log("triggerDeleteDialog");
    this.selectedActivity = categoryTag;
    this.showDeleteActivityDialog = true;
  }

  saveExistingActivity(updatedActivity: Activity) {
    console.log("Saving new category");
    this.activitiesStore.updateActivity(updatedActivity);
    // Reset things.
    this.showEditActivityDialog = false;
    this.selectedActivity = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discardActivityChange(irrelevantValue: boolean) {
    console.log("Discarding");
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
      <!-- * ---------------- Chips -->
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-1 text-h6 font-weight-light">
          Activities
        </v-card-title>

        <!-- TODO P0 --------- Use ActivityChips component here. -->
        <v-chip-group column>
          <v-chip
            v-for="(activity, index) in activitiesList"
            :close-icon="`mdi-delete`"
            close
            @click="triggerEditDialog(activity)"
            @click:close="triggerDeleteDialog(activity)"
            v-bind:activity="activity"
            v-bind:index="index"
            v-bind:key="activity.id"
            :model-value="true"
            :prepend-icon="activity.icon"
            class="pa-4 pl-3 pr-4"
          >
            <v-icon class="ml-0 mr-2">{{ activity.icon }}</v-icon>
            <span class="text-body-2">{{ activity.title }}</span>
          </v-chip>
        </v-chip-group>
      </v-card-text>

      <!-- * ------------ (+) icon ------------ * -->
      <v-card-actions>
        <v-spacer />
        <v-btn outlined rounded @click="showCreateActivityDialog = true">
          <v-icon class="pr-2"> mdi-plus </v-icon>
          Add
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <!--  -->
    </v-card>

    <!-- * ------------------------ New popup  -------------------------->
    <ActivityCreateOrEditDialog
      :activity="newActivity"
      :area="area"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateActivityDialog"
      v-on:save-confirmed="createNewActivity"
      v-on:discard="discardActivityChange"
    ></ActivityCreateOrEditDialog>

    <!-- * ------------------------ Edit popup  -------------------------->
    <ActivityCreateOrEditDialog
      :activity="selectedActivity"
      :area="area"
      :dialog-mode="`EDIT`"
      :showDialog="showEditActivityDialog"
      v-on:save-confirmed="saveExistingActivity"
      v-on:discard="discardActivityChange"
    ></ActivityCreateOrEditDialog>

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
