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

        add_button: "#8573a6",
        edit_button: "#8573a6",
        delete_button: "#b6837f",
        action_icon: "#673ab7",
      },
    },
  },
});
