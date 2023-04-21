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
import CategoryChips from "../chips/CategoryChips.vue";
import ActivityChips from "../chips/ActivityChips.vue";

/**
 * TODO P1 ----- Add validations. Especially when a Category is not selected. Block the Save button.
 **/

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    IconPicker: IconPicker,
    CategoryChips: CategoryChips,
    ActivityChips: ActivityChips,
  },
  methods: {},
})
export default class ActivityCreateOrEditDialog extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  dialogMode!: DialogMode;
  @Prop()
  activity?: Activity;
  @Prop()
  area!: Area;
  @Prop()
  showDialog!: boolean;

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
    console.log("🐪 Mounted ActivityCreateOrEditDialog");
    this.iconsStore.loadIcons();
  }

  // ------------------------------------------------ Data
  activity_local = deepCopy(defaultNewActivity);
  selectedCategory: CategoryTag | null = null;
  showDialogForConfirmDiscard = false;
  showIconPicker = false;
  showSearchBar = false;
  searchInput = "";
  selectedCategoryId = "";

  // ------------------------------------------------ Computed
  get categories(): CategoryTag[] {
    console.log(
      "🏏 ---- categories = " +
        JSON.stringify(
          this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags)
        )
    );
    return this.categoryTagsStore.getCategoriesByIDs(this.area.categoryTags);
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.categoryTagsStore.subscribeToStore(); // Subscribe to store

    // Reset

    this.activity_local = this.activity ? this.activity : defaultNewActivity;

    // Assign category
    this.selectedCategoryId = this.activity_local.categoryId;
  }

  onHide() {
    // Unsubscribe from stores.
    this.categoryTagsStore.unsubscribe(); // Unsubscribe from store
  }

  onSelectionChange() {
    console.log(
      "🏉 🏉 🏉 SELECTION CHANGED: " + JSON.stringify(this.selectedCategoryId)
    );
    if (this.selectedCategoryId.length > 0) {
      this.activity_local.categoryId = this.selectedCategoryId;
    } else {
      // TODO: Show error
    }
    console.log(
      "🏉 this.activity_local: " + JSON.stringify(this.activity_local)
    );
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
    // Ask the parent to update.
    console.log(
      "!!!!!! ------- this.activity_local = " +
        JSON.stringify(this.activity_local)
    );
    this.$emit("save-confirmed", this.activity_local);
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
          <v-card flat class="px-2">
            <!--  -->

            <!-- ? ----------------- Box title ---------------- * -->
            <v-card-actions class="pa-4 pb-0 ma-0">
              <v-card-title class="pa-0 text-h6 font-weight-light">
                {{ dialogMode === "CREATE" ? `New` : `Edit` }} Activity
              </v-card-title>
              <v-spacer />
              <!-- ? ------------- (x) Close button --------------->
              <v-icon @click="triggerCancellation">mdi-close</v-icon>
            </v-card-actions>

            <!-- ? ----------------- Box subtitle ---------------- * -->
            <v-card-text class="pa-0 ma-0">
              <v-card-subtitle class="pt-1 text-body-2 font-weight-light">
                Pick a name & an icon
              </v-card-subtitle>
            </v-card-text>

            <v-divider></v-divider>

            <!-- ? ----------------- Name text-field --------------------->
            <v-card-text class="pa-0 pt-2">
              <v-container fluid>
                <!--  -->

                <v-row>
                  <v-col class="px-auto pb-0">
                    <!--  -->
                    <!-- ? -------------- Text field ------------>
                    <v-text-field
                      label="Name"
                      v-model="activity_local.title"
                      outlined
                      clearable
                      placeholder="Activity name"
                      hint="Something short and sweet."
                      counter="15"
                      class="pa-0"
                    />
                  </v-col>
                </v-row>

                <!--  -->
              </v-container>
            </v-card-text>

            <!-- ? ------------------ Pick an icon ----------------------->
            <v-card-actions class="pl-4 pb-4 pt-0">
              <v-container fluid>
                <v-row>
                  <!-- ? -------------- Hint -->
                  <span class="mr-4 ml-1 mb-1 text-caption font-weight-light">
                    Pick an icon
                  </span>
                </v-row>
                <v-row>
                  <!-- ? -------------- Icon-->
                  <v-icon
                    x-large
                    @click="showIconPicker = true"
                    class="px-auto pt-1 mr-20 mt-0"
                  >
                    {{ activity_local.icon }}
                  </v-icon>
                </v-row>
              </v-container>

              <v-spacer />
            </v-card-actions>

            <v-divider />

            <!-- ? -------------------- CATEGORY selection ---------------- * -->

            <span class="pl-5 pt-5 mb-1 text-caption font-weight-light">
              Select a Category
            </span>

            <v-card-text class="pl-4 pb-4 pt-0">
              <!-- ? ------------------------ Auto-complete for chips  --------->
              <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
              <v-autocomplete
                auto-select-first
                chips
                label=""
                v-model="selectedCategoryId"
                :items="categories"
                item-text="title"
                item-value="id"
                hint="Click to select a category"
                persistent-hint
                hide-selected
                @input="searchInput = ''"
                :search-input.sync="searchInput"
                @keydown.enter.native.prevent
                @change="onSelectionChange"
                :menu-props="{
                  closeOnContentClick: false,
                  closeOnClick: true,
                  openOnClick: false,
                }"
                color="primary"
                class=""
              >
                <!-- Notes about the modifiers above in <v-autocomplete> -->
                <!--      @input will reset the text-input to '' once tag is selected -->
                <!--      search-input.sync will bind the text-input to our variable -->

                <!-- * ------------ When no tags match ------------ * -->
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>
                        No categories matched.
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>

                <!-- * ------------ Chips component ------------ * -->
                <template v-slot:selection="data">
                  <CategoryChips
                    :categories="[data.item]"
                    :hasCloseButton="false"
                  />
                </template>

                <!-- * ------------ List item in dropdown ------------ * -->
                <!-- eslint-disable vue/no-unused-vars -->
                <!-- eslint-disable vue/no-v-text-v-html-on-component -->
                <template v-slot:item="{ item, attrs, on }">
                  <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
                    <v-list-item-content>
                      <v-list-item-title>
                        <v-row no-gutters align="center">
                          <!--  -->

                          <v-icon small class="pr-4" :color="item.color">
                            mdi-circle
                          </v-icon>

                          <span>{{ item.title }}</span>

                          <v-spacer></v-spacer>
                        </v-row>
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>

                <!-- ? ------------ (+) icon ------------ * -->
                <!-- TODO: @click should display CreateCategory dialog -->
                <!-- eslint-disable vue/no-v-text-v-html-on-component -->
                <template v-slot:append-outer>
                  <v-icon v-text="'mdi-plus-circle-outline'"></v-icon>
                </template>

                <!--  -->
              </v-autocomplete>

              <!--  -->
            </v-card-text>

            <!-- ? --------------------- Preview ------------------------->
            <v-card-actions class="">
              <v-container fluid>
                <v-row>
                  <span class="mr-4 ml-1 mb-1 text-caption font-weight-light">
                    Preview
                  </span>
                </v-row>
                <v-row>
                  <ActivityChips
                    :activities="[activity_local]"
                    :categories="categories"
                    :hasCloseButton="false"
                  />
                </v-row>
              </v-container>
              <v-spacer />
            </v-card-actions>

            <!-- ? ------------------ Save / Cancel ---------------- * -->
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="triggerCancellation"> Cancel </v-btn>
              <v-btn color="primary" @click="saveActivity">
                {{ dialogMode === "CREATE" ? `Create` : `Save` }}
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- * ------------------------ Dialogs  -------------------------->

          <!-- ? ---------------- Confirm discard  ------------------->
          <ConfirmationDialog
            v-on:confirm-status-change="respondToConfirmDiscardDialog"
            :showDialog="showDialogForConfirmDiscard"
            messageToDisplay="Sure you want to discard this?"
            yesButtonText="Discard"
            noButtonText="Cancel"
          />

          <!-- ? ---------------- Icon Picker  ------------------->
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
