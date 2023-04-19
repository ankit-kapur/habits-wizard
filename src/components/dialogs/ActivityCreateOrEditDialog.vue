<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { DialogMode } from "./AreaCreateOrEditDialog.vue";
import ConfirmationDialog from "./ConfirmationDialog.vue";
import { useIconsStore } from "@/store/IconsStore";
import IconPicker from "@/components/dialogs/IconPicker.vue";
import { deepCopy } from "deep-copy-ts";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Area } from "@/model/pojo/definitions/Area";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    IconPicker: IconPicker,
  },
  methods: {},
})
export default class ActivityCreateOrEditDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  activity!: Activity;
  @Prop()
  area!: Area;
  @Prop()
  showDialog!: boolean;
  @Prop()
  dialogMode!: DialogMode;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("showDialog")
  // @Watch("activity")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log("👀 @Watch in ActivityCreateOrEdit. showDialog = " + _newValue);
    const isDialogOpen = !!_newValue;
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  iconsStore = useIconsStore();
  categoryTagsStore = useCategoryTagsStore();

  mounted() {
    this.iconsStore.loadIcons();
  }

  // ------------------------------------------------ Data
  activity_local = deepCopy(defaultNewActivity);
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showIconPicker = false;
  showSearchBar = false;
  searchInput = "";
  selectedItemsList: string[] = [];

  // ------------------------------------------------ Computed
  get categories(): CategoryTag[] {
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.categoryTagsStore.subscribeToStore(); // Subscribe to store
    if (DialogMode.CREATE === DialogMode[this.dialogMode]) {
      this.activity_local = deepCopy(defaultNewActivity); // Reset
    } else if (DialogMode.EDIT === DialogMode[this.dialogMode]) {
      this.activity_local = deepCopy(this.activity);
    }
  }

  onHide() {
    // Unsubscribe from stores.
    this.categoryTagsStore.unsubscribe(); // Unsubscribe from store
  }

  onTagSelectionChange() {
    this.showSearchBar = false;
    this.selectedCategory = this.categoryTagsStore.getCategoryById(
      this.selectedItemsList[0]
    );
    this.selectedItemsList = [];
  }

  resetNewActivityData() {
    this.activity_local = deepCopy(defaultNewActivity);
  }

  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      this.discard();
    } else {
      console.log("NOT DISCARDING");
    }
    this.showDialogForConfirmDiscard = false;
  }

  discard() {
    console.log("DISCARDING");
    this.$emit("discard", true);
    this.resetNewActivityData();
  }

  saveActivity() {
    // Reset dialog box
    // Ask the parent to update.
    console.log(
      "!!!!!! ------- this.activity_local = " +
        JSON.stringify(this.activity_local)
    );
    this.$emit("save-confirmed", this.activity_local);

    this.resetNewActivityData();
  }

  triggerCancellation() {
    // If nothing's changed, discard without confirmation
    if (
      JSON.stringify(this.activity_local) === JSON.stringify(this.activity) ||
      JSON.stringify(this.activity_local) === JSON.stringify(defaultNewActivity)
    ) {
      console.log("🐞 discard");
      this.discard();
    } else {
      console.log("🐞 showDialogForConfirmDiscard");
      this.showDialogForConfirmDiscard = true;
    }
  }

  newIconSelected(newIcon: string) {
    console.log("---- newIconSelected (PARENT) = " + newIcon);
    this.activity_local.icon = newIcon;
    this.closeIconPicker(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  closeIconPicker(state: boolean) {
    this.showIconPicker = false;
  }
}
</script>

<template>
  <v-container fluid>
    <v-row center>
      <v-col>
        <v-bottom-sheet
          max-width="300"
          overlay-opacity="0.88"
          inset
          v-model="showDialog"
          persistent
          @keydown.esc="triggerCancellation"
          @keydown.enter="saveActivity"
        >
          <v-card>
            <v-list>
              <v-list-item>
                <!-- ? ----------------- Box heading ---------------- * -->
                <v-list-item-content>
                  <v-list-item-title>Activity</v-list-item-title>
                  <v-list-item-subtitle
                    >Click save to create
                  </v-list-item-subtitle>
                </v-list-item-content>

                <!-- ? -------------- (x) Close button -------------- * -->
                <v-list-item-action>
                  <v-btn icon>
                    <v-icon @click="triggerCancellation">mdi-close</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <!-- * ---------- Title text-field ---------- * -->
            <v-container fluid>
              <!--  -->
              <v-row>
                <!-- ? -------------- Icon button -------------- * -->
                <v-col cols="2">
                  <v-icon
                    @click="showIconPicker = true"
                    large
                    class="px-auto pt-4 mr-20"
                    >{{ activity_local.icon }}</v-icon
                  >
                  <!-- </v-btn> -->
                </v-col>

                <!-- ? ------------------ Name ---------------- * -->
                <v-col>
                  <v-text-field
                    label="Name"
                    v-model="activity_local.title"
                    class="shrink;display:flex;width=100px"
                    placeholder="New Activity"
                    hint="Something short and sweet."
                    counter="15"
                    clearable
                    :autofocus="false"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!--  -->
            </v-container>

            <!-- * -------------------- CATEGORY selection ---------------- * -->
            <v-card-subtitle class="text-body font-weight-light"
              >Category</v-card-subtitle
            >

            <!-- ? ------- Chip -->
            <!-- <v-chip @click="showSearchBar = !showSearchBar">
              <v-icon :color="selectedCategory?.color" small class="mr-2">
                mdi-circle
              </v-icon>
              {{ selectedCategory?.title }}
            </v-chip> -->

            <v-card-text>
              <!-- ? ------------------------ Auto-complete for chips  --------->
              <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
              <v-autocomplete
                loading
                auto-select-first
                chips
                label=""
                v-model="selectedItemsList"
                :items="categories"
                item-text="title"
                item-value="id"
                hint="Search for a category"
                persistent-hint
                color="blue-grey-lighten-2"
                hide-selected
                @input="searchInput = ''"
                :search-input.sync="searchInput"
                @keydown.enter.native.prevent
                @change="onTagSelectionChange"
                :menu-props="{
                  closeOnContentClick: false,
                  closeOnClick: true,
                  openOnClick: true,
                }"
                class=""
              >
                <!-- Notes about the modifiers above in <v-autocomplete> -->
                <!--      @input will reset the text-input to '' once tag is selected -->
                <!--      search-input.sync will bind the text-input to our variable -->
                <!--      (unused) @update:search-input="callFunc" will call our func when text-input changes -->
                <!--      hide-no-data will make the prompy for 'no-data' disappear when Create box is active -->

                <!-- * ------------ When no tags match ------------ * -->
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title> No matches. </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>

                <!-- * ------------ Chip ------------ * -->
                <template v-slot:selection="data">
                  <v-chip v-bind="data.attrs">
                    <v-icon class="mr-2">{{ data.item.icon }}</v-icon>
                    {{ data.item.title }}
                  </v-chip>
                </template>

                <!-- * ------------ List item in dropdown ------------ * -->
                <!-- eslint-disable vue/no-unused-vars -->
                <!-- eslint-disable vue/no-v-text-v-html-on-component -->
                <template v-slot:item="{ item, attrs, on }">
                  <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-row no-gutters align="center">
                          <v-icon small class="pr-4" :color="item.color"
                            >mdi-circle</v-icon
                          >
                          <span>{{ item.title }}</span>
                          <v-spacer></v-spacer>
                        </v-row>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>

                <!--  -->
              </v-autocomplete>
            </v-card-text>

            <!-- ? ------------------ Save / Cancel ---------------- * -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="triggerCancellation"> Cancel </v-btn>
              <v-btn text color="primary" @click="saveActivity"> Save </v-btn>
            </v-card-actions>
          </v-card>

          <!-- * ------------------------ Confirm discard  -------------------------->
          <ConfirmationDialog
            v-on:confirm-status-change="respondToConfirmDiscardDialog"
            :showDialog="showDialogForConfirmDiscard"
            messageToDisplay="Sure you want to discard this?"
            yesButtonText="Discard"
            noButtonText="Cancel"
          />

          <IconPicker
            :showDialog="showIconPicker"
            :initialSearchPrefix="activity_local.title"
            v-on:icon-selected="newIconSelected"
            v-on:icon-picker-cancelled="closeIconPicker"
          ></IconPicker>
        </v-bottom-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>
