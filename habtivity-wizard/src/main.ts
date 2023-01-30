import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import MainApp from "./MainApp.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import Vuetify from "vuetify";

Vue.config.productionTip = false;
Vue.use(PiniaVuePlugin);
const pinia = createPinia();

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#673ab7",
        secondary: "#ff9800",
        accent: "#9c27b0",
        error: "#f44336",
        warning: "#ffc107",
        info: "#795548",
        success: "#4caf50",
      },
    },
  },
});

new Vue({
  router,
  vuetify,
  pinia,
  render: (h) => h(MainApp),
}).$mount("#app");
