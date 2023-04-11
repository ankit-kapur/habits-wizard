/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { firestoreDatabase } from "@/firebase";
import CategoryTag from "@/model/pojo/main/CategoryTag";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";

interface State {
  categoryTagsList: CategoryTag[];
  unsubscribeHooks: Unsubscribe[];
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<CategoryTag> = {
  toFirestore: (data: CategoryTag) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    snapshot.data() as CategoryTag,
};

const firestoreCollection = collection(
  firestoreDatabase,
  "categoryTags"
).withConverter(firestoreConvertor);

export const useCategoryTagsStore = defineStore("CategoryTagsStore", {
  // Initial state.
  state: (): State => {
    return {
      categoryTagsList: [],
      unsubscribeHooks: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    // -------------------------------------------- Subscribe & Unsubscribe
    subscribeToStore() {
      console.log("🔥 🔥 🔥 LOADING CATEGORY TAGS list from FireStore.");
      const queryToLoad = query(firestoreCollection); // , where("title", "!=", "CA")
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoad,
        (querySnapshot: QuerySnapshot<CategoryTag>) => {
          this.categoryTagsList = querySnapshot.docs.map((document) => {
            const categoryTag: CategoryTag = document.data();
            categoryTag.id = document.id;
            return categoryTag;
          });
          console.log(
            "🔥 🔥 🔥 Snapshot updated. Refreshed category tags: " +
              JSON.stringify(this.categoryTagsList)
          );
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // -------------------------------------------- Queries
    getCategoryTagsList(): CategoryTag[] {
      console.log(
        "🔥 🔥 🔥 getCategoryTagsList() ====> " +
          JSON.stringify(this.categoryTagsList)
      );
      return this.categoryTagsList;
    },

    getCategoryById(categoryTagId: string): CategoryTag {
      return this.categoryTagsList.find(
        (categoryTag) => categoryTag.id === categoryTagId
      )!;
    },

    getCategoriesByIDs(categoryIDs: string[]): CategoryTag[] {
      return this.categoryTagsList.filter((categoryTag) =>
        categoryIDs.includes(categoryTag.id)
      );
    },

    // -------------------------------------------- Create
    createCategoryTag(categoryTag: CategoryTag) {
      console.log("Creating categoryTag: " + JSON.stringify(categoryTag));
      addDoc(firestoreCollection, categoryTag);
    },

    // -------------------------------------------- Update
    async updateCategoryTag(categoryTag: CategoryTag) {
      console.log("Updating categoryTag: " + JSON.stringify(categoryTag));
      updateDoc(doc(firestoreCollection, categoryTag.id), categoryTag);
    },

    // -------------------------------------------- Delete
    deleteCategoryTag(categoryTag: CategoryTag) {
      console.log("Deleting categoryTag: " + JSON.stringify(categoryTag));
      deleteDoc(doc(firestoreCollection, categoryTag.id));
    },
  },
});
