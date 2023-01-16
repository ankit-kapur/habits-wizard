<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HabitCard from "@/components/HabitCard.vue"; // @ is an alias to /src
import { useHabitsStore } from "@/store/HabitsStore";

@Component({
  components: {
    HabitCard: HabitCard,
  },
})
export default class HomeView extends Vue {
  habitsStore = useHabitsStore();

  mounted() {
    this.habitsStore.fillData();
    // TODO: Load Things for today.
  }

  getThingsForToday() {
    // TODO: Query Firestore by date.
  }
}
</script>

<template>
  <div class="home">
    Morning
    <v-divider inset />
    <HabitCard
      v-for="habit in habitsStore.morningHabits()"
      :key="habit.id"
      :habit="habit"
    />

    Afternoon
    <v-divider inset />
    <HabitCard
      v-for="habit in habitsStore.afternoonHabits()"
      :key="habit.id"
      :habit="habit"
    />
  </div>
</template>
