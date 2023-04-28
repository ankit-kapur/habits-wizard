<script lang="ts">
import { useEmojiStore } from "@/store/EmojiStore";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Emoji } from "emoji-mart-vue-fast";

@Component({
  components: {
    Emoji: Emoji,
  },
})
export default class MyEmoji extends Vue {
  // ------------------------------------------------ Props
  @Prop()
  emojiString!: string;
  @Prop()
  emojiSize?: string;

  // ------------------------------------------------ Stores
  emojiStore = useEmojiStore();

  // ------------------------------------------------ Data
  defaultEmojiSize = 24;
}
</script>

<template>
  <div v-if="emojiString" class="pa-0 ma-0">
    <Emoji
      :data="emojiStore.getEmojiIndex()"
      :emoji="emojiString"
      :size="emojiSize ? emojiSize : defaultEmojiSize"
      :native="true"
    />
  </div>
  <!-- :skin="3" -->
</template>
