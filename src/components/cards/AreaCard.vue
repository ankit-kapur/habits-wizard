<script lang="ts">
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import AreaCreateOrEditDialog from "@/components/dialogs/AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { getPrettyTimestamp } from "@/utils/time/TimestampConversionUtils";

@Component({
  components: {
    AreaCreateOrEditDialog: AreaCreateOrEditDialog,
    ConfirmationDialog: ConfirmationDialog,
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
  isAreaCardExpanded = false;
  showEditButton = false;
  showDeleteButton = false;
  showDialogForConfirmDelete = false;

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
    this.isAreaCardExpanded = !this.isAreaCardExpanded;
    this.showDeleteButton = this.isAreaCardExpanded;
    this.showEditButton = this.isAreaCardExpanded;
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
    class="mb-6 mx-auto px-auto"
    style="border-radius: 8px"
    max-width="600"
    elevation="20"
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

    <!--------------------- Image ----------------------->
    <v-img
      :src="area.imageUrl"
      height="180"
      @click="isAreaCardExpanded = !isAreaCardExpanded"
    ></v-img>

    <!-- <v-card-title>
      <v-spacer></v-spacer>
      <v-btn icon class="mr-2" x-large
        ><v-icon start :color="area.color">mdi-pine-tree-variant</v-icon>
      </v-btn>
    </v-card-title> -->

    <v-card-actions class="mx-auto px-auto ma-1 ml-1 mr-1">
      <!-- <v-col cols="6" justify="center"> -->

      <!-- style="-webkit-text-stroke: 0.4px black" -->
      <!-- </v-col> -->
      <v-icon
        start
        :color="area.color"
        class="mx-auto px-auto ma-2 ml-1 mr-2"
        @click="isAreaCardExpanded = !isAreaCardExpanded"
        >mdi-circle</v-icon
      >

      <span
        left
        class="text-h5 font-weight-light"
        :color="area.color"
        @click="isAreaCardExpanded = !isAreaCardExpanded"
      >
        {{ area.title }}
      </span>

      <v-spacer></v-spacer>
      <!----------------- Edit & Delete icons ------------------->
      <v-btn
        color="action_icon"
        v-if="isAreaCardExpanded"
        icon
        @click="showEditDialog"
      >
        <v-icon> {{ `mdi-lead-pencil` }}</v-icon>
      </v-btn>

      <v-btn
        color="action_icon"
        v-if="isAreaCardExpanded"
        icon
        @click="confirmDelete"
      >
        <v-icon> {{ `mdi-delete` }}</v-icon>
      </v-btn>

      <v-btn color="action_icon" icon @click="expandAreaClicked">
        <v-icon>
          {{
            isAreaCardExpanded ? `mdi-chevron-up` : `mdi-chevron-down`
          }}</v-icon
        >
      </v-btn>
    </v-card-actions>

    <v-divider class="mx-4 mb-1"></v-divider>

    <v-expand-transition mode="in-out">
      >
      <div v-if="isAreaCardExpanded">
        <!-- <v-card
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%"
        > -->
        <v-card-text>
          {{ area.description }}
        </v-card-text>

        <v-divider class="mx-4 mb-1"></v-divider>

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
