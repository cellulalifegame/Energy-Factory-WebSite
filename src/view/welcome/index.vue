<script setup lang="ts">
import { useUserStore } from "store/modules/user";
import { computed, watch, ref, inject, onMounted } from "vue";
import {useRoute, useRouter} from "vue-router";
import {User} from "src/api";
import { useWeb3Modal } from "@web3modal/wagmi/vue"
const router = useRouter()
const route = useRoute()
const UserStore = useUserStore()
const modal = useWeb3Modal()
const address: any = computed(() => {
  return UserStore.walletAddress
})
const walletValue = ref(false)
const goToPage = (() => {
  if (address.value) {
    router.push('/home')
  } else {
    walletValue.value = true
    modal.open()
  }
})
const showGlobalMessage: any = inject('showGlobalMessage');
watch(
    () => address.value,
    () => {
      if (address.value && route.query.name === 'safepal') {
        User.recordSource(address.value, 1)
      }
      if (address.value && route.query.code) {
        let formData = {
          ethAddress: address.value,
          inviteCode: route.query.code
        }
        User.acceptInvite(formData).then((res: any) => {
          if (res.code !== 200) {
            showGlobalMessage(res.message)
          }
        })
      }
      if (address.value && walletValue.value) {
        router.push('/home')
      }
    }
)
onMounted(() => {
  if (address.value && route.query.name === 'safepal') {
    User.recordSource(address.value, 1)
  }
  if (address.value && route.query.code) {
    let formData = {
      ethAddress: address.value,
      inviteCode: route.query.code
    }
    User.acceptInvite(formData).then((res: any) => {
      if (res.code !== 200) {
        showGlobalMessage(res.message)
      }
    })
  }
})
</script>

<template>
  <div class="welcome-container">
    <div class="welcome-dialog">
      <div class="title-1">Welcome To</div>
      <div class="title-2">GAME OF LIFE</div>
      <div class="button-start" @click="goToPage">Get Started </div>
      <div class="description">Life As It Could Be</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.welcome-container {
  width: 1920px;
  height: 1080px;
  background-image: url("src/assets/images/welcome/background.png");
  background-repeat: no-repeat;
  background-size: 1920px 1080px;
  position: relative;
  .welcome-dialog {
    width: 669px;
    height: 449px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 315px;
    background-image: url("img/welcome/dialog.png");
    display: flex;
    background-size: 100% 100%;
    flex-direction: column;
    align-items: center;
    .title-1 {
      color: #FFF;
      font-size: 30px;
      margin-top: 88px;
      text-align: center;
    }
    .title-2 {
      color: #FFE662;
      text-align: center;
      margin-top: 14px;
      text-shadow: 0px 0px 23.912px #C25E00, 0px 0px 13.664px #C25E00, 0px 0px 7.971px #C25E00, 0px 0px 3.985px #C25E00, 0px 0px 1.139px #C25E00, 0px 0px 0.569px #C25E00;
      font-family: Snasm;
      font-size: 52px;
    }
    .button-start {
      width: 489px;
      height: 72px;
      line-height: 78px;
      text-align: center;
      color: #0AF3A5;
      font-size: 36px;
      background-image: url("img/welcome/btn.png");
      background-size: 100% 100%;
      margin-top: 50px;
      cursor: pointer;
    }
    .button-start:hover {
      background-image: url("img/welcome/btn-hover.png");
    }
    .description {
      color: #337FC4;
      margin-top: 52px;
      font-size: 26px;
    }
  }
}
</style>
