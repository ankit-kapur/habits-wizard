<script lang="ts">
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/main/CategoryTag";
import { useAreasStore } from "@/store/AreasStore";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import AreaDialogToEditOrCreate from "@/components/dialogs/AreaDialogToEditOrCreate.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";
import { Timestamp } from "firebase/firestore";

@Component({
  components: {
    AreaDialogToEditOrCreate: AreaDialogToEditOrCreate,
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

  getPrettyTimestamp(firestoreTimestamp?: Timestamp): string {
    if (!firestoreTimestamp) return "";
    return firestoreTimestamp.toDate().toLocaleString("en-US", {
      // weekday: "short",
      // year: "numeric",
      // month: "2-digit",
      // day: "2-digit",
      timeStyle: "short",
      dateStyle: "long",
    });
  }
}
</script>

<template>
  <v-card
    :color="area.color"
    class="mt-3 mx-auto px-auto"
    max-width="400"
    elevation="20"
    :ripple="false"
    v-touch="{
      left: () => deleteMode,
      right: () => editMode,
    }"
    @click="expandAreaClicked"
  >
    <!--------------------- Image ----------------------->
    <v-img :src="area.imageUrl" height="150px" cover></v-img>

    <v-card-title>
      <v-row justify="center">
        <!-- <v-col justify="center">
          <v-icon left>
            {{ area.icon }}
          </v-icon>
        </v-col> -->

        <v-col cols="6" justify="center">
          <span left class="text-h6 font-weight-light">
            {{ area.title }}
          </span>
        </v-col>

        <v-spacer></v-spacer>

        <!----------------- Edit & Delete icons ------------------->
        <v-col v-if="showEditButton" @click="showEditDialog" justify="center">
          <v-icon size="20" right> mdi-lead-pencil </v-icon>
        </v-col>

        <v-col justify="center" v-if="showDeleteButton" @click="confirmDelete">
          <v-icon size="20" right> mdi-delete </v-icon>
        </v-col>
      </v-row>
    </v-card-title>

    <v-expand-transition>
      <div v-if="isAreaCardExpanded">
        <v-card
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%"
        >
          <v-card-text class="pb-0">
            {{ area.description }}
          </v-card-text>

          <v-card-text class="pb-0 ma-0">
            Created at: {{ getPrettyTimestamp(area.createdAt) }} <br />
            Last updated at: {{ getPrettyTimestamp(area.lastUpdatedAt) }}
          </v-card-text>

          <!-- TODO P0 --- New component for "CategoryChip". Props: CategoryTag[] -->

          <!-- TODO P1 --- Icon's not showing up on the chip. Outline not working. -->

          <!-- TODO --- (random idea, move to Notion) allow ongoing activities to be paused and resumed. 
                     *  calc totalDuration = (endTime - startTime - all paused durations)  -->

          <!-- Category chips -->
          <v-chip-group column multiple class="ml-4">
            <v-chip
              v-for="(categoryTag, index) in getCategoriesForArea()"
              v-bind:categoryTag="categoryTag"
              v-bind:index="index"
              v-bind:key="categoryTag.id"
              :model-value="true"
              variant="outlined"
              :prepend-icon="categoryTag.icon"
              text-color="white"
            >
              <v-icon icon="mdi-account-circle-outline" start></v-icon>
              {{ categoryTag.title }}
            </v-chip>
          </v-chip-group>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- CONFIRMATION dialog for deleting this area -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDeleteDialog"
      :showDialog="showDialogForConfirmDelete"
      messageToDisplay="Sure you want to delete this?"
    />
  </v-card>
</template>
