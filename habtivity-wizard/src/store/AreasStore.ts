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
      console.log(
        "loaded areas.json ===> " + JSON.stringify(areasList) + "\n\n"
      );

      for (const area of areasList) {
        this.areas[area.id] = area;
      }
      console.log("this.areas ===> " + JSON.stringify(this.areas) + "\n\n");
    },
    getAreaById(areaId: string): Area {
      console.log(
        "getAreaById for " + areaId + " =======> " + this.areas[areaId] + "\n\n"
      );
      console.log(
        "AAAND this.areas ===> " + JSON.stringify(this.areas) + "\n\n"
      );
      return this.areas[areaId];
    },
  },
});
