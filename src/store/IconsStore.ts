/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MaterialIcon } from "@/model/pojo/icon/Materialcon";
import { defineStore } from "pinia";

interface State {
  allIcons: MaterialIcon[];
}

export const useIconsStore = defineStore("IconsStore", {
  // Initial state.
  state: (): State => {
    return {
      allIcons: [],
    };
  },
  // Getters
  getters: {},
  actions: {
    // -------------------------------------------- Load
    async loadIcons(): Promise<void> {
      this.allIcons = (await import("@/assets/icons/mdi_icons.json")).default;
      // Sort by name
      this.allIcons
        .slice()
        .sort((icon1, icon2) => icon1.name.localeCompare(icon2.name));
    },

    // -------------------------------------------- Search
    /**
     * Searches by prefix.
     *
     * @param prefix      string to use for matching icons
     * @return string[]   list of icon names that matched.
     */
    searchByPrefix(prefix: string): string[] {
      prefix = prefix.toLowerCase(); // case insensitive.
      let results = new Set<string>();

      // Names that START WITH the prefix.
      const namePrefixMatches: string[] = this.allIcons
        .filter((icon) => icon.name.startsWith(prefix))
        .map((icon) => icon.name, results);
      results = new Set([...results, ...namePrefixMatches]);

      // Alias matches
      const aliasMatches: string[] = this.allIcons
        .filter((icon) => {
          return icon.aliases.filter((alias) => alias.includes(prefix)).length >
            0
            ? true
            : false;
        })
        .map((icon) => icon.name, results);
      results = new Set([...results, ...aliasMatches]);

      // Names that CONTAIN the prefix
      const nameContainsMatches: string[] = this.allIcons
        .filter((icon) => icon.name.includes(prefix))
        .map((icon) => icon.name, results);
      results = new Set([...results, ...nameContainsMatches]);

      // Tag matches
      const tagsMatches: string[] = this.allIcons
        .filter((icon) => {
          return icon.tags.filter((alias) => alias.includes(prefix)).length > 0
            ? true
            : false;
        })
        .map((icon) => icon.name, results);
      results = new Set([...results, ...tagsMatches]);

      return Array.from(results);
    },
  },
});
