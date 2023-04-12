<script lang="ts">
import { defaultNewCategory } from "@/constants/DefaultDataForForms";
import { Area } from "@/model/pojo/definitions/Area";
import CategoryTag from "@/model/pojo/main/CategoryTag";
import { useCategoryTagsStore } from "@/store/CategoryTagsStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import ConfirmationDialog from "../dialogs/ConfirmationDialog.vue";

@Component({
  components: {
    ConfirmationDialog: ConfirmationDialog,
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
  showDialogForConfirmDiscard = false;
  selectedItemIdList_local: string[] = [];
  searchText = "";
  newCategoryTag: CategoryTag = defaultNewCategory;

  // ------------------------------------------------ Methods
  mounted() {
    this.selectedItemIdList_local = this.selectedItemIdList;
    this.resetNewCategoryData();
  }

  resetNewCategoryData() {
    this.newCategoryTag = defaultNewCategory;
  }

  promptForNewCategory(searchWord: string) {
    // If none of the existing categoryTags match.
    if (
      searchWord &&
      this.allItemsList.filter((value) =>
        value.title.toLowerCase().startsWith(searchWord.toLowerCase())
      ).length === 0
    ) {
      // Nothing matched. Show create dialog.
      this.showCreateCategoryDialog = true;
    } else {
      this.showCreateCategoryDialog = false;
    }
    this.searchText = searchWord;
  }

  // Update parent
  onTagSelectionChange() {
    this.$emit("category-tags-changed", this.selectedItemIdList_local);
  }

  respondToConfirmDiscardDialog(isConfirmed: boolean): void {
    if (isConfirmed) {
      console.log("DISCARDING");
      this.resetNewCategoryData();
      this.showCreateCategoryDialog = false;
    } else {
      console.log("NOT DISCARDING");
    }
    this.showDialogForConfirmDiscard = false;
  }

  saveNewCategory() {
    // TODO: Call store
    console.log("Saving new category");
    this.categoryTagsStore.createCategoryTag(this.newCategoryTag);
    this.resetNewCategoryData();
    this.showCreateCategoryDialog = false;
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
        <v-autocomplete
          v-bind="props"
          loading
          auto-select-first
          chips
          closable-chips
          deletable-chips
          clearable
          label="Categories"
          v-model="selectedItemIdList_local"
          :items="allItemsList"
          item-text="title"
          item-value="id"
          multiple
          color="blue-grey-lighten-2"
          variant="solo"
          hide-no-data
          @update:search-input="promptForNewCategory"
          @change="onTagSelectionChange"
        >
          <!-- ? TODO --- P2 --- Text should disappear after chip is selected -->
        </v-autocomplete>
      </template>

      <!-- TODO --- Make the popup below work. 
                    [ ] Hook up the category store. -->

      <!-- * ------------------------ New category popup  -------------------------->
      <v-card>
        <v-list>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>New Category</v-list-item-title>
              <v-list-item-subtitle>Click save to create</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn icon>
                <v-icon>{{ newCategoryTag.icon }}</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list>
          <v-list-item>
            <v-list-item-title>Name</v-list-item-title>
            <v-list-item-action-text>
              <v-text-field v-model="searchText"></v-text-field>
            </v-list-item-action-text>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDialogForConfirmDiscard = true">
            Cancel
          </v-btn>
          <v-btn text color="primary" @click="saveNewCategory"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- CONFIRMATION dialog for discarding a recorded thing -->
    <ConfirmationDialog
      v-on:confirm-status-change="respondToConfirmDiscardDialog"
      :showDialog="showDialogForConfirmDiscard"
      messageToDisplay="Sure you want to delete this?"
    />
  </div>
</template>
