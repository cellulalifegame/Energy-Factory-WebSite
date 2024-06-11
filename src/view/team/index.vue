<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import {computed, onMounted, reactive, ref, toRefs, watch, getCurrentInstance, inject, Ref} from "vue";
import {useRouter} from "vue-router";
import {useUserStore} from "store/modules/user";
import {User} from "src/api";
import {getStr} from "../../hooks/useComming";
import { formatNumberWithCommas, canContinuePaging } from "../../utils/utils";
const userInfo = useUserStore()
const router = useRouter()
const instance = getCurrentInstance();

const level = [
  {
    teammate: 1.1,
    captain: 1.6,
    hashrate: '≤5K'
  },
  {
    teammate: 1.2,
    captain: 1.7,
    hashrate: '5K~1W'
  },
  {
    teammate: 1.4,
    captain: 1.9,
    hashrate: '1W~10W'
  },
  {
    teammate: 1.6,
    captain: 2.1,
    hashrate: '10W~20W'
  },
  {
    teammate: 2,
    captain: 2.5,
    hashrate: '>20W'
  }
]
const state = reactive({
  pageStatus: 0,
  ruleStatus: false,
  chooseVisible: false,
  chooseStatus: false,
  editNameVisible: false,
  tgVisible: false,
  teamCode: '',
  teamInfo: {} as teamInfo,
  teamMember: [] as teamMember[],
  pageSize: 30,
  pageNum: 1,
  totalCount: 0
})
const chooseTeam = (status: boolean) => {
  state.chooseStatus = status
  state.chooseVisible = true
}
const teamName = ref('');
const tgName = ref('');

const regex = /^[a-zA-Z0-9]{2,20}$/;
const regexTg = /^.{2,30}$/;
const isInputValid = computed(() => regex.test(teamName.value));
const isInputValidTg = computed(() => regexTg.test(tgName.value));

const address = computed(() => {
  return userInfo.walletAddress
})
const joinTeam = async () => {
  if (!state.chooseStatus) {
    await createTeam()
  } else {
    let formData = {
      ethAddress: address.value,
      teamCode: teamCodeData.value
    }
    User.joinTeam(formData).then((res: any) => {
      if (res.code === 200) {
        state.pageStatus = 1
        state.chooseVisible = false
        getTeamCode()
      }
    })
  }
}
const createTeam = async () => {
  User.createTeam(address.value).then((res: any) => {
    if (res.code === 200) {
      state.pageStatus = 2
      state.chooseVisible = false
      getTeamCode()
    }
  })
}
const loading = ref(false)
const getTeamCode = async () => {
  User.getMyTeamCode(address.value).then((res: any) => {
    if (res.code === 309) {
      state.pageStatus = 0
      loading.value = true
    } else {
      state.teamCode = res.data
      getTeamInfo()
    }
  })
}
const getTeamInfo = () => {
  User.teamInfo(state.teamCode, address.value).then((res: any) => {
    state.teamInfo = res.data
    if (res.data.captain) {
      state.pageStatus = 2
    } else {
      state.pageStatus = 1
    }
    loading.value = true
  })
  User.getTeamMember(state.pageNum,state.pageSize,state.teamCode).then((res: any) => {
    state.teamMember = res.data.list
    state.totalCount = res.data.total
    setTimeout(() => {
      if (dataContainer.value) {
        dataContainer.value.addEventListener('scroll', handlePage);
      }
    }, 200)
  })
}
const editTeam = () => {
  if (state.editNameVisible && isInputValid.value) {
    let formData = {
      ethAddress: address.value,
      teamCode: state.teamCode,
      teamName: teamName.value,
    }
    User.editTeam(formData).then((res: any) => {
      if (res.code === 200) {
        getTeamInfo()
        state.editNameVisible = false
      } else {
        showGlobalMessage('Name Already Exists')
      }
    })
  } else if (state.tgVisible && isInputValidTg.value) {
    let formData = {
      ethAddress: address.value,
      teamCode: state.teamCode,
      teamTg: tgName.value,
    }
    User.editTeam(formData).then((res: any) => {
      if (res.code === 200) {
        getTeamInfo()
        state.tgVisible = false
      }
    })
  }
}
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
    User.getTeamMember(state.pageNum,state.pageSize,state.teamCode).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.teamMember.push(item)
      })
      pageLoading.value = false
    })
  }
};

const copyText = (text: string | null) => {
  if (text) {
    instance?.appContext.config.globalProperties.$copyToClipboard(text);
    showGlobalMessage('Successfully Copied')
  }
}
onMounted(() => {
  if (address.value) {
    getTeamCode()
  }
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
})
watch(
    () => address.value,
    () => {
      if (address.value) {
        getTeamCode()
      }
    }
)
const teamNameData = ref('')
const teamCodeData = ref('')
const getTeamName = () => {
  if (teamCodeData.value) {
    User.teamInfo(teamCodeData.value, address.value).then((res: any) => {
      if (res.code === 200) {
        teamNameData.value = res.data.teamName
        chooseTeam(true)
      } else {
        showGlobalMessage('Invalid Link Please Confirm')
      }
    })
  }
}
const { pageStatus, ruleStatus, chooseVisible, chooseStatus, editNameVisible, tgVisible, teamInfo, teamMember } = toRefs(state)
</script>

<template>
  <div class="team-container">
    <div class="back-container">
      <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
      Team
    </div>
    <div class="team-main" v-if="loading" :class="pageStatus !== 0 ? 'team-main-2' : ''">
      <template v-if="pageStatus === 0">
        <div class="logo-container"></div>
        <div class="choose-event">
          <div class="left">
            <div class="label">
              Become Member
            </div>
            <div class="element-container">
              <n-input v-model:value="teamCodeData" class="e-input" placeholder=""></n-input>
              <div @click="getTeamName" class="add-img"></div>
            </div>
            <div class="description">Join a Team by Entering the Invitation Link, and Once
              Joined, Team Modification is Not Permitted.
            </div>
          </div>
          <div class="left right">
            <div class="label">
              Become Member
            </div>
            <div class="element-container">
              <div @click="chooseTeam(false)" class="e-button">Establish a Team</div>
            </div>
            <div class="description">
              Once the Team is Established, No Joining of Other
              Teams Allowed.
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="logo2-container" :class="pageStatus === 2 ? 'logo3-container' : ''"></div>
        <div v-if="pageStatus === 1" class="choose-event choose-event-2">
          <div class="left">
            <div class="element-container">
              <div class="e-input">
                <img class="link-icon" src="img/team/link.png" /><div class="text">: {{state.teamCode}}</div>
              </div>
              <div class="copy-img" @click="copyText(state.teamCode)"></div>
            </div>
          </div>
          <div class="left right">
            <div class="element-container">
              <div class="e-input">
                <img class="tg-icon" src="img/team/tg-icon.png" /><div class="text">: {{teamInfo.teamTg}}</div>
              </div>
              <div class="copy-img" @click="copyText(teamInfo?.teamTg)"></div>
            </div>
          </div>
        </div>
        <div v-if="pageStatus === 2" class="choose-event choose-event-2 choose-event-3">
          <div class="left">
            <div class="element-container">
              <div class="e-input">
                <img class="link-icon" src="img/team/link.png" /><div class="text">: {{state.teamCode}}</div>
              </div>
              <div class="copy-img" @click="copyText(state.teamCode)"></div>
            </div>
          </div>
          <div class="left right">
            <div class="element-container">
              <div class="e-input">
                <img class="tg-icon" src="img/team/tg-icon.png" /><div class="text">: {{teamInfo.teamTg}}</div>
              </div>
              <div @click="tgVisible = true" class="write-img"></div>
            </div>
          </div>
          <div class="left right">
            <div class="element-container">
              <div class="e-input" placeholder="">
                <div class="text text-2">{{`Name: ${teamInfo.teamName}`}}</div>
              </div>
              <div @click="editNameVisible = true" class="write-img"></div>
            </div>
          </div>
        </div>
        <div class="line-container my-team-tit">My Team</div>
        <div class="member-container">
          <div class="member-title">{{ teamInfo.teamName ? teamInfo.teamName : 'Team Name' }}</div>
          <div class="data-container">
            <div class="data-item">Total Members：{{ teamInfo.memberCount }}</div>
            <div class="data-item">Current Hashrate：{{ formatNumberWithCommas(teamInfo.teamLivingQty) }}</div>
            <div class="data-item">Teammate Bonus：{{ teamInfo.additionCoefficient }}</div>
          </div>
          <div class="table-container">
            <div class="table-title">
              <div class="item">Rank</div>
              <div class="item">Address</div>
              <div class="item">Current<br />Hashrate</div>
              <div class="item">Working</div>
              <div class="item">Resting</div>
            </div>
            <div class="table-data" ref="dataContainer">
              <div class="table-item" :key="index" v-for="(item, index) in teamMember">
                <div class="data-item">{{ index+1 }}</div>
                <div class="data-item">{{ getStr(item.ethAddress,4,4) }}</div>
                <div class="data-item">{{ formatNumberWithCommas(item.nowQty) }}</div>
                <div class="data-item">{{ formatNumberWithCommas(item.workingLifeCount) }}</div>
                <div class="data-item">{{ formatNumberWithCommas(item.restLifeCount) }}</div>
              </div>
              <div v-if="teamMember.length < 6" v-for="item in (6-teamMember.length)" class="table-item">
                <div class="data-item"></div>
                <div class="data-item"></div>
                <div class="data-item"></div>
                <div class="data-item"></div>
                <div class="data-item"></div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div v-if="pageStatus !== 0" class="down-container">
        <div class="down-img" :class="ruleStatus ? 'down-img-active' : ''" @click="ruleStatus = !ruleStatus"></div>
      </div>
      <transition
          enter-active-class="animate__animated animate__fadeInUp custom-speed"
          leave-active-class="animate__animated animate__fadeOutDown custom-speed"
          mode="out-in"
      >
        <div class="rule-container" v-if="pageStatus === 0 || ruleStatus">
          <div class="line-container">Event Rules</div>
          <div class="event-container">
            <div class="right-description">
              Players have the option to join an existing
              team or create their own team.
            </div>
            <div class="left-description">
              Once players enter a team by filling out theteam link,
              they cannot exit or switch teams.
            </div>
          </div>
          <div class="title title-1">
            Captain's Responsibilities
          </div>
          <div class="duty-container">
            <div class="duty duty-1">
              <div class="description">
                Establish <br/>
                Telegram group
              </div>
            </div>
            <div class="duty duty-2">
              <div class="description">
                Answer member’s <br/> questions
              </div>
            </div>
            <div class="duty duty-3">
              <div class="description">
                Assistance in <br/>
                upgrading
              </div>
            </div>
          </div>
          <div class="title title-2">
            Team level
          </div>
          <div class="description-label">
            Teams of different levels will receive varying levels of hashrate increase.
          </div>
          <div class="level-description">
            <div v-for="item in level" :key="item.captain" class="level-item">
              <div class="header-title">
                Teammate: <span>{{ item.teammate }}</span> <br/>
                Captain: <span>{{ item.captain }}</span>
              </div>
              <div class="level-icon"></div>
              <div class="footer-title">
                Current Hashrate<br/>
                <span>{{ item.hashrate }}</span>
              </div>
            </div>
          </div>
          <div class="title-footer">
            Additional rules
          </div>
          <div class="rules-container">
            <div class="rules-item">
              a.  The platform reserves the right to adjust the invitation rules.
            </div>
            <div class="rules-item">
              b.  After establishing a team, the team leader can publicly share the <br/>
              &nbsp;&nbsp;&nbsp; Telegram group link of the team and give the team a name.
            </div>
            <div class="rules-item">
              c.  Each team can have a maximum capacity of 100 members.
            </div>
          </div>
        </div>
      </transition>
    </div>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="chooseVisible">
      <div class="team-log">
        <div class="title">{{chooseStatus ? 'Become Member' : 'Become a captain'}}</div>
        <div class="description" v-if="chooseStatus">
          You are about to become a member of the
          <span>"{{teamNameData}}"</span> team, and once you join, it
          cannot be modified.
        </div>
        <div class="description" v-else>
          Once you create a team, you won't be able to join any other teams. Are you sure you want to proceed with creating one?
        </div>
        <div class="button-container">
          <div @click="chooseVisible = false" class="button cancel">Cancel</div>
          <div class="button active" @click="joinTeam">Join Now</div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="editNameVisible">
      <div class="team-log">
        <div class="title">Edit team name</div>
        <div class="form-container">
          <div class="form-item">
            Former name:&nbsp;&nbsp;&nbsp;{{teamInfo.teamName}}
          </div>
          <div class="form-item">
            Now&nbsp;name:
            <div class="input-container">
              <n-input placeholder="" v-model:value="teamName" class="e-input"></n-input>
              <div v-if="!isInputValid && teamName.length" class="error-message">
                Input is not valid!
              </div>
              <div v-else class="error-message" style="color: #7AB9FF">
                2 ~ 20 characters in length
              </div>
            </div>
          </div>
        </div>
        <div class="button-container">
          <div @click="editNameVisible = false" class="button cancel">Cancel</div>
          <div class="button active" @click="editTeam">Confirm</div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="tgVisible">
      <div class="team-log">
        <div class="title">Edit TG Link</div>
        <div class="form-container tg-container">
          <div class="form-item">
            TG link:
            <div class="input-container">
              <n-input placeholder="" v-model:value="tgName" class="e-input"></n-input>
              <div v-if="!isInputValidTg && tgName.length" class="error-message">
                Input is not valid!
              </div>
              <div v-else class="error-message" style="color: #7AB9FF">
                2 ~ 30 characters in length
              </div>
            </div>
          </div>
        </div>
        <div class="button-container">
          <div @click="tgVisible = false" class="button cancel">Cancel</div>
          <div class="button active" @click="editTeam">Confirm</div>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped lang="scss">
.team-container {
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

  .team-main {
    min-height: 100vh;
    background-size: 100% 4440px;
    background-image: url("img/team/background.png");
    padding-top: 100px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: unset;
    background-repeat: no-repeat;
    .custom-speed {
      animation-duration: 0.5s;
    }
    .logo2-container {
      background-size: 100% 100%;
      position: absolute;
      top: 29px;
      width: 1734px;
      height: 600px;
      left: 93px;
      //transform: translateX(-50%);
      background-image: url("img/team/logo-2.png");
    }
    .logo3-container {
      background-image: url("img/team/logo-3.png");
    }
    .rule-container {
      margin-top: -310px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .logo-container {
      width: 1920px;
      height: 549px;
      background-size: 100% 100%;
      position: absolute;
      left: 0;
      top: 44px;
      background-image: url("img/team/logo.png");
    }
    .member-container {
      width: 1920px;
      height: 1009px;
      background-image: url("img/team/member-container.png");
      margin-top: -20px;
      background-size: 100% 100%;
      padding: 132px 96px 0 96px;
      .member-title {
        text-align: center;
        color: #E2F8FF;
        text-shadow: 0px 0px 1.099px #2E7AFF, 0px 0px 2.198px #2E7AFF, 0px 0px 7.694px #2E7AFF, 0px 0px 15.389px #2E7AFF, 0px 0px 26.381px #2E7AFF, 0px 0px 46.166px #2E7AFF;
        font-size: 70px;
      }
      .data-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 22px;
        padding-right: 44px;
        .data-item {
          color: #55FF8D;
          font-size: 36px;
        }
      }
      .table-container {
        margin-top: 20px;
        position: relative;
        &:after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 1690px;
          height: 2px;
          background:rgb(121,161,242);
        }
        .table-title {
          width: 1690px;
          border: 2px solid rgb(121,161,242);
          display: grid;
          grid-template-columns: 224px 1fr 1fr 1fr 1fr;
          .item {
            height: 126px;
            background: rgb(41,74,137);
            display: flex;
            align-items: center;
            text-align: center;
            justify-content: center;
            color: #4ECBED;
            font-size: 36px;
          }
          .item:not(:last-child) {
            border-right: 1px solid rgb(121,161,242);
          }
        }
        .table-data {
          height: 482px;
          overflow: hidden;
          overflow-y: auto;
scrollbar-gutter: stable;
          &:after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 2px;
            height: 484px;
            background:rgb(121,161,242);
          }
          &:before {
            content: '';
            position: absolute;
            right: 38px;
            bottom: 0;
            width: 2px;
            height: 484px;
            background:rgb(121,161,242);
          }
          .table-item {
            width: 1690px;
            display: grid;
            grid-template-columns: 224px 1fr 1fr 1fr 1fr;
            border-left: 2px solid rgba(121,161,242,0);
            border-right: 2px solid rgba(121,161,242,0);
            .data-item {
              height: 80px;
              display: flex;
              align-items: center;
              text-align: center;
              justify-content: center;
              color: #79A1F2;
              font-size: 40px;
            }
            .data-item:not(:last-child) {
              border-right: 1px solid rgb(121,161,242);
            }
          }
          .table-item:nth-child(odd) {
            background: rgb(27,46,84);
          }

          .table-item:nth-child(even) {
            background: rgb(43,67,113);
          }
        }
        .table-data::-webkit-scrollbar{
          width:22px;
          display: block;
        }
        .table-data::-webkit-scrollbar-track {
          border-radius: 20px;
          background: rgb(44,71,121);
        }
        .table-data::-webkit-scrollbar-thumb{
          border-radius: 20px;
          background: rgb(121,161,242);
        }
      }
    }
    .down-container {
      display: flex;
      justify-content: center;
      margin-top: -60px;
      margin-bottom: 40px;
      .down-img {
        width: 99px;
        height: 83px;
        background-size: 100% 100%;
        transition: .4s;
        background-image: url("img/team/down.png");
        cursor: pointer;
      }
      .down-img-active {
        transform: rotate(180deg);
      }
    }
    .choose-event {
      width: 100%;
      margin-top: 420px;
      padding: 0 260px;
      display: flex;
      justify-content: center;
      gap: 388px;

      .left {
        .label {
          font-size: 32px;
          color: #E3F1FF;
        }

        .element-container {
          display: flex;
          gap: 12px;
          margin-top: 6px;

          .e-input {
            width: 470px;
            height: 96px;
            background-color: unset !important;
            background-size: 100% 100%;
            border-radius: unset;
            background-image: url("img/team/input-img.png");
            color: #ABCAFE;
            font-size: 42px;
            line-height: 96px;
            padding-left: 20px;
            overflow: hidden;
          }

          .add-img {
            width: 106px;
            height: 106px;
            background-size: 100% 100%;
            background-image: url("img/team/add.png");
            cursor: pointer;
          }
          .copy-img {
            width: 170px;
            height: 106px;
            background-size: 100% 100%;
            cursor: pointer;
            background-image: url("img/team/copy.png");
          }
          .write-img {
            width: 170px;
            height: 106px;
            background-size: 100% 100%;
            cursor: pointer;
            background-image: url("img/team/write.png");
          }
        }

        .description {
          width: 460px;
          color: #FF7D44;
          font-size: 16px;
          margin-top: 6px;
        }
      }

      .right {
        .element-container {
          .e-button {
            width: 481px;
            height: 108px;
            background-size: 100% 100%;
            background-image: url("img/team/button-img.png");
            color: #FFF372;
            text-shadow: 0px 0px 0.472px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 19.807px #FF8F33;
            font-size: 42px;
            text-align: center;
            line-height: 108px;
            cursor: pointer;
          }
        }
      }
    }
    .choose-event-2 {
      gap: 189px;
      margin-top: 520px;
      .e-input {
        display: flex;
        align-items: center;
        gap: 12px;
        .text {
          width: 375px;
          font-size: 42px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color: #5CA9FF;
        }
      }
      .link-icon {
        width: 53px;
        height: 51px;
      }
      .tg-icon {
        width: 60px;
        height: 51px;
      }
    }
    .choose-event-3 {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 30px;
      margin-top: 440px;
      .e-input {
        display: flex;
        align-items: center;
        gap: 12px;
        .text {
          width: 375px;
          font-size: 42px;
          overflow:hidden;
          text-overflow:ellipsis;
          white-space:nowrap;
          color: #5CA9FF;
        }
        .text-2 {
          width: 100%;
        }
      }
      .link-icon {
        width: 53px;
        height: 51px;
      }
      .tg-icon {
        width: 60px;
        height: 51px;
      }
    }
    .line-container {
      width: 1557px;
      height: 47px;
      background-size: 100% 100%;
      text-align: center;
      color: #FFF372;
      line-height: 57px;
      text-shadow: 0px 0px 0.472px #FF8F33, 0px 0px 0.943px #FF8F33, 0px 0px 3.301px #FF8F33, 0px 0px 6.602px #FF8F33, 0px 0px 11.318px #FF8F33, 0px 0px 19.807px #FF8F33;
      font-size: 58px;
      background-image: url("img/team/line.png");
      margin-top: 96px;
    }
    .my-team-tit {
      margin-top: 80px;
    }
    .event-container {
      width: 1622px;
      height: 532px;
      background-size: 100% 100%;
      background-image: url("img/team/event-img.png");
      margin-top: 20px;
      position: relative;

      .right-description, .left-description {
        width: 700px;
        color: #ABCAFE;
        text-align: center;
        font-size: 26px;
        position: absolute;
        left: 65px;
        bottom: 112px;
      }

      .left-description {
        width: 710px;
        left: unset;
        right: 100px;
      }
    }
    .title, .title-footer {
      width: 1152px;
      height: 162px;
      background-size: 100% 100%;
      background-image: url("img/team/title-img.png");
      color: #E2F8FF;
      text-align: center;
      text-shadow: 0px 0px 1.099px #2E7AFF, 0px 0px 2.198px #2E7AFF, 0px 0px 7.694px #2E7AFF, 0px 0px 15.389px #2E7AFF, 0px 0px 26.381px #2E7AFF, 0px 0px 46.166px #2E7AFF;
      font-size: 70px;
      line-height: 175px;
    }

    .title-1 {
      margin-top: 0px;
    }

    .title-2 {
      margin-top: 40px;
    }

    .duty-container {
      width: 100%;
      justify-content: center;
      display: flex;
      gap: 65px;
      margin-top: 82px;

      .duty {
        width: 476px;
        height: 355px;
        background-size: 100% 100%;
        position: relative;

        .description {
          position: absolute;
          bottom: 32px;
          left: 0;
          width: 100%;
          color: #5DF;
          text-align: center;
          text-shadow: 0px 0px 7.694px #2E7AFF, 0px 0px 15.389px #2E7AFF, 0px 0px 26.381px #2E7AFF;
          font-size: 38px;
        }
      }

      .duty-1 {
        background-image: url("img/team/duty-1.png");
      }

      .duty-2 {
        background-image: url("img/team/duty-2.png");
      }

      .duty-3 {
        background-image: url("img/team/duty-3.png");
      }
    }

    .description-label {
      width: 100%;
      color: #27ECF1;
      text-align: center;
      font-size: 32px;
      margin-top: 15px;
    }

    .level-description {
      width: 1500px;
      display: flex;
      justify-content: center;
      gap: 28px 82px;
      flex-flow: row wrap;
      margin-top: 28px;

      .level-item {
        width: 440px;
        height: 532px;
        background-size: 100% 100%;
        background-image: url("img/team/level-background.png");
        display: flex;
        flex-direction: column;
        align-items: center;

        .header-title, .footer-title {
          color: #1DBFFF;
          text-align: center;
          font-size: 36px;
          margin-top: 38px;
          line-height: 55px;

          span {
            color: #FFD84B;
            font-size: 36px;
          }
        }

        .footer-title {
          margin-top: unset;
        }

        .level-icon {
          width: 216px;
          height: 200px;
          background-size: cover;
          margin: 22px 0;
          background-image: url("img/team/level-1.png");
        }

        &:nth-of-type(2) {
          .level-icon {
            background-image: url("img/team/level-2.png");
          }
        }

        &:nth-of-type(3) {
          .level-icon {
            background-image: url("img/team/level-3.png");
          }
        }

        &:nth-of-type(4) {
          .level-icon {
            background-image: url("img/team/level-4.png");
          }
        }

        &:nth-of-type(5) {
          .level-icon {
            background-image: url("img/team/level-5.png");
          }
        }
      }
    }
    .title-footer {
      height: auto;
      margin-top: 60px;
      background-image: unset;
      line-height: unset;
    }
    .rules-container {
      margin-top: -38px;
      width: 1620px;
      height: 420px;
      background-size: 100% 100%;
      background-image: url("img/team/rules-background.png");
      display: flex;
      flex-direction: column;
      padding-top: 40px;
      justify-content: center;
      padding-left: 80px;
      .rules-item {
        color: #4970C1;
        font-size: 36px;
        margin-bottom: 28px;
      }
    }
  }
  .team-main-2 {
    background-size: 1920px 5538px;
    background-image: url("img/team/background-2.png");
  }
  .team-main > * {
    scale: 0.8;
  }
}
</style>