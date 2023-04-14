<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import CategoryTag from "@/model/pojo/main/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DialogMode } from "./AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
  },
})
export default class CategoryCreateOrEditDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  categoryTag!: CategoryTag;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("showDialog")
  @Watch("categoryTag")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.showDialog_local = this.showDialog;
    if (this.categoryTag === null) {
      this.categoryTag_local = defaultNewCategory;
    } else {
      this.categoryTag_local = this.categoryTag;
    }

    console.log(
      "onPropertyChanged just happened inside @Watch. this.categoryTag_local ===> " +
        JSON.stringify(this.categoryTag_local)
    );
  }

  // Toggle for displaying this box
  categoryTag_local = defaultNewCategory;
  showDialog_local = false;
  showDialogForConfirmDiscard = false;

  // ------------------------------------------------ Methods
  resetNewCategoryData() {
    this.categoryTag_local = defaultNewCategory;
  }

  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.discard();
    } else {
      console.log("NOT DISCARDING");
    }
    this.showDialogForConfirmDiscard = false;
  }

  discard() {
    console.log("DISCARDING");
    this.$emit("discard", true);
    this.resetNewCategoryData();
  }

  saveCategoryTag() {
    // Reset dialog box
    // Ask the parent to update.
    this.$emit("save-confirmed", this.categoryTag_local);

    this.resetNewCategoryData();
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.categoryTag_local) ===
        JSON.stringify(this.categoryTag) ||
      JSON.stringify(this.categoryTag_local) ===
        JSON.stringify(defaultNewCategory)
    ) {
      console.log("🐞 discard");
      this.discard();
    } else {
      console.log("🐞 showDialogForConfirmDiscard");
      this.showDialogForConfirmDiscard = true;
    }
  }
}
</script>

<template>
  <v-container fluid>
    <v-row center>
      <v-col>
        <v-bottom-sheet
          max-width="450"
          overlay-opacity="0.88"
          inset
          v-model="showDialog_local"
          persistent
          @keydown.esc="triggerCancellation"
          @keydown.enter="saveCategoryTag"
        >
          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>New Category</v-list-item-title>
                  <v-list-item-subtitle
                    >Click save to create</v-list-item-subtitle
                  >
                </v-list-item-content>

                <v-list-item-action>
                  <v-btn icon>
                    <v-icon @click="triggerCancellation">mdi-close</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <!-- * ---------- Title text-field ---------- * -->
            <v-container fluid>
              <v-text-field
                label="Name"
                v-model="categoryTag_local.title"
                class="shrink;display:flex;width=100px"
                placeholder="New category"
                hint="Something short and sweet."
                counter="15"
                clearable
                autofocus
              ></v-text-field>

              <!-- * ---------- Icon text-field ---------- * -->
              <!-- TODO p1 Build an IconPicker component -->
              <v-icon>{{ categoryTag_local.icon }}</v-icon>
              <v-text-field
                label="Icon"
                placeholder="mdi-rocket"
                v-model="categoryTag_local.icon"
                class="mx-auto px-auto pt-4"
                clearable
              ></v-text-field>
            </v-container>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="triggerCancellation"> Cancel </v-btn>
              <v-btn text color="primary" @click="saveCategoryTag">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- * ------------------------ Confirm discard  -------------------------->
          <ConfirmationDialog
            v-on:confirm-status-change="respondToConfirmDiscardDialog"
            :showDialog="showDialogForConfirmDiscard"
            messageToDisplay="Sure you want to discard this?"
          />
        </v-bottom-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
