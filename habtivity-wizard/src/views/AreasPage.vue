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
  showDiscardConfirmationDialog = false;

  selectedArea!: Area | null;

  // Move to a Constants file maybe.
  defaultNewArea = {
    id: "placeholder",
    title: "New Area",
    icon: "mdi-new-box",
    color: "#8686D6",
  };

  // ------------------------------------------------ Mounted
  mounted() {
    this.selectedArea = null;
    this.showDialogForNewArea = false;
    this.areasStore.loadData().then((numOfAreas): void => {
      this.areAreasLoaded = true;
      console.log("Done loading " + numOfAreas + " areas.");
    }); // Tell components to start loading.

    console.log("🪁 🪁 🪁 Mounted ---> AreasPage");
  }

  // ------------------------------------------------ Methods

  triggerDiscardConfirmation(): void {
    this.showDiscardConfirmationDialog = true;
  }

  discardAreaEdit(): void {
    this.showDiscardConfirmationDialog = false;
    this.showDialogForNewArea = false;
  }

  closeNewAreaDialog(showNewAreaDialog: boolean): void {
    console.log("👾 👾 👾  Inside ---> closeNewAreaDialog");
    this.showDialogForNewArea = showNewAreaDialog;
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
        v-for="area in areasStore.getAreasList()"
        :key="area.id"
        :area="area"
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

    <!------------------- Dialog: New Area -------------------->
    <!-- Child component: for creating an Area -->

    <!-- v-model="showDialogForNewArea" -->
    <AreaDialogToEditOrCreate
      v-on:close-dialog="closeNewAreaDialog"
      :dialogMode="'EDIT'"
      :showDialog="showDialogForNewArea"
      :providedArea="defaultNewArea"
    />
    <!-- :providedArea="selectedArea" -->
  </div>
</template>
