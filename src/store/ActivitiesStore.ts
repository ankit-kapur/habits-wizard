/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase as firestoreDB } from "@/firebase";
import Activity from "@/model/pojo/definitions/Activity";
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
  allDocs: Activity[];
  unsubscribeHooks: Unsubscribe[];
  userId: string;
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
      userId: getCurrentUserId()!,
    };
  },
  // Getters
  getters: {},
  actions: {
    // ? ---------------------------------- Subscribe & Unsubscribe ----------------------------------------
    subscribeToStore() {
      console.log("🗞️ Subscribing to ACTIVITIES store.");
      const queryToLoad = query(
        firestoreCollection,
        where(FirestoreConstants.USER_ID_ATTRIBUTE, "==", this.userId)
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoad,
        (snapshot: QuerySnapshot<Activity>) => {
          this.allDocs = snapshot.docs.map((doc) => doc.data());
          console.log("🔥 🔥 🔥 Snapshot updated. Refreshed ACTIVITIES list.");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      console.log("Unsubscribing from the ActivitiesStore");
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // ? -------------------------------------------- Queries --------------------------------------------
    getAllDocs(): Activity[] {
      // Sort by Title.
      this.allDocs.slice().sort((a, b) => a.title.localeCompare(b.title));
      return this.allDocs;
    },

    getActivitiesByArea(areaId: string): Activity[] {
      return this.getAllDocs().filter((activity) => activity.areaId === areaId);
    },

    getDocById(activityId: string): Activity {
      return this.allDocs.find((activity) => activity.id === activityId)!;
    },

    // ? -------------------------------------------- Create --------------------------------------------
    createActivity(activity: Activity, areaId: string): string {
      // Generate doc ID
      const newID: string = uuid();
      activity.id = newID;

      // Set user ID
      activity.userId = getCurrentUserId()!;

      // Set Area ID
      activity.areaId = areaId;

      // Set timestamps
      const currentTimestamp: number = Date.now().valueOf();
      activity.createdAt = currentTimestamp;
      activity.lastUpdatedAt = currentTimestamp;

      console.log("Creating activity: " + JSON.stringify(activity));

      // Save to Firestore
      setDoc(getDocReference(newID, collectionName, firestoreDB), activity);
      return newID;
    },

    // ? -------------------------------------------- Update --------------------------------------------
    async updateActivity(activity: Activity) {
      // Update timestamp
      const currentTimestamp: number = Date.now().valueOf();
      activity.lastUpdatedAt = currentTimestamp;

      console.log("Updating activity: " + JSON.stringify(activity));
      updateDoc(doc(firestoreCollection, activity.id), activity);
    },

    // ? -------------------------------------------- Delete --------------------------------------------
    deleteActivity(activity: Activity) {
      console.log("Deleting activity: " + JSON.stringify(activity));
      deleteDoc(doc(firestoreCollection, activity.id));
    },
  },
});
