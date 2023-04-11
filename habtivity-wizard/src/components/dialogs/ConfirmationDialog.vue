<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ConfirmationDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  showDialog!: boolean;
  @Prop()
  messageToDisplay!: string;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.showThisDialog = this.showDialog;
    console.log(
      "onPropertyChanged just happened inside @Watch. this.showThisDialog ===> " +
        this.showThisDialog
    );
  }

  // Toggle for displaying this box
  showThisDialog = false;

  // ------------------------------------------------ Methods
  yesClicked() {
    console.log("🫖 🫖 🫖  YES was clicked");
    // Update parent
    this.$emit("confirm-status-change", true);
  }

  noClicked() {
    console.log("🫖 🫖 🫖  NO was clicked");
    // Update parent
    this.$emit("confirm-status-change", false);
  }
}
</script>

<template>
  <v-dialog v-model="showThisDialog" max-width="500px">
    <v-card>
      <v-card-title>
        <span> {{ messageToDisplay }}</span>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-actions>
        <v-btn text @click="noClicked"> No </v-btn>
        <v-btn color="primary" text @click="yesClicked"> Yes </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
