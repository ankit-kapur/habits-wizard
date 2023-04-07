import { firestoreDatabase } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
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
    },
    getAreaById(areaId: string): Area {
      return this.areasRecord[areaId];
    },
    getAreasList(): Area[] {
      console.log("Getting list of Areas from the Store");
      return Object.values(this.areasRecord);
    },

    // -------------------------------------------- Save
    async createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Add to Firestore
      await addDoc(areasCollection, area);

      // const newDocID = uuid(); // Generate a new UUID
      // setDoc(doc(areasCollection, newDocID), area);

      // Add to areasRecord
      this.areasRecord[area.id] = area;
    },

    updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));

      // Update in Firestore
      updateDoc(doc(areasCollection, area.id), area);

      // Update to areasRecord
      this.areasRecord[area.id] = area;
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      // Shouldn't need to add validation for if area doesn't exist.
      console.log("Deleting area: " + JSON.stringify(area));

      // Delete from Firestore
      deleteDoc(doc(areasCollection, area.id));

      // Delete from areasRecord
      Vue.delete(this.areasRecord, area.id);
    },
  },
});
