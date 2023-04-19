<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

// Minor TODO ------ Height of the box should be fixed. Keeps changing based on no. of results.

@Component
export default class ImagePicker extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  showDialog!: boolean;
  @Prop()
  imageUrl!: string;

  @Watch("imageUrl")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.imageUrl_local = this.imageUrl;
  }

  mounted() {
    console.log("Mounted ImagePicker");
    this.imageUrl_local = this.imageUrl;
  }

  // ------------------------------------------------ Data
  imageUrl_local!: string;

  // ------------------------------------------------ Methods
  triggerCancellation() {
    this.$emit("cancelled", true);
  }

  save() {
    this.$emit("save", this.imageUrl_local);
  }

  enterKeyPressed() {
    this.save();
  }
}
</script>

<template>
  <v-dialog v-model="showDialog">
    <v-card>
      <v-card-title> Pick an image </v-card-title>

      <v-card-text>
        <!-- ? Text-field for Image URL  -->
        <v-text-field
          v-model="imageUrl_local"
          label="Image URL"
          @keydown.enter="enterKeyPressed()"
        />
      </v-card-text>

      <!-- ? ------------------------------ Buttons for Save & Cancel -->
      <v-card-actions class="pt-6">
        <!--  -->
        <!-- <v-spacer /> -->

        <!------------- Cancel -->
        <v-btn
          @click="triggerCancellation"
          rounded
          outlined
          density="comfortable"
          class="text-body-2 font-weight-light px-auto"
        >
          Cancel
        </v-btn>

        <v-spacer />

        <!------------- Save -->
        <v-btn
          @click="save"
          rounded
          density="comfortable"
          :disabled="false"
          class="px-auto"
          color="primary"
          min-width="90"
        >
          Save
        </v-btn>

        <!--  -->
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
