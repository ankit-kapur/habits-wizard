import { Thing } from "@/model/pojo/main/Thing";
import { defineStore } from "pinia";

interface State {
  // Key = thingId
  things: Record<string, Thing>;
}

export const useThingsStore = defineStore("ThingsStore", {
  // Initial state.
  state: (): State => {
    return {
      // Load from Firebase DB eventually.
      things: {},
    };
  },
  // Getters
  getters: {},
  actions: {
    async loadData() {
      const thingsList: Thing[] = (
        await import("@/assets/dummydata/things.json")
      ).default;
      console.log("loaded things.json");

      for (const thing of thingsList) {
        this.things[thing.id] = thing;
      }
    },
    getThingById(thingId: string): Thing {
      return this.things[thingId];
    },
  },
});
