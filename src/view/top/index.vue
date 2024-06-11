<script setup lang="ts">
import {ref, onMounted, watch, reactive, toRefs, Ref, onUnmounted, inject} from 'vue'
import * as echarts from 'echarts';
import {User} from "src/api";
import {
  activeMusic,
  clickMusic,
  closeMusic,
  debounce,
  formatNumberWithCommas,
  sumNumbers, totalSum,
  truncateNumber,
  canContinuePaging
} from "src/utils/utils";
import { useRoute, useRouter } from "vue-router";
import { ethers } from "ethers";
import { useGame } from "src/hooks/web3/useGame";
import { useLoadingBar } from "naive-ui";
import ModalButton from "comps/ModalButton.vue";
import { formatEther, parseEther } from "viem";
import { getAccount, getBalance, getTransactionCount } from "@wagmi/core";
import { config } from "src/hooks/config";
import Count from "comps/Count.vue";
import Loading from '../loading/loading.vue'
const loadingBar = useLoadingBar()
const route = useRoute()
const router = useRouter()
const echartsCanvas = ref<HTMLDivElement | any>(null);
const state = reactive({
  cellulaCount: 0,
  topCellulaVos: [] as Cellula[],
  cellulaIndex: 0,
  cellulaList: [] as Cellula[],
  pageSize: 10,
  pageNum: 1,
  totalCount: 0,
  cellList: [] as Cell[],
  totalPrice: null as any,
  mintVisible: false,
  cellPrices: [] as any[],
  craftSuccessVisible: false,
  loading: false
})

const getTopCellula = () => {
  state.loading = true
  User.getTopCellula().then((res: any) => {
    state.cellulaCount = res.data.cellulaCount
    state.topCellulaVos = res.data.topCellulaVos
    state.loading = false
    getCellula()
  })
}
const getCellula = () => {
  state.pageNum = 1
  User.getCellula(state.topCellulaVos[state.cellulaIndex].geneBaseId, state.pageNum, state.pageSize).then((res: any) => {
    state.cellulaList = res.data.list
    state.totalCount = res.data.total
  })
  User.getPosition(state.topCellulaVos[state.cellulaIndex].numStr).then((res: any) => {
    state.cellList = res.data
  })
}
const dataContainer: Ref<HTMLElement | null> = ref(null);
const pageLoading = ref(false)

const handlePage = () => {
  if (!dataContainer.value || pageLoading.value || !canContinuePaging(state.pageNum, state.pageSize, state.totalCount)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainer.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    pageLoading.value = true
    state.pageNum ++
    User.getCellula(state.topCellulaVos[state.cellulaIndex].geneBaseId, state.pageNum, state.pageSize).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.cellulaList.push(item)
      })
      pageLoading.value = false
    })
  }
};
watch(
    () => state.cellulaIndex,
    () => {
      if (dataContainer.value) {
        dataContainer.value.scrollTop = 0;
      }
      getCellula()
    }
)
onMounted(() => {
  getTopCellula()
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
});
onUnmounted(() => {
  if (dataContainer.value) {
    dataContainer.value.removeEventListener('scroll', handlePage);
  }
})
watch(
    () => state.cellulaIndex,
    () => {
      activeMusic()
      currentCount.value = 1
    }
)
const { getLifePrice, mintCompound } = useGame()

const getCellsPrice = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let cells = state.cellList.map((item: Cell) => {
      return item.tokenId
    })
    getLifePrice(cells).then((res: any) => {
      let total = parseEther('0')
      res.forEach((item: any) => {
        total = total + item
      });
      state.totalPrice = total
      resolve(res)
    })
        .catch((error: any) => {
          reject(error)
        })
  })
}
const showGlobalMessage: any = inject('showGlobalMessage');
const openMintVisible = async () => {
  if (state.cellList.length) {
    await getCellsPrice().then((res: any) => {
      state.cellPrices = res
      state.mintVisible = true
    })
  }
}
const completeCount = ref(0)
const currentCount = ref(1)
watch(
    () => completeCount.value,
    () => {
      if (completeCount.value === currentCount.value) {
        completeCount.value = 0
        showGlobalMessage('Minting...', 'close')
      }
    }
)
const computedLoading = ref(false)
const computedNFTs = (async () => {
  if (!computedLoading.value) {
    computedLoading.value = true
    const {address}: any = getAccount(config)
    const balance = await getBalance(config, {
      address: address,
    })
    if (parseFloat(formatEther(balance.value)) > totalSum(currentCount.value, truncateNumber(formatEther(state.totalPrice), 6))) {
      state.mintVisible = false
      showGlobalMessage('Minting...', 'Mint')
      await getCellsPrice().then(async (res: any) => {
        state.cellPrices = res
        let total = parseEther('0')
        state.cellPrices.forEach((item) => {
          total = total+item
        });
        let cells = state.cellList.map((item: Cell) => {
          return item.tokenId
        })
        let bitLifePrice: any = 0
        const nonce = await getTransactionCount(config, {
          address: address
        })
        for (let i = 0; i < currentCount.value; i ++) {
          User.getPrice(parseInt(total.toString()), cells.toString()).then((res: any) => {
            let price = (parseFloat(formatEther(total)) * (1+0.05*res.data+1)).toFixed(18)
            bitLifePrice = ethers.utils.parseEther(price.toString())
            let cellData = state.cellList.map((item: Cell) => {
              return [parseInt(item.tokenId), item.position]
            })
            let formData = {
              price: bitLifePrice.toString(),
              cell: cellData
            }
            mintCompound(formData, nonce+i).then((res: any) => {
              state.mintVisible = false
              state.craftSuccessVisible = true
              showGlobalMessage('Successfully Mint')
              completeCount.value++
              computedLoading.value = false
            })
                .catch((error: any) => {
                  completeCount.value++
                  if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
                    showGlobalMessage('Insufficient Balance')
                  }
                  if (error.toString().substring(0,21) === 'Error: network error') {
                    showGlobalMessage('Network error')
                  }
                  computedLoading.value = false
                })
          })
        }
      })
    } else {
      showGlobalMessage('Insufficient Balance')
      computedLoading.value = false
    }
  }
})
const computedNFT = debounce(computedNFTs, 20);

watch(
    () => state.mintVisible,
    () => {
      if (state.mintVisible) {
        clickMusic()
      } else {
        closeMusic()
      }
    }
)

const { loading, cellulaCount, topCellulaVos, cellulaList, cellulaIndex, cellList, cellPrices, totalPrice, craftSuccessVisible, mintVisible, totalCount } = toRefs(state)
</script>

<template>
<div class="top-container">
  <div class="back-container">
    <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
    Leaderboard
  </div>
  <div class="navigation-rank">
    <div class="navigation-rank">
      <div class="navigation-item" @click="router.push('/top-gamers')" :class="route.name === 'TopGamers' ? 'navigation-item-active' : ''">Top Gamers</div>
      <div class="navigation-item" @click="router.push('/popular-bitlife')" :class="route.name !== 'TopGamers' ? 'navigation-item-active' : ''">Popular BitLife</div>
    </div>
  </div>
  <div class="main-container">
      <div class="left-container">
        <div class="title">
          Total number of active BitLifes: <span>{{ formatNumberWithCommas(cellulaCount) }}</span>
        </div>
        <div class="nft-container">
          <div class="cellula-item" @click="cellulaIndex = index" :class="cellulaIndex === index ? 'cellula-item-active' : '' " :key="index" v-for="(item, index) in topCellulaVos">
            <img class="img" :src="item.image" alt="">
            <div class="rank-container">Rank {{index+1}}</div>
          </div>
          <Loading size="big" v-if="loading"></Loading>
        </div>
      </div>
      <div class="right-container">
        <div class="right-box">
          <div class="avatar-container">
            <div v-if="cellulaList.length" class="avatar-img" :style="{ backgroundImage: `url('${cellulaList[0].roleImage}')` }"></div>
            <div class="avatar-bottom"></div>
          </div>
          <div class="solid-div">
            <div class="total-count">Total: <span>{{formatNumberWithCommas(totalCount)}}</span></div>
          </div>
          <div class="table-container">
            <div class="title-container">
              <div class="title-item">Token ID</div>
              <div class="title-item">Hashrate</div>
            </div>
            <div class="data-container" ref="dataContainer">
              <div class="data-item" v-for="(item, index) in cellulaList" :key="index">
                <div class="item">{{ item.tokenId }}</div>
                <div class="item">{{ formatNumberWithCommas(item.livingQty)}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="button-container">
          <Count :currentCount="currentCount" @addCount="currentCount++" @subtractCount="currentCount--"></Count>
          <div class="button" @click="openMintVisible">Mint</div>
        </div>
      </div>
  </div>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="mintVisible">
    <div class="mint-visible">
      <img @click="mintVisible = false" class="close-icon" src="img/layout/close.png" alt="">
      <div class="model-main mass-main">
        <div class="title">Mass Minting BitLife</div>
        <div class="title-container">
          <div class="title-item">BitLife</div>
          <div class="title-item">Mint Price</div>
          <div class="title-item">Quantity</div>
          <div class="title-item">Details</div>
        </div>
        <div class="data-container">
          <div class="data-item" v-for="item in currentCount">
            <div class="cover-container">
              <div class="cover" :style="{backgroundImage: `url('${cellulaList[0].roleImage}')`}"></div>
            </div>
            <div class="price">{{ truncateNumber((parseFloat(formatEther(totalPrice)) * (1 + 0.05 * item)),6) }}[BNB]</div>
            <div class="count">1</div>
            <div class="detail">
              <n-popover class="tips-text-container" :show-arrow="false" placement="bottom-end" trigger="click">
                <template #trigger>
                  <img class="detail-icon" src="img/mint/detail.png" alt="">
                </template>
                <div class="nft-popover">
                  <div class="title-container">
                    <div class="title-item"></div>
                    <div class="title-item">ID</div>
                    <div class="title-item">Price</div>
                    <div class="title-item">Quantity</div>
                  </div>
                  <div class="nft-container">
                    <div class="nft-item" v-for="(cell, index) in cellList">
                      <div class="cell-img">
                        <img :src="cell.image" alt="">
                      </div>
                      <div class="id">{{ cell.tokenId }}</div>
                      <div class="price">{{ truncateNumber((parseFloat(formatEther(cellPrices[index])) * (1 + 0.05 * item)),6) }}</div>
                      <div class="qty">1</div>
                    </div>
                  </div>
                </div>
              </n-popover>
            </div>
          </div>
        </div>
        <div class="data-border"></div>
        <div class="total-container">
          <div class="total-price">Total≈ <span class="total-price">{{totalSum(currentCount,truncateNumber(formatEther(totalPrice),6))}}[BNB]</span></div>
          <div class="qty">{{ currentCount }}</div>
        </div>
      </div>
      <div class="button-container-modal">
        <ModalButton @click="computedNFT" button-text="Mint"></ModalButton>
      </div>
    </div>
  </n-modal>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="craftSuccessVisible">
    <div class="mint-visible">
      <img @click="craftSuccessVisible = false" class="close-icon" src="img/layout/close.png" alt="">
      <div class="model-main visible-main">
        <div class="header">
          <div class="cover" id="cover">
            <div class="avatar-img" :style="{backgroundImage: `url('${cellulaList[0].roleImage}')`}"></div>
          </div>
<!--          <div class="right">-->
<!--            <div class="title">-->
<!--              <div class="label">Mint Price</div>-->
<!--            </div>-->
<!--            <div class="value">-->
<!--              <div class="label">{{ parseFloat(formatEther(totalPrice)).toFixed(6) }}</div>-->
<!--              <div class="label">[BNB]</div>-->
<!--            </div>-->
<!--          </div>-->
        </div>
        <div class="craft-description">Congratulations on completing the minting process!</div>
      </div>
      <div class="button-container-modal">
        <ModalButton type="small" @click="craftSuccessVisible = false" button-text="Mint More"></ModalButton>
        <ModalButton type="small" @click="router.push('/home')" button-text="Gain Energy"></ModalButton>
      </div>
    </div>
  </n-modal>
</div>
</template>

<style scoped lang="scss">
.top-container {
  width: 1920px;
  height: 1080px;
  background-size: 100% 100%;
  padding: 80px 156px 0;
  background-image: url("img/top/background.png");
  position: relative;
  .back-container {
    position: absolute;
    left: 146px;
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
  .navigation-rank {
    display: flex;
    gap: 12px;
    .navigation-item {
      width: 310px;
      height: 89px;
      text-align: center;
      font-size: 30px;
      line-height: 89px;
      background-size: 100% 100%;
      color: #327ABB;
      background-image: url("img/top/nav-button.png");
      cursor: pointer;
    }
    .navigation-item-active {
      color: #FFF372;
      text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
      background-image: url("img/top/nav-button-active.png");
    }
  }
  .main-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .left-container {
      width: 953px;
      height: 767px;
      border-radius: 22px;
      padding: 45px 32px 0 48px;
      background-image: url("img/top/cellula-background.png");
      background-size: 100% 100%;
      .title {
        width: 829px;
        color: #A9EEFF;
        font-size: 26px;
        padding-bottom: 12px;
        border-bottom: 2px solid #2E6495;
        span {
          font-size: 26px;
          color: #F1BB2B;
          text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
        }
      }
      .nft-container {
        width: 100%;
        height: auto;
        max-height: 600px;
        overflow-y: auto;
scrollbar-gutter: stable;
        gap: 16px 6px;
        display: flex;
        flex-flow: wrap row;
        position: relative;
        padding: 12px 0;
        .cellula-item {
          width: 161px;
          height: 196px;
          background-size: 100% 100%;
          background-image: url("img/top/cellula-item.png");
          cursor: pointer;
          padding-top: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          .rank-container {
            color: #48A2F4;
            text-shadow: 0px 0px 0.284px #1158B6;
            font-size: 22px;
            margin-top: 24px;
          }
          .img {
            width: 108px;
            height: 108px;
            margin-top: 4px;
          }
        }
        .cellula-item-active {
          &:after {
            position: absolute;
            content: '';
            width: 181px;
            height: 216px;
            background-image: url("img/top/cellula-item-active.png");
            background-size: 100% 100%;
            top: -10px;
            left: -10px;
          }
        }
      }
      .nft-container::-webkit-scrollbar{
        width:20px;
        display: block;
      }
      .nft-container::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .nft-container::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
    }
    .right-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      transform: translateY(-10px);
      .right-box {
        width: 669px;
        height: 664px;
        background-size: 100% 100%;
        background-image: url("img/top/cellula-right.png");
        padding: 86px 30px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .button-container {
        width: 100%;
        padding: 0 17px 0 32px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .button {
          font-size: 36px;
          color: #0AF3A5;
          width: 415px;
          height: 72px;
          text-align: center;
          line-height: 72px;
          background-image: url("img/mint/btn-top.png");
          background-size: 100% 100%;
          cursor: pointer;
        }
        .button:hover {
          background-image: url("img/mint/btn-top-hover.png");
        }
      }

      .avatar-container {
        width: 263px;
        height: 202px;
        background-size: 100% 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-image: url("img/featured/avatar-bottom.png");
        .avatar-img {
          width: 256px;
          height: 256px;
          background-size: 4090px 256px;
          background-repeat: no-repeat;
          position: relative;
          background-image: url("img/home/avatar-test.png");
          animation: AvatarWalk 1.2s steps(1) infinite;
          transform: translateY(-65px) translateX(-5px);
        }
      }
      .solid-div {
        width: 100%;
        height: 2px;
        background: #2E6495;
        margin: 12px 0;
        .total-count {
          color: #337FC4;
          font-size: 20px;
          transform: translateY(-28px);
          position: relative;
          &:after {
            content: '';
            position: absolute;
            left: -2px;
            top: 9px;
            width: 190px;
            height: 7px;
            background: transparent;
            border-top: 7px solid transparent;
            border-bottom: 7px solid #2B77BC;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
          }
          span {
            color: #D9E8F5;
            font-size: 20px;
          }
        }
      }
      .table-container {
        width: 100%;
        margin-top: 12px;
        z-index: 1;
        .title-container {
          width: 100%;
          display: grid;
          padding-right: 30px;
          grid-template-columns: 1fr 1fr;
          padding-bottom: 12px;
          border-bottom: 2px solid #2E6495;
          .title-item {
            font-size: 20px;
            color: #0ADCF3;
            text-align: center;
          }
        }
        .data-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
          padding-right: 10px;
          width: 100%;
          height: 260px;
          overflow-y: auto;
          scrollbar-gutter: stable;
          .data-item {
            display: grid;
            grid-template-columns: 1fr 1fr;
            height: 53px;
            width: 100%;
            background-image: url("img/top/cellula-item-data.png");
            background-size: 100% 100%;
            line-height: 53px;
            .item {
              text-align: right;
              font-size: 20px;
              color: #337FC4;
              padding-right: 94px;
              &:nth-of-type(2) {
                color: #F1BB2B;
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
      .mint-btn {
        width: 641px;
        height: 72px;
        background-image: url("img/top/mint-btn.png");
        background-size: 100% 100%;
        text-align: center;
        color: #0AF3A5;
        font-size: 36px;
        line-height: 72px;
        cursor: pointer;
      }
      .mint-btn:hover {
        background-image: url("img/top/mint-btn-hover.png");
      }
    }
  }
}
.mint-visible {
  width: 1176px;
  height: 669px;
  background-size: 100% 100%;
  background-image: url("img/layout/mint-visible.png");
  .model-main {
    padding: 80px 60px 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    .header {
      display: flex;
      align-items: center;
      gap: 90px;
      .cover {
        width: 263px;
        height: 202px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: 100% 100%;
        background-image: url("img/featured/avatar-bottom.png");
        .avatar-img {
          width: 256px;
          height: 256px;
          background-size: 4090px 256px;
          background-repeat: no-repeat;
          position: relative;
          background-position: -256px -10px;
          background-image: url("img/home/avatar-test.png");
          transform: translateY(-65px) translateX(-5px);
          animation: AvatarWalk 1.2s steps(1) infinite;
        }
      }
      .right {
        width: 342px;
        .label {
          font-size: 36px;
        }
        .title {
          display: flex;
          justify-content: space-between;
          color: #A9EEFF;
          text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
          font-size: 40px;
        }
        .value {
          display: flex;
          justify-content: space-between;
          margin-top: 52px;
          .label {
            color: #1AEB72;
            font-size: 40px;
          }
        }
      }
    }
    .craft-description {
      width: 100%;
      font-size: 32px;
      margin: 100px 0;
      color: #4C9EE8;
      text-align: center;
    }
    .cell-container {
      width: 100%;
      background-size: 100% 100%;
      margin-top: 32px;
      height: 251px;
      padding: 16px 17px 16px 24px;
      background-image: url("img/layout/cell-container.png");
      .title {
        display: grid;
        grid-template-columns: 0.3fr 1fr 1fr 1fr;
        text-align: center;
        margin-bottom: 24px;
        .item {
          color: #4C9EE8;
          font-size: 32px;
        }
      }
      .cell-box {
        overflow-y: auto;
scrollbar-gutter: stable;
        height: 150px;
        padding-right: 20px;
      }
      .cell-box::-webkit-scrollbar{
        width:20px;
        display: block;
      }
      .cell-box::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .cell-box::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
      .cell-item {
        display: grid;
        grid-template-columns: 0.3fr 1fr 1fr 1fr;
        text-align: center;
        align-items: center;
        margin: 8px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #24417E;
        .cover-container {
          display: flex;
          justify-content: left;
          .cover {
            width: 55px;
            height: 55px;
            padding: 4px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        .item {
          color: #337FC4;
          text-align: center;
          font-size: 26px;
        }
      }
    }
  }
}

</style>