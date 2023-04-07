import Vue from "vue";
import { createPinia, PiniaVuePlugin } from "pinia";
import MainApp from "./MainApp.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

// import { rtdbPlugin as VueFire } from "vuefire";
// import { firestorePlugin } from "vuefire";
// import { VueFire, VueFireAuth } from "vuefire";
// import { firebaseApp } from "./firebase";

Vue.config.productionTip = false;
Vue.use(PiniaVuePlugin);
const pinia = createPinia();

const app: Vue = new Vue({
  router,
  vuetify,
  pinia,
  render: (h) => h(MainApp),
});

// Vue.use(firestorePlugin);

// Vue.use(VueFire);

// Vue.use(VueFire, {
//   firebaseApp,
//   modules: [],
// });

// vueFire: VueFire = VueFire(app, {
//   firebaseApp,
//   modules: [],
// });

// app.use(VueFire, {
//   // imported above but could also just be created here
//   firebaseApp,
//   modules: [
//     // we will see other modules later on
//     VueFireAuth(),
//   ],
// });

app.$mount("#app");
