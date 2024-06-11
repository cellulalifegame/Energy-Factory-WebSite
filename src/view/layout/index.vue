<script setup lang="ts">
import { inject, onMounted, reactive, ref, toRefs, watch} from 'vue'
import {clickMusic, closeMusic, getSrc} from 'src/utils/utils'
import {getStr} from 'src/hooks/useComming'
import {useUserStore} from 'store/modules/user'
import {computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {User} from "src/api";
import BackgroundMusic from 'src/assets/musics/background.mp3'
import {networkList} from 'src/hooks/web3/network';
import {useLoadingBar} from "naive-ui";
import { useWeb3Modal } from "@web3modal/wagmi/vue"
import { disconnect, getChainId, switchChain } from "@wagmi/core";
import { config } from "src/hooks/config";

const modal = useWeb3Modal()
const route: any = useRoute()
const router = useRouter()
const UserStore = useUserStore()

const state = reactive({
  scrollTop: 0,
  activitiesActive: false,
  musicStatus: true,
  newVisible: false,
  netWorkVisible: false,
  checkVisible: false,
  settingVisible: false
})
const account: any = computed(() => {
  return UserStore.walletAddress
})

const connect = (async () => {
  await modal.open()
})
const chainStatus = computed(() => {
  return UserStore.chainStatus
})
let stars: any = [];
let count = 1000;
const setup = (() => {
  const canvas: any = document.getElementById('star-background');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 0.5 + 0.5,
      vx: Math.floor(Math.random() * 10) - 5,
      vy: Math.floor(Math.random() * 10) - 5
    });
  }
})
const draw = (() => {
  const canvas: any = document.getElementById('star-background');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i++) {
    let star = stars[i];
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.x += star.vx / 20;
    star.y += star.vy / 20;
    if (star.x < -50) star.x = width + 50;
    if (star.y < -50) star.y = height + 50;
    if (star.x > width + 50) star.x = -50;
    if (star.y > height + 50) star.y = -50;
  }
  requestAnimationFrame(draw);
})
const handleScroll = (() => {
  // isHeaderVisible.value = window.scrollY <= 50;
})

window.addEventListener('resize', () => {

});
const viewVisible = computed(() => {
  return UserStore.viewVisible
})
const goWebSite = (() => {
  window.location.href = networkList[networkStatus.value].websiteUrl
})
const goPacMan = (() => {
  window.open(networkList[networkStatus.value].pacmanUrl)
})
const goToGuide = (() => {
  router.push('/guide')
})
const userLifeList = computed(() => {
  return UserStore.userLifeList
})
const getMiningInfo = async () => {
  User.getMiningInfo(account.value).then((res: any) => {
    if (res.code === 200) {
      UserStore.setPoints(res.data.myEnergy)
      UserStore.setReloadData(true)
    }
  })
}
const showGlobalMessage: any = inject('showGlobalMessage');

watch(
    () => account.value,
    async () => {
      if (account.value) {
        await User.syncUser(account.value)
        await getMiningInfo()
      } else {
        sessionStorage.removeItem('account')
      }
    }
)

const openUrl = ((url: string) => {
  window.open(url)
})

const audioRef = ref<HTMLAudioElement | any>(null);

onMounted(async () => {
  const music = localStorage.getItem('musicStatus')
  if (music === 'false') {
    state.musicStatus = false
  } else {
    localStorage.setItem('musicStatus', state.musicStatus.toString())
    document.body.addEventListener('mouseover', handleMouseOver);
  }
  // window.addEventListener('scroll', handleScroll, true)
  // setup();
  // draw();
})
const handleMouseOver = () => {
  audioRef.value.play();
}
watch(
    () => state.musicStatus,
    () => {
      if (state.musicStatus) {
        document.body.addEventListener('mouseover', handleMouseOver);
        audioRef.value.play()
      } else {
        audioRef.value.pause()
        document.body.removeEventListener('mouseover', handleMouseOver);
      }
      localStorage.setItem('musicStatus', state.musicStatus.toString())
    }
)
const networkStatus = computed(() => {
  return UserStore.networkStatus
})
const switchNetwork = (index: number) => {
  state.netWorkVisible = false
  UserStore.setNetworkStatus(index)
  location.reload()
}
const loadingBar = useLoadingBar()

watch(
    () => route.path,
    () => {
      clickMusic()
    }
)
const checkAddress = computed(() => {
  return UserStore.checkAddress
})
watch(
    () => checkAddress.value,
    () => {
      if (checkAddress.value) {
        state.checkVisible = true
        UserStore.setCheckAddress(false)
      }
    }
)
const errorMsg = computed(() => {
  return UserStore.errorMsg
})
watch(
    () => errorMsg.value,
    () => {
      if (errorMsg.value) {
        showGlobalMessage(errorMsg.value)
        UserStore.setErrorMsg('')
      }
    }
)
const isHeaderVisible = ref(false);
const updateMousePosition = (event: MouseEvent) => {
  if (isHeaderVisible.value) {
    isHeaderVisible.value = event.clientY <= 90;
  } else {
    if (route.name === 'Home' || route.name === 'Welcome') {
      isHeaderVisible.value = event.clientY <= 20;
    }
  }
}
const menuVisible = ref(false)
const goToPdf = () => {
  window.open(location.origin+'/pdf', '_blank');
}
const chooseNetwork = async () => {
  const chainId = getChainId(config)
  await switchChain(config, {chainId: chainId})
}
const {settingVisible, musicStatus, checkVisible} = toRefs(state)
</script>

<template>
  <canvas id="star-background"></canvas>
  <audio volume="0.3" ref=audioRef autoPlay loop>
    <source :src="BackgroundMusic" type="audio/mpeg"/>
  </audio>
  <div class="game-layout" @mousemove="updateMousePosition">
    <transition
        enter-active-class="animate__animated animate__fadeInDown custom-speed"
        leave-active-class="animate__animated animate__fadeOutUp custom-speed"
        mode="out-in"
    >
      <div class="header" v-if="isHeaderVisible || route.name === 'Welcome'" id="header-container">
        <div class="header-box">
          <img @click="goWebSite" class="logo" src="img/layout/logo.png" alt="">
          <div class="header-right">
            <div v-if="!chainStatus" class="header-button network-wrong" @click="chooseNetwork" type="primary">
              Wrong NetWork
            </div>
            <div class="header-button" type="primary" v-if="!account" @click="connect">
              {{ account ? getStr(account, 4, 4) : 'Connect' }}
            </div>
            <div v-else class="menu-popover">
              <div class="header-button" @click="modal.open()">
                {{ getStr(account, 4, 4) }}
              </div>
            </div>
<!--            <n-popover  class="menu-popover" :show-arrow="false" trigger="hover" placement="bottom-end">-->
<!--              <template #trigger>-->

<!--              </template>-->
<!--            </n-popover>-->
            <div @click="settingVisible = true" class="setting-icon"></div>
          </div>
        </div>
      </div>
    </transition>
    <div class="main-template">
      <div class="view-main">
        <router-view></router-view>
      </div>
    </div>
  </div>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="checkVisible">
    <div class="check-visible">
      <div class="description">
        Cellula is in internal testing. Please wait for the next public testing round. For more details, follow us on
        <img @click="openUrl('https://twitter.com/cellulalifegame')" class="icon" src="img/layout/twitter-icon.png" alt=""> or <img @click="openUrl('https://discord.com/invite/2PMU2NvDcm')" class="icon" src="img/layout/discord-icon.png" alt="">
      </div>
      <div class="button" @click="checkVisible = false">Cancel</div>
    </div>
  </n-modal>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="settingVisible">
    <div class="edit-visible">
      <div class="close-icon" @click="settingVisible = false"></div>
      <div class="header-container">
        <div class="title-text">Settings</div>
      </div>
      <div class="music-container">
        <div class="label">
          <div class="music-img"></div>
          Music
        </div>
        <div class="music-switch" :class="musicStatus ? 'music-switch-active' : ''" @click="musicStatus = !musicStatus"></div>
      </div>
      <div class="button-container">
<!--        <div class="button-item" @click="openUrl('https://cellulalifegame.gitbook.io/cellula')">Doc</div>-->
        <div class="button-item" @click="goToPdf">Audits</div>
        <div class="button-item" @click="openUrl('https://mirror.xyz/cellulalifegame.eth/OC3zObuIRPr0OlesnFxpytnapZhe7KTbEHzzL_t8zFw')">Tutorial</div>
      </div>
      <div class="social-container">
        <div class="social-item twitter" @click="openUrl('https://twitter.com/cellulalifegame')"></div>
        <div class="social-item discord" @click="openUrl('https://discord.com/invite/2PMU2NvDcm')"></div>
        <div class="social-item telegram" @click="openUrl('https://t.me/+v71CZGhYMzY3NWRl')"></div>
      </div>
    </div>
  </n-modal>
</template>

<style scoped lang="scss">
#star-background {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-color: rgba(0, 0, 0, 0.5);
}
.custom-speed {
  --animate-duration: 0.5s;
}
.guide {
  position: fixed;
  bottom: 30px;
  right: 175px;
  cursor: pointer;
  z-index: 100;
}

.game-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0);

  .header {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 3000;
    background-color: rgba(0,0,0,0.8);
    .header-box {
      padding: 13px 110px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-url {
      width: 1920px;
      height: 60px;
      background-size: 100% 100%;
      background-image: url("src/assets/images/layout/header-banner.png");
      display: flex;
      align-items: center;
      justify-content: right;
      cursor: pointer;

      svg {
      }
    }

    .logo {
      width: 240px;
      height: 64px;
      object-fit: contain;
      cursor: pointer;
    }

    .menu {
      width: 50px;
      height: 38px;
      cursor: pointer;
    }

    .header-right {
      display: flex;
      align-items: center;
      grid-gap: 18px;
    }
    .header-button {
      height: 38px;
      font-size: 24px;
      cursor: pointer;
      padding: 0 16px;
      color: #FFF372;
      text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 6px #CC6300;
      line-height: 42px;
      border-radius: 8px;
      background: #162B56;
    }
    .network-wrong {
      color: rgba(254,27,27,.6);
      text-shadow: unset;
      background: rgba(254,27,27,.2);
      padding: 0 16px;
      height: 40px;
      border: 1px solid rgba(254,27,27,0);
      border-radius: 8px;
      line-height: 40px;
      cursor: pointer;
    }
    .setting-icon {
      width: 52px;
      height: 50px;
      background-size: 100% 100%;
      cursor: pointer;
      background-image: url("img/layout/setting-icon.png");
    }
    .setting-icon:hover {
      background-image: url("img/layout/setting-hover.png");
    }
  }

  .main-template {
    position: relative;

    .navigation-container {
      position: absolute;
      top: 92px;
      left: 175px;
      display: flex;

      .navigation-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .arrow {
          width: 16px;
          height: 27px;
          cursor: pointer;
        }

        span {
          font-size: 20px;
        }

        .special {
          cursor: pointer;

          &:nth-of-type(1) {
            margin-right: 22px;
          }
        }

        .special-active {
          color: #FFE600;
          text-decoration: underline #FFE600 6px;
          text-underline-offset: 8px;
        }
      }
    }
  }

  .breadcrumb-navigation {
    display: flex;
    align-items: center;
    flex-flow: row wrap;
    padding: 0px 106px;
    box-sizing: border-box;

    .nav {
      font-size: 24px;
      cursor: pointer;
    }

    .arrow {
      width: 10px;
      height: 16px;
      margin: 0 15px;
    }
  }

  .view-main {
  }

  .view-user {
    margin-top: 10px;
  }

  .view-guide {
    width: 1920px;
    margin-top: 0;
    padding-bottom: 0;
  }
}

@media screen and (max-width: 1920px) {
  .game-layout {
    .view-guide {
      width: 10rem;
    }
  }
}

@media screen and (max-width: 1439px) {
  .game-layout {
    .view-guide {
      width: 1920px;
    }
  }
}
</style>
