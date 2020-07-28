import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 注入 Tailwind css 框架
import '@/assets/css/main.css'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
