<script lang="ts">
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import AreaWizard from "@/components/dialogs/AreaWizard.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { getPrettyTimestamp } from "@/utils/time/TimestampConversionUtils";
import VClamp from "vue-clamp";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import ActivityChips from "@/components/chips/ActivityChips.vue";
import CategoryWizard from "@/components/dialogs/CategoryWizard.vue";
import { DialogMode } from "@/model/enum/DialogMode";
import Activity from "@/model/pojo/definitions/Activity";
import ActivityWizard from "@/components/dialogs/ActivityWizard.vue";

@Component({
  components: {
    AreaWizard: AreaWizard,
    CategoryWizard: CategoryWizard,
    ActivityWizard: ActivityWizard,
    ConfirmationDialog: ConfirmationDialog,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
    VClamp: VClamp,
  },
})
export default class AreaCard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  areaId!: string;

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();
  categoryTagsStore = useCategoryTagsStore();
  activitiesStore = useActivitiesStore();

  // ------------------------------------------------ Data
  isCardExpanded = false;
  showEditButton = false;
  showDeleteButton = false;
  showDialogForConfirmDelete = false;
  showCategoryWizard = false;
  showActivityWizard = false;
  selectedCategoryTag: CategoryTag | null = null;
  selectedActivity: Activity | null = null;
  categoryWizardDialogMode = DialogMode.VIEW;
  activityWizardDialogMode = DialogMode.EDIT;

  MIN_WIDTH_CARD = 320;
  MAX_WIDTH_CARD = 350;
  IMAGE_HEIGHT = 110;
  IMAGE_COLUMNS = 4;
  DESCRIPTION_MAX_LINES = 3;

  // ------------------------------------------------ Method imports
  getPrettyTimestamp = getPrettyTimestamp;

  // <!-- TODO P1 -------- Make show() and hide() functions. -->

  // ------------------------------------------------ Mounted
  mounted() {
    this.areasStore.subscribeToLoadAllQuery();
    this.categoryTagsStore.subscribeToStore();
    console.log("🐪 🐪 🐪  Mounted AreaCard");
  }

  unmounted() {
    // TODO -- not the right place to unsubscribe. not getting called.
    this.categoryTagsStore.unsubscribe();
    this.areasStore.unsubscribeAll();
    console.log("🐪 🐪 🐪  UN-mounted AreaCard");
  }

  // ------------------------------------------------ Computed props
  get activities() {
    return this.activitiesStore.getActivitiesByArea(this.areaId);
  }

  // ------------------------------------------------ Methods
  get area() {
    return this.areasStore.getAreaById(this.areaId);
  }

  expandAreaClicked() {
    const isExpanded = !this.isCardExpanded;
    this.isCardExpanded = isExpanded;

    // Whether the buttons show.
    this.showDeleteButton = isExpanded;
    this.showEditButton = isExpanded;

    // Subscribe to stores here
    if (isExpanded)
      this.activitiesStore.subscribeToStore(); // Subscribe to store
    else this.activitiesStore.unsubscribe();
  }

  // Edits
  showEditDialog() {
    // Ask parent to show edit dialog
    this.$emit("edit-area", this.areaId);
  }

  editMode() {
    console.log("EDIT MODE");
    this.showDeleteButton = false;
    this.showEditButton = true;
  }

  // Deletion
  deleteMode() {
    console.log("DELETE MODE");
    this.showDeleteButton = true;
    this.showEditButton = false;
  }

  confirmDelete() {
    this.showDialogForConfirmDelete = true;
  }

  performDelete() {
    this.areasStore.deleteArea(this.areaId);
  }

  respondToConfirmDeleteDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.performDelete();
    }
    this.showDialogForConfirmDelete = false;
  }

  // <!-- * ---------------------------- Categories ---------------------------->
  get categories(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  triggerCategoryWizard(categoryTag: CategoryTag) {
    console.log("triggerCategoryWizard ====" + JSON.stringify(categoryTag));
    this.selectedCategoryTag = categoryTag;
    this.showCategoryWizard = true;
  }

  closeCategoryWizard() {
    this.showCategoryWizard = false;
    this.categoryWizardDialogMode = DialogMode.VIEW; // Default
    this.selectedCategoryTag = null;
  }

  changeCategoryWizardMode(newDialogMode: DialogMode) {
    this.categoryWizardDialogMode = newDialogMode;
  }

  // <!-- * ---------------------------- Activities ---------------------------->

  triggerActivityWizard(activity: Activity) {
    console.log("triggerCategoryWizard ====" + JSON.stringify(activity));
    this.selectedActivity = activity;
    this.showActivityWizard = true;
  }

  closeActivityWizard() {
    this.showActivityWizard = false;
    this.activityWizardDialogMode = DialogMode.EDIT; // Default
    this.selectedActivity = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeActivityWizardMode(newDialogMode: DialogMode) {
    // TODO P2 --- Enable VIEW mode on ActivityWizard.
    // this.activityWizardDialogMode = newDialogMode;
  }
}
</script>

<template>
  <v-card
    class="mt-4 mx-auto px-auto"
    style="border-radius: 8px"
    :min-width="MIN_WIDTH_CARD"
    :max-width="MAX_WIDTH_CARD"
    elevation="5"
    :ripple="false"
    v-touch="{
      left: () => deleteMode,
      right: () => editMode,
    }"
  >
    <template slot="progress">
      <v-progress-linear
        color="deep-purple"
        height="10"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-container>
      <v-row @click="expandAreaClicked">
        <!--  -->

        <!-- ? ------------------- Image ----------------------->
        <v-col :cols="IMAGE_COLUMNS" class="ma-2 mr-0 pa-0">
          <v-img
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :src="area.imageUrl"
            :width="IMAGE_HEIGHT"
            :height="IMAGE_HEIGHT"
          ></v-img>
        </v-col>

        <v-col class="pt-1 pl-2 ma-0">
          <v-container>
            <!--  -->

            <!-- ? ------------------- Title ----------------------->
            <v-row>
              <v-col class="pa-0 pb-1 pl-0 pt-2">
                <!--  -->

                <!-- * ------------ V-CLAMP -------------->
                <!-- See docs: https://vue-clamp.vercel.app/ -->
                <v-clamp
                  autoresize
                  :max-lines="1"
                  class="text-h5 font-weight-light"
                >
                  {{ area.title }}
                </v-clamp>
              </v-col>
            </v-row>

            <!-- ? ------------------- Description ----------------------->
            <v-row class="">
              <v-col class="pa-0">
                <!--  -->
                <v-clamp
                  autoresize
                  :max-lines="DESCRIPTION_MAX_LINES"
                  class="text-subtitle-2 font-weight-light"
                >
                  {{ area.description }}
                </v-clamp>

                <!--  -->
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <v-expand-transition mode="in-out">
      >
      <div v-if="isCardExpanded">
        <!--  -->

        <!-- * ------------------- Edit & Delete buttons ----------------------->
        <v-card-actions class="mx-auto px-auto pt-0 pb-2">
          <!--  -->
          <!-- <v-spacer></v-spacer> -->

          <!-- ? ------------------- Edit button -->
          <v-btn
            text
            small
            @click="showEditDialog"
            color="edit_button"
            style="border-radius: 15px; border-width: 1"
            class="ml-5"
          >
            <v-icon small class="mr-1"> {{ `mdi-lead-pencil` }}</v-icon> Edit
          </v-btn>

          <v-spacer></v-spacer>

          <!-- ? ------------------- Delete button -->
          <v-btn
            text
            small
            @click="confirmDelete"
            color="delete_button"
            style="border-radius: 15px; border-width: 1"
            class="mr-4"
          >
            <v-icon small class="mr-1"> {{ `mdi-delete` }}</v-icon> Delete
          </v-btn>

          <!-- <v-spacer></v-spacer> -->

          <!-- ? ------------------- ^ button to collapse -->
          <v-btn icon @click="expandAreaClicked">
            <v-icon>
              {{
                isCardExpanded ? `mdi-chevron-up` : `mdi-chevron-down`
              }}</v-icon
            >
          </v-btn>
        </v-card-actions>

        <v-divider />

        <!-- * ------------------- Categories section ----------------------->
        <v-card-text
          v-if="categories.length > 0"
          class="font-weight-light mb-0 pb-0"
        >
          Categories
        </v-card-text>

        <!-- ? -------------------- Category chips ----------------------->
        <v-card-text v-if="categories.length > 0" class="pt-1 pb-2">
          <CategoryChips
            :categories="categories"
            v-on:chip-clicked="triggerCategoryWizard"
          />
        </v-card-text>

        <!-- ? ------------------- Activities section ----------------------->
        <div v-if="activities.length > 0">
          <v-divider class="mx-4 mb-1"></v-divider>

          <v-card-text class="font-weight-light mb-0 pb-0">
            Activities
          </v-card-text>

          <!-- ? -------------------- Activity chips ----------------------->
          <v-card-actions class="pt-1 pb-2">
            <ActivityChips
              :activities="activities"
              :categories="categories"
              v-on:chip-clicked="triggerActivityWizard"
            />
          </v-card-actions>
        </div>

        <!-- ? ------------------- Timestamps ----------------------->
        <v-divider class="mx-4 mb-1"></v-divider>

        <v-card-text align="left" @click="expandAreaClicked">
          <span :style="{ color: '#8e9199' }" class="font-weight-light">
            Created:
          </span>
          <span class="font-weight-light">
            {{ getPrettyTimestamp(area.createdAt) }}
          </span>
          <br />

          <span :style="{ color: '#8e9199' }" class="font-weight-light">
            Last updated:
          </span>
          <span class="font-weight-light">
            {{ getPrettyTimestamp(area.lastUpdatedAt) }}
          </span>
          <!-- Other colors: #888a89 (medium-gray) -->
        </v-card-text>

        <!-- </v-card> -->
      </div>
    </v-expand-transition>

    <!-- * ------------------------ View category dialog  -------------------------->
    <CategoryWizard
      :categoryTag="selectedCategoryTag"
      :area="area"
      :dialog-mode="categoryWizardDialogMode"
      :showDialog="showCategoryWizard"
      v-on:close="closeCategoryWizard"
      v-on:change-mode="changeCategoryWizardMode"
    />

    <ActivityWizard
      :activity="selectedActivity"
      :area="area"
      :dialog-mode="activityWizardDialogMode"
      :showDialog="showActivityWizard"
      v-on:close="closeActivityWizard"
      v-on:change-mode="changeActivityWizardMode"
    />

    <!-- CONFIRMATION dialog for deleting this area -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDeleteDialog"
      :showDialog="showDialogForConfirmDelete"
      messageToDisplay="Sure you want to delete this?"
      yesButtonText="Delete"
      noButtonText="Cancel"
    />
  </v-card>
</template>
