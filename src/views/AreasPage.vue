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
}
</script>

<!------------- Template  --------------->
<template>
  <v-container fluid>
    <v-row dense>
      <v-col>
        <!------------------- Area cards -------------------->
        <AreaCard
          v-for="(area, index) in areasStore.getAreasList()"
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
        <div class="text-center mb-15">
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
