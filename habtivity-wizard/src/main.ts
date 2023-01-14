import Vue from 'vue'
import MainApp from './MainApp.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(MainApp)
}).$mount('#app')
