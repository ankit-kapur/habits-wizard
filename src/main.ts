import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import router from "./router";
import vuetify from "./plugins/vuetify";
import MainApp from "./MainApp.vue";
import VClamp from "vue-clamp";
import ColorThief from "colorthief";

Vue.config.productionTip = false;

// Pinia (store)
Vue.use(PiniaVuePlugin);
const pinia = createPinia();

// Clamp for restricting text from overflowing.
Vue.use(VClamp);

// Color thief
Vue.use(ColorThief);

const app: Vue = new Vue({
  router,
  vuetify,
  pinia,
  render: (h) => h(MainApp),
});

app.$mount("#app");
