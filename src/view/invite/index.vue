<script setup lang="ts">
import { useUserStore } from "store/modules/user";
import { computed, onMounted, reactive, Ref, ref, onUnmounted } from "vue";
import { User } from "src/api"
import { getStr } from "../../hooks/useComming";
import { canContinuePaging } from "src/utils/utils";
import Loading from '../loading/loading.vue'
interface InviteInfo {
  ethAddress: string
  inviteCount: number
  rank: number
}
const inviteInfo = ref({} as InviteInfo)
const inviteList = ref([] as InviteInfo[])
const userInfo = useUserStore()
const address = computed(() => {
  return userInfo.walletAddress
})
const state = reactive({
  pageSize: 15,
  pageNum: 1,
  totalCount: 0,
  loading: false
})
const getData = async () => {
  state.loading = true
  await User.getInviteRank(state.pageNum, state.pageSize).then((res: any) => {
    if (res.code === 200) {
      inviteList.value = res.data.list
      state.totalCount = res.data.total
    }
  })
  if (address.value) {
    await User.getMyInviteRank(address.value).then((res: any) => {
      inviteInfo.value = res.data
    })
  }
  state.loading = false
}
const emit = defineEmits(['closeVisible'])
const closeVisible = () => {
  emit('closeVisible')
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
    User.getInviteRank(state.pageNum, state.pageSize).then((res: any) => {
      res.data.list.forEach((item: any) => {
        inviteList.value.push(item)
      })
      pageLoading.value = false
    })
  }
};

onMounted(() => {
  getData()
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
})
onUnmounted(
    () => {
      if (dataContainer.value) {
        dataContainer.value.removeEventListener('scroll', handlePage);
      }
    }
)
</script>

<template>
<div class="invite-container">
  <div class="top-banner"></div>
  <div class="close-icon" @click="closeVisible"></div>
  <div class="main-container">
    <div class="rank-container">
      <div class="title-container">
        <div class="item">Ranking</div>
        <div class="item">Address</div>
        <div class="item">Valid Invitation NO</div>
      </div>
      <div class="data-container" ref="dataContainer">
        <div class="data-item" v-if="!state.loading" v-for="(item, index) in inviteList" :key="index">
          <div class="item">{{ index + 1 }}</div>
          <div class="item">{{ getStr(item.ethAddress,4,4) }}</div>
          <div class="item">{{ item.inviteCount }}</div>
        </div>
        <Loading size="big" v-else></Loading>
      </div>
    </div>
    <div class="mine-container">
      <div class="data-item">
        <div class="item">{{ inviteInfo.rank ? inviteInfo.rank : '---' }}</div>
        <div class="item">Mine</div>
        <div class="item">{{ inviteInfo.inviteCount ? inviteInfo.inviteCount : '---' }}</div>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.invite-container {
  width: 884px;
  height: 817px;
  background-size: 100% 100%;
  background-image: url("img/invite/background.png");
  padding: 106px 32px 0 42px!important;
  position: relative;
  .close-icon {
    right: -48px!important;
    top: 12px!important;
  }
  .top-banner {
    width: 790px;
    background-size: 100% 100%;
    height: 120px;
    background-image: url("img/invite/top-banner.png");
  }
  .main-container {
    position: relative;
    margin-top: 22px;
    .mine-container {
      position: absolute;
      left: 0;
      bottom: 42px;
      z-index: 1;
      .data-item {
        width: 790px;
        height: 60px;
        background-size: 100% 100%;
        display: grid;
        grid-template-columns: 110px 258px 1fr;
        background-image: url("img/invite/mine-bg.png");
        .item {
          color: #FFD570;
          font-size: 22px;
          line-height: 68px;
          text-align: right;
          &:nth-of-type(3) {
            padding-right: 46px;
          }
        }
      }
    }
    .rank-container {
      height: 580px;
      background-size: 100% 100%;
      .title-container {
        width: 790px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        border-bottom: 1px solid #2E6495;
        padding: 0 6px 12px;
        .item {
          color: #0ADCF3;
          font-size: 22px;
          &:nth-of-type(2) {
            text-align: right;
            padding-right: 100px;
          }
          &:nth-of-type(3) {
            text-align: right;
          }
        }
      }
      .data-container {
        margin-top: 4px;
        height: 428px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        scrollbar-gutter: stable;
        .data-item {
          width: 790px;
          height: 60px;
          background-size: 100% 100%;
          display: grid;
          grid-template-columns: 110px 314px 1fr;
          background-image: url("img/invite/user-bg.png");
          .item {
            color: #337FC4;
            font-size: 22px;
            line-height: 68px;
            text-align: right;
            &:nth-of-type(3) {
              padding-right: 46px;
            }
          }
        }
      }
      .data-container::-webkit-scrollbar{
        width:12px;
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
    .description {
      position: absolute;
      top: 70px;
      right: 156px;
      color: rgb(74,171,207);
      font-size: 22px;
    }
  }
}
</style>