<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, Ref, toRefs, watch } from "vue";
import ModelButton from "comps/ModalButton.vue"
import {useUserStore} from "store/modules/user";
import {User} from "src/api";
import { useRoute, useRouter } from "vue-router";
import {getStr} from "../../../../hooks/useComming";
import { canContinuePaging } from "src/utils/utils";
const userInfo = useUserStore()
const route = useRoute()
const router = useRouter()
const options = [
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
  filter1: 7,
  scrollTop: 0,
  detail: {} as Cell,
  pageNum: 1,
  pageSize: 30,
  records: [] as CellLog[],
  totalCount: 0
})
const handleScroll = (() => {
  state.scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
})
const address = computed(() => {
  return userInfo.walletAddress
})
const loading = ref(false)
const getCellDetail = (filter?: number) => {
  if (address.value) {
    loading.value = true
    User.getCellInfo(route.params.token, address.value, filter ? filter : 7).then((res: any) => {
      state.detail = res.data
    })
    getCellMintedRecords()
  }
}
const getCellMintedRecords = () => {
  state.pageNum = 1
  state.records = []
  User.getCellMintedRecords(address.value,route.params.token,state.pageNum,state.pageSize,state.filter1).then((res: any) => {
    state.records = res.data.list
    state.totalCount = res.data.total
    loading.value = false
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
    User.getCellMintedRecords(address.value,route.params.token,state.pageNum,state.pageSize,state.filter1).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.records.push(item)
      })
      pageLoading.value = false
    })
  }
};
onMounted(() => {
  window.addEventListener('scroll', handleScroll, true)
  if (address.value) {
    getCellDetail()
  }
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
  document.documentElement.style.overflow = 'hidden';
})
onUnmounted(() => {
  document.documentElement.style.overflow = '';
})
watch(
    () => address.value,
    () => {
      if (address.value) {
        getCellDetail()
      }
    }
)
const { filter1, scrollTop, detail, records } = toRefs(state)
</script>

<template>
  <div class="cell-detail-page">
    <div class="back-container">
      <img @click="router.back()" class="back-icon" src="img/layout/new-back.png" alt="">
      Detail
    </div>
    <div class="cellula-main">
      <div class="cover-container" :class="scrollTop > 0 ? 'cover-container-active' : ''">
        <div class="cover-box">
          <img class="cover" :src="detail.image" alt="">
        </div>
      </div>
      <div class="header-container">
        <div class="table-container">
          <div class="filter-container">
            <div class="select-container">
              <n-select class="select2" @change="getCellDetail" v-model:value="filter1" :options="options" />
            </div>
            <div class="label">Average Price: {{ detail.avgPrice ? detail.avgPrice.toFixed(6) : 0 }} [BNB]</div>
          </div>
          <div class="table-title">
            <div class="item">Time</div>
            <div class="item">Price</div>
            <div class="item">Earnings</div>
          </div>
          <div class="data-container" ref="dataContainer">
            <div v-if="records.length" class="data-item" v-for="(item, index) in records" :key="index">
              <div class="item">{{ item.dateTime }}</div>
              <div class="item">{{ item.price.toFixed(6) }} [BNB]</div>
              <div class="item">{{ item.mintIncome.toFixed(6) }}</div>
            </div>
            <n-empty v-else-if="!loading" size="huge">
              <template #icon>
                <img class="empty-icon" src="img/layout/empty.png" alt="">
              </template>
            </n-empty>
          </div>
        </div>
      </div>
      <div class="detail" v-if="detail.tokenId">
        <div class="data-title">
          <div class="item">Chain:</div>
          <div class="item">Contract Address:</div>
          <div class="item">Token ID:</div>
        </div>
        <div class="data-item">
          <div class="item active">{{ detail.network }}</div>
          <div class="item">{{ getStr(detail.contractAddress,4,4) }}</div>
          <div class="item">{{ detail.tokenId }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cell-detail-page {
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
    .cover-container {
      position: fixed;
      top: 574px;
      right: 144px;
      transform: translateY(-50%);
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
          position: absolute;
          top: 38px;
          left: 82px;
          width: 250px;
          height: 250px;
          background-size: 2048px 512px;
          background-position: -32px -32px;
          scale: 1.4;
          animation: spriteAnimation 0.8s steps(1) infinite;
        }
      }
      .cover-box {
        width: 603px;
        padding: 55px 105px;
        height: 505px;
        background-image: url("img/detail/cell-background.png");
        display: flex;
        align-items: center;
        justify-content: center;
        background-size: 100% 100%;
        .cover {
          width: 240px;
          height: 240px;
          border-radius: 24px;
          background: #003229;
        }
      }
    }
    .cover-container-active {
      scale: 0.8;
    }
    .header-container {
      width: 1024px;
    }
    .table-container {
      margin-top: 4px;
      padding: 20px 16px 0 26px;
      width: 1021px;
      height: 743px;
      background-size: 100% 100%;
      background-image: url("img/detail/cell-table-background.png");
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
        grid-template-columns: 1fr 1fr 1fr;
        margin-top: 4px;
        padding: 0 40px 0 0;
        .item {
          text-align: center;
          color: #0ADCF3;
          font-size: 22px;
        }
      }
      .data-container {
        height: 600px;
        padding: 18px 8px 18px 0;
        overflow-y: auto;
scrollbar-gutter: stable;
        display: flex;
        flex-direction: column;
        gap: 12px;
        .data-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          padding: 12px 0;
          align-items: center;
          cursor: pointer;
          height: 53px;
          background-size: 100% 100%;
          background-image: url("img/detail/detail-item.png");
          .item {
            text-align: center;
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
    .button-container {
      margin-top: 42px;
      display: flex;
      justify-content: right;
    }
    .detail {
      margin-top: 12px;
    }
    .data-item {
      margin-top: 4px;
    }
    .data-title, .data-item {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
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