/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase as firestoreDB } from "@/firebase";
import { Activity } from "@/model/pojo/definitions/Activity";
import { getDocReference } from "@/utils/firebase/FirestoreUtils";
import { getCurrentUserId } from "@/utils/firebase/GoogleAuthUtils";
import {
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  onSnapshot,
  orderBy,
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
  allDocs: Activity[];
  unsubscribeHooks: Unsubscribe[];
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<Activity> = {
  toFirestore: (data: Activity) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    snapshot.data() as Activity,
};

const collectionName = FirestoreConstants.ACTIVITIES_COLLECTION_NAME;

const firestoreCollection = collection(
  firestoreDB,
  collectionName
).withConverter(firestoreConvertor);

export const useActivitiesStore = defineStore("ActivitiesStore", {
  // Initial state.
  state: (): State => {
    return {
      allDocs: [],
      unsubscribeHooks: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    // -------------------------------------------- Subscribe & Unsubscribe
    subscribeToStore() {
      console.log("🔥 🔥 🔥 LOADING CATEGORY TAGS list from FireStore.");
      const queryToLoad = query(
        firestoreCollection,
        orderBy(
          FirestoreConstants.CREATED_AT_ATTRIBUTE, // Most recent on top
          FirestoreConstants.DESCENDING
        ),
        where(FirestoreConstants.USER_ID_ATTRIBUTE, "==", getCurrentUserId + "")
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoad,
        (snapshot: QuerySnapshot<Activity>) => {
          this.allDocs = snapshot.docs.map((doc) => doc.data());
          console.log(
            "🔥 🔥 🔥 Snapshot updated. Refreshed category tags: " +
              JSON.stringify(this.allDocs)
          );
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // -------------------------------------------- Queries
    getAllDocs(): Activity[] {
      return this.allDocs;
    },

    getDocById(activityId: string): Activity {
      return this.allDocs.find((activity) => activity.id === activityId)!;
    },

    getDocsById(categoryIDs: string[]): Activity[] {
      return this.allDocs.filter((activity) =>
        categoryIDs.includes(activity.id)
      );
    },

    // -------------------------------------------- Create
    createActivity(activity: Activity): string {
      console.log("Creating activity: " + JSON.stringify(activity));
      const newID: string = uuid();
      activity.id = newID;
      activity.userId = getCurrentUserId()!;

      // Save to Firestore
      setDoc(getDocReference(newID, collectionName, firestoreDB), activity);
      return newID;
    },

    // -------------------------------------------- Update
    async updateActivity(activity: Activity) {
      console.log("Updating activity: " + JSON.stringify(activity));
      updateDoc(doc(firestoreCollection, activity.id), activity);
    },

    // -------------------------------------------- Delete
    deleteActivity(activity: Activity) {
      console.log("Deleting activity: " + JSON.stringify(activity));
      deleteDoc(doc(firestoreCollection, activity.id));
    },
  },
});
