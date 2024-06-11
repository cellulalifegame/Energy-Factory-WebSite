<script setup lang="ts">
import {ref, onMounted, computed, watch, reactive, toRefs, Ref, onUnmounted} from 'vue'
import * as echarts from 'echarts';
import {User} from "src/api";
import {useUserStore} from "store/modules/user";
import {getStr} from "src/hooks/useComming";
import { formatDate, formatNumberForEnglish, formatNumberWithCommas } from "src/utils/utils";
import { useRoute, useRouter } from "vue-router";
import Loading from '../loading/loading.vue'

const route = useRoute()
const router = useRouter()
const echartsCanvas = ref<HTMLDivElement | any>(null);

const state = reactive({
  topPlayers: [] as Player[],
  myQtySum: 0,
  rank: 0,
  energyEarnVos: [] as Energy[],
  pageSize: 30,
  pageNum: 1,
  myCoefficient: 0,
  loading: false
})
const generateRandomData = () => {
  const data: any = [];
  for (let i = 1; i <= 100; i++) {
    data.push({
      name: i.toString(),
      value: Math.floor(Math.random() * 100) + 1,
    });
  }
  return data;
};
const startEcharts = () => {
  const myChart = echarts.init(echartsCanvas.value);
  const data = state.topPlayers.map(player => ({
    name: player.ethAddress,
    value: player.qtySum
  }));
  const option = {
    color: ['#327BBD'],
    series: [
      {
        type: 'treemap',
        label: {
          show: true,
          color: '#111',
          fontSize: 20,
          fontWeight: 'bold',
          formatter: function (params: any) {
            const name = params.name;
            const value = params.value;
            return [`${getStr(name,4,4)}`, `Hashrate:${formatNumberWithCommas(value)}`].join('\n')
          },
          distance: 0,
          padding: 5,
          position: 'inside',
          overflow: 'truncate',
        },
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        breadcrumb: {
          show: false
        },
        itemStyle: {
          emphasis: {
            color: '#52ABFC',
            label: {
              color: '#103E68'
            }
          },
          normal: {
            borderColor: '#111',
            borderWidth: 1,
            borderRadius: 5,
          }
        },
        data: data,
        roam: true
      }
    ]
  };
  myChart.setOption(option);
  window.addEventListener('resize', function() {
    myChart.resize();
  });
}
const userInfo = useUserStore()
const address = computed(() => {
  return userInfo.walletAddress
})
const getTopPlayer = () => {
  if (address.value) {
    state.loading = true
    User.getTopPlayer(address.value).then((res: any) => {
      state.loading = false
      state.topPlayers = res.data.topPlayers
      state.rank = res.data.rank
      state.myQtySum = res.data.myQtySum
      state.myCoefficient = res.data.myCoefficient
      startEcharts()
      getEnergyHistories()
    })
  }
}
const getEnergyHistories = () => {
  if (address.value) {
    User.getEnergyHistories(address.value).then((res: any) => {
      if (res.code === 200) {
        state.energyEarnVos = res.data
      }
    })
  }
}
const dataContainer: Ref<HTMLElement | null> = ref(null);

onMounted(() => {
  if (address.value) {
    getTopPlayer()
  }
});
watch(
    () => address.value,
    () => {
      if (address.value) {
        getTopPlayer()
      }
    }
)
const { myCoefficient, energyEarnVos, rank, myQtySum, loading } = toRefs(state)
</script>

<template>
  <div class="top-container">
    <div class="back-container">
      <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
      Leaderboard
    </div>
    <div class="navigation-rank">
      <div class="navigation-item" @click="router.push('/top-gamers')" :class="route.name === 'TopGamers' ? 'navigation-item-active' : ''">Top Gamers</div>
      <div class="navigation-item" @click="router.push('/popular-bitlife')" :class="route.name !== 'TopGamers' ? 'navigation-item-active' : ''">Popular BitLife</div>
    </div>
    <div class="main-container">
      <div class="left-container">
        <div class="echarts-canvas" ref="echartsCanvas" id="echarts-canvas">
        </div>
        <div class="gamer-loading" v-if="loading">
          <Loading size="big"></Loading>
        </div>
      </div>
      <div class="right-container">
        <div class="my-data">
          <div class="data-container">
            <div class="data-item">
              <span class="label">My Hashrate:</span>
              <span>
                {{ myQtySum ? formatNumberWithCommas(myQtySum) : 0 }}
<!--                {{myCoefficient ? `x${myCoefficient}` : ''}}-->
              </span>
            </div>
            <div class="data-item">
              <span class="label">Ranking:</span>
              <span>{{ rank ? rank : '---' }}</span>
            </div>
          </div>
        </div>
        <div class="right-table">
          <div class="title">Energy Generation History <br/><span>Records For The Past 1 Days</span></div>
          <div class="table-container" ref="dataContainer">
            <div class="title-container">
              <div class="title-item">Time</div>
              <div class="title-item">My Hashrate</div>
              <div class="title-item">Network Hashrate</div>
              <div class="title-item">Energy</div>
            </div>
            <div class="data-container">
              <div class="data-item" v-for="(item, index) in energyEarnVos" :key="index">
                <div class="item">{{ formatDate(item.collectTime) }}</div>
                <div class="item">{{ formatNumberWithCommas(item.qtySum) }}</div>
                <div class="item">{{ formatNumberWithCommas(item.worldSum) }}</div>
                <div class="item">{{ formatNumberForEnglish(item.capacitySum) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    position: relative;
    .left-container {
      width: 953px;
      height: 767px;
      border-radius: 22px;
      padding: 45px 45px 75px;
      background-image: url("img/top/cellula-background.png");
      background-size: 100% 100%;
      position: relative;
      .echarts-canvas {
        width: 100%;
        height: 100%;
      }
      .gamer-loading {
        width: 100%;
        top: 80px;
        position: absolute;
        left: 0;
      }
    }
    .right-container {
      .my-data {
        width: 675px;
        height: 192px;
        background-size: 100% 100%;
        padding: 16px 32px;
        background-image: url("img/top/right-header.png");
        .data-container {
          height: 100%;
          display: flex;
          align-items: center;
          .data-item {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 14px;
            span {
              font-size: 22px;
              color: #FFF372;
              text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
            }
            .label {
              font-size: 26px;
              color: #FFF;
              text-shadow: unset;
            }
          }
        }
      }
      .right-table {
        width: 704px;
        height: 550px;
        background-size: 100% 100%;
        background-image: url("img/top/gamer-background.png");
        padding: 38px 27px 0 46px;
      }
      .title {
        color: #A9EEFF;
        font-size: 26px;
        span {
          color: #337FC4;
          font-size: 22px;
          font-family: SnasmBook;
        }
      }
      .table-container {
        margin-top: 6px;
        .title-container {
          display: grid;
          grid-template-columns: 1.2fr 0.7fr 1fr 1fr;
          border-top: 2px solid #2E6495;
          padding-top: 6px;
          padding-right: 20px;
          .title-item {
            color: #0ADCF3;
            font-size: 20px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            &:nth-of-type(4) {
              justify-content: right;
              padding-right: 28px;
            }
          }
        }
        .data-container {
          width: 100%;
          margin-top: 10px;
          height: 335px;
          overflow: hidden;
          overflow-y: auto;
          scrollbar-gutter: stable;
          .data-item {
            display: grid;
            grid-template-columns: 1.2fr 0.7fr 1fr 1fr;
            align-items: center;
            width: 606px;
            height: 53px;
            background-size: 100% 100%;
            background-image: url("img/top/gamer-item.png");
            margin-bottom: 6px;
            .item {
              text-align: right;
              font-size: 18px;
              color: #337FC4;
              &:nth-of-type(1) {
                text-align: center;
              }
              &:nth-of-type(3) {
                padding-right: 22px;
              }
              &:nth-of-type(4) {
                padding-right: 24px;
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
  }
}
</style>