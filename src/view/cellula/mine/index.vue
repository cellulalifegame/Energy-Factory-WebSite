<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
const router = useRouter()
const route = useRoute()
</script>

<template>
<div class="mine-container">
  <div class="view-mine">
    <router-view></router-view>
  </div>
</div>
</template>

<style scoped lang="scss">
.mine-container {
  width: 1920px;
  height: 1080px;
  background-size: 100% 100%;
  position: relative;
  .view-mine {
    width: 1920px;
    height: 1080px;
    left: 0;
    top: 0;
    position: absolute;
  }
}
</style>