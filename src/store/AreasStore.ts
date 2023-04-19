/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase as firestoreDB } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
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
import { getDocReference } from "@/utils/firebase/FirestoreUtils";
import { getCurrentUserId } from "@/utils/firebase/GoogleAuthUtils";

interface State {
  allDocs: Area[];
  unsubscribeHooks: Unsubscribe[];
  userId: string;
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<Area> = {
  toFirestore: (data: Area) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Area,
};

const collectionName = FirestoreConstants.AREA_COLLECTION_NAME;
const firestoreCollection = collection(
  firestoreDB,
  collectionName
).withConverter(firestoreConvertor);

export const useAreasStore = defineStore("AreasStore", {
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
    /**
     * Subscribes a listener to load ALL areas by query.
     */
    subscribeToLoadAllQuery() {
      console.log("🗞️ Subscribing to AREAS store.");

      const queryToLoadAreas = query(
        firestoreCollection,
        where(FirestoreConstants.USER_ID_ATTRIBUTE, "==", this.userId)
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoadAreas,
        (snapshot: QuerySnapshot<Area>) => {
          this.allDocs = snapshot.docs.map((doc) => doc.data());
          console.log("🔥 🔥 🔥 Snapshot updated. Refreshing areasList");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    /* Detaches all listeners. */
    unsubscribeAll() {
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // * -------------------------------------------- CRUD operations
    /**
     * Gets a specific area
     * @param areaId
     * @returns
     */
    getAreaById(areaId: string): Area {
      const area: Area = this.allDocs.find((area) => area.id === areaId)!;
      return area;
    },

    /**
     * Gets all Area objects
     * @returns list of Areas
     */
    getAreasList(): Area[] {
      // Sort by Title.
      this.allDocs.slice().sort((a, b) => a.title.localeCompare(b.title));
      return this.allDocs;
    },

    /**
     * Creates a new Area in Firestore.
     * @param area
     */
    createArea(area: Area) {
      // Generate doc ID
      const newID: string = uuid();
      area.id = newID;

      // Set user ID
      area.userId = this.userId;

      // Set timestamps
      const currentTimestamp: number = Date.now().valueOf();
      area.createdAt = currentTimestamp;
      area.lastUpdatedAt = currentTimestamp;

      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Save to Firestore
      setDoc(getDocReference(newID, collectionName, firestoreDB), area);
      return newID;
    },

    /**
     * Updates the given Area in Firestore.
     * @param area
     */
    async updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));
      // Update timestamp
      area.lastUpdatedAt = Date.now().valueOf();
      // delete area.createdAt;
      // Save
      updateDoc(doc(firestoreCollection, area.id), area);
    },

    /**
     * Deletes the given Area from Firestore.
     * @param area
     */
    deleteArea(area: Area) {
      console.log("Deleting area: " + JSON.stringify(area));
      deleteDoc(doc(firestoreCollection, area.id));
    },

    // -------------------------------------------- Private functions
  },
});
