<script lang="ts">
import { Area } from "@/model/pojo/definitions/Area";
import { Component, Prop, Vue } from "vue-property-decorator";
import AreaDialogToEditOrCreate from "./dialogs/AreaDialogToEditOrCreate.vue";

@Component({
  components: {
    AreaDialogToEditOrCreate: AreaDialogToEditOrCreate,
  },
})
export default class AreaCard extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area!: Area;

  // ------------------------------------------------ Data
  isAreaCardExpanded = false;
  showEditButton = false;
  showDeleteButton = false;

  showDialogForAreaEditOrCreate = false;

  // ------------------------------------------------ Methods
  expandAreaClicked() {
    console.log("AREA CARD CLICKED");
    this.isAreaCardExpanded = !this.isAreaCardExpanded;
    this.showDeleteButton = this.isAreaCardExpanded;
    this.showEditButton = this.isAreaCardExpanded;
  }

  // Edits
  showEditDialog() {
    console.log("SHOW EDIT DIALOG");
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
    // TODO: show dialog box for confirmation
    console.log("CONFIRM DELETE");
  }

  performDelete() {
    console.log("PERFORM DELETE");
    // TODO: import Areas store
    // TODO: Call store method
  }
}
</script>

<template>
  <v-card
    :color="area.color"
    class="mt-3 mx-auto px-auto"
    max-width="400"
    elevation="20"
    v-touch="{
      left: () => deleteMode,
      right: () => editMode,
    }"
  >
    <v-card-title>
      <v-row justify="center">
        <v-col justify="center" @click="expandAreaClicked">
          <v-icon left>
            {{ area.icon }}
          </v-icon>
        </v-col>

        <v-col cols="6" justify="center" @click="expandAreaClicked">
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
            <p>
              late 16th century (as a noun denoting a place where alms were
              distributed): from medieval Latin eleemosynarius, from late Latin
              eleemosyna ‘alms’, from Greek eleēmosunē ‘compassion’
            </p>
          </v-card-text>
          <v-card-actions class="pt-0"> </v-card-actions>
        </v-card>
      </div>
    </v-expand-transition>

    <AreaDialogToEditOrCreate
      v-if="showDialogForAreaEditOrCreate"
      :area="area"
    />
  </v-card>
</template>
