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

const areasCollection = collection(firestoreDatabase, "areas").withConverter(
  firestoreConvertor
);

export const useAreasStore = defineStore("AreasStore", {
  // Initial state.
  state: (): State => {
    return {
      // Load from Firebase DB eventually.
      areasList: [],
      unsubscribeHooks: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    subscribeToStore() {
      console.log("🔥 🔥 🔥 LOADING Areas list from FireStore.");

      const queryToLoadAreas = query(areasCollection); // , where("title", "!=", "CA")
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

      // const areasSnapshot: QuerySnapshot<Area> = await getDocs(areasCollection);
      // const docsSnapshot: QueryDocumentSnapshot<Area>[] = areasSnapshot.docs;

      // // Map to areasRecord
      // this.areasList = docsSnapshot.map((document) => {
      //   const area: Area = document.data();
      //   area.id = document.id;
      //   return area;
      // });
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
    // TODO -- The async is causing the parent v-ifs etc. to not get updated.
    createArea(area: Area) {
      console.log("Creating NEW area in store: " + JSON.stringify(area));

      // Add to Firestore
      addDoc(areasCollection, area);

      // // Add to areasRecord
      // promise.then((firestoreDoc): void => {
      //   // Copy over the ID that Firebase gave us.
      //   area.id = firestoreDoc.id;
      //   this.updateArea(area); // Hacky but works.

      //   this.areasRecord[firestoreDoc.id] = area;
      //   console.log("CREATED CREATED CREATED " + JSON.stringify(area));

      //   // TODO ---- Get the parent state to update (in AreasPage) after this.
      // });
    },

    async updateArea(area: Area) {
      console.log("Updating area in store: " + JSON.stringify(area));

      // Update in Firestore
      updateDoc(doc(areasCollection, area.id), area);
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      // Shouldn't need to add validation for if area doesn't exist.
      console.log("Deleting area: " + JSON.stringify(area));

      // Delete from Firestore
      deleteDoc(doc(areasCollection, area.id));

      // Delete from areasRecord
      // Vue.delete(this.areasList, area.id!);
    },
  },
});
