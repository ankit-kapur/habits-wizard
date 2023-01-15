<template>
  <v-card id="app" class="overflow-hidden">
    <v-app id="MainApp">
      <v-app-bar app elevation="14">
        <!-- Other props: shrink-on-scroll prominent -->

        <v-app-bar-nav-icon @click="openDrawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Lizard Wizard</v-toolbar-title>

        <!-- Spaces out so icons on the top-right stay far -->
        <v-spacer></v-spacer>

        <template v-slot:extension>
          <v-tabs align-with-title>
            <v-tab>Tab 1</v-tab>
            <v-tab>Tab 2</v-tab>
            <v-tab>Tab 3</v-tab>
          </v-tabs>
        </template>

        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item>
              <v-list-item-title>Click Me 1</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Click Me 2</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Click Me 3</v-list-item-title>
            </v-list-item>

            <v-list-item>
              <v-list-item-title>Click Me 4</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-navigation-drawer v-model="isNavDrawerOpen" temporary absolute>
        <!-- Fancier options: mini-variant expand-on-hover-->
        <v-list nav dense>
          <v-list-item-group
            v-model="group"
            active-class="deep-purple--text text--accent-4"
          >
            <v-list-item
              v-for="route in routes"
              :key="route.name"
              link
              @click="$router.push({ path: route.to })"
            >
              <v-list-item-icon>
                <v-icon> {{ route.icon }} </v-icon>
              </v-list-item-icon>

              <v-list-item-title>
                {{ route.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>

      <!-- Sizes your content based upon application components -->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container fluid>
          <!-- Show the ACTUAL CONTENT on the current view -->
          <router-view />
        </v-container>
      </v-main>

      <!-- SPEED DIAL -->
      <v-speed-dial
        v-model="expandFloatingActionButton"
        :top="false"
        :bottom="true"
        :right="true"
        :left="false"
        :direction="`top`"
        :open-on-hover="true"
        :transition="`slide-y-reverse-transition`"
      >
        <!-- ACTIVATOR button for the fab-menu  -->
        <template v-slot:activator>
          <v-btn
            v-model="expandFloatingActionButton"
            color="blue darken-2"
            dark
            fab
          >
            <v-icon v-if="expandFloatingActionButton"> mdi-close </v-icon>
            <v-icon v-else> mdi-plus </v-icon>
          </v-btn>
        </template>
        <!-- Buttons that pop-up are down here -->
        <v-btn fab dark small color="green">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn fab dark small color="indigo">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn fab dark small color="red">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-speed-dial>

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
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component
export default class MainApp extends Vue {
  // Data
  currentTabValue = 0;
  isNavDrawerOpen = false;
  expandFloatingActionButton = false;

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

  openDrawer(): void {
    console.log("Opening drawer");
    this.isNavDrawerOpen = !this.isNavDrawerOpen;
  }

  get group(): number {
    this.isNavDrawerOpen = false;
    return this.currentTabValue;
  }

  set group(currTab: number) {
    this.currentTabValue = currTab;
  }

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
// TODO: Figure out styling.
// @import "@/assets/styles/normalize.scss";
</style>
