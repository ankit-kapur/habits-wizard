<script lang="ts">
import { defaultNewActivity } from "@/constants/DefaultDataForForms";
import { Activity } from "@/model/pojo/definitions/Activity";
import { Area } from "@/model/pojo/definitions/Area";
import { useActivitiesStore } from "@/store/ActivitiesStore";
import { deepCopy } from "deep-copy-ts";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CategoryCreateOrEditDialog from "../dialogs/CategoryCreateOrEditDialog.vue";

@Component({
  components: {
    CategoryCreateOrEditDialog: CategoryCreateOrEditDialog,
  },
})
export default class ActivitySelector extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  allItemsList!: Activity[];
  @Prop()
  selectedItemIdList!: string[];
  @Prop()
  area!: Area;

  /**
   * Watches parent variable. Sync's its value to the child.
   */
  @Watch("selectedItemIdList")
  @Watch("allItemsList")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPropertyChanged(_newValue: string, _oldValue: string) {
    this.selectedItemIdList_local = this.selectedItemIdList;

    console.log(
      "@Watch triggered in ActivitySelector. this.selectedItemIdList_local ===> " +
        JSON.stringify(this.selectedItemIdList_local)
    );
  }

  // ------------------------------------------------ Stores
  activitiesStore = useActivitiesStore();

  /**
   * TODO ---- hook these up.
   */
  onShow() {
    this.activitiesStore.subscribeToStore();
  }

  onHide() {
    this.activitiesStore.unsubscribe();
  }

  // ------------------------------------------------ Data
  showCreateCategoryDialog = false;
  showEditCategoryDialog = false;
  selectedActivity: Activity | null = null;
  selectedItemIdList_local: string[] = [];
  newActivity: Activity = deepCopy(defaultNewActivity);
  searchInput = "";

  // ------------------------------------------------ Methods
  mounted() {
    this.selectedItemIdList_local = this.selectedItemIdList;
  }

  promptForNewCategory() {
    // Checks if the searchInput text matches something from the dropdown.
    if (
      this.allItemsList.filter((e) => e.title.startsWith(this.searchInput))
        .length == 0
    ) {
      this.newActivity.title = this.searchInput;
      this.showCreateCategoryDialog = true;
    }
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  createNewCategory(newActivity: Activity) {
    console.log("Saving new category");
    const newId: string = this.activitiesStore.createActivity(newActivity);
    this.selectedItemIdList_local.push(newId);
    this.showCreateCategoryDialog = false;
  }

  triggerEditDialog(categoryTag: Activity) {
    console.log("triggerEditDialog");
    this.selectedActivity = categoryTag;
    this.showEditCategoryDialog = true;
  }

  saveExistingCategory(updatedActivity: Activity) {
    console.log("Saving new category");
    this.activitiesStore.updateActivity(updatedActivity);
    // Reset things.
    this.showEditCategoryDialog = false;
    this.selectedActivity = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discardCategoryChange(irrelevantValue: boolean) {
    console.log("Discardddding");
    this.showCreateCategoryDialog = false;
    this.showEditCategoryDialog = false;
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
      label="Categories"
      v-model="selectedItemIdList_local"
      :items="allItemsList"
      item-text="title"
      item-value="id"
      multiple
      hint="Select a tag or create a new one."
      color="blue-grey-lighten-2"
      hide-selected
      :hide-no-data="showCreateCategoryDialog"
      @input="searchInput = ''"
      :search-input.sync="searchInput"
      @keydown.enter="promptForNewCategory"
      @keydown.enter.native.prevent
      @change="onTagSelectionChange"
      :menu-props="{
        closeOnContentClick: false,
        closeOnClick: true,
        openOnClick: false,
      }"
      :disabled="showEditCategoryDialog"
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
          @click="showCreateCategoryDialog = true"
          v-text="'mdi-plus-circle-outline'"
        ></v-icon>
      </template>
    </v-autocomplete>

    <!-- TODO ----- Make this new component -->
    <!-- * ------------------------ New Activity popup  -------------------------->
    <CategoryCreateOrEditDialog
      :categoryTag="newActivity"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateCategoryDialog"
      v-on:save-confirmed="createNewCategory"
      v-on:discard="discardCategoryChange"
    ></CategoryCreateOrEditDialog>

    <CategoryCreateOrEditDialog
      :categoryTag="selectedActivity"
      :dialog-mode="`EDIT`"
      :showDialog="showEditCategoryDialog"
      v-on:save-confirmed="saveExistingCategory"
      v-on:discard="discardCategoryChange"
    ></CategoryCreateOrEditDialog>
  </div>
</template>
