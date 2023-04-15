<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getAuth, signOut } from "firebase/auth";
import { routerPush } from "@/utils/nav/NavigationUtils";

@Component
export default class CategoryCreateOrEditDialog extends Vue {
  // ------------------------------------------------ Methods
  signout() {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signout successful. Redirecting.");
        // Redirect to login page.
        routerPush("/login");
      })
      .catch((error) => {
        // An error happened.
        console.log("🚨 🚨 🚨 ERROR ===> " + JSON.stringify(error));
      });
  }

  routerPush = routerPush;
}
</script>

<template>
  <div class="">
    <v-container fluid>
      <v-row dense>
        <v-col cols="12">
          <v-card
            @click="routerPush('/areasPage')"
            max-width="800"
            class="mb-4 mx-auto px-auto"
          >
            <v-img
              src="https://media.restless.co.uk/uploads/2020/08/5_ways_to_find_meaning_and_purpose_in_your_life_hero.jpg"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title class="text-white" style="color: white"
                >Areas</v-card-title
              >
            </v-img>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <!-- * ---------------- Habits ---------------- * -->
        <v-col cols="6">
          <v-card
            @click="routerPush('/areasPage')"
            max-width="385"
            class="mr-3 mx-auto px-auto"
          >
            <v-img
              src="https://news.harvard.edu/wp-content/uploads/2022/05/iStock-illustration2500-1200x800.jpg"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title class="text-white" style="color: white"
                >Habits</v-card-title
              >
            </v-img>
          </v-card>
        </v-col>

        <!-- * ---------------- Activities ---------------- * -->
        <v-col cols="6">
          <v-card
            @click="routerPush('/areasPage')"
            max-width="370"
            class="mx-auto"
          >
            <v-img
              src="https://www.poynter.org/wp-content/uploads/2003/06/shutterstock_549656056-1500x1000.jpg"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title class="text-white" style="color: white"
                >Activities</v-card-title
              >
            </v-img>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col align="center">
          <v-btn text @click="signout"
            ><v-icon class="pr-2">mdi-exit-run</v-icon>Sign out</v-btn
          >
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
