<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useAreasStore } from "@/store/AreasStore";
import AreaCard from "@/components/cards/AreaCard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import AreaWizard from "@/components/dialogs/AreaWizard.vue";

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

  // Toggles
  showDialogForNewArea = false;
  showDialogForEditArea = false;

  // State
  selectedArea: Area | null = null;
  expandedCardIndices: Set<string> = new Set<string>([]);

  // ------------------------------------------------ Mounted
  mounted() {
    this.areasStore.subscribeToLoadAllQuery();
    this.showDialogForNewArea = false;
    console.log("🐪 🐪 🐪  Mounted AreasPage");
  }

  /**
   * TODO P1 ------- Add an "isDisplayed" prop that's set based on the router.
   */
  unmounted() {
    // TODO -- not the right place to unsubscribe. not getting called.

    this.areasStore.unsubscribeAll();
    console.log("🐪 🐪 🐪  UN-mounted AreasPage");
  }

  // ------------------------------------------------ Methods

  closeNewAreaDialog(showNewAreaDialog: boolean): void {
    this.showDialogForNewArea = showNewAreaDialog;
  }

  triggerEditMode(selectedArea: Area): void {
    this.selectedArea = selectedArea;
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
        v-for="(area, index) in areasStore.getAreasList()"
        v-bind:key="area.id"
      >
        <!------------------- Area cards -------------------->

        <AreaCard
          v-bind:area="area"
          v-bind:index="index"
          v-bind:key="area.id"
          v-on:edit-area="triggerEditMode"
        ></AreaCard>
      </v-col>
    </v-row>

    <!----------------- (+) Add button ------------------>
    <v-row dense>
      <v-col cols="12">
        <div class="text-center mb-15 mt-4">
          <v-btn
            fab
            color="add_button"
            dark
            variant="outlined"
            elevation="10"
            @click="showDialogForNewArea = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!------------------- Dialogs -------------------->
    <!-- Create dialog -->
    <AreaWizard
      :dialog-mode="`CREATE`"
      v-on:close-dialog="closeNewAreaDialog"
      :showDialog="showDialogForNewArea"
    />

    <!-- Edit dialog -->
    <AreaWizard
      :dialog-mode="`EDIT`"
      v-on:close-dialog="closeEditAreaDialog"
      :showDialog="showDialogForEditArea"
      :area="selectedArea"
    />
  </v-container>
</template>
