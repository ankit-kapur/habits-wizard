import { Area } from "@/model/pojo/main/Area";
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
    },
    getAreaById(areaId: string): Area {
      return this.areas[areaId];
    },
  },
});
