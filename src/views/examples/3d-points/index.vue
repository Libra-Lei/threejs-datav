<!--
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 14:29:14
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-31 13:56:39
--> 
<template>
  <div class="w-full h-full relative">
    <div class="fixed relative right-0" id="stats-container"></div>
    <canvas class="w-full h-full" id="points-3d"></canvas>
  </div>
</template>

<script>
import ThreePoints from './3d-points'
import Stats from 'three/examples/jsm/libs/stats.module.js';

export default {
  data() {
    return {}
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const threePoints = new ThreePoints(document.getElementById('points-3d'));
      threePoints.init();

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
        threePoints.render();
        stats.update();
      };
      render();
    }
  }
}
</script>