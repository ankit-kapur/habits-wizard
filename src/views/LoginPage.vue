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

  get minHeight() {
    console.log("window.innerHeight = " + window.innerHeight);
    return window.innerHeight;
  }

  get minWidth() {
    console.log("window.innerWidth = " + window.outerWidth);
    return window.outerWidth;
  }

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

<template>
  <!-- :min-height="minHeight" :min-width="minWidth"  -->
  <v-container outlined :max-width="minWidth">
    <v-card-actions>
      <v-spacer />
      <v-row
        justify="center"
        align-self="center"
        align="center"
        no-gutters
        style=""
      >
        <v-col justify="center" align-self="center">
          <!--  -->

          <v-card max-width="100%" elevation="10">
            <!--  -->

            <v-card-title
              :max-width="minWidth"
              class="text-h4 font-weight-light"
            >
              <v-spacer />
              Hello
              <v-spacer />
            </v-card-title>

            <v-card-actions>
              <v-img
                width="280"
                src="https://i.pinimg.com/564x/1d/97/ef/1d97efec244f4588042476d05e56aebd.jpg"
              ></v-img>
            </v-card-actions>

            <!-- Toad
            https://i.pinimg.com/564x/1d/97/ef/1d97efec244f4588042476d05e56aebd.jpg -->

            <!-- Lizard Wizard
            https://i.pinimg.com/736x/ea/87/7e/ea877e78ec10be0966b23aa35ea54b57.jpg -->

            <v-card-actions @click="googleSignIn">
              <v-spacer />

              <v-icon color="blue" class="mr-2">mdi-google</v-icon>
              <span class="font-weight-light">Sign in with Google</span>

              <v-spacer />
            </v-card-actions>

            <v-card-text> </v-card-text>

            <!--  -->
          </v-card>
        </v-col>
      </v-row>

      <v-spacer />

      <!--  -->
    </v-card-actions>
  </v-container>
</template>
