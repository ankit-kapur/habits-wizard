/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
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
  Timestamp,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";
import { v4 as uuid } from "uuid";

interface State {
  areasList: Area[];
  unsubscribeHooks: Unsubscribe[];
}

// TODO P0 ---- Store timestamps as epoch.
//         ! Sorting isn't working because of Firestore's weird bug where it sometimes stores Timestamps as Maps.

// TODO P0 ---- Hook up "CreateCategory" component to store (for save)
//         ! Store for categories needs work. UUID, Timestamps.

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<Area> = {
  toFirestore: (data: Area) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Area,
};

const firestoreCollection = collection(
  firestoreDatabase,
  FirestoreConstants.AREA_COLLECTION_NAME
).withConverter(firestoreConvertor);

export const useAreasStore = defineStore("AreasStore", {
  // Initial state.
  state: (): State => {
    return {
      areasList: [],
      unsubscribeHooks: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    /**
     * Subscribes a listener to load ALL areas by query.
     */
    subscribeToLoadAllQuery() {
      console.log("🔥 🔥 🔥 LOADING Areas list from FireStore.");

      const queryToLoadAreas = query(
        firestoreCollection,
        orderBy(
          FirestoreConstants.CREATED_AT_ATTRIBUTE,
          FirestoreConstants.DESCENDING
        ) // Most recent on top
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoadAreas,
        (querySnapshot: QuerySnapshot<Area>) => {
          this.areasList = querySnapshot.docs.map((document) => {
            const area: Area = document.data();
            area.createdAt = this.convertFirestoreTimestamp(area.createdAt);
            return area;
          });
          console.log("🔥 🔥 🔥 Snapshot updated. Refreshing areasList");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    /**
     * Detaches all listeners.
     */
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
      const area: Area = this.areasList.find((area) => area.id === areaId)!;
      return area;
    },

    /**
     * Gets all Area objects
     * @returns list of Areas
     */
    getAreasList(): Area[] {
      console.log("🔥 🔥 🔥 Getting Areas list from FireStore.");
      return this.areasList;
    },

    /**
     * Creates a new Area in Firestore.
     * @param area
     */
    createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));
      const newID: string = uuid();
      const currentTimestamp: Timestamp = Timestamp.now();

      // Set new fields.
      area.id = newID;
      area.createdAt = currentTimestamp;
      area.lastUpdatedAt = currentTimestamp;

      // Save to Firestore
      setDoc(this.getDocReference(newID), area);
    },

    /**
     * Updates the given Area in Firestore.
     * @param area
     */
    async updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));
      // Update timestamp
      area.lastUpdatedAt = Timestamp.now();
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

    // * -------------------------------------------- Private functions
    /**
     * Makes a Firestore reference for the given doc ID
     * @param docID
     * @returns DocumentReference<T>
     */
    getDocReference(docID: string) {
      return doc(
        firestoreDatabase,
        FirestoreConstants.AREA_COLLECTION_NAME,
        docID
      );
    },

    /**
     * TODO: Move to a FirestoreUtils class.
     * Hack for dealing with Firestore's bug.
     * They occasionally store the timestamp as a Map for some reason.
     * @param givenTimestamp Timestamp from Firebase
     * @returns Timestamp
     */
    convertFirestoreTimestamp(givenTimestamp: unknown) {
      console.log(
        "🐞 🐞 🐞 🐞 🐞 TRYING TO CONVERT: " + JSON.stringify(givenTimestamp)
      );
      console.log("🐞 🐞 🐞 🐞 🐞 TYPE ====> " + typeof givenTimestamp);
      let convertedTimestamp: Timestamp;
      if (givenTimestamp instanceof Timestamp) {
        convertedTimestamp = givenTimestamp;
      } else if (givenTimestamp instanceof Object) {
        convertedTimestamp = new Timestamp(
          Object(givenTimestamp)["seconds"],
          Object(givenTimestamp)["nanoseconds"]
        );
      } else {
        console.log(
          "☠️ 💀 ☠️ 💀 ☠️ 💀 Unable to parse Timestamp given" +
            JSON.stringify(givenTimestamp)
        );
        return undefined;
      }
      console.log(
        "🐛 🐛 🐛 🐛 🐛 AFTER CONVERTING: " + JSON.stringify(convertedTimestamp)
      );
      console.log("🐛 🐛 🐛 🐛 🐛 TYPE ====> " + typeof convertedTimestamp);
      return convertedTimestamp;
    },
  },
});
