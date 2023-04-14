<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/main/CategoryTag";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";
import CategoryCreateOrEditDialog from "../dialogs/CategoryCreateOrEditDialog.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
    CategoryCreateOrEditDialog: CategoryCreateOrEditDialog,
  },
})
export default class CategorySelector extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  allItemsList!: CategoryTag[];
  @Prop()
  selectedItemIdList!: string[];
  @Prop()
  area!: Area;

  // ------------------------------------------------ Stores
  categoryTagsStore = useCategoryTagsStore();

  // ------------------------------------------------ Data
  showCreateCategoryDialog = false;
  showEditCategoryDialog = false;
  selectedCategoryTag: CategoryTag | null = null;
  selectedItemIdList_local: string[] = [];
  newCategoryTag: CategoryTag = defaultNewCategory;
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
      this.newCategoryTag.title = this.searchInput;
      this.showCreateCategoryDialog = true;
    }
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  createNewCategory(newCategoryTag: CategoryTag) {
    console.log("Saving new category");
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
   * Trigger when the (x) button is clicked on a chip
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
    <v-menu
      v-model="showCreateCategoryDialog"
      :close-on-content-click="false"
      :close-on-click="false"
      :nudge-top="240"
    >
      <template v-slot:activator="{ props }">
        <!-- * ------------------------ Chips auto-complete  -------------------------->
        <!-- https://v2.vuetifyjs.com/en/api/v-autocomplete/#props -->
        <!-- removed fields: clearable -->
        <v-autocomplete
          v-bind="props"
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
          variant="solo"
          hide-selected
          @input="searchInput = ''"
          @keydown.enter="promptForNewCategory"
          @keydown.enter.native.prevent
          :search-input.sync="searchInput"
          @change="onTagSelectionChange"
        >
          <!-- Notes about the modifiers above in <v-autocomplete> -->
          <!-- @update:search-input="promptForNewCategory" -->

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
              <v-icon class="mr-2">{{ data.item.icon }}</v-icon>
              {{ data.item.title }}
            </v-chip>
          </template>

          <!-- TODO --- Prepend icon -->
          <!-- <template v-slot:no-data=""></template>
          </template> -->

          <!-- * ------------ List item in dropdown ------------ * -->
          <!-- <template v-slot:item="{}"></template> -->

          <!-- <template v-slot:item="{ props, item }">
            <v-list-item
              v-bind="props"
              :prepend-avatar="item?.raw?.avatar"
              :title="item?.raw?.name"
              :subtitle="item?.raw?.group"
            ></v-list-item>
          </template> -->

          <!-- * ------------ (+) icon ------------ * -->
          <!-- eslint-disable vue/no-v-text-v-html-on-component -->
          <template v-slot:append-outer>
            <v-icon
              @click="showCreateCategoryDialog = true"
              v-text="'mdi-plus-circle-outline'"
            ></v-icon>
          </template>
        </v-autocomplete>
      </template>
    </v-menu>

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
