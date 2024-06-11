<script setup lang="ts">
import { useRouter } from "vue-router";
import type1 from 'img/featured/type1.png'
import type2 from 'img/featured/type2.png'
import type3 from 'img/featured/type3.png'
import { toRefs, reactive, computed, onMounted, watch, ref, inject } from "vue";
import Filter from "src/view/home/Filter.vue";
import ModalButton from "comps/ModalButton.vue";
import Loading from "src/view/loading/loading.vue";
import { useUserStore } from "store/modules/user";
import { User } from "src/api";
import { formatEther } from "viem";
import { truncateNumber } from "../../utils/utils";
import { useGameLife } from "src/hooks/web3/useGameLife";
import { useConvert } from "src/hooks/web3/useConvert";
const showGlobalMessage: any = inject('showGlobalMessage');
const { getIsApprovedForAll, setApprovalForAll } = useGameLife()
const { recycle, getEndTime } = useConvert()
interface BIT_LIFE {
  tokenId: number
  mintPrice: any
  hashRate: number
  chargingFee: number
  roleImage: string
}
const router = useRouter()
const state = reactive({
  hashRateStatus: false,
  hashRateType: 0,
  costStatus: false,
  costType: 0,
  nftVisible: false,
  filterFormData: null as any,
  nftFormData: null as any,
  filterVisible: false,
  nftFilterVisible: false,
  convertVisible: false,
  nftList: [] as BIT_LIFE[],
  restingLoading: false,
  currentIndex: 0,
  workCellula: [] as workCellula[],
  workLoading: false,
  targetWorkLoading: false,
  workTotal: 0,
  chargeIndex: 0,
  isMass: false,
  isApproved: false,
  massVisible: false,
  payBillVisible: false
})
const userInfo = useUserStore()
const account = computed(() => {
  return userInfo.walletAddress
})
const changFilter = (type: string) => {
  if (type === 'cost') {
    if (!state.costStatus) {
      state.costStatus = true
    } else {
      if (!state.costType) {
        state.costType = 1
      } else {
        state.costStatus = false
        state.costType = 0
      }
    }
  } else {
    if (!state.hashRateStatus) {
      state.hashRateStatus = true
    } else {
      if (!state.hashRateType) {
        state.hashRateType = 1
      } else {
        state.hashRateStatus = false
        state.hashRateType = 0
      }
    }
  }
  getRestingLives()
}
const confirmFilter = async (formData: any) => {
  const containerId = 'work-list';
  const previousScrollPosition: any = getScrollPosition(containerId);
  state.filterFormData = formData
  state.targetWorkLoading = true
  await User.getWorkCellula(account.value, 0, 1, 30, formData.sortType, formData.maxHashRate, formData.minHashRate).then((res: any) => {
    if (res.code === 200) {
      state.workTotal = res.data.total
      state.workCellula = res.data.list.map((item: workCellula) => {
        return {
          ...item,
          currentDay: 0,
          convertList: []
        }
      })
      cleanConvertData()
      state.targetWorkLoading = false
    }
  })
  await setScrollPosition(containerId, previousScrollPosition);
  state.filterVisible = false
}
const nftConfirmFilter = async (formData: any) => {
  state.nftFormData = formData
  state.restingLoading = true
  let hashRateType = null
  let costType = null
  switch (formData.sortType) {
    case 1:
      hashRateType = 1
      break;
    case 2:
      costType = 1
      break
    case 3:
      hashRateType = 0
      break
    default:
      costType = 0
  }
  await User.getRestingLives(
      account.value,
      hashRateType,
      costType,
      formData.maxHashRate,
      formData.minHashRate
  ).then((res: any) => {
    if (res.code === 200) {
      state.nftList = res.data
      chooseList.value = []
    }
    state.restingLoading = false
  })
  state.nftFilterVisible = false
}
const closeFilterVisible = () => {
  state.filterVisible = false
  state.filterFormData = null
  cleanConvertData()
  getWorkList()
}
const closeNftFilterVisible = () => {
  state.nftFilterVisible = false
  state.nftFormData = null
  chooseList.value = []
  cleanConvertData()
  getRestingLives()
}
const getRestingLives = async () => {
  if (account.value) {
    await getWorkList()
    state.restingLoading = true
    let hashRateType = null
    let costType = null
    let maxHashRate = null
    let minHashRate = null
    if (state.nftFormData?.sortType) {
      maxHashRate = state.nftFormData.maxHashRate
      minHashRate = state.nftFormData.minHashRate
      switch (state.nftFormData.sortType) {
        case 1:
          hashRateType = 1
          break;
        case 2:
          costType = 1
          break
        case 3:
          hashRateType = 0
          break
        default:
          costType = 0
      }
    }
    await User.getRestingLives(account.value, hashRateType, costType, maxHashRate, minHashRate).then((res: any) => {
      if (res.code === 200) {
        state.nftList = res.data
      }
      state.restingLoading = false
    })
  }
}
const getWorkList = async () => {
  if (state.filterFormData !== null) {
    confirmFilter(state.filterFormData)
  } else {
    const containerId = 'work-list';
    const previousScrollPosition: any = getScrollPosition(containerId);
    state.targetWorkLoading = true
    await User.getWorkCellula(account.value, 0, 1, 30).then((res: any) => {
      if (res.code === 200) {
        state.workTotal = res.data.total
        state.workCellula = res.data.list.map((item: workCellula) => {
          return {
            ...item,
            currentDay: 0,
            convertList: []
          }
        })
        state.targetWorkLoading = false
      }
    })
    await setScrollPosition(containerId, previousScrollPosition);
  }
}

const chooseList = ref([] as string[])
const chooseListText = computed(() => {
  let text = ''
  chooseList.value.forEach((item: any) => {
    text = text + `(${item})`
  })
  return text
})
const oneDayTokens = ref([] as number[])
const threeDayTokens = ref([] as number[])
const sevenDayTokens = ref([] as number[])
const chooseListDay = computed(() => {
  let day = 0
  if (chooseList.value.length && state.nftList.length) {
    chooseList.value.forEach((item: any) => {
      let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
        return nft.tokenId.toString() === item
      })
      if (nftItem.length) {
        day = day+nftItem[0].chargingFee
      }
    })
  }
  return day
})

const isChoose = (id: string) => {
  const index = chooseList.value.indexOf(id);
  return index !== -1
}
const chooseCharge = (id: string) => {
  const index = chooseList.value.indexOf(id);
  if (index === -1) {
    // let target = state.nftList.filter((nft: BIT_LIFE) => {
    //   return nft.tokenId.toString() === id
    // })
    // let targetDay = target[0].chargingFee
    chooseList.value.push(id);
  } else {
    chooseList.value.splice(index, 1);
  }
}
const chooseBitLife = (index: number) => {
  state.currentIndex = index
  state.nftVisible = true
  state.isMass = false
}
const massCharge = () => {
  if (chooseList.value.length) {
    state.isMass = true
    // state.nftVisible = true
    state.massVisible = true
  }
}
const chargeItem = (index: number) => {
  state.chargeIndex = index
  state.convertVisible = true
}
const chargeLoading = ref(false)
const chargeFun = async () => {
  if (!chargeLoading.value) {
    chargeLoading.value = true
    const isApproved = await getIsApprovedForAll(account.value)
    if (isApproved) {
      showGlobalMessage('Converting...', 'Converting...')
      let recycle_ids = []
      let charge_id = state.workCellula[state.chargeIndex]?.tokenId
      if (state.isMass) {
        recycle_ids = chooseList.value
      } else {
        recycle_ids.push(state.nftList[state.currentIndex].tokenId)
      }
      recycle(recycle_ids, charge_id).then((res: any) => {
        showGlobalMessage('Converting...', 'close')
        showGlobalMessage('Converted Successfully')
        chargeLoading.value = false
        state.convertVisible = false
        state.nftVisible = false
        chooseList.value = []
        state.filterFormData = null
        getRestingLives()
      })
          .catch((error: any) => {
            let isBalance = error.toString().indexOf('The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.') !== -1
            showGlobalMessage('Converting...', 'close')
            if (error.toString().substring(0, 60) !== 'Error: TransactionExecutionError: User rejected the request.') {
              User.saveErrLog(account.value, error.toString(), `recycle_ids: ${recycle_ids.toString()}||charge_id: ${charge_id}`)
            }
            if (isBalance) {
              showGlobalMessage('Insufficient Balance')
            } else if (error.toString().substring(0,60) !== 'Error: TransactionExecutionError: User rejected the request.') {
              showGlobalMessage('Converting...')
            }
            chargeLoading.value = false
          })
    } else {
      showGlobalMessage('Approve...', 'Approve...')
      setApprovalForAll().then(async (res: any) => {
        state.isApproved = true
        chargeLoading.value = false
        showGlobalMessage('Approve...', 'close')
        showGlobalMessage('Approve Successfully')
        await chargeFun()
      })
          .catch(() => {
            showGlobalMessage('Approve...', 'close')
            chargeLoading.value = false
          })
    }
  }
}
const getScrollPosition = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    return container.scrollTop;
  } else {
    return 0;
  }
};
const setScrollPosition = async (containerId: string, scrollPosition: string) => {
  const container: any = document.getElementById(containerId);
  if (container) {
    container.scrollTop = scrollPosition;
  }
};
const pollingWorking = () => {
  setTimeout(async () => {
    if (!state.nftVisible && !state.massVisible) {
      const containerId = 'bitlife-container';
      const previousScrollPosition: any = getScrollPosition(containerId);
      await getRestingLives()
      await setScrollPosition(containerId, previousScrollPosition);
    }
    await pollingWorking()
  }, 30000)
}
const addDays = (tokenId: any) => {
  const index = state.workCellula.findIndex((item: workCellula) => item.tokenId === tokenId);

  if (index !== -1) {
    if (sevenDayTokens.value.length) {
      const currentDay = state.workCellula[index].currentDay
      if ((currentDay + 7) <= 7) {
        state.workCellula[index].currentDay = currentDay + 7
        const convertId: any = sevenDayTokens.value.pop()
        state.workCellula[index].convertList.push(convertId)
      }
    } else if (threeDayTokens.value.length) {
      const currentDay = state.workCellula[index].currentDay
      if ((currentDay + 3) <= 7) {
        state.workCellula[index].currentDay = currentDay + 3
        const convertId: any = threeDayTokens.value.pop()
        state.workCellula[index].convertList.push(convertId)
      } else if ((currentDay + 1) <= 7 && oneDayTokens.value.length) {
        const currentDay = state.workCellula[index].currentDay
        state.workCellula[index].currentDay = currentDay + 1
        const convertId: any = oneDayTokens.value.pop()
        state.workCellula[index].convertList.push(convertId)
      }
    } else if (oneDayTokens.value.length) {
      const currentDay = state.workCellula[index].currentDay
      if ((currentDay + 1) <= 7) {
        state.workCellula[index].currentDay = currentDay + 1
        const convertId: any = oneDayTokens.value.pop()
        state.workCellula[index].convertList.push(convertId)
      }
    }
  }
}
const subtractDays = (tokenId: any) => {
  const index = state.workCellula.findIndex((item: workCellula) => item.tokenId === tokenId);
  if (index !== -1) {
    const currentDay = state.workCellula[index].currentDay
    if (currentDay !== 0) {
      const convertId: any = state.workCellula[index].convertList.pop()
      let convertDay: number = 0
      const nftIndex = state.nftList.findIndex((item) => item.tokenId === convertId);
      convertDay = state.nftList[nftIndex].chargingFee
      state.workCellula[index].currentDay = state.workCellula[index].currentDay - convertDay
      if (convertDay === 1) {
        oneDayTokens.value.push(convertId)
      } else if (convertDay === 3) {
        threeDayTokens.value.push(convertId)
      } else {
        sevenDayTokens.value.push(convertId)
      }
    }
  }
}
const cleanConvertData = () => {
  const chooseArr = chooseList.value
  chooseList.value = []
  chooseList.value = chooseArr
  let oneArr: number[] = []
  if (chooseList.value.length && state.nftList.length) {
    chooseList.value.forEach((item: any) => {
      let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
        return nft.tokenId.toString() === item
      })
      if (nftItem[0].chargingFee === 1) {
        oneArr.push(nftItem[0].tokenId)
      }
    })
  }
  oneDayTokens.value = oneArr
  // --------------
  let threeArr: number[] = []
  if (chooseList.value.length && state.nftList.length) {
    chooseList.value.forEach((item: any) => {
      let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
        return nft.tokenId.toString() === item
      })
      if (nftItem[0].chargingFee === 3) {
        threeArr.push(nftItem[0].tokenId)
      }
    })
  }
  threeDayTokens.value = threeArr
  // ==================
  let sevenArr: number[] = []
  if (chooseList.value.length && state.nftList.length) {
    chooseList.value.forEach((item: any) => {
      let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
        return nft.tokenId.toString() === item
      })
      if (nftItem[0].chargingFee === 7) {
        sevenArr.push(nftItem[0].tokenId)
      }
    })
  }
  sevenDayTokens.value = sevenArr
}
const payBillList = ref([] as PayBill[])
const openPayVisible = () => {
  if (!oneDayTokens.value.length && !threeDayTokens.value.length && !sevenDayTokens.value.length) {
    state.massVisible = false
    state.payBillVisible = true
    payBillList.value = state.workCellula
        .filter(item => item.currentDay !== 0)
        .map(item => ({
          tokenId: item.tokenId,
          currentDay: item.currentDay,
          convertList: item.convertList
        }));
  } else {
    showGlobalMessage('The remaining days are unused')
  }
}
const successCount = ref(0)
const massApprove = async () => {
  if (!chargeLoading.value) {
    chargeLoading.value = true
    const isApproved = await getIsApprovedForAll(account.value)
    if (isApproved) {
      showGlobalMessage('Converting...', 'Converting...')
      payBillList.value.forEach((item) => {
        let recycle_ids = item.convertList
        let charge_id = item.tokenId
        recycle(recycle_ids, charge_id).then((res: any) => {
          showGlobalMessage('Converted Successfully')
          successCount.value++
          if (successCount.value === payBillList.value.length) {
            showGlobalMessage('Converting...', 'close')
            successCount.value = 0
            chooseList.value = []
            chargeLoading.value = false
            state.payBillVisible = false
          }
        })
            .catch((error: any) => {
              successCount.value++
              console.log(error.toString());
              if (error.toString().substring(0, 60) !== 'Error: TransactionExecutionError: User rejected the request.') {
                User.saveErrLog(account.value, error.toString(), `recycle_ids: ${recycle_ids.toString()}||charge_id: ${charge_id}`)
              }
              if (successCount.value === payBillList.value.length) {
                successCount.value = 0
                showGlobalMessage('Converting...', 'close')
                chooseList.value = []
                chargeLoading.value = false
                state.payBillVisible = false
              }
              let isBalance = error.toString().indexOf('The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account.') !== -1
              if (isBalance) {
                showGlobalMessage('Insufficient Balance')
              } else if (error.toString().substring(0, 60) !== 'Error: TransactionExecutionError: User rejected the request.') {
                showGlobalMessage('Converting...')
              }
            })
      })
    } else {
      showGlobalMessage('Approve...', 'Approve...')
      setApprovalForAll().then(async (res: any) => {
        state.isApproved = true
        chargeLoading.value = false
        showGlobalMessage('Approve...', 'close')
        showGlobalMessage('Approve Successfully')
        await massApprove()
      })
          .catch(() => {
            showGlobalMessage('Approve...', 'close')
            chargeLoading.value = false
          })
    }
  }
}
watch(
    () => state.payBillVisible,
    () => {
      if (!state.payBillVisible) {
        payBillList.value = []
        cleanConvertData()
        getRestingLives()
      }
    }
)
const isAll = computed(() => {
  return chooseList.value.length === state.nftList.length && chooseList.value.length !== 0
})
const chooseAll = () => {
  if (isAll.value) {
    chooseList.value = []
  } else {
    chooseList.value = state.nftList.map((item) => {
      return item.tokenId.toString()
    })
  }
}
const closeMassVisible = () => {
  cleanConvertData()
  getRestingLives()
  state.massVisible = false
}
watch(
    () => state.massVisible,
    () => {
      if (state.massVisible) {
        let oneArr: number[] = []
        if (chooseList.value.length && state.nftList.length) {
          chooseList.value.forEach((item: any) => {
            let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
              return nft.tokenId.toString() === item
            })
            if (nftItem[0].chargingFee === 1) {
              oneArr.push(nftItem[0].tokenId)
            }
          })
        }
        oneDayTokens.value = oneArr
          // --------------
        let threeArr: number[] = []
        if (chooseList.value.length && state.nftList.length) {
          chooseList.value.forEach((item: any) => {
            let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
              return nft.tokenId.toString() === item
            })
            if (nftItem[0].chargingFee === 3) {
              threeArr.push(nftItem[0].tokenId)
            }
          })
        }
        threeDayTokens.value = threeArr
        // ==================
        let sevenArr: number[] = []
        if (chooseList.value.length && state.nftList.length) {
          chooseList.value.forEach((item: any) => {
            let nftItem = state.nftList.filter((nft: BIT_LIFE) => {
              return nft.tokenId.toString() === item
            })
            if (nftItem[0].chargingFee === 7) {
              sevenArr.push(nftItem[0].tokenId)
            }
          })
        }
        sevenDayTokens.value = sevenArr
      } else {
        closeFilterVisible()
      }
    }
)
onMounted(() => {
  getRestingLives()
  pollingWorking()
})
watch(
    () => account.value,
    () => {
      getRestingLives()
    }
)
watch(
    () => state.nftVisible,
    () => {
      if (!state.nftVisible) {
        state.filterFormData = null
        getRestingLives()
      }
    }
)
const { nftFilterVisible, nftFormData, payBillVisible, massVisible, hashRateType, hashRateStatus, costType, costStatus, nftVisible, filterFormData, filterVisible, convertVisible, nftList, restingLoading, currentIndex, workCellula, chargeIndex, isMass } = toRefs(state)
</script>

<template>
<div class="convert-container">
  <div class="back-container">
    <img @click="router.push('/home')" class="back-icon" src="img/layout/new-back.png" alt="">
    Convert BitLife To Charging Fee
  </div>
<!--  <div class="top-banner">-->
<!--    <div class="text-img"></div>-->
<!--    <div class="description">-->
<!--      Refund of charging fee from April 16th, 11:00 AM to April 29th, 11:00 AM. <br/>-->
<!--      Collect before 12:00 AM on May 16th.-->
<!--    </div>-->
<!--  </div>-->
  <div class="data-container">
    <div class="title">
      <span class="description">Resting BitLifes</span>
      <div class="filter-container">
        <n-popover v-model:show="nftFilterVisible" trigger="click" placement="bottom-end" :show-arrow="false">
          <template #trigger>
            <div class="filter-btn"></div>
          </template>
          <div class="filter-popover">
            <Filter :type="'convert'" :filterData="nftFormData" @confirmFilter="nftConfirmFilter" @resetFilter="closeNftFilterVisible"></Filter>
          </div>
        </n-popover>
        <div v-if="nftFormData?.sortType" @click="closeNftFilterVisible" class="filter-close"></div>
      </div>
    </div>
    <div class="title-container">
      <div class="title-item">TokenID</div>
      <div class="title-item">
        Hashrate
<!--        <img @click="changFilter('hashRete')" :src="hashRateStatus ? (hashRateType ? type3 : type2) : type1" alt="">-->
      </div>
      <div class="title-item">
        Cost
<!--        <img @click="changFilter('cost')" :src="costStatus ? (costType ? type3 : type2) : type1" alt="">-->
      </div>
      <div class="title-item">
        Charging Fee Options
        <n-popover class="tips-text-container tips-text-container-bottom" placement="bottom" trigger="hover">
          <template #trigger>
            <img class="tips" src="img/layout/tips-icon.png" alt="">
          </template>
          <div class="convert-tips"></div>
        </n-popover>
      </div>
      <div class="title-item">Convert</div>
    </div>
    <div class="nft-container" id="bitlife-container" ref="dataContainer">
      <Loading padding="small" v-if="restingLoading"></Loading>
      <template v-else>
        <div class="data-item" v-if="nftList.length" v-for="(item, index) in nftList" :key="index">
          <div class="check-container">
            <div @click.stop="chooseCharge(item.tokenId.toString())" class="check-circle" :class="isChoose(item.tokenId.toString()) ? 'check-circle-active' : ''">
            </div>
          </div>
          <div class="cover-container">
            <div class="cover" :style="{ backgroundImage: `url('${item.roleImage}')` }"></div>
          </div>
          <div class="item">{{ item.tokenId }}</div>
          <div class="item">
            {{ item.hashRate }}
          </div>
          <div class="item">
            {{ truncateNumber(formatEther(item.mintPrice), 6) }}[BNB]
          </div>
          <div class="item">
            {{ item.chargingFee }}[{{item.chargingFee > 1 ? 'Days' : 'Day'}}]
          </div>
          <div class="charge">
            <div class="convert-img" @click="chooseBitLife(index)"></div>
          </div>
        </div>
        <n-empty v-else-if="!restingLoading" class="small-empty" size="huge">
          <template #icon>
            <img class="empty-icon" src="img/layout/empty.png" alt="">
          </template>
        </n-empty>
      </template>
    </div>
    <div class="select-container">
      <div class="label">
        <div @click="chooseAll" class="check-container">
          <div class="check-circle" :class="isAll ? 'check-circle-active' : ''">
          </div>
        </div>
        All
      </div>
      <div class="value-container">
        <div class="date-value">
          {{ chooseListDay }}[{{chooseListDay > 1 ? 'Days' : 'Day'}}]
        </div>
        <div @click="massCharge" :class="chooseListDay ? '' : 'convert-img-disable'" class="convert-img"></div>
      </div>
    </div>
  </div>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="nftVisible">
    <div class="rest-visible">
      <div @click="nftVisible = false" class="close-icon"></div>
      <div class="title">Select The BitLife You Wish To Charge</div>
      <div class="filter-container-modal">
        <n-popover v-model:show="filterVisible" trigger="click" placement="bottom-end" :show-arrow="false">
          <template #trigger>
            <div class="filter-btn"></div>
          </template>
          <div class="filter-popover">
            <Filter :filterData="filterFormData" @confirmFilter="confirmFilter" @resetFilter="closeFilterVisible"></Filter>
          </div>
        </n-popover>
        <div v-if="filterFormData?.sortType" @click="closeFilterVisible" class="filter-close"></div>
      </div>
      <div class="nft-container" id="work-list">
        <template v-if="!state.targetWorkLoading">
          <template v-if="workCellula.length && chooseList.length !== workCellula.length">
            <div
                class="nft-item"
                v-for="(item, index) in workCellula"
                :key="index"
                :class="(isMass ? isChoose(item.tokenId.toString()) : nftList[currentIndex].tokenId.toString() === item.tokenId.toString()) ? 'nft-item-none' : ''"
            >
              <div class="cover-container">
                <div class="cover" :style="{ backgroundImage: `url('${item.roleImage}')` }"></div>
              </div>
              <div class="token-id">
                ID:{{ item.tokenId }}
              </div>
              <div class="hash-rate">
                Hashrate: <br/>
                <span>{{ item.livingQty }}</span>
              </div>
              <div class="charge-img">
                <div class="eat" @click="chargeItem(index)"></div>
              </div>
            </div>
          </template>
          <n-empty v-else-if="!state.targetWorkLoading" size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </template>
        <Loading v-else></Loading>
      </div>
    </div>
  </n-modal>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="massVisible">
    <div class="mass-convert">
      <div @click="closeMassVisible" class="close-icon"></div>
      <div class="title">Select The BitLife You Wish To Charge</div>
      <div class="filter-container-modal">
        <n-popover v-model:show="filterVisible" trigger="click" placement="bottom-end" :show-arrow="false">
          <template #trigger>
            <div class="filter-btn"></div>
          </template>
          <div class="filter-popover">
            <Filter :filterData="filterFormData" @confirmFilter="confirmFilter" @resetFilter="closeFilterVisible"></Filter>
          </div>
        </n-popover>
        <div v-if="filterFormData?.sortType" @click="closeFilterVisible" class="filter-close"></div>
      </div>
      <div class="nft-container" id="work-list">
        <template v-if="!state.targetWorkLoading">
          <template v-if="workCellula.length && chooseList.length !== workCellula.length">
            <div
                class="nft-item"
                v-for="(item, index) in workCellula"
                :key="index"
                :class="(isMass ? isChoose(item.tokenId.toString()) : nftList[currentIndex].tokenId.toString() === item.tokenId.toString()) ? 'nft-item-none' : ''"
            >
              <div class="cover-container">
                <div class="cover" :style="{ backgroundImage: `url('${item.roleImage}')` }"></div>
              </div>
              <div class="token-id">
                ID:{{ item.tokenId }}
              </div>
              <div class="hash-rate">
                Current Hashrate: <br/>
                <span>{{ item.livingQty }}</span>
              </div>
              <div class="distribution">
                <span>{{item.currentDay > 1 ? 'Days' : 'Day'}}</span>
                <div class="computed-container">
                  <div class="add-icon" :class="item.currentDay === 7 ? 'add-icon-disable' : ''" @click="addDays(item.tokenId)"></div>
                  <div class="count">{{item.currentDay ? item.currentDay : 0}}</div>
                  <div class="subtract-icon" :class="item.currentDay === 0 ? 'subtract-icon-disable' : ''" @click="subtractDays(item.tokenId)"></div>
                </div>
              </div>
              <div class="charge-img">
                <n-popover v-if="item.currentDay" class="tips-text-container" placement="top" trigger="hover">
                  <template #trigger>
                    <div class="bit-tips"></div>
                  </template>
                  <div class="convert-tips-container">
                    <div class="label">Token ID</div>
                    <div class="token-container">
                      <span class="id" v-for="tokenID in item.convertList">{{ tokenID }}</span>
                    </div>
                  </div>
                </n-popover>
              </div>
            </div>
          </template>
          <n-empty v-else-if="!state.targetWorkLoading" size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </template>
        <Loading v-else></Loading>
      </div>
      <div class="data-panel">
        <div class="total-day">
          <div class="title">
            Charging Fee Options
          </div>
          <div class="count">{{ (oneDayTokens.length+(threeDayTokens.length*3)+(sevenDayTokens.length*7)) }}</div>
        </div>
        <div class="day-container">
          <div class="item" v-if="oneDayTokens.length">
            <div class="label">
              1Day
            </div>
            <div class="value">
              {{ oneDayTokens.length }}
              <n-popover class="tips-text-container" placement="top" trigger="hover">
                <template #trigger>
                  <div class="small-icon"></div>
                </template>
                <div class="convert-tips-container">
                  <div class="label">Token ID</div>
                  <div class="token-container">
                    <span class="id" v-for="item in oneDayTokens" :key="item">{{item}}</span>
                  </div>
                </div>
              </n-popover>
            </div>
          </div>
          <div class="item" v-if="threeDayTokens.length">
            <div class="label">
              3Days
            </div>
            <div class="value">
              {{ threeDayTokens.length * 3 }}
              <n-popover class="tips-text-container" placement="top" trigger="hover">
                <template #trigger>
                  <div class="small-icon"></div>
                </template>
                <div class="convert-tips-container">
                  <div class="label">Token ID</div>
                  <div class="token-container">
                    <span class="id" v-for="item in threeDayTokens" :key="item">{{item}}</span>
                  </div>
                </div>
              </n-popover>
            </div>
          </div>
          <div class="item" v-if="sevenDayTokens.length">
            <div class="label">
              7Days
            </div>
            <div class="value">
              {{ sevenDayTokens.length * 7 }}
              <n-popover class="tips-text-container" placement="top" trigger="hover">
                <template #trigger>
                  <div class="small-icon"></div>
                </template>
                <div class="convert-tips-container">
                  <div class="label">Token ID</div>
                  <div class="token-container">
                    <span class="id" v-for="item in sevenDayTokens" :key="item">{{item}}</span>
                  </div>
                </div>
              </n-popover>
            </div>
          </div>
        </div>
        <div class="charge-container">
          <div @click="openPayVisible" :class="(oneDayTokens.length+(threeDayTokens.length*3)+(sevenDayTokens.length*7)) !== 0 ? 'charge-img-disable' : ''" class="charge-img"></div>
        </div>
      </div>
    </div>
  </n-modal>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="payBillVisible">
    <div class="mass-convert pay-bill">
      <div @click="payBillVisible = false" class="close-icon"></div>
      <div class="title">Please Approval Below Transaction:</div>
      <div class="pay-contract">
        <div class="bill-item" v-for="item in payBillList" :key="item.tokenId">
          <div class="title-container">
            <div class="title-item">Token ID</div>
            <div class="title-item">{{ item.currentDay > 1 ? 'Days' : 'Day' }}</div>
            <div class="title-item">Convert BitLife</div>
          </div>
          <div class="data-container">
            <div class="data-item">{{ item.tokenId }}</div>
            <div class="data-item">{{ item.currentDay }}</div>
            <div class="convert-life">
              <span v-for="tokenId in item.convertList" :key="tokenId">{{ tokenId }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="explore-footer">
        <div class="cancel-btn" @click="payBillVisible = false">Cancel</div>
        <div class="confirm-btn" @click="massApprove">Approve</div>
      </div>
    </div>
  </n-modal>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="convertVisible">
    <div class="rewards-log">
      <div class="model-main">
        <div class="title">Please Approve Below Transaction:</div>
        <div class="explore-title" v-if="!isMass">
          Convert BitLife TokenID {{ nftList[currentIndex].tokenId }} To {{nftList[currentIndex].chargingFee}} {{nftList[currentIndex].chargingFee > 1 ? 'Days' : 'Day'}}
          Charging Fee and Charge TokenID {{ workCellula[chargeIndex]?.tokenId }}
        </div>
        <div class="explore-title" v-else>
          Convert BitLife TokenID {{ chooseListText }} To {{chooseListDay}} {{ chooseListDay > 1 ? 'Days' : 'Day' }}
          Charging Fee and Charge TokenID {{ workCellula[chargeIndex]?.tokenId }}
        </div>
        <div class="explore-footer">
          <div class="cancel-btn" @click="convertVisible = false">Cancel</div>
          <div class="confirm-btn" @click="chargeFun">Approve</div>
        </div>
      </div>
    </div>
  </n-modal>
</div>
</template>

<style scoped lang="scss">
.convert-container {
  width: 1920px;
  height: 1080px;
  background-image: url("img/convert/bg.png");
  position: relative;
  padding-top: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  .data-container {
    width: 1617px;
    height: 834px;
    margin-top: 14px;
    background-image: url("img/convert/data-bg.png");
    padding: 94px 32px 0 52px;
    position: relative;
    .title {
      padding-left: 37px;
      position: relative;
      .description {
        color: #4B90CE;
        font-size: 22px;
      }
      .filter-container {
        position: absolute;
        right: 26px;
        top: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        .filter-close {
          width: 37px;
          height: 37px;
          background-size: 100% 100%;
          transform: translateY(2px);
          cursor: pointer;
          background-image: url("img/home/close.png");
        }
        .filter-close:hover {
          background-image: url("img/home/close-hover.png");
        }
        .filter-btn {
          width: 114px;
          height: 38px;
          background-size: 100% 100%;
          background-image: url("img/home/filter-btn.png");
          cursor: pointer;
        }
      }
    }
    .title-container {
      width: 1508px;
      display: grid;
      grid-template-columns: 408px 316px 210px 400px 1fr;
      padding-bottom: 6px;
      margin-top: 20px;
      border-bottom: 2px solid #2E6495;
      .title-item {
        text-align: right;
        color: #0ADCF3;
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: right;
        gap: 8px;
        &:nth-last-child(1) {
          justify-content: center;
        }
        &:nth-of-type(2) {
          padding-right: 56px;
        }
        &:nth-of-type(3) {
          padding-right: 24px;
        }
        &:nth-of-type(5) {
          justify-content: right;
          padding-right: 26px;
        }
        img {
          width: 16px;
          height: 26px;
          cursor: pointer;
        }
      }
    }
    .nft-container {
      margin-top: 16px;
      height: 520px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      scrollbar-gutter: stable;
      padding-bottom: 22px;
      .data-item {
        width: 1509px;
        height: 72px;
        background-size: 100% 100%;
        display: grid;
        grid-template-columns: 140px 116px 152px 260px 312px 230px 1fr;
        background-image: url("img/convert/nft-bg.png");
        .check-container {
          display: flex;
          align-items: center;
          justify-content: center;
          .check-circle {
            width: 35px;
            height: 35px;
            background-size: 100% 100%;
            background-image: url("img/home/circle.png");
            position: relative;
            cursor: pointer;
          }
          .check-circle-active {
            &:after {
              content: '';
              width: 33px;
              height: 32px;
              background-size: 100% 100%;
              position: absolute;
              top: -2px;
              right: -1px;
              background-image: url("img/home/check.png");
            }
          }
        }
        .cover-container {
          display: flex;
          justify-content: right;
          .cover {
            width: 64px;
            height: 64px;
            background-size: 1024px 64px;
            background-position: -704px 10px;
            background-repeat: no-repeat;
            scale: 1.3;
            transform: translateX(-30px) translateY(-4px);
            background-image: url("https://img.cellula.life/roleimagefactory/d17_D_21.png");
          }
        }
        .item {
          height: 72px;
          color: #337FC4;
          font-size: 22px;
          line-height: 78px;
          text-align: right;
        }
        .charge {
          display: flex;
          justify-content: right;
          align-items: center;
          .convert-img {
            width: 72px;
            height: 59px;
            margin-right: 32px;
            cursor: pointer;
            background-image: url("img/convert/convert.png");
          }
        }
      }
    }
    .select-container {
      width: 1562px;
      display: flex;
      position: absolute;
      left: 31px;
      bottom: 40px;
      height: 80px;
      justify-content: space-between;
      align-items: center;
      background: #012958;
      padding-left: 72px;
      padding-right: 68px;
      .label {
        display: flex;
        color: #4C9FE8;
        font-size: 32px;
        align-items: center;
        gap: 38px;
        .check-container {
          scale: 1.3;
          .check-circle {
            width: 35px;
            height: 35px;
            background-size: 100% 100%;
            background-image: url("img/home/circle.png");
            position: relative;
            cursor: pointer;
          }
          .check-circle-active {
            &:after {
              content: '';
              width: 33px;
              height: 32px;
              background-size: 100% 100%;
              position: absolute;
              top: -2px;
              right: -1px;
              background-image: url("img/home/check.png");
            }
          }
        }
      }
      .value-container {
        display: flex;
        align-items: center;
        gap: 162px;
        .date-value {
          color: #4C9FE8;
          font-size: 32px;
        }
        .convert-img {
          width: 85px;
          transform: translateX(14px);
          height: 70px;
          cursor: pointer;
          background-image: url("img/convert/convert-big.png");
        }
        .convert-img-disable {
          pointer-events: none;
          background-image: url("img/convert/convert-big-disable.png");
        }
      }
    }
    .nft-container::-webkit-scrollbar{
      width:16px;
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
}
.rewards-log {
  width: 1176px;
  height: 669px;
  box-shadow: unset;
  background-image: url("img/home/dialog.png");
  background-size: 100% 100%;
  .model-main {
    padding: 26px 12px;
    border-radius: 8px;
    padding-top: 0;
    .title {
      color: #A9EEFF;
      text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
      font-size: 36px;
      margin-bottom: 52px;
    }
    .explore-title {
      color: #4C9EE8;
      font-size: 36px;
      padding: 0 32px;
      margin-top: 140px;
      text-align: center;
      .nbsp {
        height: 50px;
      }
      span {
        font-size: 36px;
        color: #F1BB2B;
      };
    }
    .explore-footer {
      display: flex;
      justify-content: right;
      gap: 75px;
      margin-top: 148px;
      .cancel-btn, .confirm-btn {
        width: 241px;
        height: 72px;
        line-height: 78px;
        text-align: center;
        color: #78BFFF;
        cursor: pointer;
        font-size: 36px;
        background-image: url("img/convert/cancel.png");
      }
      .confirm-btn {
        color: #FFF372;
        text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
        background-image: url("img/convert/confirm.png");
      }
    }
  }
}
</style>