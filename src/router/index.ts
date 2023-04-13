import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import AreasPage from "@/views/AreasPage.vue";
import ProgressPage from "@/views/ProgressPage.vue";
import CalendarPage from "@/views/CalendarPage.vue";
import ConfigurationPage from "@/views/ConfigurationPage.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/calendarPage",
    name: "Calendar",
    component: CalendarPage,
  },
  {
    path: "/progressPage",
    name: "Progress",
    component: ProgressPage,
  },
  {
    path: "/configurationPage",
    name: "Preferences",
    component: ConfigurationPage,
  },
  {
    path: "/areasPage",
    name: "Areas",
    component: AreasPage,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
