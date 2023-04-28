<script lang="ts">
import { useEmojiStore } from "@/store/EmojiStore";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
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

  @Watch("emojiString")
  onPropertyChanged(_newValue: string, _oldValue: string) {
    console.log("👀 _newValue ===> " + _newValue + " ... " + _oldValue);
  }

  // ------------------------------------------------ Stores
  emojiStore = useEmojiStore();
}
</script>

<template>
  <div v-if="emojiString" class="pa-0 ma-0">
    <Emoji
      :data="emojiStore.getEmojiIndex()"
      :emoji="emojiString"
      :size="24"
      :native="true"
    />
  </div>
  <!-- :skin="3" -->
</template>
