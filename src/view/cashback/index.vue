<script setup lang="ts">
import { useRouter } from "vue-router";
import { getStr } from "src/hooks/useComming";
import { computed, onMounted, watch, ref, inject } from "vue";
import { User } from "src/api";
import { useUserStore } from "store/modules/user";
import { formatDate } from "src/utils/utils";
import { networkList } from "src/hooks/web3/network";
import { useCharge } from "src/hooks/web3/useCharge";
import { formatEther } from "viem";
import { useLoadingBar } from "naive-ui";
const loadingBar = useLoadingBar()
const refundAmount = ref('0')
const apiAmount = ref('0')
const { claimCharge, getUserInfo, getClaimable } = useCharge()
const loading = ref(false)
const userInfo = useUserStore()
const address = computed(() => {
  return userInfo.walletAddress
})
const router = useRouter()
const feedHistory = ref([] as feedData[])
interface feedData {
  txHash: string
  sumAmount: number
  feedTime: number
}
const getRefundAmount = async () => {
  if (address.value) {
    loadingBar.start()
    loading.value = true
    await User.getRefundAmount(address.value).then((res: any) => {
      apiAmount.value = res.data.toString()
    })
    await getUserInfo(address.value).then((res: any) => {
      refundAmount.value = formatEther(res)
    })
    await User.getFeedHistory(address.value, 1).then((res: any) => {
      if (res.code === 200) {
        feedHistory.value = res.data
      }
    })
    loading.value = false
    loadingBar.finish()
  }
}
const showGlobalMessage: any = inject('showGlobalMessage');

const claimChargeFun = () => {
  if (refundAmount.value) {
    showGlobalMessage('Claiming...', 'Claiming')
    claimCharge().then((res: any) => {
      showGlobalMessage('Claiming...', 'close')
      showGlobalMessage('Successfully Claimed')
      getRefundAmount()
      console.log(res);
    })
        .catch((error: any) => {
          showGlobalMessage('Claiming...', 'close')
        })
  }
}
const networkStatus = computed(() => {
  return userInfo.networkStatus
})
const goToHashDetail = (url: string) => {
  window.open(`${networkList[networkStatus.value].blockExplorerUrls}/tx/${url}`)
}
onMounted(() => {
  getRefundAmount()
})
const goToPage = () => {
  window.open('https://discord.com/invite/2PMU2NvDcm')
}
watch(
    () => address.value,
    () => {
      getRefundAmount()
    }
)
</script>

<template>
<div class="cashback-container">
  <div class="cashback-main">
    <div class="back-container">
      <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
      CashBack
    </div>
    <div class="top-banner"></div>
    <div class="center-banner">
      <div class="data-container" v-if="!loading">
        <div class="center-logo"></div>
        <div class="balance" :class="refundAmount === '0' && apiAmount !== '0' ? 'balanced' : ''">{{ apiAmount }}</div>
        <div class="claim" v-if="refundAmount !== '0'" @click="claimChargeFun">Claim</div>
        <div class="claim claimed" v-if="refundAmount === '0' && apiAmount !== '0'">Claimed</div>
      </div>
    </div>
    <div class="data-log">
      <div class="title">
        My Charging History
      </div>
      <div class="rank-container">
        <div class="title-container">
          <div class="item">Block Time</div>
          <div class="item">Amount(BNB)</div>
          <div class="item">Transactions</div>
        </div>
        <div class="data-container" ref="dataContainer">
          <div class="data-item" v-if="feedHistory.length" v-for="(item, index) in feedHistory" :key="index">
            <div class="item">{{ formatDate(item.feedTime) }}</div>
            <div class="item">{{ item.sumAmount }}</div>
            <div class="item">
              <span @click="goToHashDetail(item.txHash)">View</span>
            </div>
          </div>
          <n-empty v-else-if="!loading" size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </div>
      </div>
    </div>
    <div class="footer-container">
      <div class="title">Remarks</div>
      <div class="text-container">
        <div class="description">1.  If you have any questions regarding the refund amount, please contact us in the <span @click="goToPage">Cellula Discord</span> support center.</div>
        <div class="description">2.  Please create a ticket in the designated section below, and we will respond to your questions as soon as possible.</div>
        <div class="description-discord">
          <div class="discord1"></div>
          <div class="discord2"></div>
        </div>
        <div class="description">3.  The final interpretation and decision of this event reside with the official Cellula authorities.</div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.cashback-container {
  .cashback-main {
    z-index: 1;
    position: relative;
    padding-top: 112px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 90px;
    .back-container {
      position: absolute;
      left: 146px;
      top: 20px;
      display: flex;
      z-index: 1;
      gap: 12px;
      align-items: center;
      color: #FFF;
      text-shadow: 0 0 11.915px #1158B6, 0 0 6.808px #1158B6, 0 0 3.972px #1158B6, 0 0 1.986px #1158B6, 0 0 0.567px #1158B6, 0 0 0.284px #1158B6;
      font-size: 32px;
      .back-icon {
        width: 90px;
        height: 53px;
        cursor: pointer;
      }
    }
    .top-banner {
      width: 1586px;
      height: 299px;
      background-size: 100% 100%;
      background-image: url("img/cashback/top-banner.png");
    }
    .center-banner {
      width: 1412px;
      height: 493px;
      background-size: 100% 100%;
      background-image: url("img/cashback/center-banner.png");
      position: relative;
      .data-container {
        width: 510px;
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 180px;
        left: 484px;
        align-items: center;
        .center-logo {
          width: 227px;
          height: 34px;
          background-size: 100% 100%;
          background-image: url("img/cashback/center-logo.png");
        }
        .balance {
          color: #FFD570;
          margin-top: 10px;
          font-size: 72px;
        }
        .balanced {
          color: #3775AD;
        }
        .claim {
          width: 170px;
          height: 86px;
          background-size: 100% 100%;
          background-image: url("img/cashback/btn.png");
          color: #FFF372;
          text-shadow: 0px 0px 19.807px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 0.472px #FF8F33;
          font-size: 38px;
          text-align: center;
          line-height: 90px;
          cursor: pointer;
          margin-top: 14px;
        }
        .claimed {
          text-shadow: unset;
          background: unset;
          pointer-events: none;
          color: #3775AD;
        }
      }
    }
    .data-log {
      width: 1604px;
      height: 780px;
      background-size: 100% 100%;
      background-image: url("img/cashback/data-log.png");
      padding-top: 37px;
      .title {
        color: #FFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 32px;
        padding-left: 18px;
      }
      .rank-container {
        width: 1604px;
        padding-left: 44px;
        padding-right: 26px;
        margin-top: 66px;
        .title-container {
          width: 1504px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-bottom: 1px solid #2E6495;
          padding: 0 44px 14px;
          .item {
            color: #0ADCF3;
            font-size: 22px;
            &:nth-of-type(1) {
              padding-left: 60px;
            }
            &:nth-of-type(2) {
              text-align: center;
            }
            &:nth-of-type(3) {
              text-align: right;
            }
          }
        }
        .data-container {
          margin-top: 4px;
          height: 550px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 5px;
          scrollbar-gutter: stable;
          padding-bottom: 22px;
          .data-item {
            width: 1508px;
            height: 64px;
            background-size: 100% 100%;
            display: grid;
            grid-template-columns: 240px 590px 628px;
            background-image: url("img/point/user-bg.png");
            .item {
              height: 64px;
              color: #337FC4;
              font-size: 22px;
              line-height: 64px;
              text-align: right;
              &:nth-of-type(2) {
                color: #33CD41;
              }
              &:nth-of-type(3) {
                color: #F1BB2B;
                span {
                  font-size: 22px;
                  cursor: pointer;
                }
              }
            }
          }
        }
        .data-container::-webkit-scrollbar{
          width:20px;
          display: block;
        }
        .data-container::-webkit-scrollbar-track {
          border-radius: 20px;
          background: #000;
        }
        .data-container::-webkit-scrollbar-thumb{
          border-radius: 20px;
          background: #3780C1;
        }
      }
    }
    .footer-container {
      width: 1585px;
      height: 593px;
      background-size: 100% 100%;
      background-image: url("img/cashback/footer-banner.png");
      margin-top: 45px;
      padding: 22px 28px;
      position: relative;
      .title {
        color: #0ADCF3;
        font-size: 24px;
      }
      .text-container {
        width: 1300px;
        top: 80px;
        left: 200px;
        position: absolute;
        .description {
          color: #337FC4;
          font-size: 19px;
          margin: 22px 0;
          &:nth-of-type(1) {
            margin-top: 0;
          }
          span {
            font-size: 19px;
            color: #F1BB2B;
            cursor: pointer;
          }
        }
        .description-discord {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 10px;
          margin-bottom: 22px;
          .discord1 {
            width: 418px;
            height: 302px;
            background-size: 100% 100%;
            background-image: url("img/cashback/discord1.png");
          }
          .discord2 {
            width: 519px;
            height: 302px;
            background-size: 100% 100%;
            background-image: url("img/cashback/discord2.png");
          }
        }
      }
    }
  }
  &:after {
    content: '';
    position: absolute;
    width: 1920px;
    height: 2500px;
    left: 0;
    top: 0;
    background-size: 100% 100%;
    background-image: url("img/cashback/background.png");
  }
}
</style>