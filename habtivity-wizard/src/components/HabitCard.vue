<template>
  <v-card :color="habit.color" class="mx-auto" max-width="344" small>
    <v-card-title>
      <v-icon large left>
        {{ habit.icon }}
      </v-icon>
      <span class="text-h6 font-weight-light">
        {{ habit.title }}
      </span>
    </v-card-title>

    <v-card-text class="text-h5 font-weight-bold">
      {{ habit.areaId }}
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { HabitPojo } from "@/store/HabitState";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class HabitCardHomePage extends Vue {
  @Prop()
  habit!: HabitPojo;
}
</script>
