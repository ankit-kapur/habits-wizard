import Vue from 'vue'
import MainApp from './MainApp.vue'
import router from './router'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  render: h => h(MainApp)
}).$mount('#app')
