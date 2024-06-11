<script setup lang="ts">
import {inject, onMounted, reactive, ref, toRefs, watch, onUnmounted} from 'vue'
import {
  activeMusic,
  clickMusic,
  closeMusic,
  debounce,
  formatNumberWithCommas,
  splitEvoHistories, sumNumbers, totalSum, truncateNumber
} from "src/utils/utils";
import ModalButton from "comps/ModalButton.vue";
import {User} from "src/api";
import { ethers } from 'ethers'
import * as echarts from 'echarts'
import { useGame } from "src/hooks/web3/useGame";
import { useLoadingBar } from 'naive-ui'
import { useRoute, useRouter } from "vue-router";
import type1 from 'img/featured/type1.png'
import type2 from 'img/featured/type2.png'
import type3 from 'img/featured/type3.png'
import redPng from 'img/featured/red.png'
import greenPng from 'img/featured/green.png'
import { formatEther, parseEther } from "viem";
import ArrowDown from 'img/featured/arrow-down.png'
import ArrowDownActive from 'img/featured/arrow-down-active.png'
import { getTransactionCount, getAccount, getBalance } from "@wagmi/core";
import { config } from "src/hooks/config";
import Count from "comps/Count.vue";

const loadingBar = useLoadingBar()

const router = useRouter()
const route = useRoute()
const { getLifePrice, mintCompound } = useGame()
const state = reactive({
  activeId: null as any,
  filterType: '2',
  filterStatus: 1,
  priceStatus: 0,
  priceCheck: false,
  mintVisible: false,
  hotLife: [] as Life[],
  cellPrices: [] as any[],
  totalPrice: null as any,
  craftSuccessVisible: false,
  dayStatus: 7,
})

const switchFilter = (type: string) => {
  if (type === 'price') {
    if (!state.priceCheck) {
      state.priceCheck = true
    } else {
      if (!state.priceStatus) {
        state.priceStatus = 1
      } else {
        state.priceCheck = false
        state.priceStatus = 0
      }
    }
    getHotLife(state.filterStatus,parseInt(state.filterType))
  } else {
    if (type !== state.filterType) {
      clickMusic()
      state.filterType = type
      getHotLife(state.filterStatus,parseInt(state.filterType))
    }
  }
}
const myEcharts = ref(null as any)
const echartsStart = (async () => {
  User.getEvolution(foundBitLife()?.numStr).then((res: any) => {
    let aa: any = document.getElementById('echarts')
    let data = res.data
    const { qtyCountArr, stepArr } = splitEvoHistories(data);
    const myChartVolume = echarts.init(document.getElementById('shop-echarts')!)
    myChartVolume.setOption({
      xAxis: {
        type: 'category',
        data: stepArr,
        splitLine: {
          show: false
        },
        interval: 2,
        axisLine: {
          symbol: ['none', 'arrow'],
          symbolSize: [12, 14],
          symbolOffset: [0, 8],
          lineStyle: {
            color: '#458edb',
            width: 4
          }
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(0,0,0,0)'
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: false
        },
        axisLabel: {
          show: true,
          color: '#FFC75A',
          fontSize: 10
        },
        axisLine: {
          show: true,
          symbol: ['none', 'arrow'],
          symbolSize: [12, 14],
          symbolOffset: [0, 8],
          lineStyle: {
            color: '#458edb',
            width: 4
          }
        },
      },
      grid: {
        top: '4%',
        left: '20%',
        right: '7%',
        bottom: '3%',
        containLabel: false
      },
      series: [
        {
          data: qtyCountArr,
          type: 'line',
          smooth: false,
          itemStyle: {
            color: '#06FFDB'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFDF00',
        textStyle: {
          color: '#111111',
          fontWeight: 'bold'
        },
        formatter: function (params: any) {
          return `<div style="color: #111111">${params[0].data}: ${params[0].axisValue}</div>`
        }
      },
    })
    // aa.setAttribute('_echarts_instance_', '');
    myEcharts.value = myChartVolume
    window.addEventListener('resize', function() {
      myChartVolume.resize();
    });
  })
})
const chooseLife = (geneBaseId: any) => {
  activeMusic()
  state.activeId = geneBaseId
  currentCount.value = 1
  echartsStart()
}
const openMintVisible = async () => {
  if (state.hotLife.length) {
    await getCellsPrice().then((res: any) => {
      state.cellPrices = res
      state.mintVisible = true
    })
  }
}
const getCellsPrice = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    let cells: any = foundBitLife()?.cells.map((item) => {
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
      showGlobalMessage('Minting...', 'Minting...')
      await getCellsPrice().then(async (res: any) => {
        state.cellPrices = res
        let total = parseEther('0')
        state.cellPrices.forEach((item) => {
          total = total+item
        });
        let cells: any = foundBitLife()?.cells.map((item) => {
          return item.tokenId
        })
        let bitLifePrice: any = 0
        const nonce = await getTransactionCount(config, {
          address: address
        })
        for (let i = 0; i < currentCount.value; i ++) {
          await User.getPrice(parseInt(total.toString()), cells.toString()).then(async (res: any) => {
            let price = (parseFloat(formatEther(total)) * (1 + 0.05 * (res.data+1))).toFixed(18)
            bitLifePrice = ethers.utils.parseEther(price.toString())
            let formData = {
              price: bitLifePrice.toString(),
              cell: foundBitLife()?.positions
            }
            mintCompound(formData, nonce+i).then((res: any) => {
              state.mintVisible = false
              state.craftSuccessVisible = true
              showGlobalMessage('Successfully Mint')
              completeCount.value++
              computedLoading.value = false
              getHotLife(state.filterStatus, parseInt(state.filterType))
            })
                .catch((error: any) => {
                  completeCount.value++
                  if (error.toString().substring(0, 32) === 'Error: EstimateGasExecutionError') {
                    showGlobalMessage('Insufficient Balance')
                  }
                  if (error.toString().substring(0, 21) === 'Error: network error') {
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

const getHotLife = (rule: number, type: number) => {
  loadingBar.start()
  User.getHotLife(rule, type, state.priceCheck ? state.priceStatus : 2).then((res: any) => {
    state.hotLife = res.data
    loadingBar.finish()
  })
}
const loading = ref(false)
let isPolling = ref(true);
let isLoading = ref(false)
const reloadInfo = () => {
  if (isPolling.value && !isLoading.value && route.name === 'Shop') {
    isLoading.value = true
    if (state.filterType) {
      User.getHotLife(state.filterStatus,parseInt(state.filterType), state.priceCheck ? state.priceStatus : 2).then((res: any) => {
        state.hotLife = res.data
        const hasId = res.data.some((item: Life) => item.geneBaseId === state.activeId)
        if (!hasId) {
          state.activeId = res.data[0].geneBaseId
        }
        setTimeout(() => {
          isLoading.value = false
          reloadInfo()
        }, 3000)
      })
    }
  }
}
onUnmounted(() => {
  isPolling.value = false;
  if (myEcharts.value) {
    myEcharts.value.dispose()
  }
})
onMounted(() => {
  loadingBar.start()
  loading.value = true
  User.getHotLife(state.filterStatus,parseInt(state.filterType), 2).then((res: any) => {
    state.hotLife = res.data
    state.activeId = res.data[0].geneBaseId
    echartsStart()
    loadingBar.finish()
    loading.value = false
    setTimeout(() => {
      isPolling.value = true
      reloadInfo()
    }, 3000)
  })
})
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
const foundBitLife = () => {
  return state.hotLife.find(item => item.geneBaseId === state.activeId)
}
watch(
    () => state.dayStatus,
    () => {
      if (state.dayStatus === 7) {
        switchFilter('2')
      } else if (state.dayStatus === 1) {
        switchFilter('1')
      } else {
        switchFilter('4')
      }
    }
)
const { priceCheck, priceStatus, activeId, filterType, filterStatus, mintVisible, hotLife, cellPrices, totalPrice, craftSuccessVisible, dayStatus } = toRefs(state)
</script>

<template>
  <div class="featured-container">
    <div class="table-container">
      <div class="title">
        Top BitLife
      </div>
      <div class="filter-container">
        <div class="filter-item" :class="dayStatus == 1 ? 'filter-active' : ''" @click="dayStatus = 1">
          1D Hashrate
        </div>
        <div class="filter-item" :class="dayStatus == 7 ? 'filter-active' : ''" @click="dayStatus = 7">
          7D Hashrate
        </div>
        <div class="filter-item" :class="dayStatus == 14 ? 'filter-active' : ''" @click="dayStatus = 14">
          14D Hashrate
        </div>
      </div>
      <div class="table-title">
        <div class="item">BitLife</div>
        <div class="item" @click="switchFilter('price')">
          Recent&nbsp;Price
          <img :src="priceCheck ? (priceStatus ? type3 : type2) : type1" alt="">
        </div>
        <div class="item">
          {{ dayStatus }}D&nbsp;Hashrate
          <n-popover class="tips-text-container" trigger="hover">
            <template #trigger>
              <img class="tips" src="img/layout/tips-icon.png" alt="">
            </template>
            <div class="tips-text">Total sum up of {{24*dayStatus}} hour's Hashrate</div>
          </n-popover>
<!--          <img class="arrow-down" :src="filterType === '1' ? (filterStatus ? ArrowDownActive : ArrowDown) : ArrowDown" alt="">-->
        </div>
        <div class="item">
          Minting count
          <n-popover class="tips-text-container" trigger="hover">
            <template #trigger>
              <img class="tips" src="img/layout/tips-icon.png" alt="">
            </template>
            <div class="tips-text">Accumulated minting count</div>
          </n-popover>
<!--          <img class="arrow-down" :src="filterType === '2' ? (filterStatus ? ArrowDownActive : ArrowDown) : ArrowDown" alt="">-->
        </div>
        <div class="item">
          Daily Energy
          <n-popover class="tips-text-container" trigger="hover">
            <template #trigger>
              <img class="tips" src="img/layout/tips-icon.png" alt="">
            </template>
            <div class="tips-text">Daily Energy = （Your Hashrate / Network Hashrate） * 100% * energy output</div>
          </n-popover>
        </div>
      </div>
      <div class="table-main">
        <div class="table-grid"
             @click="chooseLife(item.geneBaseId)"
             :class="activeId === item.geneBaseId ? 'table-grid-active' : ''"
             v-for="(item, index) in hotLife"
             v-if="hotLife.length"
        >
          <div class="cover-container">
            <div class="cover" :style="{ backgroundImage: `url('${item.roleImage}')` }"></div>
          </div>
          <div class="table-data">
            <div class="item">
              {{ truncateNumber(item.lastPrice,6) }}[BNB]
              <img class="arrow" :src="item.trend !== 'up' ? redPng : greenPng" alt="">
            </div>
            <div class="item">{{ dayStatus === 7 ? formatNumberWithCommas(item.sevenDayPerformance) : dayStatus === 1 ? formatNumberWithCommas(item.oneDayPerformance) : formatNumberWithCommas(item.fourteenDayPerformance) }}</div>
            <div class="item">{{ formatNumberWithCommas(item.mintCount) }}</div>
            <div class="item">{{ formatNumberWithCommas(item.oneDayProduced)}}</div>
          </div>
        </div>
        <n-empty v-else-if="!loading" size="huge">
          <template #icon>
            <img class="empty-icon" src="img/layout/empty.png" alt="">
          </template>
        </n-empty>
      </div>
    </div>
    <div class="right-container">
      <div class="avatar-container">
        <div class="avatar-img" :style="{ backgroundImage: `url('${foundBitLife()?.roleImage}')` }"></div>
        <div class="avatar-bottom"></div>
      </div>
      <div class="echarts-container">
        <div class="title">
          Hashrate Curve
          <n-popover class="tips-text-container" trigger="hover">
            <template #trigger>
              <img class="tips" src="img/layout/tips-icon-2.png" alt="">
            </template>
            <div class="tips-text">Formed by 7 day’s BitLife Hashrate change</div>
          </n-popover>
        </div>
        <div class="description">Hashrate</div>
        <div class="echarts">
          <div class="echarts-box" id="shop-echarts"></div>
          <div class="echarts-background"></div>
        </div>
        <div class="footer">
          <div>1D</div>
          <div>7D</div>
        </div>
      </div>
      <div class="button-container">
        <Count :currentCount="currentCount" @addCount="currentCount++" @subtractCount="currentCount--"></Count>
        <div class="button" @click="openMintVisible">Mint</div>
      </div>
    </div>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="mintVisible">
      <div class="mint-visible">
        <div @click="mintVisible = false" class="close-icon"></div>
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
                <div class="cover" :style="{backgroundImage: `url('${foundBitLife()?.roleImage}')`}"></div>
              </div>
              <div class="price">{{ truncateNumber((truncateNumber(formatEther(totalPrice), 6) * (1 + 0.05 * item)),6) }}[BNB]</div>
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
                      <div class="nft-item" v-for="(cell, index) in foundBitLife()?.cells">
                        <div class="cell-img">
                          <img :src="cell.image" alt="">
                        </div>
                        <div class="id">{{ cell.tokenId }}</div>
                        <div class="price">{{ truncateNumber((parseFloat(formatEther(cellPrices[index])) * (1 + 0.05 * item)), 6) }}</div>
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
            <div class="total-price">Total≈ <span class="total-price">{{totalSum(currentCount, truncateNumber(formatEther(totalPrice), 6))}}[BNB]</span></div>
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
              <div class="avatar-img" :style="{backgroundImage: `url('${foundBitLife()?.roleImage}')`}"></div>
            </div>
<!--            <div class="right">-->
<!--              <div class="title">-->
<!--                <div class="label">Mint Price</div>-->
<!--              </div>-->
<!--              <div class="value">-->
<!--                <div class="label">{{ parseFloat(formatEther(totalPrice)).toFixed(6) }}</div>-->
<!--                <div class="label">[BNB]</div>-->
<!--              </div>-->
<!--            </div>-->
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
.featured-container {
  width: 1920px;
  height: 1080px;
  position: relative;
  .right-container {
    position: absolute;
    right: 150px;
    top: 146px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .echarts-container {
      scale: 1;
      width: 601px;
      height: 392px;
      background-size: 100% 100%;
      background-image: url("img/featured/echarts-container.png");
      padding: 44px 32px 0;
      .title {
        font-size: 22px;
        padding-left: 22px;
        color: #A9EEFF;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .description {
        font-size: 18px;
        color: #337FC4;
        padding-left: 22px;
      }
      .echarts {
        width: 486px;
        height: 238px;
        background-size: cover;
        background-position-y: 4px;
        background-repeat: no-repeat;
        position: relative;
        margin-left: 22px;
        .echarts-background {
          background-image: url("img/featured/new-grid.png");
          width: 431px;
          height: 240px;
          position: absolute;
          left: 52px;
          background-repeat: no-repeat;
          background-size: contain;
          top: -2px;
        }
        .echarts-box {
          width: 120%;
          height: 100%;
          left: -64px;
          z-index: 2;
        }
      }
      .footer {
        display: flex;
        justify-content: space-between;
        padding: 0 50px 0 105px;
        margin-top: 4px;
        position: relative;
        color: #337FC4;
        div {
          font-size: 15px;
        }
        &:after {
          content: 'Time';
          position: absolute;
          right: 0;
          top: 0;
          color: #337FC4;
          font-size: 15px;
        }
      }
    }
    .button-container {
      width: 100%;
      padding: 0 17px 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 5px;
      .button {
        font-size: 36px;
        color: #0AF3A5;
        width: 351px;
        height: 72px;
        text-align: center;
        line-height: 72px;
        background-image: url("img/mint/btn-shop.png");
        background-size: 100% 100%;
        cursor: pointer;
      }
      .button:hover {
        background-image: url("img/mint/btn-shop-hover.png");
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
        background-image: url("img/home/avatar-test3.png");
        animation: AvatarWalk 1.2s steps(1) infinite;
        transform: translateY(-65px) translateX(-5px);
      }
    }
  }
  .table-container {
    left: 130px;
    position: absolute;
    top: 80px;
    width: 1046px;
    height: 735px;
    background-size: 100% 100%;
    background-image: url("img/featured/shop-bg.png");
    padding: 52px 46px 52px 62px;
    .title {
      color: #A9EEFF;
      text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
      font-size: 32px;
    }
    .filter-container {
      color: #3775AD;
      font-size: 22px;
      margin-bottom: 22px;
      margin-top: 12px;
      display: flex;
      gap: 20px;
      .filter-item {
        width: 213px;
        height: 61px;
        text-align: center;
        line-height: 66px;
        font-size: 24px;
        color: #275E91;
        cursor: pointer;
        background-image: url("img/featured/filter.png");
      }
      .filter-active {
        color: #FFF;
        text-shadow: 0px 0px 4px #06FFF0, 0px 0px 12px rgba(6, 255, 219, 0.63);
        background-image: url("img/featured/filter-active.png");
      }
    }
    .table-main {
      height: 440px;
      overflow-y: auto;
      scrollbar-gutter: stable;
    }
    .table-main::-webkit-scrollbar{
      width:20px;
      display: block;
    }
    .table-main::-webkit-scrollbar-track {
      border-radius: 20px;
      background: #000;
    }
    .table-main::-webkit-scrollbar-thumb{
      border-radius: 20px;
      background: #3780C1;
    }
    .table-description {
      color: #FFE500;
      font-size: 14px;
      text-align: center;
      margin-right: 54px;
      margin-left: 44px;
      margin-top: 12px;
    }
    .table-grid {
      font-size: 18px;
      align-items: center;
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      width: 912px;
      height: 72px;
      background-size: 100% 100%;
      background-image: url("img/featured/bitlife-item.png");
      padding-left: 22px;
      color: #4B90CE;
      .cover {
        width: 64px;
        height: 64px;
        background-size: 1024px 64px;
        background-position: -704px 0;
        background-repeat: no-repeat;
        scale: 1.3;
        transform: translateX(-10px) translateY(-3px);
      }
      .table-data {
        flex: 1;
        display: grid;
        grid-template-columns: 166px 194px 230px 1fr;
        height: 38px;
        border-radius: 4.869px;
        transform: translateX(-22px) translateY(2px);
        .item {
          height: 38px;
          line-height: 38px;
          position: relative;
          font-size: 17px;
          text-align: right;
          &:nth-of-type(1) {
            transform: translateX(8px);
          }
          &:nth-of-type(4) {
            //padding-right: 14px;
          }
          .arrow {
            width: 19px;
            height: 30px;
            top: 50%;
            transform: translateY(-60%);
            position: absolute;
            left: 170px;
          }
        }
      }
    }
    .table-grid-active {
      background-image: url("img/featured/bitlife-item-active.png");
      color: #FFD570;
    }
    .table-title {
      display: grid;
      grid-template-columns: 100px 0.6fr 1fr 1.1fr 1fr;
      margin-bottom: 22px;
      border-bottom: 2px solid #3775AD;
      padding-bottom: 14px;
      .item {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 22px;
        color: #0ADCF3;
        font-family: SnasmBook;
        &:nth-of-type(2) {
          justify-content: center;
        }
        &:nth-of-type(3) {
          justify-content: center;
        }
        &:nth-of-type(4) {
          justify-content: center;
        }
        &:nth-of-type(5) {
          justify-content: right;
          padding-right: 12px;
        }
      }
      img {
        width: 16px;
        height: 26px;
        cursor: pointer;
      }
      .arrow-down {
        width: 14px;
        height: 12px;
      }
    }
  }
  .cellula-name {
    font-size: 16px;
    position: absolute;
    left: 666px;
    top: 225px;
  }
}
.mint-visible {
  width: 1176px;
  height: 669px;
  background-size: 100% 100%;
  background-image: url("img/layout/setting-background.png");
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
          animation: AvatarWalk 1.2s steps(1) infinite;
          transform: translateY(-65px) translateX(-5px);
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