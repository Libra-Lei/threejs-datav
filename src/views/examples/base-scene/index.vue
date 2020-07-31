<template>
  <div class="w-full h-full relative">
    <div class="fixed relative right-0" id="stats-container"></div>
    <div class="w-full h-full" id="canvas-container">
      <canvas class="w-full h-full" id="base-3d"></canvas>
    </div>
  </div>
</template>

<script>
import BaseRender from './base'
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
      const baseRender = new BaseRender(
        document.getElementById('base-3d'),
        document.getElementById('canvas-container')
      );
      baseRender.init();

      // 加上性能监控
      const stats = new Stats();
      stats.dom.style.right = 0;
      stats.dom.style.top = 0;
      stats.dom.style.left = null;
      const dom = document.getElementById('stats-container');
      dom? dom.appendChild(stats.dom) : null;

      let render = function () {
        requestAnimationFrame(render);
        baseRender.render();
        stats.update();
      };
      render();
    }
  }
}
</script>