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
import { getDocReference } from "@/utils/firebase/FirestoreUtils";
import { getCurrentUserId } from "@/utils/firebase/GoogleAuthUtils";
import MeasurableDefinition from "@/model/pojo/definitions/MeasurableDefinition";
import { v4 as uuid } from "uuid";

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
      // Generate a new ID
      area.id = uuid();
      // Set user ID
      area.userId = this.userId;

      // Set timestamps
      const currentTimestamp: number = Date.now().valueOf();
      area.createdAt = currentTimestamp;
      area.lastUpdatedAt = currentTimestamp;

      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Save to Firestore
      setDoc(getDocReference(area.id, collectionName, firestoreDB), area);
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
     * @param areaId
     */
    deleteArea(areaId: string) {
      console.log("Deleting area: " + areaId);
      deleteDoc(doc(firestoreCollection, areaId));
    },

    // ? ------------------------------------ MEASURABLES ------------------------------------

    getMeasurablesInArea(areaId: string): MeasurableDefinition[] {
      const area: Area = this.getAreaById(areaId);
      return area.measurableDefinitions;
    },

    /**
     * Measurables-related operations
     */
    updateMeasurableDefinition(
      measurableDefinition: MeasurableDefinition,
      areaId: string
    ) {
      const area: Area = this.getAreaById(areaId);

      // Remove existing one
      area.measurableDefinitions = area.measurableDefinitions.filter(
        (measurable) => measurable.id !== measurableDefinition.id
      );

      // Push new one
      area.measurableDefinitions.push(measurableDefinition);
      this.updateArea(area);
    },

    createMeasurableDefinition(
      measurableDefinition: MeasurableDefinition,
      areaId: string
    ) {
      // Generate UUID
      measurableDefinition.id = uuid();
      const area: Area = this.getAreaById(areaId);
      // Push the new one.
      area.measurableDefinitions.push(measurableDefinition);
      this.updateArea(area); // Save
    },

    deleteMeasurableDefinition(measurableDefinitionId: string, areaId: string) {
      const area: Area = this.getAreaById(areaId);

      console.log(
        "Deleting measurableDefinitionId " +
          measurableDefinitionId +
          " from area:" +
          JSON.stringify(area)
      );

      area.measurableDefinitions = area.measurableDefinitions.filter(
        (measurable) => measurable.id !== measurableDefinitionId
      );

      this.updateArea(area);
    },

    // -------------------------------------------- Private functions
  },
});
