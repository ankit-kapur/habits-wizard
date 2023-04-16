import { Activity } from "@/model/pojo/definitions/Activity";
import { defineStore } from "pinia";

interface State {
  // Key = thingId
  things: Record<string, Activity>;
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
      // const thingsList: Activity[] = (
      //   await import("@/assets/dummydata/things.json")
      // ).default;
      // console.log("loaded things.json");

      // for (const thing of thingsList) {
      //   this.things[thing.id] = thing;
      // }
      return {};
    },
    getThingById(thingId: string): Activity {
      return this.things[thingId];
    },
  },
});
