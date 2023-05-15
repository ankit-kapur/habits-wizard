<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import RecordWizard from "@/components/wizards/RecordWizard.vue";
import { DialogMode } from "@/model/enum/DialogMode";
import { useAppStateStore } from "@/store/AppStateStore";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    RecordWizard: RecordWizard,
  },
})
export default class RecordingPage extends Vue {
  //
  // ------------------------ Data
  showRecordingDialog = false;
  recordingDialogMode = DialogMode.CREATE;

  // ------------------------------------------------ Stores
  appStateStore = useAppStateStore();

  // ------------------------------------------------ Lifecycle
  mounted() {
    console.log("🐪 Mounted RecordingPage");

    // Temporary hack. Automatically popup the wizard on entering this page.
    this.showRecordingDialog = true;
  }

  unmounted() {
    console.log("🐪 UNMOUNTED RecordingPage");
  }

  // ------------------------------------------------ Methods
  recordButtonClicked() {
    this.showRecordingDialog = true;
  }

  closeRecordingDialog() {
    this.showRecordingDialog = false;
  }
}
</script>

<template>
  <div class="">
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <v-card
            @click="recordButtonClicked"
            max-width="300"
            class="mb-4 mx-auto px-auto"
          >
            <!-- https://neural.love/cdn/ai-photostock/1ed3fefe-33ce-60ae-aaa9-29ea77aa236d/0.jpg?Expires=1685577599&Signature=14s3wHonJosTtIm~xbV~uEa8064AD6tABbeWWIh2Ixr-png6YrxmEtq5C6zZUaNi7852EnQKivVqSLIcX75hVHx-bG-6IS4xLyxM0mdVr9ayDvo8A9aR1VaemIqVWaAzC4za2YpjHqw4~vGUav2QYEThvdDI-2mgUcfo4SoPz5AIaCJQ-iQD3AoPmMxqUmtHFRtzP4tN-KQsb2e0uk32VISQeosaK4PH3bVeox4DU~xEhQz-a8wFg8A7VVmezzxh6tfjGWTlMhnK-loq2L7urxb0AFnTeG04Bds3Z3scACP4T1anR6b7F-ImwKk~ePt7h5XwYc9JdBbbiQgKPEr3~g__&Key-Pair-Id=K2RFTOXRBNSROX -->
            <v-img
              src="https://neural.love/cdn/ai-photostock/1ed65fde-47b4-6e0e-9c63-f1b6b3707701/0.jpg?Expires=1685577599&Signature=wdEOzX3arQJnoBsNgNrPkfUAAcZAvhmiM0zGKaLDW8EC2gKByxQvmVOZ4pZpixNFS5K0hBpbTEOKKNLoj9GGu0V6Ugf3W0X1jNvGzMlhbR6SXXAe470O8KNWCWLM9QCGbvnaO~x9uiAiugjIYgeZBIySHZ~JYgRRvhCDiNh94KUggUJUf25nGddqIPHoQ0U3nfk0DtP3NK~OCtqJJq3j8GToECMbU-VLku3qKiSEMjcVD7lEAEIS4j7TXRioM5T8tl4qSWxgnxKqfMjPiseJZUvRjaVMwFQoI6CyUxBbEECvpGE93iwVuL3ePN0ApnSO9TMIf2fToUr0831t2WqcQg__&Key-Pair-Id=K2RFTOXRBNSROX"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="250px"
              cover
            >
              <v-card-title
                class="text-white font-weight-light"
                style="color: white"
              >
                Track an Activity
              </v-card-title>
            </v-img>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <RecordWizard
      :showDialog="showRecordingDialog"
      :dialogMode="recordingDialogMode"
      v-on:close="closeRecordingDialog"
    />
  </div>
</template>
