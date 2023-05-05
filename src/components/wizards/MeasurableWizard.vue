<script lang="ts">
import MyEmoji from "@/components/chips/MyEmoji.vue";
import { defaultNewMeasurable } from "@/constants/DefaultMeasurables";
import { DialogMode } from "@/model/enum/DialogMode";
import { MeasurableType } from "@/model/enum/MeasurableType";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { useAreasStore } from "@/store/AreasStore";
import { useEmojiStore } from "@/store/EmojiStore";
import { deepCopy } from "deep-copy-ts";
import { Emoji, Picker } from "emoji-mart-vue-fast";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";

/**
 * TODO P1 ----- Add validations. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    Picker: Picker,
    Emoji: Emoji,
    MyEmoji: MyEmoji,
  },
  methods: {},
})
export default class MeasurableWizard extends Vue {
  @Prop()
  measurableDefinition?: MeasurableDefinition;
  @Prop()
  areaId!: string;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  // <!-- ? ------------------------------------------- Watchers -->
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // <!-- ? ------------------------------------------- Data -->
  measurableDef_local: MeasurableDefinition = this.resetToDefaultState();
  originalMeasurable: MeasurableDefinition | null = null;
  showDialogForConfirmDiscard = false;
  showEmojiPicker = false;
  showAdvancedColorPicker = false;

  // <!-- ? ------------------------------------------- Computed props -->

  // <!-- ? ------------------------------------------- Stores -->
  emojiStore = useEmojiStore();
  areasStore = useAreasStore();

  // <!-- ? ------------------------------------------- Lifecycle actions -->
  mounted() {
    this.onShow();
    console.log("🐪 Mounted MeasurableWizard");
  }

  onShow() {
    this.resetToDefaultState();
    this.originalMeasurable = deepCopy(this.measurableDef_local);
  }

  onHide() {
    // No actions so far.
  }

  resetToDefaultState() {
    console.log(
      "Inside MeasurableWizard. this.measurableDefinition = " +
        JSON.stringify(this.measurableDefinition)
    );

    // Reset
    this.measurableDef_local = deepCopy(
      this.measurableDefinition
        ? this.measurableDefinition
        : defaultNewMeasurable
    );
    return this.measurableDef_local;
  }

  // Computed props
  get typesOfMeasurables() {
    return Object.entries(MeasurableType).map((entry) => {
      return {
        typeID: entry[0],
        typeDescription: entry[1],
      };
    });
  }

  // ------------------------------------------------ Methods
  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.closeThroughParent();
    }
    this.showDialogForConfirmDiscard = false;
  }

  closeThroughParent() {
    this.$emit("close", true);
  }

  save() {
    if (this.dialogMode === DialogMode.CREATE) {
      this.createNewMeasurable();
    } else {
      this.saveExistingMeasurable();
    }
    // Ask the parent to update.
    this.closeThroughParent();
  }

  createNewMeasurable() {
    this.areasStore.createMeasurableDefinition(
      this.measurableDef_local,
      this.areaId
    );
  }

  saveExistingMeasurable() {
    console.log("Saving existing measurable");
    // Save to store
    this.areasStore.updateMeasurableDefinition(
      this.measurableDef_local,
      this.areaId
    );
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (this.hasChanged()) {
      this.showDialogForConfirmDiscard = true;
    } else {
      this.closeThroughParent();
    }
  }

  hasChanged(): boolean {
    return (
      JSON.stringify(this.measurableDef_local) !==
      JSON.stringify(this.originalMeasurable)
    );
    // return (
    //   (this.measurableDefinition &&
    //     JSON.stringify(this.measurableDef_local) ===
    //       JSON.stringify(this.measurableDefinition)) ||
    //   JSON.stringify(this.measurableDef_local) ===
    //     JSON.stringify(defaultNewMeasurable)
    // );
  }

  /**
   * Saves the selected Emoji object as a string.
   * @param emoji
   */
  selectEmoji(emoji: Emoji) {
    // const emojiString = this.emojiStore.convertEmojiToString(emoji);
    console.log("SELECTED emoji.colons ==== " + emoji.colons);
    this.measurableDef_local.baseUnitEmoji = emoji.colons;
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
    @keydown.enter="save"
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

      <!-- TODO P0 ------- Add V-SELECT for MeasurableType -->

      <!-- TODO P0 ------- Add text-field for baseUnitName -->

      <!-- TODO P0 ------- Display emoji in a prettier way -->

      <!-- ? ----------------- Name text-field --------------------->
      <v-card-actions class="pa-0 pt-2 pr-3 pb-4">
        <v-container fluid>
          <v-row>
            <!--  -->

            <!-- ? -------------- Emoji ------------>
            <v-col
              cols="3"
              @click="showEmojiPicker = true"
              class="px-auto pb-0 pl-4 mb-3"
            >
              <MyEmoji
                :emojiString="measurableDef_local.baseUnitEmoji"
                :emojiSize="37"
              />
              <!--  -->
            </v-col>

            <!-- ? -------------- Text field ------------>
            <v-col class="px-auto pb-0">
              <v-text-field
                label="Name"
                v-model="measurableDef_local.title"
                outlined
                clearable
                placeholder="Name"
                hint="Pick a good name."
                counter="15"
                class="pa-0"
              />
            </v-col>
          </v-row>

          <!-- ? -------------- Type ------------>
          <v-row>
            <v-col class="px-auto pb-0">
              <v-select
                v-model="measurableDef_local.type"
                :items="typesOfMeasurables"
                item-text="typeID"
                item-value="typeDescription"
                label="Type"
              />
            </v-col>
          </v-row>

          <!-- ? -------------- Unit name ------------>
          <v-row>
            <v-col class="px-auto pb-0">
              <v-text-field
                v-model="measurableDef_local.baseUnitName"
                label="Unit name"
                placeholder="Jumps"
                hint="Optional"
                counter="10"
                persistent-hint
              />
            </v-col>
          </v-row>

          <!--  -->
        </v-container>
      </v-card-actions>

      <v-divider />

      <!-- ? ------------------ Save / Cancel ---------------------->
      <v-card-actions class="pt-4 pb-4">
        <v-spacer></v-spacer>
        <v-btn text @click="triggerCancellation"> Cancel </v-btn>
        <v-btn color="primary" @click="save">
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
        :data="emojiStore.getEmojiIndex()"
        :native="true"
        set="native"
        @select="selectEmoji"
        :emojiTooltip="true"
        title="Pick an emoji"
        :emojiSize="30"
        :skin="4"
      />

      <!-- :defaultSkin="5" -->

      <!--  -->
    </v-bottom-sheet>
  </v-bottom-sheet>
</template>
