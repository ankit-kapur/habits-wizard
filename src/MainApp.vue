<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { routerPush } from "@/utils/nav/NavigationUtils";
import RecordWizard from "@/components/wizards/RecordWizard.vue";
import { useAppStateStore } from "@/store/AppStateStore";

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component({
  components: {
    RecordWizard: RecordWizard,
  },
})
export default class MainApp extends Vue {
  //
  // ------------------------ Data
  isNavDrawerOpen = false;

  isActivity = false;

  // Icons here: https://materialdesignicons.com/
  recordingOptions = [
    { name: "Enter", to: "/", icon: "mdi-location-enter" },
    { name: "Pomodoro", to: "/pomodoro", icon: "mdi-fruit-cherries" },
    { name: "Start activity", to: "/third", icon: "mdi-play-outline" },
  ];

  // Stores
  appStateStore = useAppStateStore();

  // ------------------------------------------------ Method imports
  routerPush = routerPush;

  // ------------------------------------------------ Methods
  openDrawer() {
    console.log("Opening drawer");
    this.isNavDrawerOpen = !this.isNavDrawerOpen;
  }

  get group(): number {
    this.isNavDrawerOpen = false;
    return this.appStateStore.getBottomTabSelection();
  }

  set group(currTab: number) {
    this.appStateStore.setBottomTabSelection(currTab);
  }
}
</script>

<template>
  <v-sheet id="app" class="d-flex">
    <v-app id="MainApp">
      <!--  -->

      <!-- ? ------------------------------ Drawer -------------------------------->
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
              @click="routerPush(route.to)"
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

      <!-- ? ------------------------------ App bar -------------------------------->
      <v-app-bar
        app
        elevation="8"
        :hide-on-scroll="true"
        scroll-threshold="100"
      >
        <!-- Other props: prominent shrink-on-scroll -->
        <v-app-bar-nav-icon @click="$router.go(-1)"
          ><v-icon>mdi-chevron-left</v-icon></v-app-bar-nav-icon
        >
        <v-toolbar-title>
          {{ $route.name }}
        </v-toolbar-title>

        <!-- Spaces out so icons on the top-right stay far -->
        <v-spacer></v-spacer>

        <!-- TOP-RIGHT icons -->
        <v-btn icon @click="routerPush('/configurationPage')">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>

        <v-app-bar-nav-icon @click="openDrawer"></v-app-bar-nav-icon>
      </v-app-bar>

      <!-- ? ------------------------------ v-main -------------------------------->
      <v-main>
        <!-- Provides the application the proper gutter -->
        <v-container fluid>
          <!-- Show the ACTUAL CONTENT on the current view -->
          <router-view></router-view>
        </v-container>
      </v-main>

      <!-- BOTTOM NAV -->
      <v-bottom-navigation
        v-model="group"
        background-color=""
        :elevation="51"
        fixed
        app
        :grow="true"
        :shift="true"
        :hide-on-scroll="false"
        scroll-threshold="1"
        max-width="100%"
        color="primary"
      >
        <!-- Home -->
        <v-btn ref="link" to="/" class="pa-0 ma-0">
          <span class="pa-0 ma-0"> Home </span>
          <v-icon> mdi-home </v-icon>
        </v-btn>

        <!-- Day -->
        <v-btn ref="link" to="/calendarPage" class="pa-0 ma-0">
          <span class="pa-0 ma-0"> Day </span>
          <v-icon class="pa-0 ma-0"> mdi-calendar </v-icon>
        </v-btn>

        <!-- Record -->
        <v-btn fab ref="link" to="/recordingPage" class="pa-0 ma-0">
          <span class="pa-0 ma-0"> Record </span>
          <v-icon class="pa-0 ma-0"> mdi-radiobox-marked </v-icon>
          <!-- mdi-radiobox-marked -->
          <!-- mdi-record -->
        </v-btn>

        <template v-slot:extension>
          <v-btn fab color="cyan accent-2" bottom left absolute>
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </template>

        <!-- Progress -->
        <v-btn ref="link" to="/progressPage" class="pa-0 ma-0">
          <span class="pa-0 ma-0"> Progress </span>
          <v-icon class="pa-0 ma-0"> mdi-progress-check </v-icon>
        </v-btn>

        <!-- Profile -->
        <v-btn ref="link" to="/configurationPage" class="pa-0 ma-0">
          <span class="pa-0 ma-0"> Profile </span>
          <v-icon class="pa-0 ma-0"> mdi-account-edit </v-icon>
        </v-btn>

        <!-- End of BOTTOM -->
      </v-bottom-navigation>

      <!--  -->
    </v-app>
  </v-sheet>
</template>
