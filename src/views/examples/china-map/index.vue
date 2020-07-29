<!--
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 10:35:50
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-29 15:42:54
--> 
<template>
  <div class="h-full w-full relative" id="container">
    <div class="fixed relative right-0" id="stats-container"></div>
    <canvas class="h-full w-full absolute top-0 left-0" id="canvas"></canvas>
    <div class="title w-full absolute top-0 left-0">
      <div class="flex items-center justify-start">
        <div class="flex items-center justify-start px-4">
          <v-icon class="text-blue-500 mr-4" scale="1.5" name="regular/map"/>
          <h1 class="text-base">武汉市</h1>
        </div>
        <div class="flex items-center justify-start pr-4">
          <img
            class="w-16"
            :src="require('@/assets/images/sun.gif')">
          <h1 class="text-base">晴 32℃</h1>
        </div>
        <div class="flex items-center justify-start pr-4">
          <v-icon class="text-blue-500 mr-4" scale="1.5" name="regular/clock"/>
          <h1 class="text-base">{{ currentTime }}</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as dayjs from 'dayjs'
import Stats from 'three/examples/jsm/libs/stats.module.js';
const chinaJson = require('./china.json')

import { Map3D } from './china-map'

export default {
  data() {
    return {
      timer: null,
      timerOn: false,
      currentTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  },
  mounted() {
    this.init();
    this.setRealTime();
  },
  beforeDestroy:function(){
    this.timerOn = false;
  },
  methods: {
    init() {
      const map3D = new Map3D(document.getElementById('canvas'));
      map3D.init();
      map3D.initMap(chinaJson);
      map3D.initFlyLine();
      // 加上性能监控
      const stats = new Stats();
      stats.dom.style.right = 0;
      // stats.dom.style.bottom = 0;
      stats.dom.style.top = 0;
      stats.dom.style.left = null;
      const dom = document.getElementById('stats-container');
      dom? dom.appendChild(stats.dom) : null;
      
      let render = function () {
        requestAnimationFrame(render);
        map3D.render();
        stats.update();
      };
      render();
    },
    setRealTime() {
      this.timerOn = true;
      const update = () => {
        this.timer = setTimeout(() => {
          this.currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          if (this.timerOn) update();
        }, 1000)
      }
      update();
    }
  }
}
</script>