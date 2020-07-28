<template>
  <div class="h-full w-full">
    <h1 class="p-4">坐井观天，无限可能</h1>
    <ul class="flex flex-col justify-start items-center">
      <li
        class="cursor-pointer hover:text-primary p-4"
        v-for="(item, index) in examples"
        :key="index"
        @click="$router.push(item.url)"
        >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

interface Example {
  name: string,
  url: string
}

@Component
export default class Home extends Vue {
  examples: Example[] = [
    { name: '中国地图+飞线+星空', url: '/china-map' },
    { name: '粒子动画', url: '/3d-points-gpu' }
  ]
}
</script>
