<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  AuthError,
  getAuth,
  GoogleAuthProvider,
  OAuthCredential,
  signInWithPopup,
  User,
} from "firebase/auth";
import { routerPush } from "@/utils/nav/NavigationUtils";

@Component
export default class LoginPage extends Vue {
  // ------------------------------------------------ Data
  provider = new GoogleAuthProvider();
  loginFailed = false;
  routerPush = routerPush;

  // ------------------------------------------------ Methods
  googleSignIn() {
    const auth = getAuth();
    signInWithPopup(auth, this.provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential === null) {
          this.loginFailed = true;
          console.log(
            "Something went wrong. Got a null credential object from Google"
          );
        } else {
          console.log("✅ Login was successful. Redirecting.");
          this.loginFailed = false;
          const accessToken: string | undefined = credential.accessToken;
          // The signed-in user info.
          const user: User = result.user;
          // IdP data available using getAdditionalUserInfo(result)
          // ...
          console.log("✅ token ==> " + accessToken);
          console.log("✅ user ==> " + JSON.stringify(user));

          // Redirect to login page.
          routerPush("/");
        }
      })
      .catch((error: AuthError) => {
        // Handle Errors here.
        this.loginFailed = false;

        const errorCode: string = error.code;
        const errorMessage: string = error.message;
        // The email of the user's account used.
        const email: string | undefined = error.customData.email;
        // The AuthCredential type that was used.
        const credential: OAuthCredential | null =
          GoogleAuthProvider.credentialFromError(error);

        console.log(
          "🚨 🚨 🚨 ERROR during Google Auth. errorCode ===> " +
            errorCode +
            ", errorMessage ===> " +
            errorMessage +
            ", email ===> " +
            email +
            ", credential ===> " +
            JSON.stringify(credential)
        );
        // ...
      });
  }
}
</script>

<!-- To enable the Google signin button -->
<!-- <component
      src="https://accounts.google.com/gsi/client"
      :is="'script'"
    ></component> -->

<template>
  <v-container fluid class="pt-0">
    <v-row align="center" class="flex-child" justify="space-around">
      <v-col class="d-flex" cols="12" md="4">
        <v-sheet class="d-flex mt-auto" color="purple lighten-3" height="300">
          <v-avatar size="26px" class="pr-4 mr-4">
            <v-img
              src="https://cdn-icons-png.flaticon.com/512/2965/2965278.png"
            ></v-img>
          </v-avatar>
          <v-btn text elevation="10" @click="googleSignIn">
            Sign In with Google
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row dense v-show="loginFailed">
      <v-col cols="12">
        <div>
          <span class="error"> Something went wrong. Login failed</span>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <!-- <v-sheet id="app" class="d-flex">
    <v-app id="MainApp">
      <v-main> </v-main>
    </v-app>
  </v-sheet> -->
</template>
