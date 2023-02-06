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
export default class MainApp extends Vue {
  // ------------------------------------------------ Data
  areasStore = useAreasStore();

  areAreasLoaded = false;

  showDialogToEditOrCreate = false;
  showDiscardConfirmationDialog = false;

  selectedArea!: Area | null;

  // ------------------------------------------------ Mounted
  mounted() {
    this.selectedArea = null;
    this.showDialogToEditOrCreate = false;
    this.areasStore.loadData().then((_value): void => {
      this.areAreasLoaded = true;
      console.log(_value);
    }); // Tell components to start loading.
  }

  // ------------------------------------------------ Methods

  triggerDiscardConfirmation(): void {
    this.showDiscardConfirmationDialog = true;
  }

  discardAreaEdit(): void {
    this.showDiscardConfirmationDialog = false;
    this.showDialogToEditOrCreate = false;
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
        <v-btn
          tile
          color="accent"
          @click="showDialogToEditOrCreate = !showDialogToEditOrCreate"
        >
          <v-icon left> mdi-plus-thick </v-icon>
          Add an Area
        </v-btn>
      </v-row>
    </v-sheet>

    <!-- Dialog component: for creating or editing an Area -->

    <!-- TODO: Fix the component visibility issue. 
         Need Parent-Child 2-way sync on variable (showDialogToEditOrCreate: boolean)  -->

    <!-- v-if="showDialogForAreaEditOrCreate" -->
    <AreaDialogToEditOrCreate
      v-model="showDialogToEditOrCreate"
      :providedArea="selectedArea"
    />
  </div>
</template>