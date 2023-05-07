<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useAreasStore } from "@/store/AreasStore";
import AreaCard from "@/components/cards/AreaCard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import AreaWizard from "@/components/dialogs/AreaWizard.vue";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import Activity from "@/model/pojo/definitions/Activity";

/**
 * TODO P2 ---- unsubscribe from stores when router move away from this page.
 * Add an "isDisplayed" prop that's set based on the router.
 */

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    AreaCard: AreaCard,
    AreaWizard: AreaWizard,
  },
})
export default class AreasPage extends Vue {
  // ------------------------------------------------ Data
  // Stores
  areasStore = useAreasStore();
  categoryTagsStore = useCategoryTagsStore();
  activitiesStore = useActivitiesStore();

  // Toggles
  showDialogForNewArea = false;
  showDialogForEditArea = false;

  // State
  selectedAreaId: string | null = null;
  expandedCardIndices: Set<string> = new Set<string>([]);

  // ------------------------------------------------ Mounted
  mounted() {
    this.areasStore.subscribeToStore();
    this.categoryTagsStore.subscribeToStore();
    this.activitiesStore.subscribeToStore();
    this.showDialogForNewArea = false;
    console.log("🐪  Mounted AreasPage");
  }

  unmounted() {
    this.areasStore.unsubscribe();
    this.categoryTagsStore.unsubscribe();
    this.activitiesStore.unsubscribe();
    console.log("🐪  Unmounted AreasPage");
  }

  get isLoading(): boolean {
    // TODO P2 ----- Skeleton should show when cards are not ready.
    return false;
  }

  get selectedArea(): Area | undefined {
    return this.selectedAreaId
      ? this.areasStore.getAreaById(this.selectedAreaId)
      : undefined;
  }

  get categoryList(): CategoryTag[] {
    return this.categoryTagsStore.getAll();
  }

  get activityList(): Activity[] {
    return this.activitiesStore.getAll();
  }

  // ------------------------------------------------ Methods

  closeNewAreaDialog(showNewAreaDialog: boolean): void {
    this.showDialogForNewArea = showNewAreaDialog;
  }

  triggerEditMode(selectedAreaId: string): void {
    this.selectedAreaId = selectedAreaId;
    this.showDialogForEditArea = true;
  }

  closeEditAreaDialog(showEditAreaDialog: boolean): void {
    this.showDialogForEditArea = showEditAreaDialog;
  }
}
</script>

<!------------- Template  --------------->
<template>
  <v-container fluid class="pl-0 pr-0">
    <v-row dense align="start">
      <v-col
        class="pl-2 pr-2 pb-0 pt-0"
        v-for="(area, index) in areasStore.getAll()"
        v-bind:key="area.id"
      >
        <!------------------- Area cards -------------------->

        <v-skeleton-loader
          :loading="isLoading"
          height="400"
          width="80%"
          type="image, list-item-two-line"
        >
          <AreaCard
            :areaId="area.id"
            :areaList="areasStore.getAll()"
            :categoryList="categoryList"
            :activityList="activityList"
            v-bind:index="index"
            v-bind:key="area.id"
            v-on:edit-area="triggerEditMode"
          ></AreaCard>
        </v-skeleton-loader>

        <!--  -->
      </v-col>
    </v-row>

    <!----------------- (+) Add button ------------------>
    <v-row dense>
      <v-col cols="12">
        <div class="text-center mb-15 mt-4">
          <v-btn
            fab
            color="white"
            dark
            variant="outlined"
            elevation="10"
            @click="showDialogForNewArea = true"
          >
            <v-icon color="add_button">mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!------------------- Dialogs -------------------->
    <!-- Create dialog -->
    <AreaWizard
      :dialog-mode="`CREATE`"
      v-on:close-dialog="closeNewAreaDialog"
      :isDisplayed="showDialogForNewArea"
    />

    <!-- Edit dialog -->
    <AreaWizard
      :area="selectedArea"
      :dialog-mode="`EDIT`"
      v-on:close-dialog="closeEditAreaDialog"
      :isDisplayed="showDialogForEditArea"
    />
  </v-container>
</template>
