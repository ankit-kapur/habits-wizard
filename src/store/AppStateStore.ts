/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { defineStore } from "pinia";

interface State {
  bottomNavTabSelected: number;
}

export const useAppStateStore = defineStore("appStateStore", {
  // Initial state.
  state: (): State => {
    return {
      bottomNavTabSelected: 0,
    };
  },
  // Getters
  getters: {},
  actions: {
    getBottomTabSelection() {
      return this.bottomNavTabSelected;
    },

    setBottomTabSelection(newTabNumber: number) {
      this.bottomNavTabSelected = newTabNumber;
    },
  },
});
