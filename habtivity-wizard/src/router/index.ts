import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import ProgressPage from "@/views/ProgressPage.vue";
import CalendarPage from "@/views/CalendarPage.vue";
import ConfigurationPage from "@/views/ConfigurationPage.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "homePage",
    component: HomePage,
  },
  {
    path: "/calendarPage",
    name: "calendarPage",
    component: CalendarPage,
  },
  {
    path: "/progressPage",
    name: "progressPage",
    component: ProgressPage,
  },
  {
    path: "/configurationPage",
    name: "configurationPage",
    component: ConfigurationPage,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
