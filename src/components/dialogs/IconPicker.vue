<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
  },
  methods: {},
})
export default class IconPicker extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  showDialog!: boolean;
  @Prop()
  initialSearchPrefix!: string;

  @Watch("showDialog")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log("🚨 🚨 🚨 @Watch for IconPicker. _newValue = " + _newValue);

    const isDialogOpen = !!_newValue;

    if (isDialogOpen === true) {
      console.log("Updating --- searchPrefix = " + this.initialSearchPrefix);
      // Update the prefix
      this.searchPrefix = this.initialSearchPrefix;

      // Search as soon as this popup opens.
      this.searchForIcon(this.searchPrefix);
    }
  }

  // ------------------------------------------------ Stores
  iconsStore = useIconsStore();

  mounted() {
    this.iconsStore
      .loadIcons()
      .then(() => this.searchForIcon(this.searchPrefix));
  }

  // ------------------------------------------------ Data
  searchResults: string[] = [];
  searchPrefix = "";
  MDI_PREFIX = "mdi-";
  MAX_ICONS_TO_DISPLAY = 42;

  // ------------------------------------------------ Methods
  newIconSelected(selectedIcon: string) {
    console.log("---- newIconSelected = " + selectedIcon);
    this.$emit("icon-selected", selectedIcon);
  }

  /**
   * Pick the 1st icon if enter key is pressed.
   * TODO ----- 🪲 Bug: dialog pops up again on enter press.
   */
  enterKeyPressed() {
    if (this.searchResults.length > 0)
      this.newIconSelected(this.searchResults[0]);
  }

  closeIconPicker() {
    this.$emit("icon-picker-cancelled", true);
  }

  searchForIcon(prefix: string) {
    console.log("Searching..... prefix = " + prefix);
    const matches = this.iconsStore.searchByPrefix(prefix);
    this.searchResults = matches.map((iconName) => this.MDI_PREFIX + iconName);
  }
}
</script>

<template>
  <v-container fluid>
    <v-row center>
      <v-col>
        <v-bottom-sheet
          max-width="400"
          overlay-opacity="0.88"
          inset
          v-model="showDialog"
          persistent
          @keydown.esc="closeIconPicker"
          @keydown.enter="enterKeyPressed"
        >
          <v-card>
            <v-card-title class="pa-2">
              <!--  -->

              <!-- ? ------------- Search bar --------------->
              <v-icon class="ma-2 pa-2">mdi-magnify</v-icon>
              <div class="text-h6 font-weight-light">Pick an icon</div>

              <v-spacer></v-spacer>

              <!-- ? ------------- (x) Close button --------------->
              <v-btn icon class="px-auto mx-auto">
                <v-icon v-on:click.self="closeIconPicker">mdi-close</v-icon>
              </v-btn>

              <!--  -->
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text>
              <v-text-field
                v-model="searchPrefix"
                label="Search"
                class="shrink;display:flex;width=100px pt-6"
                placeholder=""
                hint="Start typing to search"
                autofocus
                @input="searchForIcon"
              ></v-text-field>
            </v-card-text>

            <!-- ? -------------- Matrix of icons -------------- * -->
            <v-card-text>
              <v-container fluid class="ml-3">
                <v-row>
                  <v-col
                    class="pa-0 ma-2"
                    v-for="(iconName, index) in searchResults.slice(
                      0,
                      MAX_ICONS_TO_DISPLAY
                    )"
                    v-bind:key="iconName"
                    :cols="1"
                  >
                    <v-icon
                      v-bind:index="index"
                      v-bind:key="iconName"
                      @click="newIconSelected(iconName)"
                      >{{ iconName }}</v-icon
                    >
                  </v-col>
                </v-row>

                <!--  -->
              </v-container>
            </v-card-text>

            <!-- ? ------------------------------------ Card ends here  -->
          </v-card>
          <!--  -->
        </v-bottom-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
