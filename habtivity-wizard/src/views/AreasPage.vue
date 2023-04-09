<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useAreasStore } from "@/store/AreasStore";
import AreaCard from "@/components/AreaCard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import AreaDialogToEditOrCreate from "@/components/dialogs/AreaDialogToEditOrCreate.vue";
import { defaultNewArea } from "@/constants/DefaultDataForForms";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    AreaCard: AreaCard,
    AreaDialogToEditOrCreate: AreaDialogToEditOrCreate,
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
  selectedArea: Area = defaultNewArea;

  // ------------------------------------------------ Mounted
  mounted() {
    this.areasStore.subscribeToStore();
    this.showDialogForNewArea = false;
    console.log("🐪 🐪 🐪  Mounted AreasPage");
  }

  unmounted() {
    // TODO -- not the right place to unsubscribe. not getting called.

    this.areasStore.unsubscribe();
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
  <v-container>
    <h1 align="center">Areas</h1>

    <!------------------- Area cards -------------------->
    <AreaCard
      v-for="(area, index) in areasStore.getAreasList()"
      v-bind:area="area"
      v-bind:index="index"
      v-bind:key="area.id"
      v-on:edit-area="triggerEditMode"
    ></AreaCard>

    <!----------------- (+) Add button ------------------>
    <div class="pa-4 text-center">
      <v-btn
        fab
        color="blue"
        dark
        variant="outlined"
        elevation="4"
        @click="showDialogForNewArea = true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </div>

    <!------------------- Dialogs -------------------->
    <!-- Create dialog -->
    <AreaDialogToEditOrCreate
      :dialog-mode="`CREATE`"
      v-on:close-dialog="closeNewAreaDialog"
      :showDialog="showDialogForNewArea"
    />

    <!-- Edit dialog -->
    <AreaDialogToEditOrCreate
      :dialog-mode="`UPDATE`"
      v-on:close-dialog="closeEditAreaDialog"
      :showDialog="showDialogForEditArea"
      :providedArea="selectedArea"
    />
  </v-container>
</template>
