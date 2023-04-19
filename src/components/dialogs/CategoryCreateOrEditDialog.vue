<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DialogMode } from "./AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import { deepCopy } from "deep-copy-ts";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
  },
  methods: {},
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
  // @Watch("categoryTag")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log(
      "🚨 🚨 🚨 @Watch for CategoryCreateOrEditDialog. _newValue = " + _newValue
    );
    const isDialogOpen = !!_newValue;

    if (isDialogOpen === true) {
      if (DialogMode[this.dialogMode] === DialogMode.CREATE) {
        console.log(
          "🌹 🌹 🌹 CREATE MODE ---- this.categoryTag_local = " +
            JSON.stringify(this.categoryTag_local)
        );
        this.categoryTag_local = deepCopy(defaultNewCategory); // Reset
      } else {
        console.log("🌹 🌹 🌹 EDIT");
        this.categoryTag_local = deepCopy(this.categoryTag);
      }
    }

    console.log(
      "🐞 🐞 🐞 @Watch triggered in CategoryCreateOrEdit. showDialog ===> " +
        this.showDialog +
        ", categoryTag_local ===> " +
        JSON.stringify(this.categoryTag_local) +
        ", dialogMode = " +
        this.dialogMode
    );
  }

  // ------------------------------------------------ Stores
  iconsStore = useIconsStore();

  mounted() {
    this.iconsStore.loadIcons();
  }

  // ------------------------------------------------ Data
  categoryTag_local = deepCopy(defaultNewCategory);
  showDialogForConfirmDiscard = false;
  showColorPicker = false;

  /**
   *  TODO --------- Replace with values from the THIEF
   */
  colorSwatches = [
    ["#FF0000", "#AA0000", "#550000"],
    ["#FFFF00", "#AAAA00", "#555500"],
    ["#00FF00", "#00AA00", "#005500"],
    ["#00FFFF", "#00AAAA", "#005555"],
    ["#0000FF", "#0000AA", "#000055"],
  ];

  // ------------------------------------------------ Methods
  resetNewCategoryData() {
    this.categoryTag_local = deepCopy(defaultNewCategory);
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
    console.log(
      "!!!!!! ------- this.categoryTag_local = " +
        JSON.stringify(this.categoryTag_local)
    );
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
          max-width="300"
          overlay-opacity="0.88"
          inset
          v-model="showDialog"
          persistent
          @keydown.esc="triggerCancellation"
          @keydown.enter="saveCategoryTag"
        >
          <v-card>
            <v-list>
              <v-list-item>
                <!-- ? ----------------- Box heading ---------------- * -->
                <v-list-item-content>
                  <v-list-item-title>Category</v-list-item-title>
                  <v-list-item-subtitle
                    >Click save to create</v-list-item-subtitle
                  >
                </v-list-item-content>

                <!-- ? -------------- (x) Close button -------------- * -->
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
              <!--  -->
              <v-row>
                <!-- ? -------------- Color picker -------------- * -->
                <v-col cols="3">
                  Color:
                  <v-btn
                    @click="showColorPicker = !showColorPicker"
                    :color="categoryTag.color"
                  ></v-btn>
                </v-col>

                <!-- ? ------------------ Name ---------------- * -->
                <v-col>
                  <v-text-field
                    label="Name"
                    v-model="categoryTag_local.title"
                    class="shrink;display:flex;width=100px"
                    placeholder="New category"
                    hint="Something short and sweet."
                    counter="15"
                    clearable
                    ref="titleTextBox"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!--  -->
            </v-container>

            <v-card-text>
              <v-color-picker
                v-show="showColorPicker"
                v-model="categoryTag_local.color"
                dot-size="25"
                mode="hexa"
                hide-inputs
                :swatches="colorSwatches"
                swatches-max-height="100"
                show-swatches
              ></v-color-picker>
            </v-card-text>

            <!-- ? ------------------ Save / Cancel ---------------- * -->
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
            yesButtonText="Discard"
            noButtonText="Cancel"
          />
        </v-bottom-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
