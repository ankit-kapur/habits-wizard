/* eslint-disable @typescript-eslint/no-unused-vars */
import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import colors from "vuetify/es5/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
  },
  theme: {
    // * ---------- Switch for dark/light
    dark: false,

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
        edit_button: "#5a4f4f",
        delete_button: "#5a4f4f",
        action_icon: "#673ab7",
      },
      dark: {
        primary: "#673ab7",
        secondary: "#ff9800",
        accent: "#1478c4",
        error: "#f44336",
        warning: "#ffc107",
        info: "#795548",
        success: "#238a17",

        add_button: "#8573a6",
        edit_button: "#5a4f4f",
        delete_button: "#5a4f4f",
        action_icon: "#673ab7",
      },
    },
  },
});
