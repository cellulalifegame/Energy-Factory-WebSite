<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRefs, watch, getCurrentInstance, inject, onUnmounted, Ref } from "vue";
import { useUserStore } from "store/modules/user";
import { formatEther } from "viem";
import { useRouter } from "vue-router";
import { User } from "src/api";
import { getStr } from "../../hooks/useComming";
import { canContinuePaging } from "src/utils/utils";
import Loading from '../loading/loading.vue'
const router = useRouter()
const useInfo = useUserStore()
const address = computed(() => {
  return useInfo.walletAddress
})
const state = reactive({
  pageSize: 30,
  pageNum: 1,
  userInviteList: [] as UserInvite[],
  userInvite: {} as UserInvite,
  totalCount: 0,
  inviteCode: ''
})
const getMyPointRank = () => {
  User.getMyPointRank(address.value).then((res: any) => {
    state.userInvite = res.data
  })
}
const getPointRank = () => {
  User.getPointRank(state.pageNum, state.pageSize).then((res: any) => {
    state.userInviteList = res.data.list
    state.totalCount = res.data.total
  })
}
const rank = ref('')
const timestamp = ref(0)
const balance = ref(0n)
const getUserData = () => {
  if (address.value) {
    getMyPointRank()
    User.getInviteCode(address.value).then((res: any) => {
      state.inviteCode = res.data
    })
  }
}

const formattedDate = (timestamp: number) => {
  if (timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } {
    return '---'
  }
}
watch(
    () => address.value,
    () => {
      getUserData()
    }
)
const instance = getCurrentInstance();
const showGlobalMessage: any = inject('showGlobalMessage');
const dataContainer: Ref<HTMLElement | null> = ref(null);

const pageLoading = ref(false)
const handlePage = () => {
  if (!dataContainer.value || pageLoading.value || !canContinuePaging(state.pageNum, state.pageSize, state.totalCount)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainer.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    pageLoading.value = true
    state.pageNum ++
    User.getPointRank(state.pageNum, state.pageSize).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.userInviteList.push(item)
      })
      pageLoading.value = false
    })
  }
};

const copyText = (text: string | null) => {
  if (text) {
    instance?.appContext.config.globalProperties.$copyToClipboard(location.origin+'?code='+text);
    showGlobalMessage('Successfully Copied')
  }
}
onMounted(() => {
  getUserData()
  getPointRank()
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
const { inviteCode, userInviteList, userInvite } = toRefs(state)
</script>

<template>
<div class="point-container">
  <div class="point-main">
    <div class="back-container">
      <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
      Life Points Leaderboard
    </div>
    <div class="header-container">
      <div class="code-container">
        <div class="code">
          Link: {{ inviteCode }}
        </div>
        <div class="copy-btn" @click="copyText(inviteCode)">
          Copy
        </div>
      </div>
    </div>
    <div class="main-container">
      <div class="title-banner"></div>
      <div class="description">Updated every 60s</div>
      <div class="rank-container">
        <div class="title-container">
          <div class="item">Ranking</div>
          <div class="item">Address</div>
          <div class="item">Valid Invitation NO</div>
          <div class="item">Total Life Points</div>
        </div>
        <div class="data-container" ref="dataContainer">
          <div class="data-item" v-if="userInviteList.length" v-for="(item, index) in userInviteList" :key="item.ethAddress">
            <div class="item">{{ index + 1 }}</div>
            <div class="item">{{ getStr(item.ethAddress,4,4) }}</div>
            <div class="item">{{ item.inviteCount }}</div>
            <div class="item">{{ item.integral }}</div>
          </div>
          <Loading padding="small" size="big" v-else></Loading>
        </div>
      </div>
      <div class="mine-container">
        <div class="data-item">
          <div class="item">{{ userInvite?.rank }}</div>
          <div class="item">Mine</div>
          <div class="item">{{ userInvite?.inviteCount }}</div>
          <div class="item">{{ userInvite?.integral }}</div>
        </div>
      </div>
    </div>
<!--    <div class="footer-container">-->
<!--      <div class="title">Rules and Reward</div>-->
<!--      <div class="description">-->
<!--        1.  This Life Points Leaderboard is based on the total Life points you earned during the period from April 16,<br/>-->
<!--        23:00 to May 9, 23:00(UTC-4) & the Social Point Life event-->
<!--        from April 29, 00:00 to May 9, 00:00 (UTC-4).<br/>-->
<!--        2.  Life Points = Social task points + Daily task points from the ingame quest sector.<br/>-->
<!--        3.  Players with higher ranks will be given priority in receiving reimbursement for charging expenses.<br/>-->
<!--        4.  The top 10 players in the ranking will each receive 3 high hashrate BitLife NFTs as a reward.-->
<!--      </div>-->
<!--    </div>-->
  </div>
</div>
</template>

<style scoped lang="scss">
.point-container {
  width: 1920px;
  height: 1080px;
  position: relative;
  .point-main {
    z-index: 1;
    position: relative;
    padding-top: 90px;
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
    .header-container {
      width: 1586px;
      height: 254px;
      background-size: 100% 100%;
      background-image: url("img/point/top-banner.png");
      position: relative;
      .code-container {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 14px;
        left: 44px;
        top: 135px;
        .code {
          width: 435px;
          height: 76px;
          background-size: 100% 100%;
          background-image: url("img/point/code.png");
          padding: 20px;
          color: #337FC4;
          font-size: 28px;
          line-height: 42px;
        }
        .copy-btn {
          width: 170px;
          height: 86px;
          background-size: 100% 100%;
          cursor: pointer;
          background-image: url("img/point/copy.png");
          text-align: center;
          line-height: 86px;
          color: #FFF372;
          text-shadow: 0px 0px 19.807px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 0.472px #FF8F33;
          font-size: 38px;
        }
      }
    }
    .main-container {
      position: relative;
      margin-top: 28px;
      .title-banner {
        position: absolute;
        width: 751px;
        height: 109px;
        background-size: 100% 100%;
        background-image: url("img/point/title-banner.png");
      }
      .mine-container {
        position: absolute;
        left: 40px;
        top: 186px;
        z-index: 1;
        .data-item {
          width: 1515px;
          height: 86px;
          background-size: 100% 100%;
          display: grid;
          grid-template-columns: 132px 366px 485px 1fr;
          background-image: url("img/point/mine-bg.png");
          .item {
            color: #FFD570;
            font-size: 22px;
            line-height: 68px;
            text-align: right;
            &:nth-of-type(4) {
              padding-right: 26px;
            }
          }
        }
      }
      .rank-container {
        width: 1604px;
        height: 780px;
        background-size: 100% 100%;
        background-image: url("img/point/invite-bg.png");
        padding-top: 140px;
        padding-left: 44px;
        padding-right: 26px;
        .title-container {
          width: 1504px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          border-bottom: 1px solid #2E6495;
          padding: 0 24px 14px;
          .item {
            color: #0ADCF3;
            font-size: 22px;
            &:nth-of-type(4) {
              text-align: right;
            }
          }
        }
        .data-container {
          margin-top: 74px;
          height: 478px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 5px;
          scrollbar-gutter: stable;
          .data-item {
            width: 1508px;
            height: 64px;
            background-size: 100% 100%;
            display: grid;
            grid-template-columns: 130px 364px 485px 1fr;
            background-image: url("img/point/user-bg.png");
            .item {
              color: #337FC4;
              font-size: 22px;
              line-height: 68px;
              text-align: right;
              &:nth-of-type(4) {
                padding-right: 26px;
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
      .description {
        position: absolute;
        top: 70px;
        right: 156px;
        color: rgb(74,171,207);
        font-size: 22px;
      }
    }
    .footer-container {
      width: 1585px;
      height: 222px;
      background-image: url("img/point/footer-bg.png");
      margin-top: 6px;
      background-size: 100% 100%;
      padding: 22px 28px;
      .title {
        color: #0ADCF3;
        font-size: 24px;
      }
      .description {
        color: #337FC4;
        font-size: 19px;
        margin-top: 10px;
        padding-left: 173px;
        line-height: 30px;
      }
    }
  }
  &:after {
    content: '';
    position: absolute;
    width: 1920px;
    height: 1500px;
    left: 0;
    top: 0;
    background-size: 100% 100%;
    background-image: url("img/point/background.png");
  }
}
</style>