/*
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 14:05:26
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-29 15:04:14
 */ 
import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 注入 Tailwind css 框架
import '@/assets/css/main.css'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
Vue.component('v-icon', Icon)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
