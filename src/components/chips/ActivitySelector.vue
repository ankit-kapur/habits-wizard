<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
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
  categoriesStore = useCategoryTagsStore();

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

  get categoriesList(): CategoryTag[] {
    return this.categoriesStore.getCategoryTagsList();
  }

  mounted() {
    this.onShow();
    console.log("🐪 Mounted ---- ActivitySelector");
  }

  unmounted() {
    this.onHide();
    console.log("🐪 Unmounted ---- ActivitySelector");
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.activitiesStore.subscribeToStore(); // Subscribe to store
    this.categoriesStore.subscribeToStore();
  }

  onHide() {
    this.activitiesStore.unsubscribe(); // Unsubscribe from store
    this.categoriesStore.unsubscribe();
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

  createNewActivity(newActivity: Activity) {
    // Save to store
    this.activitiesStore.createActivity(newActivity, this.area.id);

    // Hide dialog
    this.closeActivityDialog();
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

  saveExistingActivity(updatedActivity: Activity) {
    this.activitiesStore.updateActivity(updatedActivity);
    this.closeActivityDialog();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeActivityDialog(irrelevantValue?: boolean) {
    console.log("Discarding");
    this.showCreateActivityDialog = false;
    this.showEditActivityDialog = false;

    this.selectedActivity = deepCopy(defaultNewActivity);
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
        <v-card-title class="pa-2 text-h6 font-weight-light">
          Activities
        </v-card-title>
        <v-card-subtitle class="pa-2 pt-3 text-caption font-weight-light">
          Select from the list, or create a new one.
        </v-card-subtitle>

        <!-- * ------------------------ Auto-complete for chips  -------------------------->
        <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
        <!-- removed fields: clearable -->
        <v-autocomplete
          auto-select-first
          chips
          deletable-chips
          label=""
          v-model="selectedItemIDs"
          :items="activitiesList"
          item-text="title"
          item-value="id"
          multiple
          hint=""
          persistent-hint
          hide-selected
          :hide-no-data="showCreateActivityDialog"
          @input="searchInput = ''"
          :search-input.sync="searchInput"
          @keydown.enter="promptForNewActivity"
          @keydown.enter.native.prevent
          :menu-props="{
            closeOnContentClick: false,
            closeOnClick: true,
            openOnClick: false,
          }"
          :disabled="showEditActivityDialog"
          color="primary"
          class="pt-2 px-2"
        >
          <!-- Notes about the modifiers above in <v-autocomplete> -->
          <!--      @input will reset the text-input to '' once tag is selected -->
          <!--      search-input.sync will bind the text-input to our variable -->
          <!--      (unused) @update:search-input="callFunc" will call our func when text-input changes -->
          <!--      hide-no-data will make the prompy for 'no-data' disappear when Create box is active -->

          <!-- * ------------ When no tags match ------------ * -->
          <template v-slot:no-data>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  Press <code>enter</code> to create.
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <!-- * ------------ Chips component ------------ * -->
          <template v-slot:selection="data">
            <ActivityChips
              :activities="[data.item]"
              :categories="categoriesList"
              :hasCloseButton="true"
              :closeIcon="`mdi-delete`"
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
                    <v-icon class="pr-4" :color="item.color">
                      {{ item.icon }}
                    </v-icon>
                    <span>{{ item.title }}</span>
                    <v-spacer></v-spacer>
                  </v-row>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <!--  -->
        </v-autocomplete>
      </v-card-text>

      <!-- ? ------------ (+) icon ------------ * -->
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn outlined rounded @click="showCreateActivityDialog = true">
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
      :area="area"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateActivityDialog"
      v-on:save-confirmed="createNewActivity"
      v-on:discard="closeActivityDialog"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <ActivityWizard
      :activity="selectedActivity"
      :area="area"
      :dialog-mode="`EDIT`"
      :showDialog="showEditActivityDialog"
      v-on:save-confirmed="saveExistingActivity"
      v-on:discard="closeActivityDialog"
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
