import { firestoreDatabase } from "@/firebase";
import { Area } from "@/model/pojo/definitions/Area";
import {
  collection,
  FirestoreDataConverter,
  getDocs,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { defineStore } from "pinia";
import Vue from "vue";

interface State {
  // Key = areaId
  areas: Record<string, Area>;
}

const firestoreConvertor: FirestoreDataConverter<Area> = {
  toFirestore: (data: Area) => data,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Area,
};

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
      const areasCollection = collection(
        firestoreDatabase,
        "areas"
      ).withConverter(firestoreConvertor);

      const areasSnapshot = await getDocs(areasCollection);
      const areasList: Area[] = areasSnapshot.docs.map((doc) => doc.data());

      console.log(
        "🚀 🚀 🚀 Snapshot from firebase: " + JSON.stringify(areasList)
      );

      // // Load from static file
      // const areasList: Area[] = (await import("@/assets/dummydata/areas.json"))
      //   .default;

      for (const area of areasList) {
        this.areas[area.id] = area;
      }

      return areasList.length;
    },
    getAreaById(areaId: string): Area {
      return this.areas[areaId];
    },
    getAreasList(): Area[] {
      console.log("Getting list of Areas from the Store");
      return Object.values(this.areas);
    },

    // -------------------------------------------- Save
    saveArea(area: Area) {
      console.log("Saving area to store: " + JSON.stringify(area));
      this.areas[area.id] = area;
    },

    // -------------------------------------------- Delete
    deleteArea(area: Area) {
      // Shouldn't need to add validation for if area doesn't exist.
      console.log("Deleting area: " + JSON.stringify(area));

      // delete this.areas[area.id];

      Vue.delete(this.areas, area.id);

      // this.areas.splice(this.areas.indexOf(area), 1);
      // this.areas = this.areas.filter((a)=>a.id !== area.id )
    },
  },
});
