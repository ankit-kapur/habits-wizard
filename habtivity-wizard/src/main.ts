import Vue from 'vue'
import HomeScreen from './components/HomeScreen.vue'
import Vuetify from "vuetify";

// import { TextareaAutosize } from 'vue-textarea-autosize'

import { firebaseConfig } from '@/config/firebaseConfig'

// import firebase from "firebase"; // Not working
import * as firebase from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

// Vue.use(TextareaAutosize)

Vue.config.productionTip = false

// Initialize Firebase
const firebaseApp: firebase.FirebaseApp = firebase.initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(firebaseApp);

Vue.use(Vuetify)
new Vue({
  render: h => h(HomeScreen)
}).$mount('#app')

/* tslint:disable */