<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CategoryCreateOrEditDialog from "../dialogs/CategoryCreateOrEditDialog.vue";

@Component({
  components: {
    CategoryCreateOrEditDialog: CategoryCreateOrEditDialog,
  },
})
export default class CategorySelector extends Vue {
  /**
   * * ------------------------------------------------ Props
   */
  @Prop()
  area!: Area;
  @Prop()
  allItemsList!: CategoryTag[];
  @Prop()
  selectedItemIdList!: string[];
  @Prop()
  isDisplayed!: boolean;

  /**
   * * ------------------------------------------------ Watchers
   */
  @Watch("selectedItemIdList")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onListsChange(_newValue: string, _oldValue: string) {
    this.selectedItemIdList_local = this.selectedItemIdList;

    console.log(
      "@Watch triggered in CategorySelector. this.selectedItemIdList_local ===> " +
        JSON.stringify(this.selectedItemIdList_local)
    );
  }

  @Watch("isDisplayed")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDisplayStateChange(_newValue: string, _oldValue: string) {
    const isDialogOpen = !!_newValue;
    console.log(
      "👀 @Watch in CategorySelector. isDialogOpen ===> " + isDialogOpen
    );
    if (isDialogOpen) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  /**
   * * ------------------------------------------------ Stores
   */
  categoryTagsStore = useCategoryTagsStore();

  /**
   * * ------------------------------------------------ Data
   */
  showCreateCategoryDialog = false;
  showEditCategoryDialog = false;
  selectedCategoryTag: CategoryTag | null = null;
  selectedItemIdList_local: string[] = [];
  newCategoryTag: CategoryTag = defaultNewCategory;
  searchInput = "";

  /**
   * * ------------------------------------------------ Lifecycle actions
   */
  mounted() {
    this.selectedItemIdList_local = this.selectedItemIdList;
    this.onShow();
  }

  onShow() {
    this.categoryTagsStore.subscribeToStore(); // Subscribe to store
  }

  onHide() {
    this.categoryTagsStore.unsubscribe(); // Unsubscribe from store
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  /**
   * * ------------------------------------------------ Actions
   */
  promptForNewCategory() {
    // Checks if the searchInput text matches something from the dropdown.
    if (
      this.allItemsList.filter((e) => e.title.startsWith(this.searchInput))
        .length == 0
    ) {
      this.newCategoryTag.title = this.searchInput;
      this.showCreateCategoryDialog = true;
    }
  }

  createNewCategory(newCategoryTag: CategoryTag) {
    console.log("Saving new category...");
    const newId: string =
      this.categoryTagsStore.createCategoryTag(newCategoryTag);
    this.selectedItemIdList_local.push(newId);
    this.showCreateCategoryDialog = false;
  }

  triggerEditDialog(categoryTag: CategoryTag) {
    console.log("triggerEditDialog");
    this.selectedCategoryTag = categoryTag;
    this.showEditCategoryDialog = true;
  }

  saveExistingCategory(updatedCategoryTag: CategoryTag) {
    console.log("Saving new category");
    this.categoryTagsStore.updateCategoryTag(updatedCategoryTag);
    // Reset things.
    this.showEditCategoryDialog = false;
    this.selectedCategoryTag = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  discardCategoryChange(irrelevantValue: boolean) {
    console.log("Discardddding");
    this.showCreateCategoryDialog = false;
    this.showEditCategoryDialog = false;
  }

  /**
   * When the (x) button is clicked on a chip
   * @param category
   */
  removeCategoryTagFromArea(category: CategoryTag) {
    const index = this.selectedItemIdList_local.indexOf(category.id);
    if (index >= 0) this.selectedItemIdList_local.splice(index, 1);
  }
}
</script>

<template>
  <div class="text-center">
    <v-card flat>
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-0 ma-0 text-h6 font-weight-light"
          >Categories</v-card-title
        >

        <!-- * ------------------------ Auto-complete for chips  -------------------------->
        <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
        <!-- removed fields: clearable -->
        <v-autocomplete
          loading
          auto-select-first
          chips
          deletable-chips
          label=""
          v-model="selectedItemIdList_local"
          :items="allItemsList"
          item-text="title"
          item-value="id"
          multiple
          hint="Select a tag or create a new one."
          persistent-hint
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
              @click:close="removeCategoryTagFromArea(data.item)"
            >
              <v-icon class="mr-2" :color="data.item.color">
                mdi-circle
              </v-icon>
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
                    <v-icon class="pr-4">{{ item.icon }}</v-icon>
                    <span>{{ item.title }}</span>
                    <v-spacer></v-spacer>
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
      </v-card-text>
    </v-card>

    <!-- * ------------------------ New category popup  -------------------------->
    <CategoryCreateOrEditDialog
      :categoryTag="newCategoryTag"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateCategoryDialog"
      v-on:save-confirmed="createNewCategory"
      v-on:discard="discardCategoryChange"
    ></CategoryCreateOrEditDialog>

    <CategoryCreateOrEditDialog
      :categoryTag="selectedCategoryTag"
      :dialog-mode="`EDIT`"
      :showDialog="showEditCategoryDialog"
      v-on:save-confirmed="saveExistingCategory"
      v-on:discard="discardCategoryChange"
    ></CategoryCreateOrEditDialog>
  </div>
</template>
