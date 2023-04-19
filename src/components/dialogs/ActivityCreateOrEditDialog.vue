<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DialogMode } from "./AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import IconPicker from "@/components/dialogs/IconPicker.vue";
import { deepCopy } from "deep-copy-ts";
import { Ref } from "vue-property-decorator";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    IconPicker: IconPicker,
  },
  methods: {},
})
export default class ActivityCreateOrEditDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activity!: Activity;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("showDialog")
  // @Watch("activity")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log(
      "🚨 🚨 🚨 @Watch for ActivityCreateOrEditDialog. _newValue = " + _newValue
    );
    const isDialogOpen = !!_newValue;

    if (isDialogOpen === true) {
      if (DialogMode[this.dialogMode] === DialogMode.CREATE) {
        console.log(
          "🌹 🌹 🌹 CREATE MODE ---- this.activity_local = " +
            JSON.stringify(this.activity_local)
        );
        this.activity_local = deepCopy(defaultNewActivity); // Reset
      } else {
        console.log("🌹 🌹 🌹 EDIT");
        this.activity_local = deepCopy(this.activity);
      }
    }

    console.log(
      "🐞 🐞 🐞 @Watch triggered in ActivityCreateOrEdit. showDialog ===> " +
        this.showDialog +
        ", activity_local ===> " +
        JSON.stringify(this.activity_local) +
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
  activity_local = deepCopy(defaultNewActivity);
  showDialogForConfirmDiscard = false;
  showIconPicker = false;

  @Ref() readonly titleTextBox!: HTMLInputElement;

  // ------------------------------------------------ Methods
  resetNewActivityData() {
    this.activity_local = deepCopy(defaultNewActivity);
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
    this.resetNewActivityData();
  }

  saveActivity() {
    // Reset dialog box
    // Ask the parent to update.
    console.log(
      "!!!!!! ------- this.activity_local = " +
        JSON.stringify(this.activity_local)
    );
    this.$emit("save-confirmed", this.activity_local);

    this.resetNewActivityData();
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.activity_local) === JSON.stringify(this.activity) ||
      JSON.stringify(this.activity_local) === JSON.stringify(defaultNewActivity)
    ) {
      console.log("🐞 discard");
      this.discard();
    } else {
      console.log("🐞 showDialogForConfirmDiscard");
      this.showDialogForConfirmDiscard = true;
    }
  }

  newIconSelected(newIcon: string) {
    console.log("---- newIconSelected (PARENT) = " + newIcon);
    this.activity_local.icon = newIcon;
    this.closeIconPicker(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeIconPicker(state: boolean) {
    this.showIconPicker = false;
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
          @keydown.enter="saveActivity"
        >
          <v-card>
            <v-list>
              <v-list-item>
                <!-- ? ----------------- Box heading ---------------- * -->
                <v-list-item-content>
                  <v-list-item-title>Activity</v-list-item-title>
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
                <!-- ? -------------- Icon button -------------- * -->
                <v-col cols="2">
                  <v-icon
                    @click="showIconPicker = true"
                    large
                    class="px-auto pt-4 mr-20"
                    >{{ activity_local.icon }}</v-icon
                  >
                  <!-- </v-btn> -->
                </v-col>

                <!-- ? ------------------ Name ---------------- * -->
                <v-col>
                  <v-text-field
                    label="Name"
                    v-model="activity_local.title"
                    class="shrink;display:flex;width=100px"
                    placeholder="New Activity"
                    hint="Something short and sweet."
                    counter="15"
                    clearable
                    :autofocus="false"
                    ref="titleTextBox"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!--  -->
            </v-container>

            <!-- ? ------------------ Save / Cancel ---------------- * -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="triggerCancellation"> Cancel </v-btn>
              <v-btn text color="primary" @click="saveActivity"> Save </v-btn>
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

          <IconPicker
            :showDialog="showIconPicker"
            :initialSearchPrefix="activity_local.title"
            v-on:icon-selected="newIconSelected"
            v-on:icon-picker-cancelled="closeIconPicker"
          ></IconPicker>
        </v-bottom-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
