<script setup lang="ts">
import { ref, inject, computed, onMounted, toRefs } from "vue";
import { useEnergyToken } from "src/hooks/web3/useEnergy";
import { useUserStore } from "store/modules/user";
import { User } from "src/api";

const userInfo = useUserStore()
const step = ref(1)
const props = defineProps({
  myAssets: Object
})
const { claimEnergy } = useEnergyToken()
const emit = defineEmits(['closeVisible'])
const closeVisible = () => {
  emit('closeVisible')
}
const showGlobalMessage: any = inject('showGlobalMessage');
const account = computed(() => {
  return userInfo.walletAddress
})
const loading = ref(false)
const claimToken = () => {
  if (!loading.value && account.value) {
    loading.value = true
    User.claimToken(account.value).then((res: any) => {
      if (res.code === 200) {
        loading.value = false
        showGlobalMessage('Successfully Claimed')
        step.value++
        emit('closeVisible')
      } else {
        loading.value = false
        showGlobalMessage(res.message)
      }
    })
  }
}

const stepUp = () => {
  if (step.value !== 3) {
    step.value = step.value + 2
  } else {
    claimToken()
  }
}
onMounted(() => {
  console.log(props.myAssets);
})
const { myAssets } = toRefs(props)
</script>

<template>
<div class="token-container">
  <div class="text-container">
    <div class="description description-one" v-if="step === 1">
      Welcome to Cellula! <br/>
      <div class="nbsp"></div>
      We are honored to have the opportunity to connect with you. Thank you for your support and interest in our game!<br/>
    </div>
    <div class="description" v-if="step === 2">
      <div class="paragraph">
        Between <span class="date">Apr 29th, 03:00 (UTC) </span> to <span> May 23th 13:00 (UTC)</span> you have accumulated <span class="count">{{ myAssets?.allEnergy }}</span> energy points<br/>
      </div>
      <div class="nbsp"></div>
      <div class="paragraph">
        The total energy generated during this period Is <span>{{ myAssets?.promotionEnergy }}</span>
      </div>
    </div>
    <div class="description" v-if="step === 3">
      <div class="paragraph">
        In the Cellula x SafePal airdrop event,
        You have accumulated
         <span class="count">{{ myAssets?.tokenCount }}</span>
        Cell Tokens as your reward.
      </div>
      <div class="nbsp"></div>
      <div class="paragraph">
        The $CELL tokens you confirmed will be able to claim when we hold our TGE.
      </div>
    </div>
    <div class="description" v-if="step === 4">
      Thank you for being part of Cellula's Game Of Life, Cellula aims to become more than just a fully on-chain AI game.<br/>
      <div class="nbsp"></div>
      Please continue to enjoy the game and stay tuned for our future airdrop events.
    </div>
  </div>
  <div class="box" v-if="step == 3"></div>
  <div class="button-container">
    <div class="button-box">
      <div class="button" :class="step === 3 ? 'claim' : ''" @click="stepUp">
        {{ step === 3 ? 'Confirm' : step === 4 ? 'Back' : 'Next' }}
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.token-container {
  width: 1180px;
  height: 762px;
  background-size: 100% 100%;
  position: relative;
  background-image: url("img/token/bg-1.png");
  .text-container {
    position: relative;
    padding: 0 50px;
    top: 250px;
    .description, .paragraph {
      color: #286296;
      font-size: 32px;
      .nbsp {
        height: 24px;
      }
      span {
        font-size: 32px;
        color: #F1BB2B;
      }
      .count {
        color: #33CD41;
      }
      .paragraph {
        position: relative;
        margin-bottom: 12px;
        &:after {
          content: '';
          position: absolute;
          width: 15px;
          height: 15px;
          background-color: rgba(28, 152, 219, 0.40);
          left: -25px;
          border-radius: 50%;
          top: 12px;
        }
      }
      .paragraph-description {
        font-size: 28px;
        margin-top: 32px;
      }
      .claim-description {
        margin-top: 32px;
        font-size: 32px;
      }
    }
    .description-one {
      //text-align: center;
      padding-top: 20px;
    }
  }
  .box {
    width: 221px;
    height: 173px;
    background-size: 100% 100%;
    position: absolute;
    bottom: -10px;
    left: -38px;
    background-image: url("img/token/box.png");
  }
  .button-container {
    position: absolute;
    right: 140px;
    bottom: 40px;
    .button-box {
      .description {
        color: #569DDD;
        font-size: 32px;
      }
    }
  }
  .button {
    cursor: pointer;
    width: 192px;
    height: 84px;
    background-image: url("img/token/btn.png");
    color: #78BFFF;
    font-size: 32px;
    text-align: center;
    line-height: 90px;
    background-size: 100% 100%;
    float: right;
    margin-right: 12px;
    margin-top: 12px;
  }
  .claim {
    background-image: url("img/token/claim.png");
    color: #FFF372;
    text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
  }
}
</style>