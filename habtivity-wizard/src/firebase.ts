import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxyM4nv5Q77Pyb5qO_0Ltf_Ph1-K4eUtE",
  authDomain: "lizardwizard-dda1c.firebaseapp.com",
  projectId: "lizardwizard-dda1c",
  storageBucket: "lizardwizard-dda1c.appspot.com",
  messagingSenderId: "448927404986",
  appId: "1:448927404986:web:f5fd5b33b2c5c2ac214383",
  measurementId: "G-WJL148BTL8",
};
const firebaseApp = initializeApp(firebaseConfig);

export const firestoreDatabase = getFirestore(firebaseApp);
