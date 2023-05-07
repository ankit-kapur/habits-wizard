<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import CategoryWizard from "@/components/dialogs/CategoryWizard.vue";
import CategoryChips from "@/components/chips/CategoryChips.vue";
import { useAreasStore } from "@/store/AreasStore";

@Component({
  components: {
    CategoryWizard: CategoryWizard,
    CategoryChips: CategoryChips,
  },
})
export default class CategorySelector extends Vue {
  // <!-- * -------------------------------- Required Props ------------------------------->
  @Prop()
  area!: Area;
  @Prop()
  allItemsList!: CategoryTag[];
  @Prop()
  selectedItemIdList!: string[];
  @Prop()
  isDisplayed!: boolean;

  // <!-- * -------------------------------- Watchers ------------------------------->
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

  // <!-- * -------------------------------- Stores ------------------------------->
  areasStore = useAreasStore();

  // <!-- * -------------------------------- Data ------------------------------->
  showCreateCategoryDialog = false;
  showEditCategoryDialog = false;
  selectedCategoryTag: CategoryTag | null = null;
  selectedItemIdList_local: string[] = [];
  newCategoryTag: CategoryTag = defaultNewCategory;
  searchInput = "";

  // <!-- * -------------------------------- Lifecycle actions ------------------------------->
  mounted() {
    this.onShow();
    console.log("🐪 Mounted CategorySelector");
  }

  onShow() {
    this.selectedItemIdList_local = this.selectedItemIdList;
  }

  onHide() {
    // Unsubscribe from stores
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  get selectedCategories() {
    return this.allItemsList.filter((category) =>
      this.selectedItemIdList_local.includes(category.id)
    );
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

  triggerEditDialog(categoryTag: CategoryTag) {
    console.log("triggerEditDialog");
    this.selectedCategoryTag = categoryTag;
    this.showEditCategoryDialog = true;
  }

  closeCategoryWizard() {
    this.showCreateCategoryDialog = false;
    this.showEditCategoryDialog = false;
  }

  addNewlyCreatedCategory(newCategoryID: string) {
    // this.areasStore.addCategoryToArea();
    this.selectedItemIdList_local.push(newCategoryID);
    this.closeCategoryWizard();
    this.onTagSelectionChange(); // Let parent know.
  }

  /**
   * When the (x) button is clicked on a chip
   * @param category
   */
  removeCategoryTagFromArea(category: CategoryTag) {
    const index = this.selectedItemIdList_local.indexOf(category.id);
    if (index >= 0) this.selectedItemIdList_local.splice(index, 1);
    this.onTagSelectionChange(); // Let parent know.
  }
}
</script>

<template>
  <div>
    <v-card flat>
      <v-card-text class="pa-0 ma-0">
        <!-- * ---------------- Title -->
        <v-card-title class="pa-2 ma-0 text-h6 font-weight-light"
          >Categories</v-card-title
        >
        <v-card-subtitle class="pa-2 pt-3 text-caption font-weight-light">
          Select from the list, or create a new one.
        </v-card-subtitle>

        <!-- * ------------------------ Auto-complete for chips  -------------------------->
        <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
        <!-- removed fields: clearable -->
        <v-autocomplete
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
          color="primary"
          class="pt-2 px-2"
        >
          <!-- Notes about the modifiers above in <v-autocomplete> -->
          <!--      @input will reset the text-input to '' once tag is selected -->
          <!--      search-input.sync will bind the text-input to our variable -->

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

          <!-- * ------------ Chips component ------------ * -->
          <template v-slot:selection="data">
            <CategoryChips
              :categories="[data.item]"
              :hasCloseButton="true"
              :closeIcon="`mdi-close`"
              v-on:chip-clicked="triggerEditDialog"
              v-on:chip-closed="removeCategoryTagFromArea"
            />
          </template>

          <!-- ? ------------ List item in dropdown ------------ * -->
          <!-- eslint-disable vue/no-unused-vars -->
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <template v-slot:item="{ item, attrs, on }">
            <v-list-item v-on="on" v-bind="attrs" #default="{ active }">
              <v-list-item-content>
                <v-list-item-title>
                  <v-row no-gutters align="center">
                    <v-icon class="pr-4" :color="item.color">
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
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <!-- <template v-slot:append-outer>
            <v-icon
              @click="showCreateCategoryDialog = true"
              v-text="'mdi-plus-circle-outline'"
            ></v-icon>
          </template> -->

          <!--  -->
        </v-autocomplete>
      </v-card-text>

      <!-- ? ------------ (+) icon ------------ * -->
      <v-card-actions class="mt-4">
        <v-spacer />
        <v-btn outlined rounded @click="showCreateCategoryDialog = true">
          <v-icon class="pr-2"> mdi-plus </v-icon>
          Add
        </v-btn>
        <v-spacer />
      </v-card-actions>

      <!--  -->
    </v-card>

    <!-- * ------------------------ New category popup  -------------------------->
    <CategoryWizard
      :categoryTag="newCategoryTag"
      :area="area"
      :dialog-mode="`CREATE`"
      :showDialog="showCreateCategoryDialog"
      v-on:close="closeCategoryWizard"
      v-on:new-category-created="addNewlyCreatedCategory"
    />

    <CategoryWizard
      :categoryTag="selectedCategoryTag"
      :area="area"
      :dialog-mode="`EDIT`"
      :showDialog="showEditCategoryDialog"
      v-on:close="closeCategoryWizard"
    />
  </div>
</template>
