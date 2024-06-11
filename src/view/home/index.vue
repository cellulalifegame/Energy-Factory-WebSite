<script setup lang="ts">
import {useUserStore} from "store/modules/user";
import {computed, watch, ref, reactive, toRefs, onMounted, onUnmounted, inject, Ref,getCurrentInstance} from "vue";
import {useRouter} from "vue-router";
import {
  weightedRandom,
  clickMusic,
  closeMusic,
  formatTimestampToDDHHMM,
  debounce, formatNumberWithCommas, formatNumberForEnglish, canContinuePaging, truncateNumber
} from "src/utils/utils";
import ModalButton from "comps/ModalButton.vue";
import {User} from "src/api";
import { useLoadingBar } from 'naive-ui'
import HomeClick from "src/assets/musics/home-click.wav"
import HomeReturn from "src/assets/musics/home-return.wav"
import {networkList} from "src/hooks/web3/network";
import anime from "animejs/lib/anime.es.js";
import {useGameLife} from "src/hooks/web3/useGameLife";
import {usePoint} from "src/hooks/web3/useGamePoint";
import {getStr} from "src/hooks/useComming";
import { formatEther, parseEther } from "viem";
import TokenVisible from "src/view/home/TokenVisible.vue";
import InviteVisible from "../invite/index.vue"
import Safepal from "src/view/home/Safepal.vue";
import Filter from './Filter.vue'
import Loading from '../loading/loading.vue'
import { useClaim } from "src/hooks/web3/useClaim";
const loadingBar = useLoadingBar()

const router = useRouter()
const UserStore = useUserStore()

const { userClaimEnergy } = usePoint()
const { getFoodPrice, buyFood } = useGameLife()
const address = computed(() => {
  return UserStore.walletAddress
})
const walletValue = ref(false)
const state = reactive({
  rewardsVisible: false,
  isWork: false,
  rightVisible: false,
  mintInfo: {} as mintInfo,
  pointLog: [] as pointLog[],
  pointLogTotal: 0,
  workCellula: [] as workCellula[],
  noWorkCellula: [] as workCellula[],
  workTotal: 0,
  noWorkTotal: 0,
  pageSize: 30,
  pageNum: 1,
  workPageSize: 100000,
  workPageNum: 1,
  workAllVisible: false,
  maskStatus: true,
  taskVisible: false,
  taskStatus: false,
  userQuest: {} as useQuest,
  dailyTask: [] as dailyTask[],
  inviteCode: '',
  energy: 0,
  inviteMember: [] as InviteMember[],
  inviteTotal: 0,
  pageSizes: 30,
  pageNums: 1,
  exploreVisible: false,
  cashbackVisible: false,
  discordVisible: false,
  animateAvatar: [] as string[],
  questTips: false,
  dailyTips: false,
  isAll: false,
  chargePriceList: [],
  myAssets: {} as UserAssets,
  tokenCount: 0 as number,
  inviteVisible: false,
  safepalVisible: false
})
const closeInviteVisible = () => {
  state.inviteVisible = !state.inviteVisible
  state.taskVisible = !state.taskVisible
}
watch(
    () => address.value,
    () => {
      if (address.value) {
        getSafepalActivity()
        getMiningInfo()
        reloadInfo()
        getRedPoint()
        state.isAll = false
        tokenVisible.value = false
        chooseList.value = []
        User.getUserQuest(address.value).then((res: any) => {
          if (res.code === 200) {
            state.userQuest = res.data
          }
        })
        User.getInviteEnergy(address.value).then((res: any) => {
          state.energy = res.data
        })
        User.getInviteMember(state.pageNums,state.pageSizes,address.value).then((res: any) => {
          state.inviteMember = res.data.list
          state.inviteTotal = res.data.total
        })
        User.getDailyTask(address.value).then((res: any) => {
          if (res.code === 200) {
            state.dailyTask = res.data
          }
        })
        User.getInviteCode(address.value).then((res: any) => {
          state.inviteCode = res.data
        })
      }
    }
)

declare const VANTA: any;
const vantaEffect: any = ref(null);
function isEven(number: number) {
  return number % 2 === 0;
}
const showGlobalMessage: any = inject('showGlobalMessage');
const getCharge = async () => {
  let prices: any = []
  await getFoodPrice(86400).then((res: any) => {
    prices.push(formatEther(res))
  })
  await getFoodPrice(86400*3).then((res: any) => {
    prices.push(formatEther(res))
  })
  await getFoodPrice(86400*7).then((res: any) => {
    prices.push(formatEther(res))
  })
  if (prices.length) {
    state.chargePriceList = prices
  }
}

let timer: any = null;
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
    const containerId = 'bitlife-container';
    const previousScrollPosition: any = getScrollPosition(containerId);
    await getWorkCellula()
    await setScrollPosition(containerId, previousScrollPosition);
    await pollingWorking()
  }, 60000)
}
onMounted(async () => {
  centerBrickContainer()
  let isWork: any = sessionStorage.getItem('isWork')
  if (isWork) {
    state.isWork = isWork === 'true'
  }
  let maxHashRate: any = sessionStorage.getItem('maxHashRate')
  let minHashRate: any = sessionStorage.getItem('minHashRate')
  let sortType: any = sessionStorage.getItem('sortType')
  if (maxHashRate) {
    let formData = {
      maxHashRate: parseInt(maxHashRate),
      minHashRate: parseInt(minHashRate),
      sortType: parseInt(sortType)
    }
    filterFormData.value = formData
  }
  if (window.history.state.forward) {
    let forward = window.history.state.forward
    if (forward.includes('bitlife')) {
      state.rightVisible = true
    }
  }
  const el = brickContainer.value;
  if (el) {
    // For touch devices, we want to ensure the default action is prevented
    el.addEventListener('touchmove', dragMove, { passive: true });
  }
  isPolling.value = true;
  if (address.value) {
    await getSafepalActivity()
    await getMiningInfo()
    reloadInfo()
    getRedPoint()
    User.getUserQuest(address.value).then((res: any) => {
      if (res.code === 200) {
        state.userQuest = res.data
      }
    })
    User.getInviteEnergy(address.value).then((res: any) => {
      if (res.code === 200) {
        state.energy = res.data
      }
    })
    User.getInviteMember(state.pageNums,state.pageSizes,address.value).then((res: any) => {
      if (res.code === 200) {
        state.inviteMember = res.data.list
        state.inviteTotal = res.data.total
      }
    })
    User.getDailyTask(address.value).then((res: any) => {
      if (res.code === 200) {
        state.dailyTask = res.data
      }
    })
    User.getInviteCode(address.value).then((res: any) => {
      state.inviteCode = res.data
    })
    await getCharge()
    pollingWorking()
  }
  // document.documentElement.style.overflow = 'hidden';
  window.scrollTo(0, 0);
})
const { getPlayer } = useClaim()
const checkUserFirst = () => {
  if (address.value) {
    User.checkUser(address.value).then((res: any) => {
      if (res.code === 200) {
        if (res.data) {
          router.push('/guide')
        }
      }
    })
  }
}
const getSafepalActivity = async () => {
  if (address.value) {
    User.getUserSource(address.value).then(async (res: any) => {
      if (res.data) {
        User.getClaimCount().then(async (res: any) => {
          if (res.code === 200) {
            if (res.data?.alreadyClaimedCount < res.data?.totalCount) {
              const id = await getPlayer(address.value)
              if (id) {
                User.checkCharge(address.value, id).then((res: any) => {
                  if (!res.data) {
                    state.safepalVisible = true
                  } else {
                    state.safepalVisible = false
                  }
                })
              } else {
                state.safepalVisible = true
              }
            }
          }
        })
      } else {
        checkUserFirst()
        state.safepalVisible = false
      }
    })
  }
}
const closeSafepalVisible = () => {
  state.safepalVisible = false
  checkUserFirst()
}
watch(
    () => state.safepalVisible,
    () => {
      if (!state.safepalVisible) {
        checkUserFirst()
      }
    }
)
onUnmounted(() => {
  isPolling.value = false;
  stopAnime()
  clearInterval(timer)
})
const addAnimationsFun = (async () => {
  if (avatarContainer.value) {
    const existingCards = avatarContainer.value.querySelectorAll('.avatar-img');
    if (existingCards) {
      existingCards.forEach((card: any, index: number) => {
        startAnime(card)
      });
    }
  }
})
const animations: any[] = [];

function generateValidPosition(
    lastX: number,
    lastY: number,
    containerWidth: number,
    containerHeight: number,
    targetWidth: number,
    targetHeight: number
) {
  const maxDistance = 200;
  const minDistance = 80;
  const forbiddenZones = [
    { startX: 3910, endX: 4610, startY: 3032, endY: 3744 },
    { startX: 5113, endX: 5782, startY: 3346, endY: 3917 },
    { startX: 4637, endX: 5305, startY: 2889, endY: 3264 },
  ];
  let x, y, distance;

  function isInForbiddenZone(x: number, y: number): boolean {
    return forbiddenZones.some(zone =>
        x >= zone.startX && x <= zone.endX && y >= zone.startY && y <= zone.endY
    );
  }

  do {
    x = Math.random() * (containerWidth - targetWidth);
    y = Math.random() * (containerHeight - targetHeight);

    distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);

  } while (
      distance > maxDistance ||
      distance < minDistance ||
      isInForbiddenZone(x, y)
      );
  return { x, y };
}
const timeouts:any = [];

const stopAnime = async () => {
  state.animateAvatar = []
  timeouts.forEach(clearTimeout);

  timeouts.length = 0;

  animations.forEach(animation => animation.pause());

  animations.length = 0;
};
const leftTopPosition = [{
  top: 386,
  left: 1655
}]
const rightTopPosition = [{
  left: 2418,
  top: 974
}]
const rightTopPosition2 = [{
  top: 746,
  left: 1943
}]
const leftBottomPosition = [{
  top: 1325,
  left: 1348
}]
const rightBottomPosition = [{
  top: 1356,
  left: 2098
}]
let numbers = ref([] as number[])
function getRandomUniqueNumber(existingNumbers: number[]) {
  if (!Array.isArray(existingNumbers)) {
    throw new Error('The input must be an array.');
  }
  const possibleNumbers = [0, 1, 2, 3, 4];
  const availableNumbers = possibleNumbers.filter(number => !existingNumbers.includes(number));
  if (availableNumbers.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  const uniqueNumber = availableNumbers[randomIndex];
  numbers.value.push(uniqueNumber);
  return uniqueNumber;
}
const startAnime = (target: any) => {
  const container: any = avatarContainer.value
  if (!container) {
    return;
  }
  const integer = getRandomUniqueNumber(numbers.value)
  if (integer !== null) {
    let targetLeft = 0
    let targetTop = 0
    if (integer === 0) {
      target.style.top = '0PX'
      target.style.left = '4113PX'
      targetLeft = rightTopPosition[0].left
      targetTop = rightTopPosition[0].top
    } else if (integer === 1) {
      target.style.top = '2314PX'
      target.style.left = '4113PX'
      targetLeft = rightBottomPosition[0].left
      targetTop = rightBottomPosition[0].top
    } else if (integer === 2) {
      target.style.top = '2314PX'
      target.style.left = '0PX'
      target.classList.add('avatar-flip')
      targetLeft = leftBottomPosition[0].left
      targetTop = leftBottomPosition[0].top
    } else if (integer === 4) {
      target.style.top = '0PX'
      target.style.left = '4113PX'
      targetLeft = rightTopPosition2[0].left
      targetTop = rightTopPosition2[0].top
    } else {
      target.style.top = '0PX'
      target.style.left = '0PX'
      target.classList.add('avatar-flip')
      targetLeft = leftTopPosition[0].left
      targetTop = leftTopPosition[0].top
    }
    target.style.opacity = 1
    const animationInstance = anime({
      targets: target,
      left: targetLeft,
      top: targetTop,
      duration: () => (getRandomInteger(18,22)*1000),
      // duration: () => 200,
      easing: 'easeInOutQuad',
      complete: () => {
        target.left = 'unset'
        target.top = 'unset'
        if (integer !== null) {
          let index = numbers.value.indexOf(integer)
          numbers.value.splice(index, 1)
        }
        if (integer === 2 || integer === 3) {
          target.classList.add('avatar-animate-mirror')
        } else {
          target.classList.add('avatar-animate')
        }
        setTimeout(() => {
          target.classList.add('avatar-animate-opacity')
        }, 4000)
        setTimeout(() => {
          target.classList.remove('avatar-animate')
          target.classList.remove('avatar-animate-opacity')
          target.classList.remove('avatar-flip')
          target.classList.remove('avatar-animate-mirror')
          target.style.opacity = 0
          startAnime(target)
        }, 7000)
      },
    });

    animations.push(animationInstance);
  } else {
    setTimeout(() => {
      startAnime(target)
    }, 2000)
  }
};


function createPoller(interval: number, times: number, task: any) {
  let count = 0;
  let timerId: any = null;

  const start = () => {
    if (count < times) {
      task();
      count++;
      timerId = setTimeout(start, interval);
    }
  };

  const stop = () => {
    clearTimeout(timerId);
  };

  return { start, stop };
}

const poller = createPoller(3000, 30, () => {
  state.workPageNum = 1
  let isWork = state.isWork
  if (isWork) {
    loading.value = true
  } else {
    noWorkingLoading.value = true
  }
  if (filterFormData.value === null) {
    User.getWorkCellula(address.value, isWork ? 1 : 0, state.workPageNum, state.workPageSize).then((res: any) => {
      if (res.code === 200) {
        if (isWork) {
          state.workCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          loading.value = false
          if (state.workTotal !== res.data.total) {
            poller.stop()
            state.workTotal = res.data.total
          }
        } else {
          state.noWorkCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          noWorkingLoading.value = false
          if (state.noWorkTotal !== res.data.total) {
            poller.stop()
            state.noWorkTotal = res.data.total
          }
        }
      }
    })
  } else {
    let formData: any = filterFormData.value
    User.getWorkCellula(address.value, isWork ? 1 : 0, state.workPageNum, state.workPageSize, formData.sortType, formData.maxHashRate, formData.minHashRate).then((res: any) => {
      if (res.code === 200) {
        if (isWork) {
          state.workCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          loading.value = false
          if (state.workTotal !== res.data.total) {
            poller.stop()
            state.workTotal = res.data.total
          }
        } else {
          state.noWorkCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          noWorkingLoading.value = false
          if (state.noWorkTotal !== res.data.total) {
            poller.stop()
            state.noWorkTotal = res.data.total
          }
        }
      }
    })
  }
});

onUnmounted(() => {
  // Destroy the VANTA effect when the component is unmounted to prevent memory leaks
  if (vantaEffect.value) {
    vantaEffect.value.destroy();
  }
});
const centerBrickContainer = () => {
  if (brickContainer.value) {
    setTranslate(-1072, -620, brickContainer.value);
    setTranslate(-1072, -620, avatarContainer.value);
    xOffset = -1072
    yOffset = -620
  }
};
const mapContainer = ref<HTMLElement | null>(null);
const brickContainer = ref<HTMLElement | null>(null);
const avatarContainer = ref<HTMLElement | null>(null);
let active = false;
let currentX = 0;
let currentY = 0;
let initialX = 0;
let initialY = 0;
let xOffset = 0;
let yOffset = 0;
const MAX_TRANSLATE_X = -2190;
const MAX_TRANSLATE_Y = -1234;
const MIN_TRANSLATE_X = 0;
const MIN_TRANSLATE_Y = 0;

const dragStart = (e: any) => {
  const startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
  const startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
  const container = (e.target).closest('.brick-container');

  if (container && brickContainer.value && container === brickContainer.value) {
    active = true;
    initialX = startX - xOffset;
    initialY = startY - yOffset;
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove);
    document.addEventListener('touchend', dragEnd);
    e.preventDefault();
  }
};

const dragEnd = () => {
  document.removeEventListener('mousemove', dragMove);
  document.removeEventListener('mouseup', dragEnd);
  document.removeEventListener('touchmove', dragMove);
  document.removeEventListener('touchend', dragEnd);
  active = false;
  initialX = currentX;
  initialY = currentY;
};

const dragMove = (e: any) => {
  if (active) {
    e.preventDefault();
    let x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    let y = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    currentX = x - initialX;
    currentY = y - initialY;

    currentX = Math.max(Math.min(currentX, MIN_TRANSLATE_X), MAX_TRANSLATE_X);
    currentY = Math.max(Math.min(currentY, MIN_TRANSLATE_Y), MAX_TRANSLATE_Y);

    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, brickContainer.value);
    setTranslate(currentX, currentY, avatarContainer.value);
  }
};

const setTranslate = (xPos: any, yPos: any, el: any) => {
  if (el) {
    el.style.transform = `translate3d(${xPos}PX, ${yPos}PX, 0)`;
  }
};
function getRandomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getNewRandom() {
  return weightedRandom()
}
const classList: any = []
const brickList: any = []
for (let i = 0; i< 80; i++) {
  const classRow = [];
  const brickRow = [];

  for (let j = 0; j < 80; j++) {
    classRow.push(getRandomInteger(1, 40));
    brickRow.push(getNewRandom());
  }

  classList.push(classRow);
  brickList.push(brickRow);
}
const loading = ref(false)
const noWorkingLoading = ref(false)
const getTokenData = () => {
  if (address.value) {
    User.getMyToken(address.value).then((res: any) => {
      if (res.code === 200) {
        state.tokenCount = res.data
      }
    })
    User.getMyAssets(address.value).then((res: any) => {
      if (res.code === 200) {
        state.myAssets = res.data
      }
    })
  }
}
const getMiningInfo = async () => {
  loadingBar.start()
  User.getMiningInfo(address.value).then(async (res: any) => {
    if (res.code === 200) {
      if (state.animateAvatar?.length) {
        await stopAnime()
      }
      state.animateAvatar = res.data.roleImages
      state.mintInfo = res.data
      state.pointLog = []
      state.pageNum = 1
      User.getPointLog(address.value, state.pageNum, state.pageSize).then((res: any) => {
        state.pointLog = res.data.list
        state.pointLogTotal = res.data.total
        getWorkCellula()
      })
      setTimeout(async () => {
        await addAnimationsFun()
        loadingBar.finish()
      }, 1000)
    }
  })
  getTokenData()
  User.getRefundAmount(address.value).then((res: any) => {
    refundAmount.value = res.data
  })
}
const refundAmount = ref('')
let isPolling = ref(true);
let isLoading = ref(false)
let claimPointLoading = ref(false)
let rewardsLoading = ref(false)
const reloadInfo = () => {
  if (isPolling.value && !isLoading.value) {
    isLoading.value = true
    User.getMiningInfo(address.value).then((res: any) => {
      if (res.code === 200) {
        if (res.data.myQty > 0 && res.data.blocks === 0) {
          claimPointLoading.value = true
        }
        if (state.mintInfo.waitClaimEnergy !== res.data.waitClaimEnergy) {
          claimPointLoading.value = false
        }
        state.mintInfo = res.data
        UserStore.setPoints(res.data.myEnergy)
        setTimeout(() => {
          isLoading.value = false
          reloadInfo()
        }, 2000)
      }
    })
  }
}
watch(
    () => state.rewardsVisible,
    () => {
      if (state.rewardsVisible) {
        User.getPointLog(address.value, state.pageNum, state.pageSize).then((res: any) => {
          state.pointLog = res.data.list
        })
      } else {
        state.pageNum = 1
        state.pageSize = 30
      }
    }
)
const points = computed(() => {
  return UserStore.points
})
const dataContainer2: Ref<HTMLElement | null> = ref(null);
const pageLoading2 = ref(false)
const handlePageWork = () => {
  if (!dataContainer2.value || pageLoading2.value || !canContinuePaging(state.workPageNum, state.workPageSize, state.workTotal)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainer2.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    pageLoading2.value = true
    state.workPageNum ++
    User.getWorkCellula(address.value, state.isWork ? 1 : 0, state.workPageNum, state.workPageSize).then((res: any) => {
      if (res.code === 200) {
        state.workTotal = res.data.total
        res.data.list.forEach((item: any) => {
          let addItem = item
          addItem.popoverShow = false
          state.workCellula.push(addItem)
        })
        pageLoading2.value = false
      }
    })
  }
};
const getWorkCellula = async () => {
  state.workPageNum = 1
  state.workCellula = []
  state.noWorkCellula = []
  state.noWorkTotal = 0
  state.workTotal = 0
  let isWork = state.isWork
  if (isWork) {
    loading.value = true
  } else {
    noWorkingLoading.value = true
  }
  if (filterFormData.value === null) {
    await User.getWorkCellula(address.value, isWork ? 1 : 0, state.workPageNum, state.workPageSize).then((res: any) => {
      if (res.code === 200) {
        if (isWork) {
          state.workTotal = res.data.total
          state.workCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          loading.value = false
        } else {
          state.noWorkTotal = res.data.total
          state.noWorkCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          noWorkingLoading.value = false
        }
      }
    })
  } else {
    let formData: any = filterFormData.value
    await User.getWorkCellula(address.value, isWork ? 1 : 0, state.workPageNum, state.workPageSize, formData.sortType, formData.maxHashRate, formData.minHashRate).then((res: any) => {
      if (res.code === 200) {
        if (isWork) {
          state.workTotal = res.data.total
          state.workCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          loading.value = false
        } else {
          state.noWorkTotal = res.data.total
          state.noWorkCellula = res.data.list.map((item: any) => {
            return {
              ...item,
              popoverShow: false
            }
          })
          noWorkingLoading.value = false
        }
      }
    })
  }
}
watch(
    () => state.isWork,
    () => {
      sessionStorage.setItem('isWork', state.isWork.toString())
      const containerId = 'bitlife-container';
      setScrollPosition(containerId, '0');
      getWorkCellula()
    }
)
const claimRewardLoading = ref(false)
const claimRewardsDebounce = () => {
  if (!claimRewardLoading.value) {
    const nowBlockId = localStorage.getItem('nowBlockId')
    const nowAddress = localStorage.getItem('nowAddress')
    if (state.mintInfo.waitClaimEnergy && nowBlockId !== state.mintInfo.nowBlockId.toString()) {
      clickMusic()
      loadingBar.start()
      claimRewardLoading.value = true
      showGlobalMessage('Collecting Energy', 'Withdrawing')
      userClaimEnergy().then(async (res: any) => {
        rewardsLoading.value = true
        setTimeout(async () => {
          // await getMiningInfo()
          localStorage.setItem('nowBlockId', state.mintInfo.nowBlockId.toString())
          if (address.value) {
            localStorage.setItem('nowAddress', address.value.toString())
          }
          loadingBar.finish()
          claimRewardLoading.value = false
          showGlobalMessage('Collecting Energy', 'close')
          showGlobalMessage('Successfully Collected')
        }, 1000)
      })
          .catch((error: any) => {
            console.log(error);
            loadingBar.finish()
            claimRewardLoading.value = false
            showGlobalMessage('Collecting Energy', 'close')
            if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
              showGlobalMessage('Insufficient Balance')
            }
            if (error.toString().substring(0,21) === 'Error: network error') {
              showGlobalMessage('Network error')
            }
          })
    } else if (state.mintInfo.waitClaimEnergy && nowBlockId && nowAddress !== address.value) {
      clickMusic()
      loadingBar.start()
      claimRewardLoading.value = true
      showGlobalMessage('Collecting Energy', 'Withdrawing')
      userClaimEnergy().then(async (res: any) => {
        rewardsLoading.value = true
        setTimeout(async () => {
          // await getMiningInfo()
          localStorage.setItem('nowBlockId', state.mintInfo.nowBlockId.toString())
          if (address.value) {
            localStorage.setItem('nowAddress', address.value.toString())
          }
          loadingBar.finish()
          claimRewardLoading.value = false
          showGlobalMessage('Collecting Energy', 'close')
          showGlobalMessage('Successfully Collected')
        }, 1000)
      })
          .catch((error: any) => {
            console.log(error);
            loadingBar.finish()
            claimRewardLoading.value = false
            showGlobalMessage('Collecting Energy', 'close')
            if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
              showGlobalMessage('Insufficient Balance')
            }
            if (error.toString().substring(0,21) === 'Error: network error') {
              showGlobalMessage('Network error')
            }
          })
    }
  }
}
const claimRewards = debounce(claimRewardsDebounce, 200);

const networkStatus = computed(() => {
  return UserStore.networkStatus
})
const goToHashDetail = (url: string) => {
  window.open(`${networkList[networkStatus.value].blockExplorerUrls}/tx/${url}`)
}

const workingFunDebounce = (index: number, type: number) => {
  clickMusic()
  closePopover(index)
  getFoodPrice(86400*type).then((res: any) => {
    loadingBar.start()
    showGlobalMessage('Charging BitLife.......', 'inject')
    buyFood(state.isWork ? [state.workCellula[index].tokenId] : [state.noWorkCellula[index].tokenId],(86400*type).toString(), res).then((res: any) => {
      setTimeout(() => {
        getMiningInfo()
        poller.start()
        getRedPoint()
        showGlobalMessage('Charging BitLife.......', 'close')
        showGlobalMessage('Successfully Charged')
        loadingBar.finish()
      }, 2000)
    })
        .catch((error: any) => {
          console.log(error);
          showGlobalMessage('Charging BitLife.......', 'close')
          loadingBar.finish()
          if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
            showGlobalMessage('Insufficient Balance')
          }
          if (error.toString().substring(0,21) === 'Error: network error') {
            showGlobalMessage('Network error')
          }
        })
  })
}
const workingFun = debounce(workingFunDebounce, 2000);

const workingFunAllDebounce= (type: number) => {
  clickMusic()
  getFoodPrice(86400*type).then((res: any) => {
    loadingBar.start()
    state.workAllVisible = false
    showGlobalMessage('Charging BitLife.......', 'inject')
    const tokenIds = chooseList.value
    console.log(tokenIds);
    const seconds = 86400*type
    const totalPrice = parseInt(res) * tokenIds.length
    buyFood(tokenIds,seconds, totalPrice.toString()).then((res: any) => {
      setTimeout(() => {
        chooseList.value = []
        getMiningInfo()
        poller.start()
        getRedPoint()
        showGlobalMessage('Charging BitLife.......', 'close')
        showGlobalMessage('Successfully Charged')
        loadingBar.finish()
      }, 2000)
    })
        .catch((error: any) => {
          showGlobalMessage('Charging BitLife.......', 'close')
          loadingBar.finish()
          if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
            showGlobalMessage('Insufficient Balance')
          }
          if (error.toString().substring(0,21) === 'Error: network error') {
            showGlobalMessage('Network error')
          }
        })
  })
}
const workingFunAll = debounce(workingFunAllDebounce, 2000);

const closePopover = (index: number) => {
  if (state.isWork) {
    state.workCellula[index].popoverShow = false
    clickMusic()
  } else {
    state.noWorkCellula[index].popoverShow = false
    clickMusic()
  }
}
const dataContainer: Ref<HTMLElement | null> = ref(null);
const pageLoading = ref(false)
const handlePage = () => {
  if (!dataContainer.value || pageLoading.value || !canContinuePaging(state.pageNum, state.pageSize, state.pointLogTotal)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainer.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    pageLoading.value = true
    state.pageNum ++
    User.getPointLog(address.value, state.pageNum, state.pageSize).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.pointLog.push(item)
      })
      pageLoading.value = false
    })
  }
};
watch(
    () => state.rewardsVisible,
    () => {
      if (state.rewardsVisible) {
        clickMusic()
        setTimeout(() => {
          if (dataContainer.value) {
            dataContainer.value.addEventListener('scroll', handlePage);
          }
        }, 200)
      } else {
        closeMusic()
        if (dataContainer.value) {
          dataContainer.value.removeEventListener('scroll', handlePage);
        }
      }
    }
)
watch(
    () => state.rightVisible,
    () => {
      if (state.rightVisible) {
        const music = localStorage.getItem('musicStatus')
        if (music !== 'false') {
          const audioClick = new Audio(HomeClick);
          audioClick.play()
        }
        setTimeout(() => {
          if (dataContainer2.value) {
            // dataContainer2.value.addEventListener('scroll', handlePageWork);
          }
        }, 200)
      } else {
        filterFormData.value = null
        sessionStorage.removeItem('sortType')
        sessionStorage.removeItem('maxHashRate')
        sessionStorage.removeItem('minHashRate')
        getWorkCellula()
        const music = localStorage.getItem('musicStatus')
        if (music !== 'false') {
          const audioClick = new Audio(HomeReturn);
          audioClick.play()
        }
        if (dataContainer2.value) {
          // dataContainer2.value.removeEventListener('scroll', handlePageWork);
        }
      }
    }
)

const isGuide = ref(false)
const guideStep = ref(0)
const homeVisible = computed(() => {
  return UserStore.homeVisible
})
watch(
    () => homeVisible.value,
    () => {
      if (homeVisible.value) {
        state.rightVisible = true
        UserStore.setHomeVisible(false)
      }
    }
)
const reloadData = computed(() => {
  return UserStore.reloadData
})
watch(
    () => reloadData.value,
    () => {
      if (reloadData.value) {
        // getMiningInfo()
        UserStore.setReloadData(false)
      }
    }
)
watch(
    () => points.value,
    () => {
      if (address.value) {
        getWorkCellula()
        rewardsLoading.value = false
      }
    }
)
// __________________________________________________________________________________________
const instance = getCurrentInstance();

const copyText = (text: string | null) => {
  if (text) {
    instance?.appContext.config.globalProperties.$copyToClipboard(location.origin+'?code='+text);
    showGlobalMessage('Successfully Copied')
  }
}
const getNumber = (str: string) => {
  const matches = str.match(/\d+/);
  return matches ? parseInt(matches[0], 10) : null;
};
const claimInvite = () => {
  loadingBar.start()
  if (state.energy) {
    User.claimInviteEnergy(address.value).then((res: any) => {
      User.getInviteEnergy(address.value).then((res: any) => {
        state.energy = res.data
      })
      loadingBar.finish()
    })
  }
}

const getRedPoint = () => {
  User.checkTask(address.value).then((res: any) => {
    if (res.code === 200) {
      state.dailyTips = res.data.notClaimDailyTask
      state.questTips = res.data.notClaimQuest
    }
  })
}
const claimQuest = (questId: number) => {
  loadingBar.start()
  if (!state.taskStatus) {
    const formData = {
      ethAddress: address.value,
      questId: questId
    }
    if (questId !== 1) {
      User.claimQuest(formData).then((res: any) => {
        getRedPoint()
        User.getUserQuest(address.value).then((res: any) => {
          if (res.code === 200) {
            state.userQuest = res.data
            loadingBar.finish()
          }
        })
      })
    } else {
      showGlobalMessage('Claiming...', 'Claiming')
      User.claimLife(address.value).then((res: any) => {
        showGlobalMessage('Claiming...', 'close')
        showGlobalMessage('Claiming Successful')
        getRedPoint()
        User.getUserQuest(address.value).then((res: any) => {
          if (res.code === 200) {
            state.userQuest = res.data
            loadingBar.finish()
          }
        })
      })
    }
  } else {
    const formData = {
      ethAddress: address.value,
      dailyTaskId: questId
    }
    User.claimDaily(formData).then((res: any) => {
      getRedPoint()
      User.getUserQuest(address.value).then((res: any) => {
        if (res.code === 200) {
          state.userQuest = res.data
        }
      })
      User.getDailyTask(address.value).then((res: any) => {
        if (res.code === 200) {
          state.dailyTask = res.data
          loadingBar.finish()
        }
      })
    })
  }
}
const dataContainerTeam: Ref<HTMLElement | null> = ref(null);


watch(
    () => state.taskStatus,
    () => {
      if (!state.taskStatus) {
        state.pageNums = 1
        User.getInviteMember(state.pageNums,state.pageSizes,address.value).then((res: any) => {
          state.inviteMember = res.data.list
          state.inviteTotal = res.data.total
        })
        setTimeout(() => {
          if (dataContainerTeam.value) {
            dataContainerTeam.value.addEventListener('scroll', handlePageTeam);
          }
        }, 200)
      }
    }
)
const teamPageLoading  = ref(false)
const handlePageTeam = () => {
  if (!dataContainerTeam.value || teamPageLoading.value || !canContinuePaging(state.pageNums, state.pageSizes, state.inviteTotal)) return;

  const { scrollTop, scrollHeight, clientHeight } = dataContainerTeam.value;

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 500;

  if (isAtBottom) {
    teamPageLoading.value = true
    state.pageNums ++
    User.getInviteMember(state.pageNums,state.pageSizes,address.value).then((res: any) => {
      state.inviteTotal = res.data.total
      res.data.list.forEach((item: any) => {
        state.inviteMember.push(item)
      })
      teamPageLoading.value = false
    })
  }
};
const goToPage = (name: string) => {
  state.taskVisible = false
  if (name === 'Home') {
    state.rightVisible = true
  }
  router.push({name: name})
}
watch(
    () => state.taskVisible,
    () => {
      if (state.taskVisible) {
        clickMusic()
        User.getUserQuest(address.value).then((res: any) => {
          if (res.code === 200) {
            state.userQuest = res.data
          }
        })
        User.getInviteEnergy(address.value).then((res: any) => {
          state.energy = res.data
        })
        User.getInviteMember(state.pageNums,state.pageSizes,address.value).then((res: any) => {
          state.inviteTotal = res.data.total
          state.inviteMember = res.data.list
          if (!state.taskStatus) {
            setTimeout(() => {
              if (dataContainerTeam.value) {
                dataContainerTeam.value.addEventListener('scroll', handlePageTeam);
              }
            }, 200)
          }
        })
        User.getDailyTask(address.value).then((res: any) => {
          if (res.code === 200) {
            state.dailyTask = res.data
          }
        })
      } else {
        state.pageNums= 1
        closeMusic()
      }
    }
)
const twitterList = [
    "Game theory meets lifeform combos & algorithms. Dive into @cellulalifegame to mine energy creatively.",
    "Exploring Cellula's universe, where strategy meets creativity. Its vPOW asset system redefines gaming. Loving @cellulalifegame!",
    "Hooked on Cellula, Cellula is the best and fully on-chain AI game that combines digital lifeforms and vPOW mechanisms. @cellulalifegame represents the future of gaming.",
    "Cellula: Where character creation meets crypto mining @cellulalifegame offers thrilling strategic play.",
    "Cellula transforms gaming with innovative mechanics & endless characters, supported by Binance Labs & OKX Ventures. Discover @cellulalifegame.",
    "@cellulalifegame, backed by Binance Labs & OKX Ventures, introduces new horizons with creative gameplay. Engage in a new era of gaming.",
    "Cellula, supported by Binance Labs & OKX Ventures, revolutionizes gaming with unique mechanics. @cellulalifegame's alpha shows blockchain's evolution.",
    "Cellula redefines web3 gaming with character creation & mining, thanks to Binance Labs & OKX Ventures. Join @cellulalifegame's innovative journey.",
    "Cellula combines nostalgia & blockchain innovation, backed by Binance Labs & OKX Ventures. @cellulalifegame's character and mining mechanics lead gaming.",
    "Cellula's alpha reveals the potential of gameplay & blockchain tech fusion, backed by Binance Labs & OKX Ventures. @cellulalifegame hints at a bright future."
]
const openTwitter = (() => {
  if (state.userQuest.lifeCount) {
    let shareText = twitterList[getRandomInteger(0,9)]
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}%0A${location.origin+'?code='+state.inviteCode}`;
    window.open(twitterShareUrl, '_blank');
    User.shareTwitter(address.value).then(() => {
      getRedPoint()
      User.getDailyTask(address.value).then((res: any) => {
        if (res.code === 200) {
          state.dailyTask = res.data
        }
      })
      User.getUserQuest(address.value).then((res: any) => {
        if (res.code === 200) {
          state.userQuest = res.data
        }
      })
    })
  } else {
    goToPage('Shop')
  }
})
const openTwitterRename = (() => {
  window.open('https://twitter.com/cellulalifegame', '_blank');
  User.renameAction(address.value).then(() => {
    getRedPoint()
    User.getDailyTask(address.value).then((res: any) => {
      if (res.code === 200) {
        state.dailyTask = res.data
      }
    })
    User.getUserQuest(address.value).then((res: any) => {
      if (res.code === 200) {
        state.userQuest = res.data
      }
    })
  })
})

const activeCount = (leftPercentage: any) => {
  const percentage = parseFloat(leftPercentage) / 100;
  const total = 7;
  const active: any = Math.ceil(total * percentage);
  return active;
}
watch(
    () => state.workAllVisible,
    () => {
      if (state.workAllVisible) {
        isGuide.value = true
      } else {
        isGuide.value = false
      }
    }
)
watch(
    () => state.workCellula.map(item => item.popoverShow),
    (newValues, oldValues) => {
      const isAnyPopoverShow = newValues.some(value => value === true);
      if (isAnyPopoverShow) {
        isGuide.value = true
      } else {
        isGuide.value = false
      }
    },
    { deep: true }
);
watch(
    () => state.noWorkCellula.map(item => item.popoverShow),
    (newValues, oldValues) => {
      const isAnyPopoverShow = newValues.some(value => value === true);
      if (isAnyPopoverShow) {
        isGuide.value = true
      } else {
        isGuide.value = false
      }
    },
    { deep: true }
);
const filterVisible = ref(false)
watch(
    () => filterVisible.value,
    () => {
      if (filterVisible.value) {
        isGuide.value = true
      } else {
        isGuide.value = false
      }
    }
)
const closeFilterVisible = () => {
  filterVisible.value = false
  filterFormData.value = null
  sessionStorage.removeItem('sortType')
  sessionStorage.removeItem('maxHashRate')
  sessionStorage.removeItem('minHashRate')
  getWorkCellula()
}
const filterFormData = ref(null as any)
watch(
    () => filterFormData.value,
    () => {
      chooseList.value = []
    }
)
const confirmFilter = (formData: any) => {
  state.workPageNum = 1
  filterFormData.value = formData
  let isWork = state.isWork
  if (isWork) {
    loading.value = true
  } else {
    noWorkingLoading.value = false
  }
  sessionStorage.setItem('sortType', formData.sortType)
  sessionStorage.setItem('maxHashRate', formData.maxHashRate)
  sessionStorage.setItem('minHashRate', formData.minHashRate)
  User.getWorkCellula(address.value, isWork ? 1 : 0, state.workPageNum, state.workPageSize, formData.sortType, formData.maxHashRate, formData.minHashRate).then((res: any) => {
    if (res.code === 200) {
      if (isWork) {
        state.workTotal = res.data.total
        state.workCellula = res.data.list.map((item: any) => {
          return {
            ...item,
            popoverShow: false
          }
        })
        filterVisible.value = false
        loading.value = false
      } else {
        state.noWorkTotal = res.data.total
        state.noWorkCellula = res.data.list.map((item: any) => {
          return {
            ...item,
            popoverShow: false
          }
        })
        filterVisible.value = false
        noWorkingLoading.value = false
      }
    }
  })
}
const openUrl = ((url: string) => {
  window.open(url)
})
const dialogTitle = ref('Team')
const openComingSoon = (title: string) => {
  dialogTitle.value = title
  state.exploreVisible = true
}
const chooseList = ref([] as string[])
const chooseCharge = (id: string) => {
  const index = chooseList.value.indexOf(id);
  if (index === -1) {
    chooseList.value.push(id);
  } else {
    chooseList.value.splice(index, 1);
  }
}
const isChoose = (id: string) => {
  const index = chooseList.value.indexOf(id);
  return index !== -1
}
const chooseIsAll = () => {
  state.isAll = !state.isAll
  if (state.isAll) {
    // User.getRestTokenIds(address.value).then((result: any) => {
    //   console.log(result);
    //   chooseList.value = result.data
    // })
    chooseList.value = state.noWorkCellula.map((item: any) => {
      return item.tokenId
    })
  } else {
    chooseList.value = []
  }
}
watch(
    () => chooseList.value.length,
    () => {
      state.isAll = chooseList.value.length === state.noWorkCellula.length
    }
)
const tokenVisible = ref(false)
const boxOpen = ref(false)
const closeTokenVisible = () => {
  tokenVisible.value = false
  getTokenData()
}
const openBox = (() => {
  boxOpen.value = true
  setTimeout(() => {
    tokenVisible.value = true
    boxOpen.value = false
  }, 1000)
})
const openDiscord = () => {
  state.cashbackVisible = false
  state.discordVisible = true
}
const openDiscordUrl = () => {
  state.discordVisible = false
  window.open('https://discord.com/invite/2PMU2NvDcm')
}
const goToDetail = (tokenId: string) => {
  router.push(`/bitlife/${tokenId}`)
}
const openCharge = (index: number) => {
  state.noWorkCellula[index].popoverShow = true
}
watch(
    () => isGuide.value,
    () => {
      if (isGuide.value) {
        document.documentElement.style.overflow = 'hidden';
      } else {
        document.documentElement.style.overflow = '';
      }
    }
)
const {workTotal, inviteVisible, myAssets, tokenCount, chargePriceList, questTips, isAll, inviteTotal, dailyTips, animateAvatar, exploreVisible, discordVisible, cashbackVisible, taskVisible, taskStatus, userQuest, dailyTask, inviteCode, inviteMember, rewardsVisible, isWork, rightVisible, mintInfo, pointLog, workCellula, noWorkCellula, noWorkTotal, workAllVisible, safepalVisible} = toRefs(state)
</script>

<template>
  <div class="home-container no-rem" id="home-container">
    <div :class="isGuide ? 'gray' : ''" class="map-container" ref="mapContainer">
      <div
          class="brick-container"
          @mousedown="dragStart"
          @mouseup="dragEnd"
          @mousemove="dragMove"
          @touchstart.passive="dragStart"
          @touchmove.passive="dragMove"
          @touchend="dragEnd"
          @click="rightVisible = false"
          ref="brickContainer"
          :class="isGuide ? 'guide-mask' : ''"
      >
        <div class="avatar-base">
        </div>
        <div class="avatar-base2">
        </div>
        <div class="avatar-base3">
        </div>
        <div class="avatar-base4">
        </div>
        <div class="avatar-base5">
        </div>
        <div class="build-container">
          <div class="build-box">
            <div :class="[guideStep === 1 ? 'priority' : '', mintInfo.lifeCount !== 0 && mintInfo?.roleImages?.length === 0 ? 'build-breath' : '']" class="build" @click.stop="rightVisible = !rightVisible"></div>
            <div :class="guideStep === 1 ? 'priority' : ''" class="build-light"></div>
            <div :class="guideStep === 1 ? 'priority' : ''" class="build-gif"></div>
            <div :class="guideStep === 1 ? 'priority' : ''" class="point-gif"></div>
            <div :class="guideStep === 1 || guideStep === 3 ? 'priority' : ''" @click.stop="claimRewards" class="point-container">
              <div class="time-container">
                <div class="time"></div>
                {{ mintInfo.blocks }}
              </div>
              <div class="value" :title="mintInfo.waitClaimEnergy > 1000 ? mintInfo.waitClaimEnergy.toString() : ''">
<!--                <span>{{ // formatNumberForEnglish(mintInfo.waitClaimEnergy) }}</span>-->
                <span>{{ formatNumberForEnglish(mintInfo.waitClaimEnergy) }}</span>
                <div v-if="claimPointLoading" class="loading-point"></div>
              </div>
            </div>
            <div v-if="!boxOpen && myAssets.receiveStatus === 0 && myAssets.tokenCount && !tokenVisible && myAssets.promotionStatus" class="gift-box" @click="openBox">
            </div>
            <div v-if="boxOpen && !tokenVisible" class="gift-box-open"></div>
          </div>
        </div>
      </div>
      <div
          class="avatar-container"
          ref="avatarContainer"
          :class="isGuide ? 'guide-mask-avatar' : ''"
      >
        <div class="avatar-img" v-if="animateAvatar?.length" :key="index" v-for="(item, index) in animateAvatar">
          <div class="avatar" :style="{ backgroundImage: `url('${item}')` }">
            <div class="point-box">
              <div class="point"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="rewards" :class="isGuide && guideStep !== 3 ? 'gray' : ''">
      <div class="reward-position">
        <div class="value" :title="points > 1000 ? points.toString() : ''">
          {{ formatNumberForEnglish(points) }}
        </div>
        <div v-if="rewardsLoading" class="loading-reward"></div>
      </div>
    </div>
    <transition
        enter-active-class="animate__animated animate__slideInRight"
        leave-active-class="animate__animated animate__slideOutRight"
        mode="out-in"
    >
      <div v-if="!rightVisible" @click="rightVisible = true" class="right-icon"></div>
    </transition>
    <div :class="isGuide && guideStep !== 3 ? 'gray' : ''" class="book-icon" @click.stop="rewardsVisible = true"></div>
    <div class="navigation-container" :class="isGuide ? 'gray' : ''">
      <div class="navigation-item" @click="goToPage('Hub')">
        <div class="navigation-icon icon-1"></div>
        BitLife Hub
      </div>
      <div class="navigation-item" @click="taskVisible = true">
        <div class="navigation-icon icon-2" :class="questTips || dailyTips ? 'red-point' : ''"></div>
        Quests
      </div>
      <div class="navigation-item" @click="goToPage('TopGamers')">
        <div class="navigation-icon icon-3"></div>
        Leaderboard
      </div>
      <div class="navigation-item" @click="openComingSoon('Team')">
        <div class="navigation-icon icon-4"></div>
        Team
      </div>
    </div>
    <div @click="openComingSoon('Explore')" :class="isGuide ? 'gray' : ''" class="button-game">
    </div>
    <div :class="isGuide && guideStep !== 3 ? 'gray' : ''" class="world-data">
      <div class="header">
        <div class="left">
          Network&nbsp;Hashrate<br/>
          <span :title="mintInfo.worldAllQty > 1000 ? mintInfo.worldAllQty.toString() : ''">{{ formatNumberForEnglish(mintInfo.worldAllQty) }}</span>
        </div>
        <div class="right">
          My&nbsp;Hashrate<br/>
          <span :title="mintInfo.myQty > 1000 ? mintInfo.myQty.toString() : ''">
            {{ formatNumberForEnglish(mintInfo.myQty) }}
<!--            {{mintInfo.coefficient ? `x${mintInfo.coefficient}` : ''}}-->
          </span>
        </div>
      </div>
      <div class="bottom">My Share: {{mintInfo.proportion}}</div>
    </div>
    <transition
        enter-active-class="animate__animated animate__bounceInRight"
        leave-active-class="animate__animated animate__bounceOutRight"
        mode="out-in"
    >
      <div v-if="rightVisible" :class="isGuide ? 'gray' : ''" class="right-container">
        <div class="header">
          <div class="header-left">
            <div class="left" @click="isWork = false" :class="!isWork ? 'left-active' : ''">
              Resting
            </div>
            <div class="right" @click="isWork = true" :class="isWork ? 'right-active' : ''">
              Working
            </div>
          </div>
          <div class="convert-img" @click="goToPage('Convert')"></div>
        </div>
        <div class="filter-container">
          <div class="total">
            Total At {{!isWork ? 'Resting' : 'Working'}}：<span>{{ isWork ? workTotal : noWorkTotal }}</span>
          </div>
          <div class="filter-right">
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
        </div>
        <div class="cellula-container" :class="[isWork ? 'cellula-container-work' : '', isGuide ? 'no-scroll' : '']" id="bitlife-container" ref="dataContainer2">
          <template v-if="isWork">
            <template v-if="workCellula.length">
              <div class="cellula-item"
                   v-for="(item, index) in workCellula"
                   :key="index"
              >
                <div class="cellula-template" @click.stop="goToDetail(item.tokenId)" :class="isWork ? 'cellula-template-work' : ''">
                  <div class="check-container" v-if="!isWork">
                    <div @click.stop="chooseCharge(item.tokenId)" class="check-circle" :class="isChoose(item.tokenId) ? 'check-circle-active' : ''">
                    </div>
                  </div>
                  <div class="avatar-img">
                    <div class="avatar-image" :style="{backgroundImage: `url('${item.roleImage}')`}"></div>
                    <span>{{ item.tokenId }}</span>
                  </div>
                  <div class="gold">
                    <div class="label">Hashrate</div>
                    <div class="value">{{ item.livingQty }}</div>
                  </div>
                  <n-popover
                      v-model:show="item.popoverShow"
                      trigger="click"
                      placement="bottom"
                      :show-arrow="false"
                      :disabled="isWork"
                      v-if="!isWork"
                  >
                    <template #trigger>
                      <div class="eat" @click.stop="openCharge(index)" v-if="!isWork"></div>
                    </template>
                    <div class="cell-detail">
                      <div @click="closePopover(index)" class="close-icon"></div>
                      <!--                <div v-if="isWork" class="date">{{formatTimestampToDDHHMM(item.expireTime)}}</div>-->
                      <div class="description">Please avoid recharging repeatedly, as each <br/> recharge will reset BitLife's work time.</div>
                      <div class="date-option">
                        <div class="date-item">
                          <img class="icon" src="img/home/1.png" alt="">
                          <div class="price">{{ chargePriceList[0] }} BNB / 1D</div>
                          <div class="eat" @click="workingFun(index, 1)">Charge</div>
                        </div>
                        <div class="date-item">
                          <img class="icon" src="img/home/2.png" alt="">
                          <div class="price">{{ chargePriceList[1] }} BNB / 3D</div>
                          <div class="eat" @click="workingFun(index, 3)">Charge</div>
                        </div>
                        <div class="date-item">
                          <img class="icon" src="img/home/3.png" alt="">
                          <div class="price">{{ chargePriceList[2] }} BNB / 7D</div>
                          <div class="eat" @click="workingFun(index, 7)">Charge</div>
                        </div>
                      </div>
                    </div>
                  </n-popover>
                  <n-popover v-if="isWork && item?.leftPercentage" trigger="hover" placement="bottom" :show-arrow="false">
                    <template #trigger>
                      <div class="progress-container">
                        <div class="rate-active" v-for="item1 in activeCount(item?.leftPercentage) as any" :key="'1'+item1"></div>
                        <div class="rate" v-for="item2 in (7-activeCount(item?.leftPercentage)) as any" :key="'2'+item2"></div>
                      </div>
                    </template>
                    <div class="date-end-container">
                      {{formatTimestampToDDHHMM(item.expireTime)}}
                    </div>
                  </n-popover>
                </div>
              </div>
            </template>
            <n-empty v-else-if="!loading" size="huge">
              <template #icon>
                <img class="empty-icon" src="img/layout/empty.png" alt="">
              </template>
            </n-empty>
            <Loading v-if="loading"></Loading>
          </template>
          <template v-else>
            <template v-if="noWorkCellula.length">
              <div class="cellula-item"
                   v-for="(item, index) in noWorkCellula"
                   :key="index"
              >
                <div class="cellula-template" @click.stop="goToDetail(item.tokenId)" :class="isWork ? 'cellula-template-work' : ''">
                  <div class="check-container" v-if="!isWork">
                    <div @click.stop="chooseCharge(item.tokenId)" class="check-circle" :class="isChoose(item.tokenId) ? 'check-circle-active' : ''">
                    </div>
                  </div>
                  <div class="avatar-img">
                    <div class="avatar-image" :style="{backgroundImage: `url('${item.roleImage}')`}"></div>
                    <span>{{ item.tokenId }}</span>
                  </div>
                  <div class="gold">
                    <div class="label">Hashrate</div>
                    <div class="value">{{ item.livingQty }}</div>
                  </div>
                  <n-popover
                      v-model:show="item.popoverShow"
                      trigger="click"
                      placement="bottom"
                      :show-arrow="false"
                      :disabled="isWork"
                      v-if="!isWork"
                  >
                    <template #trigger>
                      <div class="eat" @click.stop="openCharge(index)" v-if="!isWork"></div>
                    </template>
                    <div class="cell-detail">
                      <div @click="closePopover(index)" class="close-icon"></div>
                      <!--                <div v-if="isWork" class="date">{{formatTimestampToDDHHMM(item.expireTime)}}</div>-->
                      <div class="description">Please avoid recharging repeatedly, as each <br/> recharge will reset BitLife's work time.</div>
                      <div class="date-option">
                        <div class="date-item">
                          <img class="icon" src="img/home/1.png" alt="">
                          <div class="price">{{ chargePriceList[0] }} BNB / 1D</div>
                          <div class="eat" @click="workingFun(index, 1)">Charge</div>
                        </div>
                        <div class="date-item">
                          <img class="icon" src="img/home/2.png" alt="">
                          <div class="price">{{ chargePriceList[1] }} BNB / 3D</div>
                          <div class="eat" @click="workingFun(index, 3)">Charge</div>
                        </div>
                        <div class="date-item">
                          <img class="icon" src="img/home/3.png" alt="">
                          <div class="price">{{ chargePriceList[2] }} BNB / 7D</div>
                          <div class="eat" @click="workingFun(index, 7)">Charge</div>
                        </div>
                      </div>
                    </div>
                  </n-popover>
                  <n-popover v-if="isWork && item?.leftPercentage" trigger="hover" placement="bottom" :show-arrow="false">
                    <template #trigger>
                      <div class="progress-container">
                        <div class="rate-active" v-for="item1 in activeCount(item?.leftPercentage) as any" :key="'1'+item1"></div>
                        <div class="rate" v-for="item2 in (7-activeCount(item?.leftPercentage)) as any" :key="'2'+item2"></div>
                      </div>
                    </template>
                    <div class="date-end-container">
                      {{formatTimestampToDDHHMM(item.expireTime)}}
                    </div>
                  </n-popover>
                </div>
              </div>
            </template>
            <n-empty v-else-if="!noWorkingLoading" size="huge">
              <template #icon>
                <img class="empty-icon" src="img/layout/empty.png" alt="">
              </template>
            </n-empty>
            <Loading v-if="noWorkingLoading"></Loading>
          </template>
        </div>
        <div class="cellula-footer" v-if="!isWork && noWorkCellula.length">
          <div class="check-container">
            <div class="check-circle" @click="chooseIsAll" :class="isAll ? 'check-circle-active' : ''">
            </div>
            All
          </div>
          <n-popover v-model:show="workAllVisible" trigger="click" placement="top" :show-arrow="false">
            <template #trigger>
              <div class="all-button" :class="!chooseList.length ? 'all-button-none' : ''">Charge</div>
            </template>
            <div class="cell-detail">
              <div @click="workAllVisible = false" class="close-icon"></div>
              <div class="description">Please avoid recharging repeatedly, as each <br/> recharge will reset BitLife's work time.</div>
              <div class="date-option">
                <div class="date-item">
                  <img class="icon" src="img/home/1.png" alt="">
                  <div class="price">{{ chargePriceList[0] }} BNB / 1D</div>
                  <div class="eat" @click="workingFunAll(1)">Charge</div>
                </div>
                <div class="date-item">
                  <img class="icon" src="img/home/2.png" alt="">
                  <div class="price">{{ chargePriceList[1] }} BNB / 3D</div>
                  <div class="eat" @click="workingFunAll(3)">Charge</div>
                </div>
                <div class="date-item">
                  <img class="icon" src="img/home/3.png" alt="">
                  <div class="price">{{ chargePriceList[2] }} BNB / 7D</div>
                  <div class="eat" @click="workingFunAll(7)">Charge</div>
                </div>
              </div>
            </div>
          </n-popover>
        </div>
      </div>
    </transition>
    <div class="token-container" :class="isGuide ? 'gray' : ''">
      <div class="label">
        $CELL Token
        <n-popover class="tips-text-container tips-text-container-bottom" :show-arrow="false" trigger="hover">
          <template #trigger>
            <img class="tips tips-small" src="img/layout/tips-icon.png" alt="">
          </template>
          <div class="tips-text">Extra $CELL tokens users earned from the airdrop events.</div>
        </n-popover>
      </div>
      <div class="value" :title="tokenCount.toString()">{{ formatNumberForEnglish(truncateNumber(tokenCount,6)) }}</div>
    </div>
    <div class="activity-container" v-show="false">
          <div class="treasure-container" @click="goToPage('Cashback')" :class="isGuide ? 'gray' : ''">
<!--      <div class="treasure-container" @click="goToPage('Cashback')" :class="isGuide ? 'gray' : ''">-->
        <img class="treasure" src="img/home/treasure.gif" alt="">
        <span class="label">CashBack</span>
      </div>
<!--      <div class="exchange" @click="openUrl('https://app.galxe.com/quest/cellula/GCh7FtTmKe')" :class="isGuide ? 'gray' : ''"></div>-->
    </div>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="rewardsVisible">
      <div class="rewards-log">
        <div @click="rewardsVisible = false" class="close-icon"></div>
        <div class="model-main ">
          <div class="title">Collecting History</div>
          <div class="table-title">
            <div class="table-item">
              Time
            </div>
            <div class="table-item">
              Energy
            </div>
            <div class="table-item">
              Transaction
            </div>
          </div>
          <div class="table-box" ref="dataContainer">
            <div v-if="pointLog.length" class="table" v-for="(item, index) in pointLog" :key="index">
              <div class="table-item">
                {{ item.claimTime }}
              </div>
              <div class="table-item active2">
                +{{ formatNumberWithCommas(item.claimEnergy) }}
              </div>
              <div @click="goToHashDetail(item.txHash)" class="table-item active">
                View
              </div>
            </div>
            <n-empty v-else size="huge">
              <template #icon>
                <img class="empty-icon" src="img/layout/empty.png" alt="">
              </template>
            </n-empty>
          </div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="exploreVisible">
      <div class="rewards-log">
        <div @click="exploreVisible = false" class="close-icon"></div>
        <div class="model-main">
          <div class="title">{{ dialogTitle }}</div>
          <div class="explore-title" v-if="dialogTitle === 'Cashback'">
            The Great Refund Revival: Claiming Your Charging Fees Coming Soon !
          </div>
          <div v-else class="explore-title">
            Coming Soon !
          </div>
          <div class="explore-footer">
            <ModalButton @click="exploreVisible = false" type="back" button-text="Back"></ModalButton>
          </div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="cashbackVisible">
      <div class="rewards-log">
        <div @click="cashbackVisible = false" class="close-icon"></div>
        <div class="model-main">
          <div class="title">CashBack</div>
          <div class="explore-title cashback-title">
            The charging fees will be available to claim starting at 0:00 (UTC-4) on May 9th. Please verify the amount beforehand.  <br/>
            <div class="nbsp"></div>
            My cashback: <span>{{refundAmount}} (BNB)</span>
          </div>
          <div class="explore-footer cashback-footer">
            <ModalButton @click="openDiscord" type="small-button" button-text="Question"></ModalButton>
            <ModalButton @click="cashbackVisible = false" type="small-button" button-text="Confirm Amount"></ModalButton>
          </div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="discordVisible">
      <div class="rewards-log">
        <div @click="discordVisible = false" class="close-icon"></div>
        <div class="model-main">
          <div class="title">Discord</div>
          <div class="explore-title">
            Please proceed to the official Cellula Discord support tickets. We will assist you as soon as possible.
          </div>
          <div class="explore-footer">
            <ModalButton @click="openDiscordUrl" type="back" button-text="Go"></ModalButton>
          </div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="taskVisible">
      <div class="task-log">
        <div @click="taskVisible = false" class="close-icon"></div>
        <div class="model-main">
          <div class="header-container">
            <div class="button-container">
              <div class="button" :class="[!taskStatus ? 'button-active' : '', questTips ? 'red-point' : '']" @click="taskStatus = false">Quests</div>
              <div class="button" :class="[taskStatus ? 'button-active' : '', dailyTips ? 'red-point' : '']" @click="taskStatus = true">Daily Rewards</div>
              <div class="button life-point" @click="goToPage('LifePoints')">Life Points Leaderboard</div>
            </div>
          </div>
          <div class="description">
            Quest will be updated now and then, be sure to come check it everyday!
          </div>
          <div class="point-container">
            <div class="reward"></div>
            Life Points:
            <span>{{ formatNumberWithCommas(userQuest.integral) }}</span>
          </div>
          <div class="quest-container" v-if="!taskStatus && Object.keys(userQuest).length">
            <div class="quest-1 quest-2 quest-3 team-quest">
              <div class="header-title">
                <div class="label">Invite Friends</div>
              </div>
              <div class="description">
                Invite your friends to mint BitLife, and for each invited friend who <br/>
                successfully mints a BitLife, you will be rewarded with 10 Life points.
                <div @click="copyText(inviteCode)" class="button-go">
                  <img class="copy-img" src="img/home/copy.png" alt="">
                  Copy
                </div>
              </div>
              <div class="title">
                <div class="title-1">
                  You Have Invited <span class="bold">{{ inviteTotal }}</span> Friends.
                </div>
                <div class="title-1 title-2">
                  <span class="bold">{{ state.energy }}</span>
                  <div class="point"></div>
                  Issued
                  <div @click="closeInviteVisible" class="invite-btn"></div>
                </div>
              </div>
              <div class="table-container">
                <div class="table-title">
                  <div class="item">Address</div>
                  <div class="item">Status</div>
                </div>
                <div class="table-data" ref="dataContainerTeam">
                  <div class="table-item" :key="index" v-for="(item, index) in inviteMember">
                    <div class="data-item">{{ getStr(item.ethAddress,4,4) }}</div>
                    <div class="data-item" v-if="item.mintStatus">
                      <div class="reward"></div>
                      <span>+10</span>
                    </div>
                    <div class="data-item" v-else>Unminted BitLife</div>
                  </div>
                  <div v-if="inviteMember.length < 5" v-for="item in (5-inviteMember.length)" class="table-item">
                    <div class="data-item"></div>
                    <div class="data-item"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="quest-1 quest-2">
              <div class="header-title">
                <div class="label">Mint BitLife</div>
              </div>
              <div class="description">
                You can mint BitLife on the popular BitLife page or on the Crafting table.
                <div class="button-go" @click="goToPage('Shop')">Go</div>
              </div>
              <div class="title">
                You Minted <span class="bold">{{ formatNumberWithCommas(userQuest.lifeCount) }}</span> BitLife.
              </div>
              <div class="block-2">
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[0].questName) }}</span>
                    <span class="name">BitLife</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[0].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[0].questId)"
                       :class="userQuest.userQuestVos[0].doStatus ? (userQuest.userQuestVos[0].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[0].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[1].questName) }}</span>
                    <span class="name">BitLife</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[1].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[1].questId)"
                       :class="userQuest.userQuestVos[1].doStatus ? (userQuest.userQuestVos[1].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[1].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[2].questName) }}</span>
                    <span class="name">BitLife</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[2].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[2].questId)"
                       :class="userQuest.userQuestVos[2].doStatus ? (userQuest.userQuestVos[2].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[2].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[3].questName) }}+</span>
                    <span class="name">BitLife</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[3].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[3].questId)"
                       :class="userQuest.userQuestVos[3].doStatus ? (userQuest.userQuestVos[3].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[3].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
              </div>
            </div>
<!--            <div class="quest-1 quest-2 quest-3" v-show="false">-->
<!--              <div class="header-title">-->
<!--                <div class="label">Team Rank Up</div>-->
<!--              </div>-->
<!--              <div class="description">-->
<!--                Helping your team level up earns extra rewards. You can <br/> achieve this by inviting new users or increasing your Hashrate.-->
<!--                <div class="button-go" @click="goToPage('Team')">Go</div>-->
<!--              </div>-->
<!--              <div class="title">-->
<!--                Team Level <span class="bold">{{ userQuest.teamLevel }}</span>-->
<!--              </div>-->
<!--              <div class="block-2">-->
<!--                <div class="block-item">-->
<!--                  <div class="block-label">-->
<!--                    <span class="count">{{ getNumber(userQuest.userQuestVos[4].questName) }}</span>-->
<!--                    <img class="team-icon" src="img/layout/team1.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="content">-->
<!--                    <span class="count">{{ userQuest.userQuestVos[4].reward }}</span>-->
<!--                    <img class="reward" src="img/layout/task-reward.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="button" @click="claimQuest(userQuest.userQuestVos[4].questId)"-->
<!--                       :class="userQuest.userQuestVos[4].doStatus ? (userQuest.userQuestVos[4].claimStatus ? 'button2' : '') : 'button3'">-->
<!--                    {{ userQuest.userQuestVos[4].claimStatus ? 'Claimed' : 'Claim' }}-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="block-item">-->
<!--                  <div class="block-label">-->
<!--                    <span class="count">{{ getNumber(userQuest.userQuestVos[5].questName) }}</span>-->
<!--                    <img class="team-icon" src="img/layout/team2.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="content">-->
<!--                    <span class="count">{{ userQuest.userQuestVos[5].reward }}</span>-->
<!--                    <img class="reward" src="img/layout/task-reward.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="button" @click="claimQuest(userQuest.userQuestVos[5].questId)"-->
<!--                       :class="userQuest.userQuestVos[5].doStatus ? (userQuest.userQuestVos[5].claimStatus ? 'button2' : '') : 'button3'">-->
<!--                    {{ userQuest.userQuestVos[5].claimStatus ? 'Claimed' : 'Claim' }}-->
<!--                  </div>-->
<!--                </div>-->
<!--                <div class="block-item">-->
<!--                  <div class="block-label">-->
<!--                    <span class="count">{{ getNumber(userQuest.userQuestVos[6].questName) }}</span>-->
<!--                    <img class="team-icon" src="img/layout/team3.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="content">-->
<!--                    <span class="count">{{ userQuest.userQuestVos[6].reward }}</span>-->
<!--                    <img class="reward" src="img/layout/task-reward.png" alt="">-->
<!--                  </div>-->
<!--                  <div class="button" @click="claimQuest(userQuest.userQuestVos[6].questId)"-->
<!--                       :class="userQuest.userQuestVos[6].doStatus ? (userQuest.userQuestVos[6].claimStatus ? 'button2' : '') : 'button3'">-->
<!--                    {{ userQuest.userQuestVos[6].claimStatus ? 'Claimed' : 'Claim' }}-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
            <div class="quest-1 quest-2 quest-3">
              <div class="header-title">
                <div class="label">Enhance Your Hashrate</div>
              </div>
              <div class="description">
                Mint or charge more BitLife will increase your Hashrate.
                <div class="button-go" @click="goToPage('Home')">Go</div>
              </div>
              <div class="title">
                Your Hashrate <span class="bold">{{ formatNumberWithCommas(userQuest.nowLivingQty) }}</span>
              </div>
              <div class="block-2">
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[4].questName) }}</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[4].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[4].questId)"
                       :class="userQuest.userQuestVos[4].doStatus ? (userQuest.userQuestVos[4].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[4].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[5].questName) }}</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[5].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[5].questId)"
                       :class="userQuest.userQuestVos[5].doStatus ? (userQuest.userQuestVos[5].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[5].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <span class="count">{{ getNumber(userQuest.userQuestVos[6].questName) }}</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ userQuest.userQuestVos[6].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button" @click="claimQuest(userQuest.userQuestVos[6].questId)"
                       :class="userQuest.userQuestVos[6].doStatus ? (userQuest.userQuestVos[6].claimStatus ? 'button2' : '') : 'button3'">
                    {{ userQuest.userQuestVos[6].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
              </div>
            </div>
            <div class="quest-1 quest-social">
              <div class="header-title">
                <div class="label">{{ userQuest.userQuestVos[7].questName }}</div>
              </div>
              <div class="description">
                Add (🧬 Cellula 🧬) to your X account nickname
                <div class="reward-box">
                  {{ userQuest.userQuestVos[7].reward }} <img class="reward" src="img/layout/task-reward.png" alt="">
                </div>
              </div>
              <div class="footer-container">
                <div class="progress-container">
                </div>
                <div v-if="!userQuest.userQuestVos[7].doStatus" @click="openTwitterRename" class="button-go">Go</div>
                <div v-else class="button"
                     @click="claimQuest(userQuest.userQuestVos[7].questId)"
                     :class="userQuest.userQuestVos[7].doStatus ? (userQuest.userQuestVos[7].claimStatus ? 'button2' : '') : 'button3'">
                  {{ userQuest.userQuestVos[7].claimStatus ? 'Claimed' : 'Claim' }}
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="dailyTask.length" class="quest-container daily">
            <div class="quest-1">
              <div class="header-title">
                <div class="label">{{ dailyTask[0].dailyTaskName }}</div>
              </div>
              <div class="description">
                Collect the energy bubble above the spaceship for mining earnings. <br/> Come and get additional Life rewards every day!
                <div class="reward-box">
                  {{ dailyTask[0].reward }} <img class="reward" src="img/layout/task-reward.png" alt="">
                </div>
              </div>
              <div class="footer-container">
                <div class="progress-container">
                </div>
                <div class="button"
                     @click="claimQuest(dailyTask[0].dailyTaskId)"
                     :class="dailyTask[0].doStatus ? (dailyTask[0].claimStatus ? 'button2' : '') : 'button3'">
                  {{ dailyTask[0].claimStatus ? 'Claimed' : 'Claim' }}
                </div>
              </div>
            </div>
            <div class="quest-1">
              <div class="header-title">
                <div class="label">{{ dailyTask[1].dailyTaskName }}</div>
              </div>
              <div class="description">
                Mint a new BitLife today to receive additional Life rewards.
                <div class="reward-box">
                  {{ dailyTask[1].reward }} <img class="reward" src="img/layout/task-reward.png" alt="">
                </div>
              </div>
              <div class="footer-container">
                <div class="progress-container">
                </div>
                <div class="button"
                     @click="claimQuest(dailyTask[1].dailyTaskId)"
                     :class="dailyTask[1].doStatus ? (dailyTask[1].claimStatus ? 'button2' : '') : 'button3'">
                  {{ dailyTask[1].claimStatus ? 'Claimed' : 'Claim' }}
                </div>
              </div>
            </div>
            <div class="quest-1">
              <div class="header-title">
                <div class="label">{{ dailyTask[5].dailyTaskName }}</div>
              </div>
              <div class="description">
                Share your minted BitLife on"X"，You can mint BitLife <br/> on the top BitLife page or on the Crafting table.
                <div class="reward-box">
                  {{ dailyTask[5].reward }} <img class="reward" src="img/layout/task-reward.png" alt="">
                </div>
              </div>
              <div class="footer-container">
                <div class="progress-container">
                </div>
                <div v-if="!dailyTask[5].doStatus" @click="openTwitter" class="button-go">Go</div>
                <div v-else class="button"
                     @click="claimQuest(dailyTask[5].dailyTaskId)"
                     :class="dailyTask[5].doStatus ? (dailyTask[5].claimStatus ? 'button2' : '') : 'button3'">
                  {{ dailyTask[5].claimStatus ? 'Claimed' : 'Claim' }}
                </div>
              </div>
            </div>
            <div class="quest-1 quest-2">
              <div class="header-title">
                <div class="label"> Charge BitLife</div>
              </div>
              <div class="description">
                Charge BitLife to earn additional Life rewards.
                <div class="button-go" @click="goToPage('Home')">Go</div>
              </div>
              <div class="block-2">
                <div class="block-item">
                  <div class="block-label">
                    <img class="food" src="img/layout/food1.png" alt="">
                    <span class="count">x1</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ dailyTask[2].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button"
                       @click="claimQuest(dailyTask[2].dailyTaskId)"
                       :class="dailyTask[2].doStatus ? (dailyTask[2].claimStatus ? 'button2' : '') : 'button3'">
                    {{ dailyTask[2].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <img class="food" src="img/layout/food2.png" alt="">
                    <span class="count">x1</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ dailyTask[3].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button"
                       @click="claimQuest(dailyTask[3].dailyTaskId)"
                       :class="dailyTask[3].doStatus ? (dailyTask[3].claimStatus ? 'button2' : '') : 'button3'">
                    {{ dailyTask[3].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
                <div class="block-item">
                  <div class="block-label">
                    <img class="food" src="img/layout/food3.png" alt="">
                    <span class="count">x1</span>
                  </div>
                  <div class="content">
                    <span class="count">{{ dailyTask[4].reward }}</span>
                    <img class="reward" src="img/layout/task-reward.png" alt="">
                  </div>
                  <div class="button"
                       @click="claimQuest(dailyTask[4].dailyTaskId)"
                       :class="dailyTask[4].doStatus ? (dailyTask[4].claimStatus ? 'button2' : '') : 'button3'">
                    {{ dailyTask[4].claimStatus ? 'Claimed' : 'Claim' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="tokenVisible">
      <TokenVisible :myAssets="myAssets" @closeVisible="closeTokenVisible"></TokenVisible>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="inviteVisible">
      <InviteVisible @closeVisible="closeInviteVisible"></InviteVisible>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="safepalVisible">
      <Safepal @close-safepal="safepalVisible = false" @closeSafepalVisible="closeSafepalVisible"></Safepal>
    </n-modal>
  </div>
</template>

<style scoped lang="scss">
.no-rem * {
  //font-size: 16PX;
}
.home-container {
  width: 100%;
  height: 100%;
  min-height: 1080px;
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: 1920px 1080px;
  position: relative;
  overflow: hidden;
  .fake-data {
    position: absolute!important;
    right: 55px;
    top: 170px;
    width: 588px;
    height: 585px;
    background-size: 100% 100%;
    background-image: url("img/home/data.png");
  }
  .map-container {
    width: 100%;
    height: 1080PX;
    position: relative;
    overflow: hidden;
    .brick-container {
      position: relative;
      width: 4113PX;
      height: 2314PX;
      background-image: url("img/home/new-background.webp");
      background-size: 100% 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      will-change: transform;
      .custom-speed {
        --animate-duration: 0.5s;
      }
      .avatar-base,.avatar-base2,.avatar-base3,.avatar-base4,.avatar-base5 {
        width: 397PX;
        height: 255PX;
        background-size: 100% 100%;
        background-image: url("img/home/avatar-base.png");
        position: absolute;
        left: 2332PX;
        top: 1064PX;
      }
      .avatar-base2 {
        top: 1431PX;
        left: 2018PX;
      }
      .avatar-base3 {
        top: 1411PX;
        left: 1275PX;
      }
      .avatar-base4 {
        top: 834PX;
        left: 1859PX;
      }
      .avatar-base5 {
        top: 471PX;
        left: 1582PX;
      }
      .build-container {
        position: absolute;
        width: 789PX;
        height: 767PX;
        left: 1280PX;
        top: 650PX;
        .build-box {
          width: 100%;
          height: 100%;
          position: relative;
          .point-container {
            width: 155PX;
            height: 169PX;
            background-size: 100% 100%;
            background-image: url("img/home/point.png");
            position: absolute;
            left: 555PX;
            top: 460PX;
            z-index: 4;
            cursor: pointer;
            animation: float 3s ease-in-out infinite, blink 2s linear infinite;
            .value {
              margin-top: -4PX;
              text-align: center;
              span {
                color: #FFF372;
                font-size: 18PX;
                text-shadow: 0PX 0PX 5.998PX #CC6300, 0PX 0PX 3.427PX #CC6300, 0PX 0PX 1.999PX #CC6300, 0PX 0PX 1PX #CC6300, 0PX 0PX 0.286PX #CC6300, 0PX 0PX 0.143PX #CC6300;
                margin-top: 4PX;
              }
            }
            .reward {
              width: 45PX;
              height: 38PX;
              background-size: 100% 100%;
              background-image: url("img/home/reward.png");
              scale: 0.8;
              margin-top: 1PX;
              margin-left: -4PX;
            }
            .time-container {
              display: flex;
              align-items: center;
              position: relative;
              top: -40PX;
              justify-content: center;
              gap: 6PX;
              font-size: 18PX;
              color: #A3FF41;
              text-shadow: 0PX 0PX 4.536PX #4A8F00, 0PX 0PX 2.592PX #4A8F00, 0PX 0PX 1.512PX #4A8F00, 0PX 0PX 0.756PX #4A8F00, 0PX 0PX 0.216PX #4A8F00, 0PX 0PX 0.108PX #4A8F00;
              .time {
                position: relative;
                width: 38PX;
                height: 41PX;
                background-size: 100% 100%;
                background-image: url("img/home/time.png");
                top: -2px;
              }
            }
            .VFX {
              position: relative;
              left: 115px;
              top: 20px;
              color: #FFF372;
            }
          }
          .build {
            position: absolute;
            width: 789PX;
            height: 767PX;
            left: 0;
            top: 0;
            z-index: 3;
            background-size: 100% 100%;
            background-image: url("img/home/build.png");
            cursor: pointer;
          }
          .build-breath {
            animation: buildBreathEffect 3s ease-in-out infinite;
          }
          .build:hover {
            background-image: url("img/home/build-hover.png");
          }
          .build-light {
            position: absolute;
            width: 789PX;
            height: 767PX;
            background-image: url("img/home/build-light.png");
            left: 0PX;
            top: 0PX;
            z-index: 3;
            animation: flickerAnimation 1.5s infinite;
            pointer-events: none;
          }
          .build-gif {
            position: absolute;
            width: 180PX;
            height: 180PX;
            background-image: url("img/home/light.gif");
            background-size: 100% 100%;
            left: 240PX;
            top: 70PX;
            z-index: 3;
            pointer-events: none;
            opacity: 0.7;
          }
          .point-gif {
            position: absolute;
            width: 300PX;
            height: 300PX;
            background-image: url("img/home/point.gif");
            background-size: 100% 100%;
            left: 310PX;
            top: 300PX;
            z-index: 3;
            pointer-events: none;
            transform: rotate(24deg);
            opacity: 0.7;
          }
          .gift-box {
            position: absolute;
            left: 50PX;
            bottom: 20PX;
            width: 243PX;
            height: 464PX;
            background-size: 100% 100%;
            animation: boxAnimation 1s infinite linear;
            z-index: 4;
            cursor: pointer;
          }
          .gift-box-open {
            position: absolute;
            width: 317PX;
            height: 329PX;
            background-size: 100% 100%;
            left: -50PX;
            animation: boxOpenAnimation 1s infinite linear;
            bottom: 30PX;
            z-index: 4;
          }
        }
      }
    }
    .avatar-container {
      width: 4113PX;
      height: 2314PX;
      position: relative;
      top: -2314PX;
      left: 0;
      pointer-events: none;
      z-index: 1;
      .avatar-img {
        width: 256PX;
        height: 256PX;
        position: absolute;
        z-index: 1000;
        .avatar {
          width: 100%;
          height: 100%;
          background-size: 4090PX 256PX;
          background-repeat: no-repeat;
          position: relative;
          background-image: url("img/home/avatar-test.png");
          animation: AvatarWalkHome 0.8s steps(1) infinite;
        }
      }
      .avatar-animate {
        animation: float2 7s infinite;
        .avatar {
          background-position: -2811.875PX -10PX;
          animation: main-img-hide 7s infinite step-end;
          position: relative;
          .point-box {
            animation: float 3s ease-in-out infinite, blink 2s linear infinite;
            position: absolute;
            left: 110PX;
            top: -24PX;
            .point {
              width: 52PX;
              height: 54PX;
              background-size: 100% 100%;
              animation: main-img-hide-point 4s step-end;
              background-image: url("img/home/new-point.png");
            }
          }
        }
        .avatar::before,
        .avatar::after {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: inherit;
        }

        .avatar::after {
          content: "";
          animation: glitch-one 7s infinite step-end;
        }

        .avatar::before {
          content: "";
          animation: glitch-two 7s infinite 1s step-end;
        }
      }
      .avatar-animate-mirror {
        animation: float3 7s infinite;
        .avatar {
          background-position: -2811.875PX -10PX;
          animation: main-img-hide 7s infinite step-end;
          position: relative;
          .point-box {
            animation: float 3s ease-in-out infinite, blink 2s linear infinite;
            position: absolute;
            left: 110PX;
            top: -24PX;
            .point {
              width: 52PX;
              height: 54PX;
              background-size: 100% 100%;
              animation: main-img-hide-point 4s step-end;
              background-image: url("img/home/new-point.png");
            }
          }
        }
        .avatar::before,
        .avatar::after {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: inherit;
        }

        .avatar::after {
          content: "";
          animation: glitch-one 7s infinite step-end;
        }

        .avatar::before {
          content: "";
          animation: glitch-two 7s infinite 1s step-end;
        }
      }
      .avatar-animate-opacity {
        .avatar {
          .point-box {
            opacity: 0;
            display: none;
            .point {
              opacity: 0;
              display: none;
            }
          }
        }
      }
      .avatar-flip {
        transform: scaleX(-1);
      }
    }
  }
  .navigation-container {
    position: fixed;
    left: 30px;
    top: 200px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 15px;
    .navigation-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #FFF;
      text-shadow: 0px 0px 5.594px #0C5CC6, 0px 0px 3.197px #0C5CC6, 0px 0px 1.865px #0C5CC6, 0px 0px 0.932px #0C5CC6, 0px 0px 0.266px #0C5CC6, 0px 0px 0.133px #0C5CC6;
      font-size: 18px;
      cursor: pointer;
      .navigation-icon {
        width: 90px;
        height: 90px;
        background-size: 100% 100%;
      }
      .icon-1 {
        background-image: url("img/home/market.png");
      }
      .icon-2 {
        background-image: url("img/home/task.png");
      }
      .icon-3 {
        background-image: url("img/home/rank.png");
      }
      .icon-4 {
        background-image: url("img/home/team.png");
      }
    }
    .navigation-item:hover {
      color: #FFF1B9;
      text-shadow: 0px 0px 5.594px #943400, 0px 0px 3.197px #943400, 0px 0px 1.865px #943400, 0px 0px 0.932px #943400, 0px 0px 0.266px #943400, 0px 0px 0.133px #943400;
      .icon-1 {
        background-image: url("img/home/market-hover.png");
      }
      .icon-2 {
        background-image: url("img/home/task-hover.png");
      }
      .icon-3 {
        background-image: url("img/home/rank-hover.png");
      }
      .icon-4 {
        background-image: url("img/home/team-hover.png");
      }
    }
  }
  .rank-icon, .invite-icon, .task-icon {
    z-index: 3;
    width: 79px;
    height: 73px;
    position: fixed;
    background-size: 100% 100%;
    top: 290px;
    left: 52px;
    background-image: url("img/home/rank.png");
    cursor: pointer;
  }
  .task-icon {
    //top: 450px;
    top: 370px;
    background-image: url("img/home/task.png");
  }
  .task-icon-active {
    &:after {
      content: '';
      width: 25px;
      height: 27px;
      background-image: url("img/home/tips.png");
      right: -2px;
      top: -10px;
      position: absolute;
    }
  }
  .task-icon:hover {
    background-image: url("img/home/task-hover.png");
  }
  .rank-icon:hover {
    background-image: url("img/home/rank-hover.png");
  }
  .rank-icon-active {
    background-image: url("img/home/rank-hover.png");
  }
  .book-icon {
    z-index: 3;
    width: 90px;
    height: 76px;
    background-image: url("img/home/book.png");
    background-size: 100% 100%;
    position: fixed;
    top: 30px;
    cursor: pointer;
    right: 7px;
  }
  .book-icon:hover {
    background-image: url("img/home/book-hover.png");
  }
  .right-container {
    z-index: 5;
    width: 529px;
    height: 791px;
    background-size: 100% 100%;
    position: fixed;
    top: 112px;
    right: 20px;
    background-image: url("img/home/option-container.png");
    padding: 0 46px 0 44px;
    .header {
      margin-top: 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-left {
        display: flex;
        gap: 12px;
        .left, .right {
          display: flex;
          align-items: center;
          width: 135px;
          height: 59px;
          background-size: 100% 100%;
          justify-content: center;
          background-image: url("img/home/btn.png");
          cursor: pointer;
          font-size: 20px;
          color: #3775AD;
        }
        .left-active,.right-active {
          background-image: url("img/home/btn-active.png");
          color: #FFF372;
          text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
        }
      }
      .convert-img {
        width: 72px;
        height: 59px;
        background-image: url("img/home/convert.png");
        cursor: pointer;
      }
      .convert-img:hover {
        background-image: url("img/home/convert-hover.png");
      }
    }
    .filter-container {
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .total {
        font-size: 18px;
        color: #3775AD;
        span {
          font-size: 18px;
          color: #FFF;
        }
      }
      .filter-right {
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
      }
      .filter-btn {
        width: 114px;
        height: 38px;
        background-size: 100% 100%;
        background-image: url("img/home/filter-btn.png");
        cursor: pointer;
      }
    }
    .cellula-container {
      margin-top: 30px;
      height: 486px;
      overflow-y: auto;
      scrollbar-gutter: stable;
      padding-top: 10px;
      .cellula-item {
        margin-bottom: 16px;
        width: 413px;
        height: 127px;
        background-repeat: no-repeat;
        background-image: url("img/home/cellula-item.png");
        background-size: 100% 100%;
        padding: 8px 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        .check-container {
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
        .cellula-template {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-size: 50% 100%;
          background-repeat: no-repeat;
          padding: 0 12px;
          position: relative;
          .progress-container {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 0px;
            z-index: 1;
            display: flex;
            .rate, .rate-active {
              width: 14px;
              height: 16px;
              background-size: 100% 100%;
              background-image: url("img/home/rate.png");
            }
            .rate-active {
              background-image: url("img/home/rate-active.png");
            }
          }
        }
        .cellula-template-work {
          justify-content: space-around;
          .progress-container {
            left: 280px;
            bottom: -6px;
          }
        }
        .avatar-img {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          .avatar-image {
            width: 64px;
            height: 64px;
            background-size: 1024px 64px;
            background-position: -704px 0;
            background-repeat: no-repeat;
            scale: 1.8;
            transform: translateY(-1px);
            background-image: url("img/home/avatar-test2.png");
          }
          span {
            width: 100px;
            text-align: center;
            font-size: 18px;
            color: #FFE500;
            transform: translateY(10px);
          }
        }
        .gold {
          text-shadow: 1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
          font-size: 20px;
          text-align: center;
          display: flex;
          gap: 8px;
          flex-direction: column;
          .value {
            color: #FFE500;
            font-size: 20px;
          }
          .label {
            color: #06FFDB;
            font-size: 20px;
          }
        }
        .eat {
          width: 70px;
          height: 64px;
          background-size: 100% 100%;
          background-image: url("img/home/eat.png");
          cursor: pointer;
          z-index: 10;
        }
        .eat:hover {
          background-image: url("img/home/eat-hover.png");
        }
      }
    }
    .cellula-container-work {
      height: 560px;
    }
    .cellula-container::-webkit-scrollbar{
      width:20px;
      display: block;
    }
    .cellula-container::-webkit-scrollbar-track {
      border-radius: 20px;
      background: #000;
    }
    .cellula-container::-webkit-scrollbar-thumb{
      border-radius: 20px;
      background: #3780C1;
    }
    .cellula-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-left: 22px;
      .check-container {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #3780C1;
        font-size: 32px;
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
      .all-button {
        width: 278px;
        height: 72px;
        background-image: url("img/home/all-button.png");
        background-size: 100% 100%;
        cursor: pointer;
        text-align: center;
        line-height: 72px;
        color: #0AF3A5;
        font-size: 32px;
        margin-right: 32px;
      }
      .all-button:hover {
        background-image: url("img/home/all-button-hover.png");
      }
      .all-button-none {
        color: #738AAE;
        pointer-events: none;
        background-image: url("img/home/all-button-none.png");
      }
      .all-button-none:hover {
        background-image: url("img/home/all-button-none.png");
      }
    }
  }
  .world-data {
    z-index: 3;
    width: 484px;
    height: 187px;
    background-image: url("img/home/world-data.png");
    background-size: 100% 100%;
    position: fixed;
    top: 8px;
    left: 6px;
    cursor: pointer;
    .header {
      display: flex;
      justify-content: space-between;
      padding: 16px 20px 0;
      text-shadow: 1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
      .left,.right{
        flex: 1;
        height: 88px;
        padding-top: 28px;
        text-align: center;
        font-size: 18px;
        color: #FFF;
        span {
          color: #FFF372;
          font-size: 18px;
          text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
        }
      }
    }
    .bottom {
      text-align: center;
      color: #06FFDB;
      font-size: 20px;
      margin-top: 18px;
      text-shadow: 0px 0px 12.449px #008AB8, 0px 0px 7.114px #008AB8, 0px 0px 4.15px #008AB8, 0px 0px 2.075px #008AB8, 0px 0px 0.593px #008AB8, 0px 0px 0.296px #008AB8;
    }
  }
  .token-container {
    position: fixed;
    top: 30px;
    right: 408px;
    width: 277px;
    height: 76px;
    background-size: 100% 100%;
    background-image: url("img/token/token-bg.png");
    display: flex;
    flex-direction: column;
    padding-left: 24px;
    padding-top: 14px;
    z-index: 3;
    .label {
      font-size: 16px;
      color: #FFF;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .value {
      color: #FFF372;
      text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
      font-size: 27px;
      margin-top: -2px;
    }
  }
  .activity-container {
    display: flex;
    align-items: center;
    position: fixed;
    top: 100px;
    right: 120px;
    z-index: 3;
    .treasure-container {
      width: 104px;
      height: 109px;
      background-size: 100% 100%;
      cursor: pointer;
      position: relative;
      .label {
        position: absolute;
        top: 100px;
        left: 5px;
        z-index: 2;
        font-size: 18px;
        text-shadow: 0px 0px 5.594px #0C5CC6, 0px 0px 3.197px #0C5CC6, 0px 0px 1.865px #0C5CC6, 0px 0px 0.932px #0C5CC6, 0px 0px 0.266px #0C5CC6, 0px 0px 0.133px #0C5CC6;
        color: #FFF;
        line-height: 20px;
      }
      .treasure {
        width: 220px;
        height: 220px;
        object-fit: contain;
        position: relative;
        left: -58px;
        top: -50px;
        pointer-events: none;
      }
    }
    .exchange {
      width: 104px;
      height: 109px;
      background-size: 100% 100%;
      background-image: url("img/home/activity.png");
      cursor: pointer;
    }
  }
  .right-icon {
    z-index: 3;
    width: 84px;
    position: fixed;
    right: -4px;
    cursor: pointer;
    top: 354px;
    background-size: 100% 100%;
    height: 203px;
    background-image: url("img/home/right-icon.png");
  }
  .right-icon:hover {
    background-image: url("img/home/right-icon-hover.png");
  }
  .rewards {
    z-index: 3;
    width: 295px;
    height: 100px;
    position: fixed;
    background-size: 100% 100%;
    background-image: url("img/home/rewards.png");
    top: 18px;
    right: 98px;
    cursor: pointer;
    .reward-position {
      width: 100%;
      height: 100%;
      position: relative;
      .value {
        overflow: hidden;
        width: 66%;
        height: 70px;
        margin-left: 114px;
        text-align: left;
        margin-top: 36px;
        color: #FFF372;
        text-shadow: 0px 0px 5.998px #CC6300, 0px 0px 3.427px #CC6300, 0px 0px 1.999px #CC6300, 0px 0px 1px #CC6300, 0px 0px 0.286px #CC6300, 0px 0px 0.143px #CC6300;
        font-size: 28px;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .loading-reward {
        width: 78px;
        height: 78px;
        background-size: 100% 100%;
        background-image: url("img/home/loading.gif");
        position: absolute;
        top: -28px;
        left: 8px;
        z-index: 1;
      }
    }
  }
  .rewards:hover {
    //background-image: url("img/home/rewards-hover.png");
    //.value {
    //  color: #111111;
    //}
  }
  .button {
    z-index: 3;
    width: 323px;
    height: 77px;
    cursor: pointer;
    background-image: url("src/assets/images/home/button.png");
    background-size: 100% 100%;
    font-size: 28px;
    text-align: center;
    line-height: 70px;
  }
  .button-market, .button-game {
    z-index: 3;
    position: fixed;
    left: 52px;
    bottom: 5%;
    width: 225px;
    height: 55px;
    background-image: url("img/home/market.png");
    background-size: 100% 100%;
    line-height: 45px;
    font-size: 23px;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .icon {
      width: 36px;
      height: 34px;
      background-size: 100% 100%;
      background-image: url("img/home/home.png");
      margin-bottom: 2px;
      margin-right: 12px;
    }
  }
  .button-market-breath {
    animation: breathEffect 3s ease-in-out infinite;
  }
  .button-market-active {
    background-image: url("img/home/market-hover.png");
    color: #111111;
    .icon {
      background-image: url("img/home/home-hover.png");
    }
  }
  .button-market:hover {
    background-image: url("img/home/market-hover.png");
    color: #111111;
    .icon {
      background-image: url("img/home/home-hover.png");
    }
  }
  .button-game {
    position: fixed;
    width: 306px;
    height: 117px;
    left: unset;
    top: 769px;
    right: 16px;
    background-size: 100% 100%;
    background-image: url("img/home/explore.png");
  }
  .button-game:hover {
    background-image: url("img/home/explore-hover.png");
  }
  .button:hover {
    color: #111;
    background-image: url("src/assets/images/home/button-hover.png");
  }

  .small {
    width: 250px;
    height: 60px;
    line-height: 55px;
    font-size: 22px;
  }
}

.rewards-log {
  width: 1176px;
  height: 669px;
  box-shadow: unset;
  background-image: url("img/home/dialog.png");
  background-size: 100% 100%;
  .close-icon {
    width: 62px;
    height: 62px;
    background-size: 100% 100%;
    background-image: url("img/home/close.png");
    top: 39px;
    right: 68px;
  }
  .close-icon:hover {
    background-image: url("img/home/close-hover.png");
  }
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
    .cashback-title {
      margin-top: 100px;
    }
    .explore-footer {
      display: flex;
      justify-content: center;
      margin-top: 148px;
    }
    .cashback-footer {
      margin-top: 58px;
    }
    .table-title {
      display: grid;
      grid-template-columns: 1.1fr 0.8fr 1fr;
      text-align: center;
      border-bottom: 2px solid #295E8D;
      padding-bottom: 10px;
      .table-item {
        font-size: 32px;
        color: #0ADCF3;
        &:nth-of-type(2) {
          text-align: right;
        }
      }
    }
    .table-box {
      padding: 12px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      height: 420px;
      overflow-y: auto;
scrollbar-gutter: stable;
      .table {
        padding: 12px 0;
        border-radius: 8.754px;
        display: grid;
        grid-template-columns: 1.1fr 0.8fr 1fr;
        text-align: center;
        align-items: center;
        width: 100%;
        background-size: 100% 100%;
        height: 72px;
        background-image: url("img/home/rewards-item.png");
        .table-item {
          font-size: 26px;
          color: #4B90CE;
        }
        .active {
          color: #F1BB2B;
          cursor: pointer;
        }
        .active2 {
          color: #33CD41;
          text-align: right;
        }
      }
    }
    .table-box::-webkit-scrollbar{
      width:20px;
      display: block;
    }
    .table-box::-webkit-scrollbar-track {
      border-radius: 20px;
      background: #000;
    }
    .table-box::-webkit-scrollbar-thumb{
      border-radius: 20px;
      background: #3780C1;
    }
  }
}
@keyframes spriteAnimation {
  0% {
    background-position: -60PX -60PX;
  }
  12.5% {
    background-position: -316PX -60PX;
  }
  25% {
    background-position: -572PX -60PX;
  }
  37.5% {
    background-position: -828PX -60PX;
  }
  50% {
    background-position: -1084PX -60PX;
  }
  62.5% {
    background-position: -1340PX -60PX;
  }
  75% {
    background-position: -1596PX -60PX;
  }
  87.5% {
    background-position: -1852PX -60PX;
  }
  100% {
    background-position: -60PX -60PX;
  }
}
@keyframes spriteAnimationAttack {
  0% {
    background-position: -60PX -60PX;
  }
  12.5% {
    background-position: -316PX -315PX;
  }
  25% {
    background-position: -572PX -315PX;
  }
  37.5% {
    background-position: -828PX -315PX;
  }
  50% {
    background-position: -1084PX -315PX;
  }
  62.5% {
    background-position: -1340PX -315PX;
  }
  75% {
    background-position: -1596PX -315PX;
  }
  87.5% {
    background-position: -1852PX -315PX;
  }
  100% {
    background-position: -60PX -315PX;
  }
}
</style>
