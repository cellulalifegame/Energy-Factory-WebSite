<script setup lang="ts">

import { ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter()
const guideStep = ref(1)
const stepUp = (() => {
  if (guideStep.value !== 4) {
    guideStep.value++
  } else {
    router.push('/home')
  }
})
</script>

<template>
<div class="guide-view">
  <div class="guide-main" :class="`guide-main-${guideStep}`" ></div>
  <div class="click-block" :class="`click-block-${guideStep}`" @click="stepUp"></div>
</div>
</template>

<style scoped lang="scss">
.guide-view {
  position: relative;
  .guide-main {
    width: 1920px;
    height: 1080px;
    background-size: 100% 100%;
    background-image: url("img/guide/guide-1.webp");
  }
  .click-block {
    width: 115px;
    height: 115px;
    position: absolute;
    left: 20px;
    top: 200px;
    cursor: pointer;
  }
  .click-block-2 {
    width: 567px;
    height: 71px;
    left: 1189px;
    top: 724px;
  }
  .click-block-3 {
    width: 172px;
    height: 51px;
    left: 1680px;
    top: 500px;
  }
  .click-block-4 {
    width: 150px;
    height: 130px;
    left: 767px;
    top: 510px;
  }
  .guide-main-1 {
    background-image: url("img/guide/guide-1.webp");
  }
  .guide-main-2 {
    background-image: url("img/guide/guide-2.webp");
  }
  .guide-main-3 {
    background-image: url("img/guide/guide-3.webp");
  }
  .guide-main-4 {
    background-image: url("img/guide/guide-4.webp");
  }
}
</style>