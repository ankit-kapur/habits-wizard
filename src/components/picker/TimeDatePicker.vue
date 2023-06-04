<script lang="ts">
import {
  getDateFromEpoch_ISO8601,
  getPrettyShortDate,
  convertToEpoch,
  getTimeFromEpoch,
} from "@/utils/time/TimestampConversionUtils";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class TimeDatePicker extends Vue {
  $refs!: {
    menu: HTMLFormElement;
  };

  // ------------------------------------------------ Props
  @Prop()
  initialTimestampEpoch?: number;

  /* <!-- ? ------------------------------ Data ------------------------------> */
  showTimePicker = false;
  showDatePicker = false;

  selectedTime = ""; // HH:MM (24 hour format)
  selectedDate = ""; // YYYY-MM-DD format (ISO-8601)

  /* <!-- ? ------------------------------ Watchers ------------------------------> */
  @Watch("initialTimestampEpoch")
  onTimestampChange(_newValue: string) {
    this.resetState();
    console.log(
      "👀 @Watch in StartTimePicker. initialTimestampEpoch = " + _newValue
    );
  }

  @Watch("showTimePicker")
  onShowTimePicker(show: boolean) {
    console.log("👀 @Watch in showTimePicker. VALUE = " + show);
    if (show) {
      this.selectedTime = getTimeFromEpoch(
        this.initialTimestampEpoch
          ? this.initialTimestampEpoch
          : new Date().valueOf()
      );
    }
  }

  /* <!-- ? ------------------------------ Lifecycle ------------------------------> */
  mounted() {
    this.resetState();
  }

  resetState() {
    // this.showTimePicker = false;

    console.log(
      "Inside resetState. initialTimestamp = " + this.initialTimestampEpoch
    );

    this.selectedTime = this.initialTimestampEpoch
      ? getTimeFromEpoch(this.initialTimestampEpoch)
      : "";

    const timestampEpoch = this.initialTimestampEpoch
      ? this.initialTimestampEpoch
      : new Date().valueOf();
    this.selectedDate = getDateFromEpoch_ISO8601(timestampEpoch);
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
    if (!this.selectedTime) return "";
    var split = this.selectedTime.split(":");
    let hours: number = parseInt(split[0]);
    let minutes = split[1];
    var suffix = hours >= 12 ? " PM" : " AM";
    hours = ((hours + 11) % 12) + 1;
    return hours + ":" + minutes + suffix;
  }

  /* <!-- ? ------------------------------ Methods ------------------------------> */

  /* <!-- * ------------------------------ Method imports ------------------------------> */
  getPrettyShortDate = getPrettyShortDate;
  getDate_ISO8601 = getDateFromEpoch_ISO8601;
  convertToEpoch = convertToEpoch;
  getTimeFromEpoch = getTimeFromEpoch;
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
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
            class="pa-0"
          ></v-text-field>
        </template>

        <!-- ? ---------------- Time picker dialog -->
        <v-card v-if="showTimePicker" elevation="15">
          <v-time-picker v-model="selectedTime" full-width scrollable />
          <v-card-actions>
            <v-btn @click="showTimePicker = false" outlined text>Cancel</v-btn>
            <v-spacer />
            <v-btn @click="saveSelectedTime" color="primary">Save</v-btn>
          </v-card-actions>
        </v-card>

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
            :value="getPrettyShortDate(selectedDate)"
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
