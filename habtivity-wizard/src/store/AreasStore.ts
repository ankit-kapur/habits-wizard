/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { firestoreDatabase } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  Unsubscribe,
  updateDoc,
} from "firebase/firestore";
import { defineStore } from "pinia";

interface State {
  areasList: Area[];
  unsubscribeHooks: Unsubscribe[];
}

// Replace with Generics <T> across all stores.
// See: https://medium.com/swlh/using-firestore-with-typescript-65bd2a602945
const firestoreConvertor: FirestoreDataConverter<Area> = {
  toFirestore: (data: Area) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Area,
};

const firestoreCollection = collection(
  firestoreDatabase,
  "areas"
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
    subscribeToStore() {
      console.log("🔥 🔥 🔥 LOADING Areas list from FireStore.");

      const queryToLoadAreas = query(firestoreCollection); // , where("title", "!=", "CA")
      const unsubscribe: Unsubscribe = onSnapshot(
        queryToLoadAreas,
        (querySnapshot: QuerySnapshot<Area>) => {
          this.areasList = querySnapshot.docs.map((document) => {
            const area: Area = document.data();
            area.id = document.id;
            return area;
          });

          console.log("🔥 🔥 🔥 Snapshot updated. Refreshing areasList");
        }
      );
      this.unsubscribeHooks.push(unsubscribe);
    },

    unsubscribe() {
      this.unsubscribeHooks.forEach((unsubscribeHook) => unsubscribeHook());
    },

    getAreaById(areaId: string): Area {
      const area: Area = this.areasList.find((area) => area.id === areaId)!;
      return area;
    },
    getAreasList(): Area[] {
      console.log("🔥 🔥 🔥 Getting Areas list from FireStore.");
      return this.areasList;
    },

    // -------------------------------------------- Save
    createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));
      addDoc(firestoreCollection, area);
    },

    async updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));
      updateDoc(doc(firestoreCollection, area.id), area);
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      console.log("Deleting area: " + JSON.stringify(area));
      deleteDoc(doc(firestoreCollection, area.id));
    },
  },
});
