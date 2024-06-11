<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, Ref, ref, toRefs, watch} from 'vue'
import {
  canContinuePaging,
  clickMusic, findOnesPositions,
  formatNumberForEnglish,
  formatNumberWithCommas,
  splitEvoHistories
} from "src/utils/utils";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "store/modules/user";
import {User} from "src/api";
import { useLoadingBar } from 'naive-ui'
import type1 from 'img/featured/type1.png'
import type2 from 'img/featured/type2.png'
import type3 from 'img/featured/type3.png'
import * as echarts from "echarts";
import Evolution from "src/view/cellula/mine/craft/Evolution.vue";
const loadingBar = useLoadingBar()

const router = useRouter()
const scrollAmount = 100;
const state = reactive({
  activeIndex: 0,
  filterType: '',
  filterStatus: 0,
  lifeList: [] as Life[],
  pageNum: 1,
  pageSize: 30,
  totalCount: 0,
  dayStatus: 7,
  dayVisible: false,
  evolutionModal: false,
  evolutionData: [] as any
})
const scrollDirection = ((direction: string) => {
  const scrollContainer = document.querySelector('.cell-container');
  if (scrollContainer) {
    if (direction === 'right') {
      scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  } else {
    console.error('.level-container not found');
  }
})
const goToDetail = () => {
  if (state.lifeList.length) {
    router.push(`/bitlife/${state.lifeList[state.activeIndex].tokenId}`)
  }
}
const echartsStart = (async (index: any) => {
  const data = findOnesPositions(state.lifeList[state.activeIndex].numStr)
  state.evolutionData = data
  User.getEvolution(state.lifeList[state.activeIndex].numStr).then((res: any) => {
    const data = res.data
    let aa: any = document.getElementById('echarts')
    const { qtyCountArr, stepArr } = splitEvoHistories(data);
    const myChartVolume = echarts.init(document.getElementById('echarts')!)
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
    aa.setAttribute('_echarts_instance_', '');
    window.addEventListener('resize', function() {
      myChartVolume.resize();
    });
  })
})

const switchFilter = (type: string) => {
  clickMusic()
  if (type === state.filterType) {
    state.filterStatus = state.filterStatus ? 0 : 1;
  } else {
    state.filterStatus = 0
  }
  if (state.filterType === type && !state.filterStatus) {
    state.filterType = ''
    getMyLife()
  } else {
    state.filterType = type
  }
  if (state.filterType) {
    getMyLife(state.filterStatus,parseInt(type))
  }
}
const userInfo = useUserStore()
const address = computed(() => {
  return userInfo.walletAddress
})
const rules: any = ref(null)
const types: any = ref(null)
const loading = ref(false)
const getMyLife = (rule?: number, type?: number) => {
  if (address.value) {
    loadingBar.start()
    loading.value = true
    state.pageNum = 1
    if (rule !== undefined) {
      rules.value = rule
      types.value = type
    }
    User.getMyLife(address.value, state.pageNum, state.pageSize,state.dayStatus, rule, type).then((res: any) => {
      state.lifeList = []
      state.lifeList = res.data.list
      state.totalCount = res.data.total
      loadingBar.finish()
      echartsStart(state.activeIndex)
      loading.value = false
    })
  }
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
    User.getMyLife(address.value, state.pageNum, state.pageSize,state.dayStatus, rules.value, types.value).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.lifeList.push(item)
      })
      pageLoading.value = false
    })
  }
};
onMounted(() => {
  if (address.value) {
    getMyLife()
  }
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
    () => address.value,
    () => {
      if (address.value) {
        getMyLife()
      }
    }
)
watch(
    () => state.activeIndex,
    () => {
      echartsStart(state.activeIndex)
    }
)
const chooseDay = (day: number) => {
  state.dayStatus = day
  getMyLife()
  state.dayVisible = false
}
const route = useRoute()
const { activeIndex, filterType, filterStatus, lifeList, dayStatus, dayVisible, evolutionModal, evolutionData } = toRefs(state)
</script>

<template>
<div class="cellula-page">
  <div class="navigation-container-my">
    <div class="nav-item" @click="router.push({name: 'BitLife'})" :class="route.name === 'BitLife' ? 'nav-item-active' : ''">My BitLife</div>
    <div class="nav-item" @click="router.push({name: 'BitCell'})" :class="route.name === 'BitCell' ? 'nav-item-active' : ''">My BitCell</div>
  </div>
  <div class="table-container">
    <div class="table-title">
      <div class="item">BitLife</div>
      <div class="item" @click="switchFilter('4')">Energy<img :src="filterType === '4' ? (filterStatus ? type3 : type2) : type1" alt=""></div>
      <div class="item" @click="switchFilter('5')">Current&nbsp;Hashrate<img :src="filterType === '5' ? (filterStatus ? type3 : type2) : type1" alt=""></div>
      <div class="item">
        Minted Times
        <n-popover class="tips-text-container" trigger="hover">
          <template #trigger>
            <img class="tips" src="img/layout/tips-icon.png" alt="">
          </template>
          <div class="tips-text">
            BitLife Total Working Hours/ 5 minutes =  Total Energy Generated Times
          </div>
        </n-popover>
      </div>
      <n-popover v-model:show="dayVisible" class="my-bitlife-popover" :show-arrow="false" placement="bottom" trigger="click">
        <template #trigger>
          <div class="item">
            Future {{ dayStatus }}D Hashrate
          </div>
        </template>
        <div class="bitlife-popver">
          <div class="bitlife-popver-item" :class="dayStatus === 1 ? 'bitlife-popver-item-active' : ''" @click="chooseDay(1)">Future 1D Hashrate</div>
          <div class="bitlife-popver-item" :class="dayStatus === 7 ? 'bitlife-popver-item-active' : ''" @click="chooseDay(7)">Future 7D Hashrate</div>
          <div class="bitlife-popver-item" :class="dayStatus === 14 ? 'bitlife-popver-item-active' : ''" @click="chooseDay(14)">Future 14D Hashrate</div>
        </div>
      </n-popover>
    </div>
    <div class="table-main" ref="dataContainer">
      <div class="table-grid"
           @click="activeIndex = index"
           :class="activeIndex === index ? 'table-grid-active' : ''"
           v-for="(item, index) in lifeList"
           v-if="lifeList.length"
      >
        <div class="cover-container">
          <div class="cover-box">
            <div class="cover" :style="{ backgroundImage: `url('${item.roleImage}')` }"></div>
          </div>
        </div>
        <div class="table-data">
          <div class="item" :title="item.energyProduced > 1000 ? item.energyProduced.toString() : ''">{{formatNumberForEnglish(item.energyProduced)}}</div>
          <div class="item">{{ item.livingQty }}</div>
          <div class="item">{{ item.nowStep }}</div>
          <div class="item">{{ item.oneDayPerformance ? (dayStatus === 1 ? formatNumberWithCommas(item.oneDayPerformance) : dayStatus === 7 ? formatNumberWithCommas(item.sevenDayPerformance) : formatNumberWithCommas(item.fourteenDayPerformance)) : '---' }}</div>
        </div>
      </div>
      <n-empty v-else-if="!loading" size="huge">
        <template #icon>
          <img class="empty-icon" src="img/layout/empty.png" alt="">
        </template>
      </n-empty>
    </div>
  </div>
  <div class="right-container" v-if="lifeList.length">
    <div class="avatar-container">
      <div class="avatar-id">ID: {{lifeList[activeIndex].tokenId}}</div>
      <div class="avatar-img" :style="{ backgroundImage: `url('${lifeList[activeIndex].roleImage}')` }"></div>
      <div class="play-box">
        <div class="play" @click="evolutionModal = true"></div>
      </div>
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
        <div class="echarts-box" id="echarts"></div>
        <div class="echarts-background"></div>
      </div>
      <div class="footer">
        <div>1D</div>
        <div>7D</div>
      </div>
    </div>
    <div class="button" @click="goToDetail">Detail</div>
  </div>
  <n-modal v-model:show="evolutionModal">
    <n-card
        style="width: 940px"
        size="huge"
        role="dialog"
        aria-modal="true"
        class="craft-modal"
    >
      <Evolution :evolutionData="evolutionData" @closeEvolutionVisible="evolutionModal = false"></Evolution>
    </n-card>
  </n-modal>
</div>
</template>

<style scoped lang="scss">
.cellula-page {
  height: 1080px;
  position: relative;
  .evolution-box {
    width: 390px;
    height: 320px;
    position: absolute;
    left: 160px;
    top: 374px;
    background-size: 4096px 1024px;
    background-repeat: no-repeat;
    background-position: -570px -70px;
    animation: spriteAnimationBig 0.8s steps(1) infinite;
  }
  .table-container {
    left: 130px;
    position: absolute;
    top: 80px;
    width: 1046px;
    height: 735px;
    background-size: 100% 100%;
    background-image: url("img/featured/bitlife-background.png");
    padding: 52px 46px 52px 62px;
    .title {
      color: #A9EEFF;
      text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
      font-size: 32px;
    }
    .description {
      color: #3775AD;
      font-size: 22px;
      margin-bottom: 42px;
    }
    .table-main {
      height: 460px;
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
        background-image: url("img/home/avatar-test3.png");
      }
      .table-data {
        flex: 1;
        display: grid;
        grid-template-columns: 126px 254px 180px 1fr;
        margin-right: 15px;
        margin-left: 12px;
        height: 38px;
        border-radius: 4.869px;
        transform: translateX(-22px) translateY(2px);
        .item {
          height: 38px;
          line-height: 38px;
          position: relative;
          font-size: 15px;
          text-align: right;
          &:nth-of-type(4) {
            padding-right: 12px;
          }
          .arrow {
            width: 19px;
            height: 30px;
            top: 50%;
            transform: translateY(-60%);
            position: absolute;
            left: 120px;
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
      grid-template-columns: 100px 200px 0.8fr 0.7fr 238px;
      margin-bottom: 22px;
      border-bottom: 2px solid #3775AD;
      padding-bottom: 14px;
      margin-top: 100px;
      .item {
        display: flex;
        align-items: center;
        gap: 2px;
        font-size: 16px;
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
          width: 238px;
          height: 42px;
          cursor: pointer;
          background-image: url("img/mine/filter-bg.png");
          justify-content: center;
          padding-right: 6px;
        }
      }
      img {
        width: 16px;
        height: 26px;
        cursor: pointer;
      }
    }
  }
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
        gap: 4px;
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
    .button {
      font-size: 36px;
      color: #569DDD;
      width: 566px;
      height: 72px;
      text-align: center;
      line-height: 72px;
      background-image: url("img/mine/btn-detail.png");
      background-size: 100% 100%;
      cursor: pointer;
    }
    .button:hover {
      background-image: url("img/mine/btn-detail-hover.png");
    }
    .avatar-container {
      width: 263px;
      height: 202px;
      background-size: 100% 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: url("img/featured/avatar-bottom.png");
      position: relative;
      .play-box {
        width: 92px;
        height: 88px;
        position: absolute;
        right: -134px;
        bottom: 0;
        background-image: url("img/mine/evolution.png");
        .play {
          width: 90px;
          height: 90px;
          background-image: url("img/craft/play.png");
          background-size: 100% 100%;
          cursor: pointer;
          position: relative;
          &:after {
            content: '';
            position: absolute;
            left: -5px;
            bottom: -9px;
            width: 90px;
            height: 6px;
            background: transparent;
            border-top: 6px solid transparent;
            border-bottom: 6px solid rgba(39, 126, 202, 1);
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
          }
        }

        .play:hover {
          background-image: url("img/craft/play-hover.png");
        }
      }
      .avatar-id {
        width: 500px;
        position: absolute;
        top: -90px;
        left: 50%;
        text-align: center;
        transform: translateX(-50%);
        color: #A9EEFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 28px;
      }
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
  }
}
</style>