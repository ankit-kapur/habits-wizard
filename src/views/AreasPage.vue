<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { useAreasStore } from "@/store/AreasStore";
import AreaCard from "@/components/cards/AreaCard.vue";
import { Area } from "@/model/pojo/definitions/Area";
import AreaCreateOrEditDialog from "@/components/dialogs/AreaCreateOrEditDialog.vue";
import { defaultNewArea } from "@/constants/DefaultDataForForms";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    AreaCard: AreaCard,
    AreaCreateOrEditDialog: AreaCreateOrEditDialog,
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
  expandedCardIndices: Set<string> = new Set<string>([]);

  // ------------------------------------------------ Mounted
  mounted() {
    this.areasStore.subscribeToLoadAllQuery();
    this.showDialogForNewArea = false;
    console.log("🐪 🐪 🐪  Mounted AreasPage");
  }

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

  /**
   * ! -------- Fix these bugs.
   *    (a) Fix changeAreaCardWidth function below. It doesn't get added to the set.
   *    (b) Expansion should push card on the left/right downwards.
   *
   * Updates state of cards, when a card is expanded or unexpanded.
   * @param isExpanded
   * @param areaId
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeAreaCardWidth(isExpanded: boolean, areaId?: string) {
    // // Disabling expansion logic for now.
    // console.log("HASSSSS = " + this.expandedCardIndices.has(areaId!));
    // if (this.expandedCardIndices.has(areaId!)) {
    //   this.expandedCardIndices.delete(areaId!);
    // } else {
    //   console.log("ADDDDDINGGG = " + areaId);
    //   /* ! ------------------------------ "add" below doesn't work. list is still empty.   */
    //   this.expandedCardIndices.add(areaId!);
    //   console.log("AFTER = " + JSON.stringify(this.expandedCardIndices));
    // }
    // console.log("Poking = " + this.expandedCardIndices.has(areaId!));
    // console.log(
    //   "🐶 ------ this.expandedCardIndices = " +
    //     JSON.stringify(this.expandedCardIndices) +
    //     ", areaID = " +
    //     areaId
    // );
  }

  /**
   * Get width in cols for this card.
   * @param areaId
   * @return no. of cols to use for this card.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCardWidth(areaId?: string) {
    return 12;

    // // Disabling expansion logic for now.

    // console.log(
    //   "🐶 getCardWidth ----- " + this.expandedCardIndices.has(areaId!) ? 12 : 6
    // );
    // return this.expandedCardIndices.has(areaId!) ? 12 : 6;
  }
}
</script>

<!------------- Template  --------------->
<template>
  <v-container fluid class="pl-0 pr-0">
    <v-row dense>
      <v-col
        class="pl-2 pr-2"
        v-for="(area, index) in areasStore.getAreasList()"
        v-bind:key="area.id"
        :cols="getCardWidth(area.id)"
      >
        <!------------------- Area cards -------------------->

        <AreaCard
          v-bind:area="area"
          v-bind:index="index"
          v-bind:key="area.id"
          v-on:edit-area="triggerEditMode"
          v-on:card-expanded="changeAreaCardWidth($event, area.id)"
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
            elevation="4"
            @click="showDialogForNewArea = true"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!------------------- Dialogs -------------------->
    <!-- Create dialog -->
    <AreaCreateOrEditDialog
      :dialog-mode="`CREATE`"
      v-on:close-dialog="closeNewAreaDialog"
      :showDialog="showDialogForNewArea"
    />

    <!-- Edit dialog -->
    <AreaCreateOrEditDialog
      :dialog-mode="`EDIT`"
      v-on:close-dialog="closeEditAreaDialog"
      :showDialog="showDialogForEditArea"
      :providedArea="selectedArea"
    />
  </v-container>
</template>
