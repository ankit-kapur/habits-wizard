<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useAreasStore } from "@/store/AreasStore";
import AreaCard from "@/components/AreaCard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import AreaDialogToEditOrCreate from "@/components/dialogs/AreaDialogToEditOrCreate.vue";

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
  areasStore = useAreasStore();

  areAreasLoaded = false;

  showDialogForNewArea = false;
  showDialogForEditArea = false;

  // Move to a Constants file maybe.
  defaultNewArea: Area = {
    id: "placeholder",
    title: "New Area",
    icon: "mdi-new-box",
    color: "#8686D6",
  };

  selectedArea: Area = this.defaultNewArea;

  // ------------------------------------------------ Mounted
  mounted() {
    // this.selectedArea = null;
    this.showDialogForNewArea = false;
    this.areasStore.loadData().then((numOfAreas): void => {
      this.areAreasLoaded = true;
      console.log("Done loading " + numOfAreas + " areas.");
    }); // Tell components to start loading.
    console.log("🪁 🪁 🪁 Mount complete for AreasPage");
  }

  // ------------------------------------------------ Methods

  closeNewAreaDialog(showNewAreaDialog: boolean): void {
    console.log("👾 👾 👾  Inside ---> closeNewAreaDialog");
    this.showDialogForNewArea = showNewAreaDialog;
  }

  triggerEditMode(selectedArea: Area): void {
    this.selectedArea = selectedArea;
    this.showDialogForEditArea = true;
  }

  closeEditAreaDialog(showEditAreaDialog: boolean): void {
    console.log("👾 👾 👾  Inside ---> closeEditAreaDialog");
    this.showDialogForEditArea = showEditAreaDialog;
  }
}
</script>

<!------------- Template  --------------->

<template>
  <div class="">
    <h1 align="center">Areas</h1>

    <!------------------- Area cards -------------------->

    <v-sheet v-if="areAreasLoaded">
      <AreaCard
        v-for="(area, index) in areasStore.getAreasList()"
        v-bind:area="area"
        v-bind:index="index"
        v-bind:key="area.id"
        v-on:edit-area="triggerEditMode"
      ></AreaCard>
    </v-sheet>

    <!----------------- (+) Add button ------------------>

    <v-sheet class="mt-8">
      <v-row align="center" justify="space-around">
        <v-btn tile color="accent" @click="showDialogForNewArea = true">
          <v-icon left> mdi-plus-thick </v-icon>
          Add an Area
        </v-btn>
      </v-row>
    </v-sheet>

    <!------------------- Dialogs -------------------->
    <!-- Create dialog -->
    <AreaDialogToEditOrCreate
      :dialog-mode="'CREATE'"
      v-on:close-dialog="closeNewAreaDialog"
      :showDialog="showDialogForNewArea"
      :providedArea="defaultNewArea"
    />

    <!-- Edit dialog -->
    <AreaDialogToEditOrCreate
      :dialog-mode="'EDIT'"
      v-on:close-dialog="closeEditAreaDialog"
      :showDialog="showDialogForEditArea"
      :providedArea="selectedArea"
    />
  </div>
</template>
