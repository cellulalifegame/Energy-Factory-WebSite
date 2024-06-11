<script setup lang="ts">
const props = defineProps<{
  size?: 'big';
  padding?: 'small'
}>()
</script>

<template>
<div class="loading-container" :class="props.padding ? 'padding-small' : ''">
  <div class="loading-img" :class="props.size ? 'loading-img-big' : ''"></div>
</div>
</template>

<style scoped lang="scss">
.loading-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20%;
  .loading-img {
    width: 70px;
    height: 64px;
    //scale: 2;
    background-image: url("img/loading/1.png");
    animation: loadingAnimation 2s infinite linear;
  }
  .loading-img-big {
    width: 139px;
    height: 124px;
    scale: 0.7;
  }
}
.padding-small {
  padding-top: 5%;
}
</style>