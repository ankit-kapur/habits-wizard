<script lang="ts">
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class TimePicker extends Vue {
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

  /* <!-- ? ------------------------------ Data ------------------------------> */
  isDisplayed_local = false;
  showTimePicker = false;
  selectedTime = "";

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
  }

  closeViaParent() {
    this.$emit("cancel", false);
  }

  saveSelectedTime() {
    // Set menu action
    this.$refs.menu?.save(this.selectedTime);

    // Emit to parent
    this.$emit("time-selected", this.selectedTime);
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

  /* <!-- * ------------------------------ Methods ------------------------------> */
}
</script>

<template>
  <div>
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
        ></v-text-field>
      </template>

      <!-- ? ----------------------- Time picker dialog -->
      <v-time-picker
        v-if="showTimePicker"
        v-model="selectedTime"
        full-width
        scrollable
        @click:minute="saveSelectedTime"
        elevation="15"
      ></v-time-picker>

      <!--  -->
    </v-menu>
  </div>
</template>
