import Habit from "@/pojo/HabitPojo";
import { defineStore } from "pinia";

export interface State {
  // TODO: Maybe change to DICTIONARY of habits?
  // TODO: Hook this up with FIREBASE to see which one works better,
  //       especially for UPDATES
  habitList: Habit[];
}

export const useHabitsStore = defineStore("HabitsStore", {
  // Initial state. TODO: Load from Firebase DB.
  state: (): State => {
    return {
      habitList: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    nothingJustLog() {
      console.log(this.habitList);
    },
    async fillData() {
      // TODO: Is this getting called automatically?
      this.habitList = (await import("@/assets/dummydata/habits.json")).default;
    },
    morningHabits(): Habit[] {
      // TODO: Filter by time
      return this.habitList.slice(0, 2);
    },
    afternoonHabits(): Habit[] {
      return this.habitList.slice(2, 4);
    },
  },
});
