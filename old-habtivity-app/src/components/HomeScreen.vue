<!-- eslint-disable vue/multi-word-component-names -->
<!-- @ts-nocheck -->

<template>
  <v-row class="fill-height">
    <v-col>
      <!-- Toolbar sheet -->
      <v-sheet height="64">
        <v-toolbar flat color="white">
          <v-btn color="primary" dark @click.stop="dialog = true">
            New Event
          </v-btn>
          <v-btn outlined class="mr-4" @click="setToday"> Today </v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <div class="flex-grow-1"></div>
        </v-toolbar>
      </v-sheet>

      <!-- "Record Event" modal popup -->
      <v-sheet height="100">
        <RecordActivityComponent
          v-model:activityTitle="activityTitle"
          v-model:area="area"
        />

        <label> {{ activityTitle }} </label>
        <label> {{ area }} </label>
      </v-sheet>

    </v-col>
  </v-row>
</template>

<script lang="ts">
// import { db } from "@/main";
import { defineComponent } from "vue";
import RecordActivityComponent from "./custom/RecordActivityComponent.vue";

export default defineComponent({
  components: { RecordActivityComponent },
  data: () => ({
    activityTitle: "default title",
    area: "default area",

  }),
  mounted() {},
  methods: {},
  computed: {},
});
</script>

<style>
  @import '@/assets/styles/somerandom.css';
</style>
