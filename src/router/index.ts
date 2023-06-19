import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomePage from "@/views/HomePage.vue";
import LoginPage from "@/views/LoginPage.vue";
import AreasPage from "@/views/AreasPage.vue";
import ProgressPage from "@/views/ProgressPage.vue";
import RecordingPage from "@/views/RecordingPage.vue";
import CalendarPage from "@/views/CalendarPage.vue";
import ConfigurationPage from "@/views/ConfigurationPage.vue";
import { getAuth } from "firebase/auth";
import { authStatus } from "@/utils/firebase/GoogleAuthUtils";

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
    path: "/recordingPage",
    name: "Record",
    component: RecordingPage,
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
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
];

const router = new VueRouter({
  routes,
});

/*
 * * ------------ Force redirect to login-page, if not authenticated.
 */
const googleAuth = getAuth();
router.beforeEach(async (to, from, next) => {
  await authStatus;

  // ? Temporary hack to make VS code debugger work.
  //    console.log(googleAuth);
  //    next();

  if (!googleAuth.currentUser && to.name !== "Login") next("/login");
  else next();
});

export default router;
