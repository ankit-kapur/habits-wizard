import Vue from "vue";
import Vuetify from "vuetify/lib/framework";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
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
