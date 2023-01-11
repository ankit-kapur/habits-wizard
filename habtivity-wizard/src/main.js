import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueTextareaAutosize from 'vue-textarea-autosize'

// import firebase from "firebase"; // Not working
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

Vue.use(VueTextareaAutosize)
Vue.config.productionTip = false

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCr1L4ewSFFgbvso4AYnI4_qDq_cfvV6GY",
  authDomain: "habtivity-wizard.firebaseapp.com",
  projectId: "habtivity-wizard",
  storageBucket: "habtivity-wizard.appspot.com",
  messagingSenderId: "921143983666",
  appId: "1:921143983666:web:cfd4a4fded065bf119062b",
  measurementId: "G-F5KS9S441L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
