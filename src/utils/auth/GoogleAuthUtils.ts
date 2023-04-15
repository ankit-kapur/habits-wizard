import { getAuth, onAuthStateChanged } from "firebase/auth";

/*
 * * ------------ Listener for Auth status
 */
const googleAuth = getAuth();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authStatus = new Promise<void>((resolve, reject) => {
  onAuthStateChanged(googleAuth, (user) => {
    if (user) {
      console.log("onAuthStateChanged = TRUE");

      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      // const uid = user.uid;
    } else {
      console.log("onAuthStateChanged = FALSE. User is signed out");
    }
    resolve();
  });
});
