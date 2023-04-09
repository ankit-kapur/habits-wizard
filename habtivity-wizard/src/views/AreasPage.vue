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

  showDialogForNewArea = false;
  showDialogForEditArea = false;

  // Move to a Constants file maybe.
  defaultNewArea: Area = {
    title: "New Area",
    imageUrl: "https://cdn.vuetifyjs.com/images/cards/sunshine.jpg",
    color: "#8686D6",
    description:
      "late 16th century (as a noun denoting a place where alms were distributed): from medieval Latin eleemosynarius, from late Latin eleemosyna ‘alms’, from Greek eleēmosunē ‘compassion’",
    categoryTags: [],
  };

  selectedArea: Area = this.defaultNewArea;

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
  <div class="">
    <h1 align="center">Areas</h1>

    <!------------------- Area cards -------------------->

    <v-sheet>
      <!-- v-if="areAreasLoaded" -->
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
      :dialog-mode="`CREATE`"
      v-on:close-dialog="closeNewAreaDialog"
      :showDialog="showDialogForNewArea"
      :providedArea="defaultNewArea"
    />

    <!-- Edit dialog -->
    <AreaDialogToEditOrCreate
      :dialog-mode="`UPDATE`"
      v-on:close-dialog="closeEditAreaDialog"
      :showDialog="showDialogForEditArea"
      :providedArea="selectedArea"
    />
  </div>
</template>
