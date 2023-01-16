import { defineStore } from "pinia";

export interface HabitPojo {
  id: string;
  title: string;
  areaId: string;
  categoryId: string;
  plannedStartTime: string; // Change to date format
  icon: string;
  color: string;
}

export interface State {
  habitList: HabitPojo[];
}

export const useHabitStore = defineStore("HabitStore", {
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
  },
});
