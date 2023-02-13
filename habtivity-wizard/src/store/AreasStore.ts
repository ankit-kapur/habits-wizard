import { Area } from "@/model/pojo/definitions/Area";
import { defineStore } from "pinia";

interface State {
  // Key = areaId
  areas: Record<string, Area>;
}

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
      const areasList: Area[] = (await import("@/assets/dummydata/areas.json"))
        .default;

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
  },
});
