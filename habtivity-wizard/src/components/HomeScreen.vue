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

      <!-- Navigation bar @ bottom -->
      <v-bottom-navigation v-model="currentBottomNavPage" :input-value="isBottomNavActive" color="indigo">
        <v-btn>
          <span>Recents</span>

          <v-icon>mdi-history</v-icon>
        </v-btn>

        <v-btn>
          <span>Favorites</span>

          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <v-btn>
          <span>Nearby</span>

          <v-icon>mdi-map-marker</v-icon>
        </v-btn>
      </v-bottom-navigation>
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

    // Bottom nav
    isBottomNavActive: true,
    currentBottomNavPage: 1
  }),
  mounted() {},
  methods: {},
  computed: {},
});
</script>
