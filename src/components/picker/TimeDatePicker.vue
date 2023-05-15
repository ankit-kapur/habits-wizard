<script lang="ts">
import {
  getDate_ISO8601,
  getPrettyDate,
  convertToEpoch,
} from "@/utils/time/TimestampConversionUtils";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class TimeDatePicker extends Vue {
  $refs!: {
    menu: HTMLFormElement;
  };

  // ------------------------------------------------ Props
  @Prop()
  isDisplayed!: boolean;
  @Prop()
  titleText!: string;
  @Prop()
  initialTime?: string;
  @Prop()
  initialDate?: Date;
  // TODO ------- just 1 prop here. EPOCH TIMESTAMP.

  /* <!-- ? ------------------------------ Data ------------------------------> */
  isDisplayed_local = false;

  showTimePicker = false;
  showDatePicker = false;

  selectedTime = ""; // HH:MM (24 hour format)
  selectedDate = ""; // YYYY-MM-DD format (ISO-8601)

  /* <!-- ? ------------------------------ Watchers ------------------------------> */
  @Watch("isDisplayed")
  onIsDisplayedChanged(_newValue: string) {
    const isDialogOpen = !!_newValue;
    console.log("👀 @Watch in StartTimePicker. isDisplayed = " + _newValue);
    if (isDialogOpen) {
      this.resetState();
    }
    this.isDisplayed_local = this.isDisplayed;
  }

  // Workaround for when space above dialog is tapped.
  @Watch("isDisplayed_local")
  onLocalDisplayChanged(_newValue: boolean) {
    if (_newValue === false) this.closeViaParent();
  }

  /* <!-- ? ------------------------------ Lifecycle ------------------------------> */
  mounted() {
    this.resetState();
  }

  resetState() {
    this.showTimePicker = false;

    const now = new Date();
    const currentTime = now.getHours() + ":" + now.getMinutes();

    console.log("currentTime = " + currentTime);
    console.log("initialTime = " + this.initialTime);

    this.selectedTime = this.initialTime
      ? deepCopy(this.initialTime)
      : currentTime;

    this.selectedDate = getDate_ISO8601(
      this.initialDate ? deepCopy(this.initialDate) : new Date()
    );
  }

  closeViaParent() {
    // TODO ---- Don't think this is needed. Maybe don't need isDisplayed at all.
    this.$emit("cancel", false);
  }

  saveSelectedTime() {
    console.log("OG ----- " + this.selectedTime);

    // Set menu action
    this.$refs.menu?.save(this.selectedTime);

    this.updateTimeSelection();
  }

  saveSelectedDate() {
    console.log("SAVE. this.selectedDate = " + this.selectedDate);
    // TODO P0 ----- Implement
    this.showDatePicker = false;

    this.updateTimeSelection();
  }

  /**
   * Tell parent the timestamp has changed.
   */
  updateTimeSelection() {
    // TODO: Convert to epoch
    const epoch: number = convertToEpoch(this.selectedDate, this.selectedTime);

    // Emit to parent
    this.$emit("timestamp-updated", epoch);
  }

  /* <!-- ? ------------------------------ Computed props ------------------------------> */
  get timePrettyFormatted() {
    var split = this.selectedTime.split(":");
    let hours: number = parseInt(split[0]);
    let minutes = split[1];
    var suffix = hours >= 12 ? " PM" : " AM";
    hours = ((hours + 11) % 12) + 1;
    return hours + ":" + minutes + suffix;
  }

  /* <!-- ? ------------------------------ Methods ------------------------------> */

  /* <!-- * ------------------------------ Method imports ------------------------------> */
  getPrettyDate = getPrettyDate;
  getDate_ISO8601 = getDate_ISO8601;
  convertToEpoch = convertToEpoch;
}
</script>

<template>
  <v-row>
    <!--  -->

    <!-- * ------------------------------ Time picker -------------------------------->
    <v-col cols="6" class="pa-auto">
      <v-menu
        ref="menu"
        v-model="showTimePicker"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="selectedTime"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="timePrettyFormatted"
            :label="titleText"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
            class="pa-0"
          ></v-text-field>
        </template>

        <!-- ? ---------------- Time picker dialog -->
        <v-time-picker
          v-if="showTimePicker"
          v-model="selectedTime"
          full-width
          scrollable
          @click:minute="saveSelectedTime"
          elevation="15"
        />

        <!--  -->
      </v-menu>
    </v-col>

    <!-- * ------------------------------ Date picker -------------------------------->
    <v-col cols="6" class="pa-auto pl-0">
      <v-menu
        v-model="showDatePicker"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290"
        min-width="290"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            :value="getPrettyDate(selectedDate)"
            :label="titleText"
            prepend-icon="mdi-calendar-today"
            readonly
            v-bind="attrs"
            v-on="on"
            class="pa-0"
          ></v-text-field>
        </template>

        <!-- ? ----------------- Date picker dialog -->
        <v-date-picker
          v-if="showDatePicker"
          v-model="selectedDate"
          full-width
          scrollable
          @change="saveSelectedDate"
          elevation="25"
        />
        <!--  -->
      </v-menu>
    </v-col>
  </v-row>
</template>
