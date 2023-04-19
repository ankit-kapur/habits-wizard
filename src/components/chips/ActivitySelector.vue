<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import Activity from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import ActivityCreateOrEditDialog from "../dialogs/ActivityCreateOrEditDialog.vue";

@Component({
  components: {
    ActivityCreateOrEditDialog: ActivityCreateOrEditDialog,
  },
})
export default class ActivitySelector extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  area!: Area;
  @Prop()
  isDisplayed!: boolean;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in ActivitySelector. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  // ------------------------------------------------ Stores
  activitiesStore = useActivitiesStore();

  // ------------------------------------------------ Data
  activitiesList!: Activity[];
  showCreateActivityDialog = false;
  showEditActivityDialog = false;
  selectedActivity: Activity | null = null;
  selectedItemIdList_local: string[] = [];
  newActivity: Activity = deepCopy(defaultNewActivity);
  searchInput = "";

  // ------------------------------------------------ Computer props
  get allItemsList() {
    return this.activitiesStore.getActivitiesByArea(this.area.id);
  }

  mounted() {
    this.onShow();
    console.log("🐪 🐪 🐪 Mounted ---- ActivitySelector");
  }

  unmounted() {
    this.activitiesStore.unsubscribe();
    console.log("🐪 🐪 🐪 🐪 🐪 🐪 UNMOUNTED ---- ActivitySelector");
  }

  // ------------------------------------------------ Methods
  onShow() {
    this.activitiesStore.subscribeToStore(); // Subscribe to store
  }

  onHide() {
    this.activitiesStore.unsubscribe(); // Unsubscribe from store
  }

  promptForNewActivity() {
    // Checks if the searchInput text matches something from the dropdown.
    if (
      this.allItemsList.filter((e) => e.title.startsWith(this.searchInput))
        .length == 0
    ) {
      this.newActivity.title = this.searchInput;
      this.showCreateActivityDialog = true;
    }
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  createNewActivity(newActivity: Activity) {
    console.log("Saving new category");

    // TODO P0 -------- Get Category ID here for Create.

    const categoryId = "";

    const newId: string = this.activitiesStore.createActivity(
      newActivity,
      this.area.id,
      categoryId
    );
    this.selectedItemIdList_local.push(newId);
    this.showCreateActivityDialog = false;
  }

  triggerEditDialog(categoryTag: Activity) {
    console.log("triggerEditDialog");
    this.selectedActivity = categoryTag;
    this.showEditActivityDialog = true;
  }

  saveExistingActivity(updatedActivity: Activity) {
    console.log("Saving new category");
    this.activitiesStore.updateActivity(updatedActivity);
    // Reset things.
    this.showEditActivityDialog = false;
    this.selectedActivity = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discardActivityChange(irrelevantValue: boolean) {
    console.log("Discarding");
    this.showCreateActivityDialog = false;
    this.showEditActivityDialog = false;
  }

  /**
   * Trigger when the (x) button is clicked on a chip
   * @param category
   */
  removeActivityFromArea(category: Activity) {
    const index = this.selectedItemIdList_local.indexOf(category.id);
    if (index >= 0) this.selectedItemIdList_local.splice(index, 1);
  }
}
</script>

<template>
  <div class="text-center">
    <!-- * ------------------------ Auto-complete for chips  -------------------------->
    <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
    <!-- removed fields: clearable -->
    <v-autocomplete
      loading
      auto-select-first
      chips
      deletable-chips
      label="Activities"
      v-model="selectedItemIdList_local"
      :items="allItemsList"
      item-text="title"
      item-value="id"
      multiple
      hint="Select a tag or create a new one."
      color="blue-grey-lighten-2"
      hide-selected
      :hide-no-data="showCreateActivityDialog"
      @input="searchInput = ''"
      :search-input.sync="searchInput"
      @keydown.enter="promptForNewActivity"
      @keydown.enter.native.prevent
      @change="onTagSelectionChange"
      :menu-props="{
        closeOnContentClick: false,
        closeOnClick: true,
        openOnClick: false,
      }"
      :disabled="showEditActivityDialog"
      class="pt-6"
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
            <v-list-item-title>
              Press <code>enter</code> to create.
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <!-- * ------------ Chip ------------ * -->
      <template v-slot:selection="data">
        <v-chip
          v-bind="data.attrs"
          close
          @click="triggerEditDialog(data.item)"
          @click:close="removeActivityFromArea(data.item)"
        >
          <v-icon class="mr-2">{{ data.item.icon }}</v-icon>
          {{ data.item.title }}
        </v-chip>
      </template>

      <!-- * ------------ List item in dropdown ------------ * -->
      <!-- eslint-disable vue/no-unused-vars -->
      <!-- eslint-disable vue/no-v-text-v-html-on-component -->
      <template v-slot:item="{ item, attrs, on }">
        <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
          <!-- <v-list-item-avatar>
            <img :src="area.imageUrl" />
          </v-list-item-avatar> -->
          <v-list-item-content>
            <v-list-item-title>
              <v-row no-gutters align="center">
                <v-icon class="pr-4">{{ item.icon }}</v-icon>
                <span>{{ item.title }}</span>
                <v-spacer></v-spacer>
                <!-- <v-btn icon>
                      <v-icon small class="">mdi-pencil</v-icon>
                    </v-btn> -->
              </v-row>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>

      <!-- * ------------ (+) icon ------------ * -->
      <!-- eslint-disable vue/no-v-text-v-html-on-component -->
      <template v-slot:append-outer>
        <v-icon
          @click="showCreateActivityDialog = true"
          v-text="'mdi-plus-circle-outline'"
        ></v-icon>
      </template>
    </v-autocomplete>

    <!-- TODO ----- Make this new component -->
    <!-- * ------------------------ New Activity popup  -------------------------->
    <ActivityCreateOrEditDialog
      :activity="newActivity"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateActivityDialog"
      v-on:save-confirmed="createNewActivity"
      v-on:discard="discardActivityChange"
    ></ActivityCreateOrEditDialog>

    <ActivityCreateOrEditDialog
      :activity="selectedActivity"
      :dialog-mode="`EDIT`"
      :showDialog="showEditActivityDialog"
      v-on:save-confirmed="saveExistingActivity"
      v-on:discard="discardActivityChange"
    ></ActivityCreateOrEditDialog>
  </div>
</template>
