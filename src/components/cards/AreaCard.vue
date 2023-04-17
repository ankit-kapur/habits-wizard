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

  // ------------------------------------------------ Data
  isCardExpanded = false;
  showEditButton = false;
  showDeleteButton = false;
  showDialogForConfirmDelete = false;

  MAX_WIDTH_CARD = 400;
  IMAGE_HEIGHT = 120;
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

  // ------------------------------------------------ Methods
  expandAreaClicked() {
    const isExpanded = !this.isCardExpanded;
    this.isCardExpanded = isExpanded;
    this.showDeleteButton = isExpanded;
    this.showEditButton = isExpanded;
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
  getCategoriesForArea(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }
}
</script>

<template>
  <v-card
    class="mt-4 mx-auto px-auto"
    style="border-radius: 8px"
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
      <v-row>
        <!--  -->
        <!-- ? ------------------- Image ----------------------->
        <v-col :cols="IMAGE_COLUMNS" class="ma-2 mr-0 pa-0">
          <v-img
            class="ma-0 pa-0"
            style="border-radius: 6px"
            :src="area.imageUrl"
            :width="IMAGE_HEIGHT"
            :height="IMAGE_HEIGHT"
            @click="expandAreaClicked"
          ></v-img>
        </v-col>

        <v-col class="pl-2 ma-0">
          <!--  -->
          <!-- ? ------------------- Color indicater ----------------------->
          <!-- <v-icon
            start
            :color="area.color"
            class="mx-auto px-auto ma-2 ml-1 mr-2 pl-0"
            @click="expandAreaClicked"
            >mdi-circle</v-icon
          > -->

          <v-container @click="expandAreaClicked">
            <!-- ? ------------------- Title ----------------------->
            <v-row>
              <v-col class="pa-0 pb-1 pl-0">
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
        <v-card-actions class="mx-auto px-auto ma-1 ml-1 mr-1 pt-0 pb-0 pl-0">
          <!--  -->
          <v-spacer></v-spacer>

          <!-- ? ------------------- Edit & Delete buttons ----------------------->
          <v-btn color="action_icon" icon @click="showEditDialog">
            <v-icon class="pr-2 ml-5"> {{ `mdi-lead-pencil` }}</v-icon>
            Edit
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn color="action_icon" icon @click="confirmDelete">
            <v-icon class="pr-2 ml-5"> {{ `mdi-delete` }}</v-icon>
            Delete
          </v-btn>

          <v-spacer></v-spacer>

          <!-- ? ------------------- ^ button to collapse ----------------------->
          <v-btn color="action_icon" icon @click="expandAreaClicked">
            <v-icon>
              {{
                isCardExpanded ? `mdi-chevron-up` : `mdi-chevron-down`
              }}</v-icon
            >
          </v-btn>
        </v-card-actions>

        <v-divider class="mx-4 mb-1"></v-divider>

        <!-- ? ------------------- Timestamps ----------------------->
        <v-card-text>
          Created at: {{ getPrettyTimestamp(area.createdAt) }} <br />
          Last updated at: {{ getPrettyTimestamp(area.lastUpdatedAt) }}
        </v-card-text>

        <!-- TODO P0 --- New component for "CategoryChip". Props: CategoryTag[] -->

        <!-- TODO P1 --- Icon's not showing up on the chip. Outline not working. -->

        <!-- TODO --- (random idea, move to Notion) allow ongoing activities to be paused and resumed. 
                     *  calc totalDuration = (endTime - startTime - all paused durations)  -->

        <div v-if="getCategoriesForArea().length > 0">
          <v-divider class="mx-4 mb-1"></v-divider>
          <v-card-text class="pt-3 mb-0 pb-0">Categories</v-card-text>

          <!-- Category chips -->
          <v-chip-group column multiple class="ml-3 mr-1 pt-0 pb-1">
            <v-chip
              v-for="(categoryTag, index) in getCategoriesForArea()"
              v-bind:categoryTag="categoryTag"
              v-bind:index="index"
              v-bind:key="categoryTag.id"
              :model-value="true"
              :prepend-icon="categoryTag.icon"
            >
              <v-icon small class="ml-0 mr-2">{{ categoryTag.icon }}</v-icon>
              {{ categoryTag.title }}
            </v-chip>
          </v-chip-group>
        </div>
        <!-- </v-card> -->
      </div>
    </v-expand-transition>

    <!-- CONFIRMATION dialog for deleting this area -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDeleteDialog"
      :showDialog="showDialogForConfirmDelete"
      messageToDisplay="Are you sure you want to delete this?"
      yesButtonText="Delete"
      noButtonText="Cancel"
    />
  </v-card>
</template>
