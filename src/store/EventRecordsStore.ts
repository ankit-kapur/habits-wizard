/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FirestoreConstants } from "@/constants/FirestoreConstants";
import { firestoreDatabase as firestoreDB } from "@/firebase";
import EventRecord from "@/model/pojo/records/EventRecord";
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
  allDocs: EventRecord[];
  unsubscribeHooks: Unsubscribe[];
  userId: string;
}

// TODO --------- Make these:
// ?              (1) Recording dialog to CREATE & EDIT an EventRecord
// ?              (2) Home screen for VIEW EventRecords

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<EventRecord> = {
  toFirestore: (data: EventRecord) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) =>
    snapshot.data() as EventRecord,
};

const collectionName = FirestoreConstants.EVENT_RECORDS_COLLECTION_NAME;

const firestoreCollection = collection(
  firestoreDB,
  collectionName
).withConverter(firestoreConvertor);

export const useEventRecordsStore = defineStore("EventRecordsStore", {
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
      console.log("🗞️ Subscribing to EventRecords store.");
      const queryToLoad = query(
        firestoreCollection,
        where(FirestoreConstants.USER_ID_ATTRIBUTE, "==", this.userId)
      );
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoad,
        (snapshot: QuerySnapshot<EventRecord>) => {
          this.allDocs = snapshot.docs.map((doc) => doc.data());
          console.log("🔥 🔥 🔥 Snapshot updated. Refreshed EventRecords.");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      console.log("Unsubscribing from the EventRecordsStore");
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    // ? -------------------------------------------- Queries --------------------------------------------
    getAllDocs(): EventRecord[] {
      // Sort by Title.
      this.allDocs.slice().sort((a, b) => a.createdAt! - b.createdAt!);
      return this.allDocs;
    },

    getEventRecordsByArea(areaId: string): EventRecord[] {
      return this.getAllDocs().filter(
        (eventRecord) => eventRecord.areaId === areaId
      );
    },

    getDocById(eventRecordId: string): EventRecord {
      return this.allDocs.find(
        (eventRecord) => eventRecord.id === eventRecordId
      )!;
    },

    // ? -------------------------------------------- Create --------------------------------------------
    createEventRecord(eventRecord: EventRecord, areaId: string): string {
      // Generate doc ID
      const newID: string = uuid();
      eventRecord.id = newID;

      // Set user ID
      eventRecord.userId = getCurrentUserId()!;

      // Set Area ID
      eventRecord.areaId = areaId;

      // Set timestamps
      const currentTimestamp: number = Date.now().valueOf();
      eventRecord.createdAt = currentTimestamp;
      eventRecord.lastUpdatedAt = currentTimestamp;

      console.log("Creating eventRecord: " + JSON.stringify(eventRecord));

      // Save to Firestore
      setDoc(getDocReference(newID, collectionName, firestoreDB), eventRecord);
      return newID;
    },

    // ? -------------------------------------------- Update --------------------------------------------
    async updateEventRecord(eventRecord: EventRecord) {
      // Update timestamp
      const currentTimestamp: number = Date.now().valueOf();
      eventRecord.lastUpdatedAt = currentTimestamp;

      console.log("Updating eventRecord: " + JSON.stringify(eventRecord));
      updateDoc(doc(firestoreCollection, eventRecord.id), eventRecord);
    },

    // ? -------------------------------------------- Delete --------------------------------------------
    deleteEventRecord(eventRecord: EventRecord) {
      console.log("Deleting eventRecord: " + JSON.stringify(eventRecord));
      deleteDoc(doc(firestoreCollection, eventRecord.id));
    },
  },
});
