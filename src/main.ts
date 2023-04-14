import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import MainApp from "./MainApp.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;
Vue.use(PiniaVuePlugin);
const pinia = createPinia();

const app: Vue = new Vue({
  router,
  vuetify,
  pinia,
  render: (h) => h(MainApp),
});

app.$mount("#app");