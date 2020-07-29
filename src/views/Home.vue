<!--
 * @Description: 
 * @Author: 幺五六
 * @Date: 2020-07-29 14:05:26
 * @LastEditors: 幺五六
 * @LastEditTime: 2020-07-29 14:41:28
--> 
<template>
  <div class="h-full w-full text-center">
    <h1 class="p-4 font-bold text-3xl text-indigo-500">坐井观天，无限可能</h1>
    <ul class="flex flex-col justify-start items-center">
      <li
        class="cursor-pointer text-white hover:text-indigo-500 p-4"
        v-for="(item, index) in examples"
        :key="index"
        @click="$router.push(item.url)"
        >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      examples: [
        { name: '基础场景渲染', url: '/base-scene' },
        { name: '中国地图+飞线+星空', url: '/china-map' },
        { name: '粒子动画', url: '/3d-points' }
      ]
    }
  }
}
</script>
