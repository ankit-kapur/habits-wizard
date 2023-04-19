<script lang="ts">
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import AreaCreateOrEditDialog from "@/components/dialogs/AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { getPrettyTimestamp } from "@/utils/time/TimestampConversionUtils";
import VClamp from "vue-clamp";
import { useActivitiesStore } from "@/store/ActivitiesStore";

@Component({
  components: {
    AreaCreateOrEditDialog: AreaCreateOrEditDialog,
    ConfirmationDialog: ConfirmationDialog,
    VClamp: VClamp,
  },
})
export default class AreaCard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area!: Area;

  // ------------------------------------------------ Stores
  areasStore = useAreasStore();
  categoryTagsStore = useCategoryTagsStore();
  activitiesStore = useActivitiesStore();

  // ------------------------------------------------ Data
  isCardExpanded = false;
  showEditButton = false;
  showDeleteButton = false;
  showDialogForConfirmDelete = false;

  MIN_WIDTH_CARD = 320;
  MAX_WIDTH_CARD = 350;
  IMAGE_HEIGHT = 110;
  IMAGE_COLUMNS = 4;
  DESCRIPTION_MAX_LINES = 3;

  // ------------------------------------------------ Method imports
  getPrettyTimestamp = getPrettyTimestamp;

  // ------------------------------------------------ Mounted
  mounted() {
    this.categoryTagsStore.subscribeToStore();
    console.log("🐪 🐪 🐪  Mounted AreaCard");
  }

  unmounted() {
    // TODO -- not the right place to unsubscribe. not getting called.
    this.categoryTagsStore.unsubscribe();
    console.log("🐪 🐪 🐪  UN-mounted AreaCard");
  }

  // ------------------------------------------------ Computer props
  get activitiesList() {
    return this.activitiesStore.getActivitiesByArea(this.area.id);
  }

  // ------------------------------------------------ Methods
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
    this.$emit("edit-area", this.area);
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
    this.areasStore.deleteArea(this.area);
  }

  respondToConfirmDeleteDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.performDelete();
    }
    this.showDialogForConfirmDelete = false;
  }

  // Categories
  get categories(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
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
          <!--  -->
          <!-- ? ------------------- Color indicater ----------------------->
          <!-- <v-icon
            start
            :color="area.color"
            class="mx-auto px-auto ma-2 ml-1 mr-2 pl-0"
            @click="expandAreaClicked"
            >mdi-circle</v-icon
          > -->

          <v-container>
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
        <v-card-actions class="mx-auto px-auto pt-0 pb-2">
          <!--  -->
          <!-- <v-spacer></v-spacer> -->

          <!-- ? ------------------- Edit & Delete buttons ----------------------->
          <v-btn
            icon
            small
            outlined
            @click="showEditDialog"
            color="edit_button"
            style="border-radius: 15px; border-width: 1"
            class="ml-5"
          >
            <v-icon small class="mr-0"> {{ `mdi-lead-pencil` }}</v-icon>
          </v-btn>

          <v-btn
            icon
            small
            outlined
            @click="confirmDelete"
            color="delete_button"
            style="border-radius: 15px; border-width: 1"
            class="ml-4"
          >
            <v-icon small class="mr-0"> {{ `mdi-delete` }}</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <!-- ? ------------------- ^ button to collapse ----------------------->
          <v-btn icon @click="expandAreaClicked">
            <v-icon>
              {{
                isCardExpanded ? `mdi-chevron-up` : `mdi-chevron-down`
              }}</v-icon
            >
          </v-btn>
        </v-card-actions>

        <!-- TODO P0 --- New component for "CategoryChip". Props: CategoryTag[] -->

        <!-- TODO --- (random idea, move to Notion) allow ongoing activities to be paused and resumed. 
                     *  calc totalDuration = (endTime - startTime - all paused durations)  -->

        <!-- ? ------------------- Categories section ----------------------->
        <v-divider class=""></v-divider>
        <v-card-text
          v-if="categories.length > 0"
          class="font-weight-light mb-0 pb-0"
        >
          Categories
        </v-card-text>

        <!-- ? -------------------- Category chips ----------------------->
        <v-card-text v-if="categories.length > 0" class="pt-1 pb-2">
          <!-- Category chips -->
          <v-chip-group column multiple>
            <v-chip
              v-for="(categoryTag, index) in categories"
              v-bind:categoryTag="categoryTag"
              v-bind:index="index"
              v-bind:key="categoryTag.id"
              :model-value="true"
              :prepend-icon="categoryTag.icon"
            >
              <!-- TODO P0 ---- Use colored circle icon here instead of Icon -->

              <v-icon color="primary" small class="ml-0 mr-2"
                >mdi-circle</v-icon
              >
              {{ categoryTag.title }}
            </v-chip>
          </v-chip-group>
        </v-card-text>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!-- ? ------------------- Activities section ----------------------->
        <v-card-text
          v-if="activitiesList.length > 0"
          class="font-weight-light mb-0 pb-0"
        >
          Activities
        </v-card-text>

        <!-- ? -------------------- Activity chips ----------------------->
        <v-card-text v-if="activitiesList.length > 0" class="pt-1 pb-2">
          <!-- TODO P0 ---- Reminder to use the FILTER feature of the TODO extension plugin here. -->
          <!-- TODO P0 ---- Use color from 'categories' computed prop to set border-color -->

          <!-- Activity chips -->
          <v-chip-group column multiple>
            <v-chip
              outlined
              v-for="(activity, index) in activitiesList"
              v-bind:activity="activity"
              v-bind:index="index"
              v-bind:key="activity.id"
              :model-value="true"
              :prepend-icon="activity.icon"
              color="purple"
            >
              <v-icon small class="ml-0 mr-2">{{ activity.icon }}</v-icon>
              {{ activity.title }}
            </v-chip>
          </v-chip-group>
        </v-card-text>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!-- ? ------------------- Timestamps ----------------------->
        <v-card-text align="left">
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
