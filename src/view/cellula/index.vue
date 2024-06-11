<script setup lang="ts">
import {useRouter, useRoute} from "vue-router";
import {getSrc} from "src/utils/utils";
import {ref} from "vue";

const router = useRouter()
const route: any = useRoute()
</script>

<template>
  <div class="cellula-container">
    <div class="back-container">
      <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
      BitLife Hub
    </div>
    <img v-show="false" v-if="route.path.includes('featured') || route.path.includes('craft')" class="title-img" src="img/layout/title.png" alt="">
    <div class="navigation-button">
      <div class="nav-item" @click="router.push({ name: 'Shop' })" :class="route.name.includes('Shop') ? 'nav-item-active' : ''">BitLife Shop</div>
      <div class="nav-item" @click="router.push({ name: 'Mint' })" :class="route.name.includes('Mint') ? 'nav-item-active' : ''">Mint BitLife</div>
      <div class="nav-item" @click="router.push({ name: 'BitLife' })" :class="route.name.includes('BitLife') || route.name.includes('BitCell') ? 'nav-item-active' : ''">My NFTs</div>
    </div>
    <div class="view">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cellula-container {
  position: relative;
  .cellula-arrow {
    position: absolute;
    left: 170px;
    width: 16px;
    height: 27px;
    cursor: pointer;
    top: 98px;
    z-index: 2;
  }
  .navigation-main {
    .navigation-container {
      position: absolute;
      top: 90px;
      left: 200px;
      display: flex;
      grid-gap: 44px;
      z-index: 1;
      align-items: center;
      .nav-item {
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
        position: relative;
        .route-icon {
          width: 38px;
          height: 33px;
          background-size: 100% 100%;
          background-image: url("img/layout/market.png");
        }
        .cellula-icon {
          width: 42px;
          height: 42px;
          background-image: url("img/layout/cellula.png");
        }
        .navigation-container-second {
          display: none;
          position: absolute;
          top: 48px;
          left: -250px;
          grid-gap: 44px;
          width: 340px;
          z-index: 1;
          .nav-item {
            font-size: 18px;
            cursor: pointer;
          }
          .nav-item-active {
            border-bottom: 6px solid #FFE600;
          }
        }
      }
      .nav-item:hover {
        .navigation-container-second {
          display: flex;
        }
      }
      .nav-item-active {
        text-decoration: underline #FFE600 6px;
        text-underline-offset: 5px;
        .route-icon {
          background-image: url("img/layout/market-hover.png");
        }
        .cellula-icon {
          background-image: url("img/layout/cellula-hover.png");
        }
      }

      .token-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .arrow {
          width: 16px;
          height: 27px;
          cursor: pointer;
        }
      }
    }
  }
  .back-container {
    position: absolute;
    left: 156px;
    top: 20px;
    display: flex;
    z-index: 1;
    gap: 12px;
    align-items: center;
    color: #FFF;
    text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
    font-size: 32px;
    .back-icon {
      width: 90px;
      height: 53px;
      cursor: pointer;
    }
  }
  .navigation-button {
    width: 100%;
    left: 0;
    top: 820px;
    position: absolute;
    z-index: 1;
    height: 90px;
    justify-content: center;
    gap: 94px;
    display: flex;
    .nav-item {
      width: 291px;
      height: 90px;
      background-image: url("img/layout/btn.png");
      cursor: pointer;
      font-size: 32px;
      background-size: 100% 100%;
      color: #569DDD;
      line-height: 90px;
      text-align: center;
    }
    .nav-item-active {
      color: #FFE78B;
      text-shadow: 0px 0px 13.306px #D65600, 0px 0px 7.603px #D65600, 0px 0px 4.435px #D65600, 0px 0px 2.218px #D65600, 0px 0px 0.634px #D65600, 0px 0px 0.317px #D65600;
      background-image: url("img/layout/btn-active.png");
    }
  }
  .title-img {
    position: absolute;
    width: 580px;
    height: 54px;
    top: 90px;
    right: 40px;
    z-index: 2;
  }

  .view {
    width: 1920px;
    height: 1080px;
    background-image: url("img/featured/background.png");
    background-size: 100% 100%;
    left: 0;
    top: 0;
    position: absolute;
  }
}
</style>