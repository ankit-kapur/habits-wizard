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
  updateDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";

interface State {
  // Key = areaId
  areas: Record<string, Area>;
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
      areas: {},
    };
  },
  // Getters
  getters: {},
  actions: {
    async loadData() {
      const areasSnapshot = await getDocs(areasCollection);

      // const areasList: Area[] = areasSnapshot.docs.map((doc) => {
      //   return doc.data();
      // });

      areasSnapshot.docs.forEach((document) => {
        const loadedDoc: Area = document.data();
        loadedDoc.id = document.id;
        this.areas[document.id] = loadedDoc;
      });

      // this.areas = areasSnapshot.docs.map((document) => [
      //   document.id,
      //   document.data(),
      // ]);

      // return document.data();
      //   return [document.id, document.data()];
      // });

      console.log(
        "🚀 🚀 🚀 Snapshot from firebase: " + JSON.stringify(this.areas)
      );

      // // Load from static file
      // const areasList: Area[] = (await import("@/assets/dummydata/areas.json"))
      //   .default;

      // for (const area of areasList) {
      //   this.areas[area.id] = area;
      // }
    },
    getAreaById(areaId: string): Area {
      return this.areas[areaId];
    },
    getAreasList(): Area[] {
      console.log("Getting list of Areas from the Store");
      return Object.values(this.areas);
    },

    // -------------------------------------------- Save
    async createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Add to Firestore
      await addDoc(areasCollection, area);

      // const newDocID = uuid(); // Generate a new UUID
      // setDoc(doc(areasCollection, newDocID), area);

      // Add to static HashMap (i.e. Record)
      // this.areas[area.id] = area;
    },

    updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));

      // Add to Firestore
      updateDoc(doc(areasCollection, area.id), area);
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      // Shouldn't need to add validation for if area doesn't exist.
      console.log("Deleting area: " + JSON.stringify(area));

      // Delete from Firestore
      deleteDoc(doc(areasCollection, area.id));

      // Delete from HashMap (i.e. Record)
      // Vue.delete(this.areas, area.id);
    },
  },
});
