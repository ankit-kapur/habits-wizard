/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase as firestoreDB } from "@/firebase";
import Activity from "@/model/pojo/definitions/Activity";
import CategoryTag from "@/model/pojo/definitions/CategoryTag";
import { getDocReference } from "@/utils/firebase/FirestoreUtils";
import { getCurrentUserId } from "@/utils/firebase/GoogleAuthUtils";
import {
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from "firebase/firestore";
import { defineStore } from "pinia";
import { v4 as uuid } from "uuid";

interface State {
  allDocs: CategoryTag[];
  unsubscribeHooks: Unsubscribe[];
  userId: string;
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<CategoryTag> = {
  toFirestore: (data: CategoryTag) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    snapshot.data() as CategoryTag,
};

const collectionName = FirestoreConstants.CATEGORY_TAGS_COLLECTION_NAME;
const firestoreCollection = collection(
  firestoreDB,
  collectionName
).withConverter(firestoreConvertor);

export const useCategoryTagsStore = defineStore("CategoryTagsStore", {
  // Initial state.
  state: (): State => {
    return {
      allDocs: [],
      unsubscribeHooks: [],
      userId: getCurrentUserId()!,
    };
  },
  // Getters
  getters: {},
  actions: {
    // -------------------------------------------- Subscribe & Unsubscribe
    subscribeToStore() {
      console.log("🗞️ Subscribing to CATEGORIES store.");
      const queryToLoad = query(
        firestoreCollection,
        where(FirestoreConstants.USER_ID_ATTRIBUTE, "==", this.userId)
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoad,
        (snapshot: QuerySnapshot<CategoryTag>) => {
          this.allDocs = snapshot.docs.map((doc) => doc.data());
          console.log("💾 Snapshot updated. Refreshed categories.");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      console.log("Unsubscribing from the Categories store.");
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // -------------------------------------------- Queries
    getCategoryTagsList(): CategoryTag[] {
      // Sort by Title.
      this.allDocs.slice().sort((a, b) => a.title.localeCompare(b.title));
      return this.allDocs;
    },

    getCategoryById(categoryTagId: string): CategoryTag {
      return this.allDocs.find(
        (categoryTag) => categoryTag.id === categoryTagId
      )!;
    },

    getCategoriesByIDs(categoryIDs: string[]): CategoryTag[] {
      return this.allDocs.filter((categoryTag) =>
        categoryIDs.includes(categoryTag.id)
      );
    },

    getActivityColor(activity: Activity | null): string {
      if (!activity) return "";
      return this.getCategoryById(activity.categoryId).color;
    },

    // -------------------------------------------- Create
    createCategoryTag(categoryTag: CategoryTag): void {
      // Generate doc ID
      const newID: string = uuid();
      categoryTag.id = newID;

      // Set user ID
      categoryTag.userId = getCurrentUserId()!;

      // Set timestamps
      const currentTimestamp: number = Date.now().valueOf();
      categoryTag.createdAt = currentTimestamp;
      categoryTag.lastUpdatedAt = currentTimestamp;

      console.log("Creating categoryTag: " + JSON.stringify(categoryTag));

      // Save to Firestore
      setDoc(getDocReference(newID, collectionName, firestoreDB), categoryTag);
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
