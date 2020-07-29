<!--
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 14:29:14
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-29 15:45:07
--> 
<template>
  <div class="w-full h-full">
    <canvas class="w-full h-full" id="points-3d"></canvas>
  </div>
</template>

<script>
import ThreePoints from './3d-points'
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
      threePoints
    }
  }
}
</script>