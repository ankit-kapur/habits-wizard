<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import AreaDialogToEditOrCreate from "@/components/dialogs/AreaDialogToEditOrCreate.vue";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog.vue";

@Component({
  components: {
    AreaDialogToEditOrCreate: AreaDialogToEditOrCreate,
    ConfirmationDialog: ConfirmationDialog,
  },
})
export default class BottomNavBar extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  selectedPage!: number;

  @Watch("currentTabValue")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.selectedPageNumber = this.selectedPage;
  }
  // ------------------------------------------------ Data
  selectedPageNumber = 0;
  showRecordingDialog = false;
  showDiscardConfirmationDialog = false;

  // TODO: Remove these.
  date = null;
  trip = {
    name: "",
    location: null,
    start: null,
    end: null,
  };
  locations = [
    "Australia",
    "Barbados",
    "Chile",
    "Denmark",
    "Ecuador",
    "France",
  ];

  // ------------------------------------------------ Mounted
  mounted() {
    console.log("🐪 🐪 🐪  Mounted BottomNavBar");
  }

  // ------------------------------------------------ Methods
  // TODO: Move to dialog-box component
  saveRecordedThing(): void {
    this.showRecordingDialog = false;
  }

  triggerDiscardConfirmation(): void {
    this.showDiscardConfirmationDialog = true;
  }

  discardRecordedThing(): void {
    this.showDiscardConfirmationDialog = false;
    this.showRecordingDialog = false;
  }
}
</script>

<template>
  <!-- TODO use color from the theme -->
  <v-bottom-navigation
    v-model="selectedPageNumber"
    background-color="indigo"
    mode="shift"
    :elevation="11"
    fixed
    class=""
  >
    <!-- Home -->
    <v-btn ref="link" to="/" min-width="38" min-height="30">
      <span> Home </span>
      <v-icon> mdi-home </v-icon>
    </v-btn>

    <v-btn ref="link" to="/calendarPage" min-width="38" min-height="30">
      <span> Day </span>
      <v-icon> mdi-calendar </v-icon>
    </v-btn>

    <v-btn ref="link" to="/progressPage" min-width="38" min-height="30">
      <span> Progress </span>
      <v-icon> mdi-progress-check </v-icon>
    </v-btn>

    <v-btn ref="link" to="/configurationPage" min-width="38" min-height="30">
      <span> Config </span>
      <v-icon> mdi-account-edit </v-icon>
    </v-btn>

    <!-- Record button, and it's popup menu -->
    <v-menu
      top
      close-on-content-click
      transition="slide-y-reverse-transition"
      offset-x
      offset-y
    >
      <v-list>
        <!-- TODO: Set different @click action -->
        <v-list-item @click="showRecordingDialog = true">
          <v-list-item-icon>
            <v-icon> mdi-fruit-cherries </v-icon>
          </v-list-item-icon>
          <v-list-item-title> Pomodoro </v-list-item-title>
        </v-list-item>

        <!-- TODO: Set different @click action -->
        <v-list-item @click="showRecordingDialog = true">
          <v-list-item-icon>
            <v-icon> mdi-timer-play </v-icon>
          </v-list-item-icon>
          <v-list-item-title> Timer </v-list-item-title>
        </v-list-item>

        <v-list-item @click="showRecordingDialog = true">
          <v-list-item-icon>
            <v-icon> mdi-location-enter </v-icon>
          </v-list-item-icon>
          <v-list-item-title> Enter </v-list-item-title>
        </v-list-item>
      </v-list>
      <template v-slot:activator="{ on: recordMenuOn, attrs: recordMenuAttrs }">
        <v-btn
          ref="link"
          v-bind="recordMenuAttrs"
          v-on="recordMenuOn"
          min-width="38"
          min-height="30"
        >
          <span> Record </span>
          <v-icon> mdi-radiobox-marked </v-icon>
        </v-btn>
      </template>
    </v-menu>

    <!-- TODO: Move out to a new component "RecordHabitBottomSheet.vue" -->
    <v-bottom-sheet v-model="showRecordingDialog" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h6">Record a Thing</span>
        </v-card-title>
        <v-card-text>
          <!-- TODO: Replace placeholder stuff -->

          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <template v-slot:default="{ open }">
                  <v-row no-gutters>
                    <v-col cols="4"> Trip name </v-col>
                    <v-col cols="8" class="text--secondary">
                      <v-fade-transition leave-absolute>
                        <span v-if="open" key="0">
                          Enter a name for the trip
                        </span>
                        <span v-else key="1">
                          {{ trip.name }}
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-text-field
                  v-model="trip.name"
                  placeholder="Caribbean Cruise"
                ></v-text-field>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header v-slot="{ open }">
                <v-row no-gutters>
                  <v-col cols="4"> Location </v-col>
                  <v-col cols="8" class="text--secondary">
                    <v-fade-transition leave-absolute>
                      <span v-if="open" key="0"> Select trip destination </span>
                      <span v-else key="1">
                        {{ trip.location }}
                      </span>
                    </v-fade-transition>
                  </v-col>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row no-gutters>
                  <v-spacer></v-spacer>
                  <v-col cols="5">
                    <v-select
                      v-model="trip.location"
                      :items="locations"
                      chips
                      flat
                      solo
                    ></v-select>
                  </v-col>

                  <v-divider vertical class="mx-4"></v-divider>

                  <v-col cols="3">
                    Select your destination of choice
                    <br />
                    <a href="#">Learn more</a>
                  </v-col>
                </v-row>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn text color="secondary"> Cancel </v-btn>
                  <v-btn text color="primary"> Save </v-btn>
                </v-card-actions>
              </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header v-slot="{ open }">
                <v-row no-gutters>
                  <v-col cols="4"> Start and end dates </v-col>
                  <v-col cols="8" class="text--secondary">
                    <v-fade-transition leave-absolute>
                      <span v-if="open">When do you want to travel?</span>
                      <v-row v-else no-gutters style="width: 100%">
                        <v-col cols="6">
                          Start date: {{ trip.start || "Not set" }}
                        </v-col>
                        <v-col cols="6">
                          End date: {{ trip.end || "Not set" }}
                        </v-col>
                      </v-row>
                    </v-fade-transition>
                  </v-col>
                </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-row justify="space-around" no-gutters>
                  <v-col cols="3">
                    <v-menu
                      ref="startMenu"
                      :close-on-content-click="false"
                      :return-value.sync="trip.start"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="trip.start"
                          label="Start date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="date" no-title scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary"> Cancel </v-btn>
                        <v-btn text color="primary"> OK </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>

                  <v-col cols="3">
                    <v-menu
                      ref="endMenu"
                      :close-on-content-click="false"
                      :return-value.sync="trip.end"
                      offset-y
                      min-width="290px"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                          v-model="trip.end"
                          label="End date"
                          prepend-icon="mdi-calendar"
                          readonly
                          v-bind="attrs"
                          v-on="on"
                        ></v-text-field>
                      </template>
                      <v-date-picker v-model="date" no-title scrollable>
                        <v-spacer></v-spacer>
                        <v-btn text color="primary"> Cancel </v-btn>
                        <v-btn text color="primary"> OK </v-btn>
                      </v-date-picker>
                    </v-menu>
                  </v-col>
                </v-row>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            class="discard-button white--text"
            text
            @click="triggerDiscardConfirmation"
          >
            Discard
          </v-btn>
          <v-btn
            class="confirm-button white--text"
            text
            @click="saveRecordedThing"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- CONFIRMATION dialog for discarding a recorded thing -->
    <v-dialog v-model="showDiscardConfirmationDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>Sure you want to discard this?</span>
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-actions>
          <v-btn color="primary" text @click="discardRecordedThing">
            Yes
          </v-btn>

          <v-btn
            color="primary"
            text
            @click="showDiscardConfirmationDialog = false"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-bottom-navigation>
  <!-- End of BOTTOM -->
</template>
