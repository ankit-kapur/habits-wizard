<script lang="ts">
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { useAreasStore } from "@/store/AreasStore";
import { useEventRecordsStore } from "@/store/EventRecordsStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ActivityWizard from "../dialogs/ActivityWizard.vue";
import ActivityChips from "./ActivityChips.vue";

@Component({
  components: {
    ActivityWizard: ActivityWizard,
    ActivityChips: ActivityChips,
    ConfirmationDialog: ConfirmationDialog,
  },
})
export default class ActivitySelector extends Vue {
  // <!-- * -------------------------------- Required Props ------------------------------->
  @Prop()
  isDisplayed!: boolean;

  // <!-- * -------------------------------- Optional Props ------------------------------->
  // For filtering, areaID and/or categoryID can be provided.
  @Prop()
  areaId?: string;
  @Prop()
  categoryId?: string;

  // <!-- * -------------------------------- Watchers ------------------------------->
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

  // <!-- * -------------------------------- Stores ------------------------------->
  areasStore = useAreasStore();
  activitiesStore = useActivitiesStore();
  eventRecordsStore = useEventRecordsStore();

  // ------------------------------------------------ Data
  showCreateActivityDialog = false;
  showEditActivityDialog = false;
  showDeleteActivityDialog = false;
  selectedActivity: Activity | null = null;
  selectedActivityID = "";
  newActivity: Activity = deepCopy(defaultNewActivity);
  searchInput = "";
  isSearchModeEnabled = false;

  // <!-- * -------------------------------- Computed props ------------------------------->
  get activitiesList(): Activity[] {
    const activityList = this.activitiesStore.getAll();

    if (this.areaId) {
      activityList.filter((activity) => activity.areaId === this.areaId);
    }

    return activityList;
  }

  get areasList(): Area[] {
    return this.areasStore.getAll();
  }

  // <!-- * -------------------------------- Lifecycle actions ------------------------------->
  mounted() {
    this.onShow();
    console.log("🐪 Mounted ---- ActivitySelector");
  }

  unmounted() {
    this.onHide();
    console.log("🐪 Unmounted ---- ActivitySelector");
  }

  onShow() {
    // Subscribe to stores
    this.areasStore.subscribeToStore();
    this.activitiesStore.subscribeToStore();

    // Reset
    this.resetState();
  }

  onHide() {
    this.areasStore.unsubscribe();
    this.activitiesStore.unsubscribe(); // Unsubscribe from stores
  }

  resetState() {
    this.selectedActivityID = "";
    this.isSearchModeEnabled = false;
  }

  /**
   * When selection changes, notify the parent.
   */
  onTagSelectionChange() {
    this.selectedActivity =
      this.selectedActivityID && this.selectedActivityID.length > 0
        ? this.activitiesStore.getActivityByID(this.selectedActivityID)
        : null;

    this.$emit("selection-changed", this.selectedActivity);

    // Reset
    this.isSearchModeEnabled = false;
  }

  deSelectChip() {
    console.log("DESELECTED");
    this.selectedActivityID = "";
    this.$emit("selection-changed", null);
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

  onInputClick() {
    // <!-- TODO P2 ------- Not working. Need to stop the onscreen-keyboard from popping up.

    if (!this.isSearchModeEnabled)
      (document.activeElement as HTMLElement).blur();
    this.searchInput = "";
  }

  triggerEditDialog() {
    console.log("triggerEditDialog");
    this.showEditActivityDialog = true;
  }

  triggerDeleteDialog() {
    console.log("triggerDeleteDialog");
    this.showDeleteActivityDialog = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeActivityDialog(irrelevantValue?: boolean) {
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
    <v-container flat class="pl-5">
      <v-row>
        <!--  -->

        <v-col cols="1" class="d-flex justify-center align-center">
          <!-- ? ------------ Filter icon ------------ * -->
          <!-- TODO P2 ----- Show a dialog for selecting an Area and/or Category -->
          <v-icon @click="isSearchModeEnabled = true" class="mb-4">
            mdi-magnify
          </v-icon>

          <!-- <v-btn icon @click="showCreateActivityDialog = true" class="pb-4">
            <v-icon> mdi-filter </v-icon>
          </v-btn> -->
        </v-col>

        <!-- * ------------------------ Auto-complete chips  -------------------------->
        <v-col class="px-0">
          <!--  -->

          <v-select
            auto-select-first
            chips
            deletable-chips
            label="Pick an Activity"
            v-model="selectedActivityID"
            :items="activitiesList"
            item-text="title"
            item-value="id"
            hint="Select an Activity or create one."
            persistent-hint
            hide-selected
            :hide-no-data="showCreateActivityDialog"
            @input="onInputClick()"
            :search-input.sync="searchInput"
            @keydown.enter="promptForNewActivity"
            @keydown.enter.native.prevent
            @change="onTagSelectionChange"
            :menu-props="{
              closeOnContentClick: false,
              closeOnClick: true,
              openOnClick: false,
            }"
            :disabled="showEditActivityDialog"
            color="primary"
            class="pt-2 px-2"
          >
            <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
            <!-- removed fields: clearable -->
            <!-- <v-autocomplete
            auto-select-first
            chips
            deletable-chips
            label="Pick an Activity"
            v-model="selectedActivityID"
            :items="activitiesList"
            item-text="title"
            item-value="id"
            hint="Select an Activity or create one."
            persistent-hint
            hide-selected
            :hide-no-data="showCreateActivityDialog"
            @input="onInputClick()"
            :search-input.sync="searchInput"
            @keydown.enter="promptForNewActivity"
            @keydown.enter.native.prevent
            @change="onTagSelectionChange"
            :menu-props="{
              closeOnContentClick: false,
              closeOnClick: true,
              openOnClick: false,
            }"
            :disabled="showEditActivityDialog"
            color="primary"
            class="pt-2 px-2"
          > -->
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
                :areas="areasList"
                :hasCloseButton="true"
                :closeIcon="`mdi-close`"
                v-on:chip-closed="deSelectChip"
                v-on:chip-clicked="triggerEditDialog"
                class="mt-3"
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
                      <!--  -->

                      <!-- ? ------ Icon -->
                      <v-icon
                        class="pr-4"
                        :color="areasStore.getActivityColor(item)"
                      >
                        {{ item.icon }}
                      </v-icon>

                      <!-- ? ------ Title of Activity -->
                      <span>{{ item.title }}</span>
                      <v-spacer></v-spacer>
                    </v-row>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>

            <!-- ? ------------ (+) icon ------------ * -->
            <template v-slot:append-outer>
              <v-btn icon @click="showCreateActivityDialog = true">
                <v-icon> mdi-plus </v-icon>
                <!-- mdi-plus-circle-outline -->
              </v-btn>
            </template>

            <!--  -->
          </v-select>

          <!--  -->
        </v-col>
      </v-row>

      <!--  -->
    </v-container>

    <!-- * ------------------------ New popup  -------------------------->
    <ActivityWizard
      :activity="newActivity"
      :areaId="areaId"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateActivityDialog"
      v-on:close="closeActivityDialog"
    />

    <!-- * ------------------------ Edit popup  -------------------------->
    <ActivityWizard
      :activity="selectedActivity"
      :areaId="areaId"
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
