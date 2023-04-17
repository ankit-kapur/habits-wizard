import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import "@fortawesome/fontawesome-free/css/all.css"; // Ensure your project is capable of handling css files

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
// import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

Vue.component("font-awesome-icon", FontAwesomeIcon); // Register component globally
library.add(fas, fab); // Include needed icons
// TODO: Can't import far

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "faSvg",
  },
  theme: {
    themes: {
      light: {
        primary: "#673ab7",
        secondary: "#ff9800",
        accent: "#1478c4",
        error: "#f44336",
        warning: "#ffc107",
        info: "#795548",
        success: "#238a17",

        add_button: "#673ab7",
        action_icon: "#795548",
      },
    },
  },
});
