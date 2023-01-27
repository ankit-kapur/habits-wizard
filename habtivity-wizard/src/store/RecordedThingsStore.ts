import { RecordedThing } from "@/model/pojo/main/RecordedThing";
import { defineStore } from "pinia";

interface State {
  // Key = recordedThingId
  recordedThingsList: RecordedThing[];
}

export const useRecordedThingsStore = defineStore("RecordedThingsStore", {
  // Initial state.
  state: (): State => {
    return {
      // Load from Firebase DB eventually.
      recordedThingsList: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    async loadData() {
      this.recordedThingsList = (
        await import("@/assets/dummydata/recordedThings.json")
      ).default;
      console.log("loaded recordedThings.json");
    },
    getRecordedThingsByDay(): RecordedThing[] {
      // TODO: should take Date as argument.
      return this.recordedThingsList;
    },
  },
});
