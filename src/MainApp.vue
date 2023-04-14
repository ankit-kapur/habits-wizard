<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import BottomNavBar from "@/components/nav/BottomNavBar.vue";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    BottomNavBar: BottomNavBar,
  },
})
export default class MainApp extends Vue {
  //
  // ------------------------ Data
  currentTabValue = 0;
  isNavDrawerOpen = false;
  expandFloatingActionButton = false;

  isActivity = false;

  // Icons here: https://materialdesignicons.com/
  recordingOptions = [
    { name: "Enter", to: "/", icon: "mdi-location-enter" },
    { name: "Pomodoro", to: "/pomodoro", icon: "mdi-fruit-cherries" },
    { name: "Start activity", to: "/third", icon: "mdi-play-outline" },
  ];

  // ------------------------------------------------ Methods
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
}
</script>

<style lang="scss">
// TODO: Figure out styling.
@import "@/assets/styles/styling.scss";
</style>

<template>
  <v-sheet id="app" class="d-flex">
    <v-app id="MainApp">
      <v-app-bar app elevation="5">
        <!-- Other props: prominent shrink-on-scroll -->
        <v-app-bar-nav-icon @click="$router.go(-1)"
          ><v-icon>mdi-chevron-left</v-icon></v-app-bar-nav-icon
        >
        <v-toolbar-title>
          <!-- <a href="$router.go(-1)"> ooo </a> -->
          {{ $route.name }}
        </v-toolbar-title>

        <!-- Spaces out so icons on the top-right stay far -->
        <v-spacer></v-spacer>

        <!-- TOP-RIGHT icons -->
        <v-btn icon @click="$router.push({ path: '/configurationPage' })">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>

        <v-app-bar-nav-icon @click="openDrawer"></v-app-bar-nav-icon>
      </v-app-bar>

      <v-navigation-drawer v-model="isNavDrawerOpen" temporary absolute>
        <v-list nav dense>
          <v-list-item-group
            v-model="group"
            active-class="deep-purple--text text--accent-4"
          >
            <v-list-item
              v-for="route in recordingOptions"
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
        <v-container class="pt-0">
          <!-- Show the ACTUAL CONTENT on the current view -->
          <router-view />
        </v-container>
      </v-main>

      <!-- BOTTOM NAV -->
      <BottomNavBar :selectedPage="currentTabValue"></BottomNavBar>
    </v-app>
  </v-sheet>
</template>