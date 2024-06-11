<script setup lang="ts">

</script>

<template>
  <div class="not-found-container">
    <img class="not-icon" src="img/not/404.png" alt="">
    <div class="description">
      <router-link to="/home">
        <span>Back Home</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.not-found-container {
  width: 1920px;
  height: 1080px;
  padding-top: 355px;
  .not-icon {
    width: 683px;
    height: 261px;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  .description {
    text-align: center;
    margin-top: 80px;
    span {
      color: #3D68B8;
      font-size: 50px;
      cursor: pointer;
      position: relative;
      &:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 4px;
        height: 2px;
        background: currentColor;
      }
    }
  }
}
</style>