<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { getAuth, signOut } from "firebase/auth";
import { routerPush } from "@/utils/nav/NavigationUtils";

@Component
export default class ConfigurationPage extends Vue {
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
        <!-- * ---------------- Area ---------------- * -->
        <v-col cols="12">
          <v-card
            @click="routerPush('/areasPage')"
            max-width="800"
            class="mb-4 mx-auto px-auto"
          >
            <!-- https://media.restless.co.uk/uploads/2020/08/5_ways_to_find_meaning_and_purpose_in_your_life_hero.jpg -->
            <!-- https://neural.love/cdn/ai-photostock/1ed4d3cd-d1c5-695c-8ca7-af2308386f71/0.jpg?Expires=1685577599&Signature=kMVae~zpAPs62R7TvEydjivBYom2xKbJyIU~RT00FGANUrw4grHYl2ndGfpRIvcQwy8eSKcHPy3c7p6qpd6BkvYyUja9JZZllLc4vCKcCzsjrppjNd5KGy6SOKnLSCmARbvELmYfb7QzA~rCskGAinPjE0bUkusKs~OFmOQoKLy~cuQlL7eyQHkkNOIMt~fzsFRL8op4HHzqS3KVQrI~fzciuAj-dMccw0f73C1kSEaD-pB3Ywkho6QPSuZNbv3sS8xcsW9J2HL2kP532BBHNWVyFQxVAZ99SFTnY93xDc1qaL3VB1j2zV0CIeycXYVrhI8QDoDBU1XGU5eOG9bYcw__&Key-Pair-Id=K2RFTOXRBNSROX -->
            <v-img
              src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/4273f2f5-90b8-4ca7-b7e2-383f943800c8/dfi538t-8aba0de6-9643-4ccf-bd4b-59332b2c94bb.jpg/v1/fill/w_622,h_350,q_70,strp/fablecraft___into_the_woods_by_andreasrocha_dfi538t-350t.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTQwNyIsInBhdGgiOiJcL2ZcLzQyNzNmMmY1LTkwYjgtNGNhNy1iN2UyLTM4M2Y5NDM4MDBjOFwvZGZpNTM4dC04YWJhMGRlNi05NjQzLTRjY2YtYmQ0Yi01OTMzMmIyYzk0YmIuanBnIiwid2lkdGgiOiI8PTI1MDAifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.vFLsBkR1bv5fYs9WoBcbc5TEDTQ_BbizOma2KpFu8hg"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="250px"
              cover
            >
              <v-card-title
                class="font-weight-light text-h5"
                style="color: white"
              >
                Areas
              </v-card-title>
            </v-img>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense>
        <!-- * ---------------- Categories ---------------- * -->
        <v-col cols="6">
          <v-card
            @click="routerPush('/areasPage')"
            max-width="385"
            class="mr-3 mx-auto px-auto"
          >
            <!-- Habits: https://news.harvard.edu/wp-content/uploads/2022/05/iStock-illustration2500-1200x800.jpg -->
            <v-img
              src="https://cdnb.artstation.com/p/assets/images/images/048/799/125/20220426070841/smaller_square/andreas-rocha-pinecastle01.jpg?1650974921"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title
                class="font-weight-light text-h6"
                style="color: white"
                >Categories</v-card-title
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
            <!-- https://www.poynter.org/wp-content/uploads/2003/06/shutterstock_549656056-1500x1000.jpg -->
            <!-- Adventure frog: https://neural.love/cdn/ai-photostock/1ede1284-c7c1-6fba-8630-d329aa1cc150/0.jpg?Expires=1685577599&Signature=CD0~07V5Yjhpb8qxaG1XrT3tbLzSQ1S6kgR9wJWg1s4Qv2bzhNkw0VXFvTc8diOUcAnXDd2MKovLEZ6isaMXf8tsW2xj18yZu011xg4rLrGI1IpSZLiz1VdZa89caDuY~eMAqjQfaVgQ5LoHvyMX-Q2TuP0AUGNtrxYibCfUDiL0A~8FVB1Ma54nCHO~rS1VMezajTOaBrhQdtDttwCXUW1Yk7TqHz-BfKcB1ft9C43USLTaibvQlw2U~v-oaqj0voIhGcn9LcfVjcCHN69Thmu4qrM5hJN96SgOqtfUrQ1mfo9to1jc7lmx2pyMEiaP0h~9Czh3mS2JCRUPqQ9PHg__&Key-Pair-Id=K2RFTOXRBNSROX -->
            <v-img
              src="https://cdnb.artstation.com/p/assets/images/images/026/268/905/smaller_square/andreas-rocha-thebookclub01.jpg?1588330383"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              height="200px"
              cover
            >
              <v-card-title
                class="font-weight-light text-h6"
                style="color: white"
                >Activities</v-card-title
              >
            </v-img>
          </v-card>
        </v-col>

        <v-spacer />

        <!--  -->
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
