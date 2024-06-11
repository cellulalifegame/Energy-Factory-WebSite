<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, reactive, toRefs, watch } from "vue";
import CashBack from "../cashback/index.vue"
import { User } from "src/api";
const router = useRouter()
interface Activity {
  id: number
  activityName: string
  bannerUrl: string
  activityDesc: string
  status: number
  createTime: number
  updateTime: number
}
const state = reactive({
  activityStatus: null as any,
  activityList: [] as Activity[],
  activityId: 0,
  filterVisible: false
})
const getActivityList = () => {
  User.getActivityList(state.activityStatus).then((res: any) => {
    if (res.code === 200) {
      state.activityList = res.data
      if (res.data.length) {
        state.activityId = res.data[0].id
      }
    }
  })
}
onMounted(() => {
  getActivityList()
})
watch(
    () => state.activityStatus,
    () => {
      getActivityList()
      state.filterVisible = false
    }
)
const { activityStatus, activityList, activityId, filterVisible } = toRefs(state)
</script>

<template>
<div class="activity-container">
  <div class="back-container">
    <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
    Activity
  </div>
  <div class="activity-main">
    <div class="aside-main">
      <n-popover v-model:show="filterVisible" trigger="click" placement="bottom" :show-arrow="false">
        <template #trigger>
          <div class="filter-block">
            {{ activityStatus === null ? 'All Activities' : activityStatus === 0 ? 'In Progress' : 'Completed' }}
          </div>
        </template>
        <div class="activity-filter">
          <div class="filter-item" @click="activityStatus = null" :class="activityStatus === null ? 'filter-item-active' : ''">All Activities</div>
          <div class="filter-item" @click="activityStatus = 0" :class="activityStatus === 0 ? 'filter-item-active' : ''">In Progress</div>
          <div class="filter-item" @click="activityStatus = 1" :class="activityStatus === 1 ? 'filter-item-active' : ''">Completed</div>
        </div>
      </n-popover>
      <div class="card-container">
        <div v-if="activityList.length" class="activity-card" @click="activityId = item.id" :class="activityId === item.id  ? 'activity-card-active' : ''" :key="item.id" v-for="item in activityList">
          <img class="cover" :src="item.bannerUrl" />
          <div class="text-container">
            <div class="title">
              Cashback
            </div>
            <div class="description">
              Claiming your Charging Fees
            </div>
          </div>
        </div>
        <n-empty v-else size="huge">
          <template #icon>
            <img class="empty-icon" src="img/layout/empty.png" alt="">
          </template>
        </n-empty>
      </div>
    </div>
    <div class="activity-page">
      <div class="activity-view">
        <template v-if="activityList.length">
          <div class="cashback-view" v-if="activityId === 1">
            <CashBack></CashBack>
          </div>
        </template>
        <n-empty v-else size="huge">
          <template #icon>
            <img class="empty-icon" src="img/layout/empty.png" alt="">
          </template>
        </n-empty>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.activity-container {
  width: 1920px;
  height: 1080px;
  background-image: url("img/activity/bg.png");
  position: relative;
  padding-top: 100px;
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
  .activity-main {
    padding: 0 145px;
    display: flex;
    .aside-main {
      width: 484px;
      height: 857px;
      background-image: url("img/activity/aside-bg.png");
      padding-right: 30px;
      .filter-block {
        margin-top: 39px;
        margin-left: 38px;
        width: 409px;
        height: 52px;
        cursor: pointer;
        background-image: url("img/activity/filter-block.png");
        color: #A9EEFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 30px;
        padding-left: 15px;
        line-height: 56px;
      }
      .card-container {
        margin-top: 33px;
        padding-left: 55px;
        height: 700px;
        gap: 28px;
        overflow-y: auto;
        overflow-x: hidden;
        .activity-card {
          width: 376px;
          height: 277px;
          background-image: url("img/activity/card.png");
          position: relative;
          margin-bottom: 26px;
          cursor: pointer;
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          .cover {
            width: 325px;
            height: 150px;
          }
          .text-container {
            width: 339px;
            height: 76px;
            margin-top: 10px;
            background-image: url("img/activity/text-bg.png");
            text-align: center;
            padding-top: 11px;
            .title {
              color: #FFF372;
              text-shadow: 0px 0px 26.381px #2E7AFF, 0px 0px 15.389px #2E7AFF, 0px 0px 7.694px #2E7AFF;
              font-size: 20px;
            }
            .description {
              margin-top: 5px;
              color: #5DF;
              text-shadow: 0px 0px 26.381px #2E7AFF, 0px 0px 15.389px #2E7AFF, 0px 0px 7.694px #2E7AFF;
              font-size: 15px;
            }
          }
        }
        .activity-card-active {
          &:after {
            content: '';
            position: absolute;
            width: 406px;
            height: 307px;
            left: -14px;
            top: -14px;
            background-size: 100% 100%;
            background-image: url("img/activity/card-active.png");
          }
        }
      }
      .card-container::-webkit-scrollbar{
        width:10px;
        display: block;
      }
      .card-container::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .card-container::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
    }
    .activity-page {
      width: 1150px;
      height: 871px;
      background-image: url("img/activity/main-bg.png");
      padding: 76px 60px 0 40px;
      .activity-view {
        height: 745px;
        overflow-y: auto;
        .cashback-view {
          position: relative;
        }
      }
    }
  }
}
</style>