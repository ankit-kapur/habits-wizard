/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { firestoreDatabase } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  FirestoreDataConverter,
  getDocs,
  QueryDocumentSnapshot,
  QuerySnapshot,
  updateDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";
import Vue from "vue";

interface State {
  // Key = areaId
  areasRecord: Record<string, Area>;
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<Area> = {
  toFirestore: (data: Area) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Area,
};

const areasCollection = collection(firestoreDatabase, "areas").withConverter(
  firestoreConvertor
);

export const useAreasStore = defineStore("AreasStore", {
  // Initial state.
  state: (): State => {
    return {
      // Load from Firebase DB eventually.
      areasRecord: {},
    };
  },
  // Getters
  getters: {},
  actions: {
    async loadData() {
      // Take a snapshot
      const areasSnapshot: QuerySnapshot<Area> = await getDocs(areasCollection);
      const docsSnapshot: QueryDocumentSnapshot<Area>[] = areasSnapshot.docs;

      // Map to areasRecord
      docsSnapshot.forEach((document) => {
        const loadedDoc: Area = document.data();
        loadedDoc.id = document.id;
        this.areasRecord[document.id] = loadedDoc;
      });

      console.log(
        "🚀 🚀 🚀 Snapshot from firebase: " + JSON.stringify(this.areasRecord)
      );
      return docsSnapshot.length;
    },

    getAreaById(areaId: string): Area {
      return this.areasRecord[areaId];
    },
    getAreasList(): Area[] {
      console.log("Getting list of Areas from the Store");
      return Object.values(this.areasRecord);
    },

    // -------------------------------------------- Save
    // TODO -- The async is causing the parent v-ifs etc. to not get updated.
    async createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Add to Firestore
      const promise: Promise<DocumentReference> = addDoc(areasCollection, area);

      // Add to areasRecord
      promise.then((firestoreDoc): void => {
        // Copy over the ID that Firebase gave us.
        area.id = firestoreDoc.id;
        this.updateArea(area); // Hacky but works.

        this.areasRecord[firestoreDoc.id] = area;
        console.log("CREATED CREATED CREATED " + JSON.stringify(area));

        // TODO ---- Get the parent state to update (in AreasPage) after this.
      });
    },

    async updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));

      // Update in Firestore
      const promise: Promise<void> = updateDoc(
        doc(areasCollection, area.id),
        area
      );

      // Update to areasRecord
      promise.then((): void => {
        this.areasRecord[area.id!] = area;
        console.log("UPDATED UPDATED UPDATED " + JSON.stringify(area));
      });
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      // Shouldn't need to add validation for if area doesn't exist.
      console.log("Deleting area: " + JSON.stringify(area));

      // Delete from Firestore
      deleteDoc(doc(areasCollection, area.id));

      // Delete from areasRecord
      Vue.delete(this.areasRecord, area.id!);
    },
  },
});
