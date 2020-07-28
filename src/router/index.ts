import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackchunkName: "home" */ '@/views/home.vue')
  },
  {
    path: '/base-scene',
    name: 'BaceScene',
    component: () => import(/* webpackChunkName: "BaceScene" */ '@/views/examples/base-scene/index.vue')
  },
  {
    path: '/china-map',
    name: 'ChinaMap',
    component: () => import(/* webpackChunkName: "ChinaMap" */ '@/views/examples/china-map/index.vue')
  },
  {
    path: '/3d-points',
    name: '3DPoints',
    component: () => import(/* webpackChunkName: "3DPoints" */ '@/views/examples/3d-points/index.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
