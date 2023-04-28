/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Emoji, EmojiIndex } from "emoji-mart-vue-fast";
import data from "emoji-mart-vue-fast/data/all.json";
import { defineStore } from "pinia";

interface State {
  emojiIndex: EmojiIndex;
}

export const useEmojiStore = defineStore("EmojiStore", {
  // Initial state.
  state: (): State => {
    return {
      emojiIndex: new EmojiIndex(data),
    };
  },
  // Getters
  getters: {},
  actions: {
    // -------------------------------------------- Get index
    getEmojiIndex(): EmojiIndex {
      return this.emojiIndex;
    },

    // -------------------------------------------- Get by COLON name
    getEmojiFromColonName(emojiColonName: string): Emoji {
      return this.emojiIndex.findEmoji(emojiColonName);
    },
    getEmojiAsString(emojiColonName: string): string {
      return JSON.stringify(this.getEmojiFromColonName(emojiColonName));
    },

    getEmojiObject(emojiObjectString: string): Emoji {
      console.log(
        "<<<<<<<<<<<<<<<<<< INSIDE getEmojiObject. emojiObjectString = " +
          emojiObjectString
      );
      return JSON.parse(emojiObjectString);
    },
    convertEmojiToString(emoji: Emoji): string {
      return JSON.stringify(emoji);
    },
  },
});
