<template>
  <div id="app">
    <v-app id="MainApp">
      <v-navigation-drawer app>
        <!-- -->
      </v-navigation-drawer>

      <v-app-bar app>
        <!-- TODO: Make an app bar -->
      </v-app-bar>

      <!-- Sizes your content based upon application components -->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container fluid>
          <router-view />
        </v-container>
      </v-main>

      <!-- BOTTOM NAV -->
      <v-bottom-navigation
        v-model="currentTabValue"
        :background-color="color"
        shift
      >
        <v-btn
          v-for="(route, key) in routes"
          ref="link"
          :key="'route' + key"
          :to="route.to"
          min-width="48"
          min-height="30"
        >
          <span>{{ route.name }} </span>
          <v-icon>{{ route.icon }}</v-icon>
        </v-btn>
      </v-bottom-navigation>
      <!-- End of BOTTOM -->
    </v-app>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component
export default class MainApp extends Vue {
  // Data
  currentTabValue = 0;

  // Icons here: https://materialdesignicons.com/
  routes = [
    { name: "Home", to: "/", icon: "mdi-calendar-today" },
    { name: "About", to: "/about", icon: "mdi-pine-tree" },
    { name: "Third", to: "/third", icon: "mdi-baguette" },
    { name: "Stats", to: "/fourth", icon: "mdi-gauge" },
  ];

  // class property will not be reactive (i.e. the changes for the properties will not be detected). Use data() hook instead
  // Not sure how to access the data elsewhere though.
  // data() {
  //   return {
  //     currentTab: 1
  //   }
  // }

  get color(): string {
    console.log(
      `inside COLOR fuinction. this.currentTabValue = ${this.currentTabValue}`
    );

    switch (this.currentTabValue) {
      case 0:
        return "blue-grey";
      case 1:
        return "teal";
      case 2:
        return "brown";
      case 3:
        return "indigo";
      default:
        return "blue-grey";
    }
  }

  // get currentTab(): number {
  //   return this.currentTabValue;
  // }
  // set currentTab(value: number) {
  //   // this.currentTabValue = value;
  //   console.log(
  //     `inside compute fuinction. this.currentTabValue = ${this.currentTabValue}. this.currentTab = ${this.currentTab}`
  //   );
  // }
}
</script>

<style lang="scss">
@import "@/assets/styles/normalize.scss";
</style>
