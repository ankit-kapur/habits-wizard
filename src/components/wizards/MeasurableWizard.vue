<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { deepCopy } from "deep-copy-ts";
import { DialogMode } from "@/model/enum/DialogMode";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { defaultNewMeasurable } from "@/constants/DefaultMeasurables";
import MeasurableChips from "../chips/MeasurableChips.vue";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";
import { Picker, Emoji, EmojiIndex } from "emoji-mart-vue-fast";
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { uuidv4 } from "@firebase/util";

/**
 * TODO P1 ----- Add validations. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    MeasurableChips: MeasurableChips,
    Picker: Picker,
    Emoji: Emoji,
  },
  methods: {},
})
export default class MeasurableWizard extends Vue {
  @Prop()
  measurableDefinition!: MeasurableDefinition;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  // <!-- ? ------------------------------------------- Watchers -->
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in CategoryCreateOrEdit. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // <!-- ? ------------------------------------------- Data -->
  measurableDef_local: MeasurableDefinition = deepCopy(defaultNewMeasurable);
  showDialogForConfirmDiscard = false;
  showEmojiPicker = false;
  showAdvancedColorPicker = false;

  emojiIndex = new EmojiIndex(data);

  // <!-- ? ------------------------------------------- Computed props -->
  get categoriesList() {
    return [this.measurableDef_local];
  }

  // <!-- ? ------------------------------------------- Stores -->

  // <!-- ? ------------------------------------------- Lifecycle actions -->
  mounted() {
    this.onShow();
    console.log("🐪 Mounted MeasurableWizard");
  }

  onShow() {
    this.resetToDefaultState();
  }

  onHide() {
    // No actions so far.
  }

  resetToDefaultState() {
    // Reset
    this.measurableDef_local = deepCopy(
      this.measurableDefinition
        ? this.measurableDefinition
        : defaultNewMeasurable
    );
  }

  // ------------------------------------------------ Methods
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
  }

  saveCategoryTag() {
    // Generate UUID
    this.measurableDef_local.id = uuidv4();
    // Ask the parent to update.
    this.$emit("save-confirmed", this.measurableDef_local);
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.measurableDef_local) ===
        JSON.stringify(this.measurableDefinition) ||
      JSON.stringify(this.measurableDef_local) ===
        JSON.stringify(defaultNewMeasurable)
    ) {
      this.discard();
    } else {
      this.showDialogForConfirmDiscard = true;
    }
  }

  selectEmoji(emoji) {
    console.log("Emoji ==== " + JSON.stringify(emoji));
    this.measurableDef_local.baseUnitEmoji = emoji;
    this.showEmojiPicker = false;
  }
}
</script>

<template>
  <v-bottom-sheet
    max-width="300"
    overlay-opacity="0.88"
    inset
    v-model="showDialog"
    persistent
    @keydown.esc="triggerCancellation"
    @keydown.enter="saveCategoryTag"
  >
    <v-card flat class="px-2">
      <!--  -->

      <!-- ? ----------------- Box title ---------------- * -->
      <v-card-actions class="pa-4 pb-0 ma-0">
        <v-card-title class="pa-0 text-h6 font-weight-light">
          {{ dialogMode === "CREATE" ? `New` : `Edit` }} Measurable
        </v-card-title>
        <v-spacer />
        <!-- ? ------------- (x) Close button --------------->
        <v-icon @click="triggerCancellation">mdi-close</v-icon>
      </v-card-actions>

      <!-- ? ----------------- Box subtitle ---------------- * -->
      <v-card-text class="pa-0 ma-0">
        <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
          Define what you'd like to measure
        </v-card-subtitle>
      </v-card-text>

      <v-divider></v-divider>

      <!-- ? ----------------- Name text-field --------------------->
      <v-card-text class="pa-0 pt-2">
        <v-container fluid>
          <!--  -->

          <v-row>
            <v-col class="px-auto pb-0">
              <!--  -->
              <!-- ? -------------- Text field ------------>
              <v-text-field
                label="Name"
                v-model="measurableDef_local.title"
                outlined
                clearable
                placeholder="Name"
                hint="Something short and sweet."
                counter="15"
                class="pa-0"
              />
            </v-col>
          </v-row>

          <!--  -->
        </v-container>
      </v-card-text>

      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!--  -->
      <!-- TODO P0 -------- Generate UUID for CREATE mode. -->
      <!-- TODO P0 -------- v-select for TYPE -->
      <!-- TODO P0 -------- text-field for base unit name -->

      <!-- ? ------------------ Pick an emoji ----------------------->
      <!-- * ----- Source: https://github.com/serebrov/emoji-mart-vue -->
      <v-card-actions class="pl-4 pb-4 pt-0">
        <v-container fluid>
          <!--  -->

          <v-row @click="showEmojiPicker = true">
            <v-col class="px-auto pb-0">
              <!--  -->
              <!-- ? -------------- Emoji ------------>
              <span> Emoji: </span>

              <emoji
                :data="emojiIndex"
                :emoji="measurableDef_local.baseUnitEmoji"
                :skin="3"
                :size="32"
              />

              <!--  -->
            </v-col>
          </v-row>

          <!--  -->
        </v-container>

        <v-spacer />
      </v-card-actions>

      <v-divider />

      <!-- ? ------------------ Save / Cancel ---------------------->
      <v-card-actions class="pt-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn text @click="triggerCancellation"> Cancel </v-btn>
        <v-btn color="primary" @click="saveCategoryTag">
          {{ dialogMode === "CREATE" ? `Create` : `Save` }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- * ----------------------- Dialogs  -------------------------->

    <!-- ? ------------------------ Confirm discard -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDiscardDialog"
      :showDialog="showDialogForConfirmDiscard"
      messageToDisplay="Sure you want to discard this?"
      yesButtonText="Discard"
      noButtonText="Cancel"
    />

    <v-bottom-sheet v-model="showEmojiPicker">
      <picker
        :data="emojiIndex"
        :native="true"
        set="native"
        @select="selectEmoji"
        :emojiTooltip="true"
        title="Pick an emoji"
        :emojiSize="30"
        :defaultSkin="3"
      />
    </v-bottom-sheet>
  </v-bottom-sheet>
</template>
