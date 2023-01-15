import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import ThirdView from "@/views/SomeThirdView.vue";
import FourthView from "@/views/SomeFourthView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    component: AboutView,
  },
  {
    path: "/third",
    name: "third",
    component: ThirdView,
  },
  {
    path: "/fourth",
    name: "fourth",
    component: FourthView,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
