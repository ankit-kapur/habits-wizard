import Thing from "@/model/pojo/main/Thing";
import { defineStore } from "pinia";

export interface State {
  // TODO: change to DICTIONARY
  // TODO: Hook this up with FIREBASE to see potential CRUD issues
  things: Thing[];
}

export const useHabitsStore = defineStore("HabitsStore", {
  // Initial state. TODO: Load from Firebase DB.
  state: (): State => {
    return {
      things: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    nothingJustLog() {
      console.log(this.things);
    },
    async fillData() {
      // TODO: Fix JSON data to match schema
      this.things = (await import("@/assets/dummydata/things.json")).default;
    },
    morningHabits(): Thing[] {
      // TODO: Filter by time
      return this.things.slice(0, 2);
    },
    afternoonHabits(): Thing[] {
      return this.things.slice(2, 4);
    },
  },
});
