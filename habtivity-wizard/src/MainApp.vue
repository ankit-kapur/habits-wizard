<template>
  <div id="app">
    <v-bottom-navigation v-model="currentTab" :background-color="color" dark shift>
      <v-btn>
        <span>Video</span>

        <v-icon>mdi-television-play</v-icon>
      </v-btn>

      <v-btn>
        <span>Music</span>

        <v-icon>mdi-music-note</v-icon>
      </v-btn>

      <v-btn>
        <span>Book</span>

        <v-icon>mdi-book</v-icon>
      </v-btn>

      <v-btn>
        <span>Image</span>

        <v-icon>mdi-image</v-icon>
      </v-btn>
    </v-bottom-navigation>

    <!-- TODO: Replace this thing with BOTTOM NAV BAR from Vuetify -->
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

// See documentation on class-components:
// 👉🏽 https://class-component.vuejs.org/guide/class-component.html#computed-properties
@Component
export default class MainApp extends Vue {

  // Data
  currentTab = 1;

  data() {
    return {
      currentTab: 1
    }
  }

  get color() {
    switch (this.currentTab) {
      case 0:
        return 'blue-grey'
      case 1:
        return 'teal'
      case 2:
        return 'brown'
      case 3:
        return 'indigo'
      default:
        return 'blue-grey'
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
