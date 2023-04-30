<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ConfirmationDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  showDialog!: boolean;
  @Prop()
  messageToDisplay!: string;
  @Prop()
  yesButtonText!: string;
  @Prop()
  noButtonText!: string;

  // ------------------------------------------------ Computed props
  get showDialog_local() {
    return this.showDialog;
  }

  set showDialog_local(newVal: boolean) {
    this.noClicked();
  }

  // ------------------------------------------------ Methods
  yesClicked() {
    console.log("🫖 Yes was clicked");
    // Update parent
    this.$emit("confirm-status-change", true);
  }

  noClicked() {
    console.log("🫖 No was clicked");
    // Update parent
    this.$emit("confirm-status-change", false);
  }
}
</script>

<template>
  <v-dialog v-model="showDialog_local" max-width="500px">
    <v-card class="pb-2">
      <v-card-title>
        <span> {{ messageToDisplay }}</span>
        <v-spacer></v-spacer>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="noClicked"> {{ noButtonText }} </v-btn>
        <v-btn color="primary" @click="yesClicked">
          {{ yesButtonText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
