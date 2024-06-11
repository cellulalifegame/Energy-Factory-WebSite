<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from "vue";
import { useClaim } from "src/hooks/web3/useClaim";
import { useUserStore } from "store/modules/user";
import { User } from "src/api";
import { useGameLife } from "src/hooks/web3/useGameLife";
import { formatEther, parseEther } from "viem";
import { formatNumberWithCommas } from "src/utils/utils";
const userInfo = useUserStore()
const { buyFood, getFoodPrice } = useGameLife()
const { getPlayer, claimBitlife } = useClaim()
const account = computed(() => {
  return userInfo.walletAddress
})
const step = ref(1)
const open = ref(false)
const limit = ref(false)
const tokenId = ref('')
const imgUrl = ref(null as any)
const chargeLoading = ref(false)
const textIndex = ref(0)
const texts = [['I only need about 1 USDT, and I can work for 24 hours.', 'After charging, I can become stronger.'],['After charging, I can go mine energy!','Energy Points can be coverted to $CELL Tokens at TGE!'], ['Give me a little charge, please.', 'After charging, I can become stronger.']]
const textIndexChange = () => {
  if (textIndex.value === 2) {
    textIndex.value = 0
  } else if (textIndex.value === 1) {
    textIndex.value = 2
  } else {
    textIndex.value = 1
  }
  setTimeout(() => {
    textIndexChange()
  }, 5000)
}
const getImgUrl = async () => {
  await User.getClaimBitlifeImg(account.value).then((res: any) => {
    if (res.data) {
      step.value = 2
      imgUrl.value = res.data
    } else {
      setTimeout(() => {
        getImgUrl()
      }, 2000)
    }
  })
}
const alreadyClaimedCount = ref(0)
const totalCount = ref(0)
const getUserData = async () => {
  if (account.value) {
    User.getClaimCount().then((res: any) => {
      if (res.code === 200) {
        alreadyClaimedCount.value = res.data?.alreadyClaimedCount
        totalCount.value = res.data?.totalCount
        if (alreadyClaimedCount.value >= totalCount.value) {
          limit.value = true
        }
      }
    })
    const id = await getPlayer(account.value)
    tokenId.value = id.toString()
    console.log(tokenId.value);
    if (tokenId.value !== '0') {
      step.value = 2
      progressloading.value = true
      imgUrl.value = null
      textIndexChange()
      setTimeout(() => {
        progressValue.value = 50
        progressloading.value = false
      }, 500)
      await getImgUrl()
    } else {
      imgUrl.value = null
      step.value = 1
      progressValue.value = 0
    }
  }
}
const showGlobalMessage: any = inject('showGlobalMessage');

const chargeBitlife = () => {
  if (!chargeLoading.value) {
    chargeLoading.value = true
    progressloading.value = false
    increaseProgressBar(20000,95, 50)
    buyFood([tokenId.value],86400,parseEther(foodPrice.value)).then((res: any) => {
      User.saveClaimRecord(account.value, tokenId.value)
      step.value++
      chargeLoading.value = false
      progressValue.value = 100
    })
        .catch((error: any) => {
          chargeLoading.value = false
          progressloading.value = true
          setTimeout(() => {
            progressValue.value = 50
            progressloading.value = false
          }, 500)
          console.log(error);
          let isBalance = error.toString().indexOf('The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.') !== -1
          if (isBalance) {
            showGlobalMessage('Insufficient Balance')
          }
        })
  }
}
const foodPrice = ref('')
onMounted(async () => {
  await getUserData()
  const price = await getFoodPrice(86400)
  foodPrice.value = formatEther(price)
})
const progressValue = ref(0)
const progressloading = ref(false)
function increaseProgressBar(duration: number, target: number, current?: number) {
  let start = current ? current : 0;
  const end = target;
  const incrementTime = duration / end;
  const interval = setInterval(() => {
    start++;
    progressValue.value = start
    if (progressloading.value) {
      clearInterval(interval);
    }
    if (start >= end) {
      clearInterval(interval);
    }
  }, incrementTime);
}
const claimloading = ref(false)
const claim = () => {
  if (!claimloading.value) {
    claimloading.value = true
    open.value = true
    progressloading.value = false
    increaseProgressBar(20000,45)
    claimBitlife().then((res: any) => {
      claimloading.value = false
      getUserData()
    })
        .catch((error: any) => {
          progressloading.value = true
          setTimeout(() => {
            claimloading.value = false
            progressValue.value = 0
            open.value = false
            progressloading.value = false
          }, 500)
          console.log(error);
          let isBalance = error.toString().indexOf('The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.') !== -1
          if (isBalance) {
            showGlobalMessage('Insufficient Balance')
          }
        })
  }
}
watch(
    () => account.value,
    () => {
      getUserData()
    }
)
const emit = defineEmits(['closeSafepal', 'closeSafepalVisible'])
</script>

<template>
<div class="safepal-container">
  <div class="close-icon" @click="emit('closeSafepal')"></div>
  <div class="title"></div>
  <div class="progress-container">
    <div class="rock rock1 rock-active"></div>
    <div class="rock rock2" :class="step >= 2 ? 'rock-active' : ''"></div>
    <div class="rock rock3" :class="step >= 3 ? 'rock-active' : ''"></div>
    <div class="progress-block" :style="{width: `${progressValue}%`}"></div>
    <div class="rock-container"></div>
    <div class="hoe" :class="step === 2 ? 'hoe-2' : step === 3 ? 'hoe-3' : ''" :style="{left: `${progressValue - 6}%`}">
      <div class="hoe-icon"></div>
    </div>
  </div>
  <div class="section-one" v-if="step === 1">
    <div class="title-container" v-if="limit">
      Thank you for your participation. The free giveaway has ended, <br/> Please stay try more of Cellula's game features!
    </div>
    <div v-if="limit" class="nodata">
    </div>
    <div class="box-container" v-if="!limit">
      <div v-if="!open" @click="claim" class="box"></div>
      <div v-else class="open"></div>
    </div>
    <div v-if="limit" @click="emit('closeSafepalVisible')" class="button">Get More</div>
    <div class="limt-container">
      One address can only get 1 FREE BitLife Once <span>({{ formatNumberWithCommas(alreadyClaimedCount) }}/{{ formatNumberWithCommas(totalCount) }})</span>
    </div>
  </div>
  <div class="section-two" v-if="step === 2">
    <template v-if="!chargeLoading">
      <div class="nft-container">
        <div class="cover" :style="{ backgroundImage: `url('${imgUrl}')` }"></div>
        <div class="message-1">{{ texts[textIndex][0] }}</div>
        <div class="message-2">{{ texts[textIndex][1] }}</div>
      </div>
      <div class="button-container">
        <div class="charge" @click="chargeBitlife">Charge</div>
        <div class="description">
          {{foodPrice}}BNB ≈ 1USDT
        </div>
      </div>
    </template>
    <div v-else class="loading-container">
      <div class="loading-box">
        <div class="loading"></div>
      </div>
    </div>
  </div>
  <div class="section-three" v-if="step === 3">
    <div class="description-container">
      <div class="left-cover"></div>
      <div class="nft-container">
        <div class="cover" :style="{ backgroundImage: `url('${imgUrl}')` }"></div>
        <div class="message-1">After charging, I can go mine energy!</div>
      </div>
    </div>
    <div class="button" @click="emit('closeSafepalVisible')">Get More</div>
  </div>
</div>
</template>

<style scoped lang="scss">
.safepal-container {
  width: 1030px;
  height: 632px;
  background-image: url("img/safepal/bg.png");
  position: relative;
  .close-icon {
    position: absolute;
    right: -44px;
    top: -40px;
  }
  .title {
    width: 485px;
    height: 46px;
    margin-left: 50%;
    transform: translateX(-50%);
    background-image: url("img/safepal/title.png");
  }
  .progress-container {
    width: 726px;
    height: 18px;
    margin-top: 45px;
    background-image: url("img/safepal/progress.png");
    margin-left: 66px;
    position: relative;
    .progress-block {
      width: 0;
      height: 15px;
      position: absolute;
      top: 0;
      left: 0;
      transition: 1s;
      background-image: url("img/safepal/progress-block.png");
    }
    .rock-container {
      width: 711px;
      position: absolute;
      height: 33px;
      left: 129px;
      top: -10px;
      z-index: 2;
      background-image: url("img/safepal/rock-container.png");
    }
    .rock {
      width: 64px;
      height: 43px;
      background-image: url("img/safepal/rock.png");
      position: absolute;
      top: -22px;
      z-index: 1;
      &:after {
        position: absolute;
        content: 'Get a free BitLife';
        width: 250px;
        color: #33CD41;
        left: -90px;
        font-size: 20px!important;
        bottom: -32px;
        text-align: center;
      }
    }
    .rock1 {
      left: -22px;
      background-image: url("img/safepal/rock-active.png");
    }
    .rock2 {
      left: 50%;
      transform: translateX(-50%);
      &:after {
        content: 'Charge';
      }
    }
    .rock3 {
      right: -20px;
      &:after {
        content: 'Collect Energy';
      }
    }
    .rock-active {
      background-image: url("img/safepal/rock-active.png");
      &:after {
        color: #FFD75F;
        text-shadow: 0px 0px 12px #FF650E;
        font-size: 24px;
      }
    }
    .hoe {
      width: 108px;
      height: 103px;
      position: absolute;
      z-index: 2;
      transition: 1s;
      left: -50px;
      top: -84px;
      .hoe-icon {
        width: 108px;
        height: 103px;
        animation: hoeAnimation .4s infinite linear;
      }
    }
  }
  .button {
    width: 218px;
    height: 69px;
    color: #FFF372;
    text-shadow: 0px 0px 19.807px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 0.472px #FF8F33;
    font-size: 26px;
    text-align: center;
    line-height: 66px;
    cursor: pointer;
    //transform: translateX(20px);
    background-image: url("img/safepal/get-more.png");
  }
  .section-one {
    margin-top: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .nodata {
      width: 98px;
      height: 121px;
      margin-top: 20px;
      background-image: url("img/safepal/nodata.png");
    }
    .title-container {
      text-align: center;
      color: #9CC7DA;
      text-align: center;
      font-size: 24px;
    }
    .box-container {
      position: absolute;
      width: 200px;
      height: 200px;
      top: 100px;
      .box {
        width: 273px;
        height: 400px;
        background-image: url("img/safepal/box1.png");
        transform: translateY(-200px);
        animation: safepalBoxAnimation 1s infinite linear;
        cursor: pointer;
      }
      .open {
        width: 341px;
        height: 358px;
        background-image: url("img/safepal/open1.png");
        animation: safepalOpenAnimation 1s linear 1 forwards;
        pointer-events: none;
        transform: translateX(-100px) translateY(-150px);
      }
    }
    .button {
      position: absolute;
      top: 220px;
    }
    .limt-container {
      position: absolute;
      color: #4C9EE8;
      font-size: 16px;
      top: 320px;
      right: -20px;
      span {
        color: #EAF5FF;
      }
    }
  }
  .section-two {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .loading-container {
      width: 100%;
      height: 300px;
      position: relative;
      top: 90px;
      .loading-box {
        position: absolute;
        transition: .1s;
        animation: safepalAnimation 10s infinite linear;
      .loading {
          width: 135px;
          height: 242px;
          animation: safepalLoadingAnimation 2.4s steps(1) infinite;
          background-image: url("img/safepal/loading1.png");
        }
      }
    }
    .nft-container {
      width: 280px;
      height: 280px;
      background-repeat: no-repeat;
      background-position: bottom;
      background-size: 244px 127px;
      background-image: url("img/safepal/nft-bottom.png");
      position: relative;
      .cover {
        width: 256px;
        height: 256px;
        background-size: 4090px 256px;
        background-repeat: no-repeat;
        position: absolute;
        top: 52px;
        left: 12px;
        background-image: url("https://img.cellula.life/roleimagefactory/d33_D_15.png");
        animation: AvatarWalk 1.2s steps(1) infinite;
        transform: translateY(-65px) translateX(-5px);
      }
      .message-1 {
        width: 246px;
        height: 58px;
        padding: 4px 12px 6px;
        color: #337FC4;
        font-size: 15px;
        position: absolute;
        left: -180px;
        top: 50px;
        background-image: url("img/safepal/message.png");
      }
      .message-2 {
        width: 247px;
        height: 58px;
        padding: 4px 20px 6px;
        color: #337FC4;
        font-size: 15px;
        position: absolute;
        right: -240px;
        top: 82px;
        background-image: url("img/safepal/message-2.png");
      }
    }
    .button-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      .charge {
        width: 226px;
        height: 71px;
        padding-left: 80px;
        color: #3775AD;
        line-height: 70px;
        font-size: 26px;
        cursor: pointer;
        background-image: url("img/safepal/charge.png");
      }
      .charge:hover {
        color: #FFF372;
        text-shadow: 0px 0px 19.807px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 0.472px #FF8F33;
        background-image: url("img/safepal/charge-hover.png");
      }
      .description {
        color: #FFD75F;
        font-size: 16px;
        margin-top: 18px;
      }
    }
  }
  .section-three {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 50px;
    .description-container{
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .left-cover {
        width: 400px;
        height: 293px;
        background-image: url("img/safepal/description.png");
      }
      .nft-container {
        width: 280px;
        height: 280px;
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: 244px 127px;
        background-image: url("img/safepal/nft-bottom.png");
        position: relative;
        .cover {
          width: 256px;
          height: 256px;
          background-size: 4090px 256px;
          background-repeat: no-repeat;
          position: absolute;
          top: 52px;
          left: 12px;
          background-image: url("https://img.cellula.life/roleimagefactory/d33_D_15.png");
          animation: AvatarWalk 1.2s steps(1) infinite;
          transform: translateY(-65px) translateX(-5px);
        }
        .message-1 {
          width: 247px;
          height: 52px;
          padding: 12px;
          color: #337FC4;
          font-size: 15px;
          position: absolute;
          left: -180px;
          top: 10px;
          background-image: url("img/safepal/message.png");
        }
        .message-2 {
          width: 247px;
          height: 52px;
          padding: 12px 32px;
          color: #337FC4;
          font-size: 12px;
          position: absolute;
          right: -240px;
          top: 62px;
          background-image: url("img/safepal/message-2.png");
        }
      }
    }
  }
}
</style>