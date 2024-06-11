<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, Ref, ref, toRefs, watch} from "vue";
import ModelButton from "comps/ModalButton.vue"
import {User} from "src/api";
import { useRoute, useRouter } from "vue-router";
import {useUserStore} from "store/modules/user";
import { splitEvoHistories, formatDate, formatNumberWithCommas, canContinuePaging } from "src/utils/utils";
import * as echarts from "echarts";
const route = useRoute()
const router = useRouter()
const options = [
  {
    label: "Mining Energy",
    value: 0
  }
]
const options2 = [
  {
    label: "3D",
    value: 3
  },
  {
    label: "7D",
    value: 7
  }
]
const state = reactive({
  filter1: 0,
  filter2: 3,
  scrollTop: 0,
  detail: {} as Detail,
  capacityRecords: [] as any,
  energySum: 0,
  pageSize: 30,
  pageNum: 1,
  totalCount: 0
})
const handleScroll = (() => {
  state.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
})
const userInfo = useUserStore()
const address = computed(() => {
  return userInfo.walletAddress
})
const loading = ref(false)
const getDetail = () => {
  if (address.value && route.params.token) {
    loading.value = true
    User.getLifeDetail(address.value, route.params.token).then((res: any) => {
      state.detail = res.data
      echartsStart()
      getEnergyList()
    })
  }
}
const getEnergyList = () => {
  state.pageNum = 1
  state.capacityRecords = null
  User.getCapacityRecords(state.filter2,address.value,state.filter1,route.params.token,state.pageNum, state.pageSize).then((res: any) => {
    state.capacityRecords = res.data.lifeEnergyPageList
    state.energySum = res.data.energySum
    state.totalCount = res.data.total
    loading.value = false
  })
}
const echartsStart = (() => {
  let aa: any = document.getElementById('echarts')
  const { qtyCountArr, stepArr } = splitEvoHistories(state.detail.evoHistories);
  const myChartVolume = echarts.init(document.getElementById('echarts')!)
  let currentIndex = stepArr.indexOf(state.detail.nowStep)
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
      top: '10%',
      left: '9%',
      right: '4%',
      bottom: '6%',
      containLabel: false
    },
    series: [
      {
        data: qtyCountArr,
        type: 'line',
        smooth: false,
        itemStyle: {
          color: '#06FFDB'
        },
        markPoint: {
          symbolSize: 25,
          symbol: 'triangle',
          label: {
            position: 'outside',
            color: '#06FFDB',
            formatter: '{b}\n{c}'
          },
          data: [
            {
              name: 'Cumulative',
              value: qtyCountArr[currentIndex],
              xAxis: currentIndex,
              yAxis: qtyCountArr[currentIndex],
              itemStyle: {
                color: '#FFDF00'
              },
              label: {
                color: '#06FFDB',
                fontSize: 14,
              },
              symbolOffset: function () {
                return [0, '15'];
              }
            }
          ],
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
const dataContainer: Ref<HTMLElement | null> = ref(null);
const pageLoading = ref(false)
const handlePage = () => {
  if (!dataContainer.value || pageLoading.value || !canContinuePaging(state.pageNum, state.pageSize, state.totalCount)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainer.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    pageLoading.value = true
    state.pageNum ++
    User.getCapacityRecords(state.filter2,address.value,state.filter1,route.params.token,state.pageNum, state.pageSize).then((res: any) => {
      res.data.lifeEnergyPageList.list.forEach((item: any) => {
        state.capacityRecords.list.push(item)
      })
      pageLoading.value = false
    })
  }
};
onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
  getDetail()
  document.documentElement.style.overflow = 'hidden';
})
onUnmounted(() => {
  document.documentElement.style.overflow = '';
})
onUnmounted(() => {
  if (dataContainer.value) {
    dataContainer.value.removeEventListener('scroll', handlePage);
  }
})
watch(
    () => address.value,
    () => {
      if (address.value) {
        getDetail()
      }
    }
)
watch(
    () => state.filter2,
    () => {
      getEnergyList()
    }
)

const { filter2, filter1, scrollTop, detail, energySum, capacityRecords } = toRefs(state)
</script>

<template>
<div class="cellula-detail">
  <div class="back-container">
    <img @click="router.back()" class="back-icon" src="img/layout/new-back.png" alt="">
    Detail
  </div>
  <div class="cellula-main">
    <div class="cover-container" :class="scrollTop > 0 ? 'cover-container-active' : ''">
      <div class="avatar-container" v-if="detail?.roleImage">
        <div class="avatar-img" :style="{ backgroundImage: `url('${detail.roleImage}')` }"></div>
      </div>
      <div class="cover-box">
        <img class="cover" :src="detail.image" alt="">
      </div>
    </div>
    <div class="detail-left-container">
      <div class="echarts-container">
        <div class="title">Hashrate</div>
        <div class="echarts-box">
          <div class="echarts" id="echarts"></div>
        </div>
        <div class="description">
          <span></span>
          <span></span>
          <span>Time</span>
        </div>
      </div>
      <div class="table-container">
        <div class="filter-container">
          <div class="select-container">
            <n-select class="select2" v-model:value="filter2" :options="options2" />
          </div>
          <div class="label">Cumulative Energy: {{ formatNumberWithCommas(energySum) }}</div>
        </div>
        <div class="table-title">
          <div class="item">Block Time</div>
          <div class="item">Hashrate</div>
          <div class="item">Share</div>
          <div class="item">Energy</div>
        </div>
        <div class="data-container" ref="dataContainer">
          <div v-if="capacityRecords?.list?.length" class="data-item" v-for="item in capacityRecords.list">
            <div class="item">{{ formatDate(item.createTime) }}</div>
            <div class="item">{{ formatNumberWithCommas(item.livingCount) }}</div>
            <div class="item">{{ item.proportion }}</div>
            <div class="item">{{ formatNumberWithCommas(item.capacity) }}</div>
          </div>
          <n-empty v-else-if="!loading" size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </div>
      </div>
    </div>
    <div class="detail">
      <div class="data-title">
        <div class="item">Chain:</div>
        <div class="item">Hashrate:</div>
        <div class="item">Current Generation:</div>
        <div class="item">Mint Price:</div>
      </div>
      <div class="data-item">
        <div class="item active">{{ detail.network }}</div>
        <div class="item active">{{ detail.livingQty }}</div>
        <div class="item active">{{ detail.nowStep }}</div>
        <div class="item active">{{ detail?.mintPrice?.toFixed(6) }} [BNB]</div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.cellula-detail {
  background-image: url("img/featured/background.png");
  background-repeat: no-repeat;
  background-size: 1920px 1080px;
  height: 1080px;
  position: relative;
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
  .cellula-main {
    padding: 70px 137px 0 154px;
    .title {
      font-size: 32px;
    }
    .cover-container {
      position: fixed;
      top: 130px;
      right: 144px;
      transition: 1s;
      display: flex;
      flex-direction: column;
      align-items: center;
      .avatar-container {
        width: 263px;
        height: 202px;
        background-size: 100% 100%;
        background-image: url("img/featured/avatar-bottom.png");
        position: relative;
        .avatar-img {
          width: 256px;
          height: 256px;
          background-size: 4090px 256px;
          background-repeat: no-repeat;
          position: relative;
          background-image: url("img/home/avatar-test.png");
          animation: AvatarWalk 1.2s steps(1) infinite;
          transform: translateY(-95px) translateX(-5px);
        }
      }
      .cover-box {
        width: 603px;
        padding: 55px 105px;
        height: 505px;
        background-image: url("img/detail/cell-background.png");
        background-size: 100% 100%;
        .cover {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          background: #003229;
        }
      }
    }
    .cover-container-active {
      top: 40%;
      scale: 0.8;
    }
    .detail-left-container {
      width: 1024px;
    }
    .echarts-container {
      border-radius: 20px;
      padding: 42px 50px 0 36px;
      width: 1053px;
      height: 345px;
      background-size: 100% 100%;
      background-image: url("img/cellula/echarts-background.png");
      transform: translateX(-16px);
      .title {
        padding-left: 12px;
        color: #A9EEFF;
        font-size: 22px;
      }
      .echarts-box {
        width: 906px;
        height: 200px;
        background-image: url("img/detail/grid.png");
        margin-top: 12px;
        position: relative;
        background-size: 820px 100%;
        background-repeat: no-repeat;
        background-position-x: 84px;
        //background-position-y: 84px;
        .echarts {
          width: 102%;
          height: 112%;
          left: 0;
          top: -10px;
          position: absolute;
        }
      }
      .description {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        padding-right: 42px;
        span {
          font-size: 18px;
        }
      }
    }
    .table-container {
      margin-top: 4px;
      padding: 20px 16px 0 26px;
      width: 1021px;
      height: 412px;
      background-size: 100% 100%;
      background-image: url("img/detail/table-background.png");
      .filter-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #2E6495;
        padding-bottom: 18px;
        .select-container {
          display: flex;
          gap: 78px;
          .select1 {
            width: 200px;
          }
          .select2 {
            width: 136px;
            height: 42px;
            ::v-deep(.n-base-selection) {
              height: 100%!important;
              border: unset!important;
              outline: unset!important;
            }
            ::v-deep(.n-base-selection--selected) {
              border: unset!important;
              .n-base-selection-label {
                  width: 136px;
                  height: 42px;
                  background-size: 100% 100%;
                  background-color: unset;
                  background-image: url("img/detail/filter.png")!important;
                }
            }
            //. {
            //  .n-base-selection-label {
            //    width: 136px;
            //    height: 42px;
            //    background-image: url("img/detail/filter.png")!important;
            //  }
            //}
          }
        }
        .label {
          color: #0ADCF3;
          font-size: 22px;
        }
      }
      .table-title {
        display: grid;
        grid-template-columns: 1fr 0.9fr 1fr 1fr;
        margin-top: 4px;
        padding: 0 80px 6px 0;
        border-bottom: 1px solid #2E6495;
        .item {
          text-align: right;
          color: #0ADCF3;
          font-size: 22px;
          &:nth-of-type(1) {
            text-align: right;
          }
          &:nth-of-type(3) {
            text-align: right;
          }
          //&:nth-of-type(4) {
          //  text-align: center;
          //}
        }
      }
      .data-container {
        height: 260px;
        padding: 0 8px 18px 0;
        overflow-y: auto;
scrollbar-gutter: stable;
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 12px;
        .data-item {
          display: grid;
          grid-template-columns: 1fr 0.9fr 1fr 1fr;
          align-items: center;
          cursor: pointer;
          background-size: 100% 100%;
          height: 53px;
          padding: 12px 56px 12px 0;
          background-image: url("img/detail/detail-item.png");
          .item {
            text-align: right;
            font-size: 20px;
            color: #4B90CE;
            &:nth-of-type(3) {
              color: #33CD41;
            }
            &:nth-of-type(4) {
              color: #F1BB2B;
            }
          }
        }
        .n-empty {
          margin-top: 80px;
        }
        .data-item:hover {
          //box-shadow: 0px 0px 7.227px 0px #F9E603 inset, 0px 0px 4.156px 0px #F9E603 inset, 0px 4px 4px 0px #F9E603;
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
    .detail {
      margin-top: 12px;
    }
    .button-container {
      margin-top: 42px;
      display: flex;
      justify-content: right;
    }
    .data-item {
      margin-top: 4px;
    }
    .data-title, .data-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      .item {
        text-align: center;
        font-size: 22px;
        color: #0ADCF3;
      }
      .active {
        color: #F1BB2B;
      }
    }
  }
}
</style>