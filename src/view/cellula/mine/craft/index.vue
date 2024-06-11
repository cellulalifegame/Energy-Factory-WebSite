<script setup lang="ts">
import {reactive, toRefs, ref, computed, onMounted, onUnmounted, watch, inject} from "vue";
import Button from "comps/Button.vue"
import { GameOfLife } from 'src/utils/gameOfLife'
import {
  clickMusic,
  closeMusic,
  debounce,
  getSrc,
  splitEvoHistories,
  sumNumbers, totalSum,
  truncateNumber
} from "src/utils/utils";
import ModalButton from "comps/ModalButton.vue";
import {Sortable, Swap} from "sortablejs/modular/sortable.core.esm";
import {useUserStore} from 'store/modules/user'
import { User } from 'src/api'
import Evolution from './Evolution.vue'
import {useGame} from "src/hooks/web3/useGame";
import * as echarts from 'echarts'
import { useLoadingBar } from 'naive-ui'
import {useRouter} from "vue-router";
import addMusic from '../../../../assets/musics/add.wav'
import moveMusic from '../../../../assets/musics/move.wav'
import deleteMusic from '../../../../assets/musics/delete.wav'
import returnMusic from '../../../../assets/musics/return.wav'
import LifePng from 'img/workbench/life.png'
import {ethers} from "ethers";
import { formatEther, parseEther } from "viem";
import Count from "comps/Count.vue";
import { getAccount, getBalance, getTransactionCount } from "@wagmi/core";
import { config } from "src/hooks/config";

const loadingBar = useLoadingBar()
const showGlobalMessage: any = inject('showGlobalMessage');

const router = useRouter()
const UserStore = useUserStore()
const { getLifePrice, mintCompound } = useGame()

const state = reactive({
  pageNum: 1,
  isAll: true,
  mintVisible: false,
  reloadVisible: true,
  evolutionData: [] as any,
  cellList: [] as any,
  show: true,
  evolutionModal: false,
  cellPrices: [] as any[],
  cellsList: [] as any,
  cellTotalList: [] as any,
  moreVisible: true,
  imgId: null as number | null,
  oldArr: [] as any,
  oldCells: [] as any,
  isImage: false,
  craftSuccessVisible: false
})
const isSwap = computed(() => {
  return UserStore.isSwap
})
const nftContainer: any = ref(null);
const checkerboard: any = ref(null);
const cleanList = (() => {
  state.evolutionData = []
  state.reloadVisible = false
  elementCount.value = 0
  const music = localStorage.getItem('musicStatus')
  if (music !== 'false') {
    const musicDelete = new Audio(returnMusic)
    musicDelete.play()
  }
  setTimeout(() => {
    state.reloadVisible = true
  }, 100)
  setTimeout(async () => {
    sortableMounted()
    evolveStep()
  }, 200)
})

const getGridPositions = (() => {
  const gridContainer: any = document.getElementById('gridContainer');
  const items = gridContainer.querySelectorAll('.nft-index');
  const positions: any = [];
  items.forEach((item: any, index: any) => {
    if (item.id) {
      let id = item.id.substring(7)
      positions.push({
        id: id.slice(0, -1),
        position: index,
        pageNum: id[id.length - 1]
      });
    }
  });
  return positions
})
const getRoleImage = () => {
  let evolutionData: any = []
  const arr = getGridPositions()
  arr.forEach((item: any, index: any) => {
    const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
    if (foundItem?.numStr) {
      let newArr: any = getLitGrids(item.position, foundItem.numStr)
      newArr.forEach((arrItem: any) => {
        evolutionData.push(arrItem)
      })
    }
  })
  let grid = createEmptyGrid()
  for (let i = 0; i < evolutionData.length; i++) {
    const [y, x] = evolutionData[i];
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      grid[y][x] = true;
    }
  }
  const stringRepresentation = grid
      .flat()
      .map(value => (value ? '1' : '0'))
      .join('');
  User.getRoleImage(stringRepresentation).then((res: any) => {
    if (res.data) {
      state.imgId = res.data
      state.isImage = true
    }
  })
}
const cyclicDom = (() => {
  const element = nftContainer.value.querySelectorAll(`.nft-card`)
  const activeArr = getGridPositions()
  element.forEach((item: any) => {
    activeArr.forEach((active: any) => {
      if (item.id.substring(7) === active.id) {
        item.classList.add('no-cursor')
      }
    })
  })
})
const sortableMounted = ((val?: any) => {
  if (!isSwap.value) {
    Sortable.mount(new Swap());
  }
  const dragList = document.getElementById('dragList');
  const gridContainer = document.getElementById('gridContainer');
  if (!dragList || !gridContainer) {
    return
  }
  const sortable = new Sortable(dragList, {
    group: {
      name: 'shared',
      pull: 'clone',
      put: false
    },
    animation: 150,
    swap: true,
    sort: false,
    onMove: function (evt: any) {
      const containsCellItem = evt.related.classList.contains('cell-item');
      if (containsCellItem) {
        return true
      } else {
        return false
      }
    },
    onEnd: function (evt: any) {
      state.show = false
      setTimeout(() => {
        state.show = true
        sortableMounted(true)
      }, 100)
      setTimeout(() => {
        state.show = true
        sortableMounted()
      }, 200)
      const music = localStorage.getItem('musicStatus')
      if (music !== 'false') {
        const musicAdd = new Audio(addMusic)
        musicAdd.play()
      }
      elementCount.value ++
      evolveStep()
      const arr = getGridPositions()
      if (arr.length > 1) {
        // state.imgId = getRandomInteger()
        getRoleImage()
      } else {
        state.imgId = null
      }
      cyclicDom()
      const containerId = 'dragList';
      const previousScrollPosition: any = getScrollPosition(containerId);
      setTimeout(() => {
        setScrollPosition(containerId, previousScrollPosition);
      }, 200)
    },
  });

  const gridSortable = new Sortable(gridContainer, {
    group: {
      name: 'shared',
      pull: false
    },
    animation: 150,
    swap: true, // Enable swap plugin
    sort: true,
    onEnd: function (evt: any) {
      const music = localStorage.getItem('musicStatus')
      if (music !== 'false') {
        const musicMove = new Audio(moveMusic)
        musicMove.play()
      }
      const arr = getGridPositions()
      if (arr.length > 1) {
        getRoleImage()
      } else {
        state.imgId = null
      }
      evolveStep()
      cyclicDom()
    },
  });
  const observer = new MutationObserver(() => {
    const childrenWithId = Array.from(checkerboard.value.children).filter(function (child: any) {
      return child.classList.length >= 3;
    });
  });
  observer.observe(nftContainer.value, {childList: true});
  UserStore.setIsSwap(true)
  domWatch()
  if (val) {
    sortable.destroy();
    gridSortable.destroy()
  }
})

const getMoreEvolution = async () => {
  clickMusic()
  loadingBar.start()
  let oldEvolution: any = []
  if (state.oldCells.length > 1) {
    let evolutionData: any = []
    const arr = state.oldCells[state.oldCells.length - 2]
    arr.forEach((item: any, index: any) => {
      const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
      if (foundItem?.numStr) {
        let newArr: any = getLitGrids(item.position, foundItem.numStr)
        newArr.forEach((arrItem: any) => {
          evolutionData.push(arrItem)
        })
      }
    })
    let grid = createEmptyGrid()
    for (let i = 0; i < evolutionData.length; i++) {
      const [y, x] = evolutionData[i];
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[y][x] = true;
      }
    }
    const stringRepresentation = grid
        .flat()
        .map(value => (value ? '1' : '0'))
        .join('');
    const {data} = await User.getEvolution(stringRepresentation)
    const { qtyCountArr, stepArr } = splitEvoHistories(data);
    oldEvolution = qtyCountArr
  }
  let evolutionData: any = []
  const arr = getGridPositions()
  arr.forEach((item: any, index: any) => {
    const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
    if (foundItem?.numStr) {
      let newArr: any = getLitGrids(item.position, foundItem.numStr)
      newArr.forEach((arrItem: any) => {
        evolutionData.push(arrItem)
      })
    }
  })
  let grid = createEmptyGrid()
  for (let i = 0; i < evolutionData.length; i++) {
    const [y, x] = evolutionData[i];
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      grid[y][x] = true;
    }
  }
  const stringRepresentation = grid
      .flat()
      .map(value => (value ? '1' : '0'))
      .join('');
  const {data} = await User.getEvolution(stringRepresentation)
  const { qtyCountArr, stepArr } = splitEvoHistories(data);
  let domItem: any = document.getElementById('echarts')
  state.moreVisible = false
  if (oldEvolution.length) {
    echartsStart(stepArr, qtyCountArr, oldEvolution)
  } else {
    echartsStart(stepArr, qtyCountArr)
  }
  loadingBar.finish()
}

function paginate(array: Cell[], pageSize: number, pageNum: number) {
  const skip = (pageNum - 1) * pageSize;
  return array.slice(skip, skip + pageSize);
}

const getCellsList = () => {
  User.getCellsList(1,600, state.pageNum).then((res: any) => {
    state.cellList = res.data.list
  })
}
const elementCount = ref(0);

onMounted(async () => {
  loadingBar.start()
  User.getCellsList(1,600).then((res: any) => {
    state.cellTotalList = res.data.list
    loadingBar.finish()
  })
  getCellsList()
  setTimeout(async () => {
    sortableMounted()
    cyclicDom()
  }, 200)
  domWatch()
})
function getRandomInteger() {
  return Math.floor(Math.random() * (71 - 1 + 1)) + 1;
}
const getCellsPrice = async (open?: string) => {
  let arr = getGridPositions()
  let cells = arr.map((item: any) => {
    return item.id
  })
  getLifePrice(cells).then((res: any) => {
    state.cellsList = arr
    state.cellPrices = res
    let evolutionData: any = []
    arr.forEach((item: any, index: any) => {
      const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
      if (foundItem?.numStr) {
        let newArr: any = getLitGrids(item.position, foundItem.numStr)
        newArr.forEach((arrItem: any) => {
          evolutionData.push(arrItem)
        })
      }
    })
    if (open) {
      state.mintVisible = true
    }
  })
}
function resetCanvas() {
  if (canvas.value && ctx.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    canvas.value.width = gridWidth * cellSize.value + 10;
    canvas.value.height = gridHeight * cellSize.value + 10;
    grid.value = createEmptyGrid();
    draw();
  }
}
const domWatch = () => {
  if (nftContainer.value) {
    const observer = new MutationObserver(() => {
      updateOpacityOnDuplicateClassList(nftContainer.value);
    });

    observer.observe(nftContainer.value, { childList: true, subtree: true });

    // onUnmounted(() => {
    //   observer.disconnect();
    // });
  }
}
const updateOpacityOnDuplicateClassList = (container: HTMLElement) => {
  const classListMap = new Map<string, HTMLElement[]>();

  const elements: any = Array.from(container.children);
  elements.forEach((element: any, index: number) => {
    if (element.classList.length > 3) {
      elements[index].style.display = 'none';
    }
  });
};

function getObjectById(arr: any, id: string) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].tokenId === id) {
      return arr[i];
    }
  }
  return null;
}
const getLitGrids = ((matrix: any, pattern: any) => {
  const x = Math.floor(matrix / 3) * 3;
  const y = (matrix % 3) * 3;
  const litGrids = [];
  for (let i = 0; i < 9; i++) {
    const digit = pattern.charAt(i);
    if (digit === '1') {
      const row = Math.floor(i / 3) + x;
      const col = (i % 3) + y;
      litGrids.push([row, col]);
    }
  }
  return litGrids;
})
const openEvoVisible = () => {
  let arr = getGridPositions()
  if (arr.length > 0) {
    arr.forEach((item: any, index: any) => {
      const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
      if (foundItem?.numStr) {
        let newArr: any = getLitGrids(item.position, foundItem.numStr)
        newArr.forEach((arrItem: any) => {
          state.evolutionData.push(arrItem)
        })
      }
    })
    state.evolutionModal = true
  }
}
const openMintVisible = async () => {
  let arr = getGridPositions()
  if (arr.length >= 2) {
    await getCellsPrice('open')
  }
}

const totalPrice = computed(() => {
  let total: bigint = parseEther('0')

  state.cellPrices.forEach((item) => {
    total = total+item
  });
  return total
})
const completeCount = ref(0)
const currentCount = ref(1)
watch(
    () => completeCount.value,
    () => {
      if (completeCount.value === currentCount.value) {
        completeCount.value = 0
        showGlobalMessage('Minting...', 'close')
      }
    }
)
const computedLoading = ref(false)
const computedNFTs = (async () => {
  if (!computedLoading.value) {
    computedLoading.value = true
    const {address}: any = getAccount(config)
    const balance = await getBalance(config, {
      address: address,
    })
    if (parseFloat(formatEther(balance.value)) > totalSum(currentCount.value, truncateNumber(formatEther(totalPrice.value), 6))) {
      let evolutionData: any = []
      state.mintVisible = false
      const arr = getGridPositions()
      arr.forEach((item: any, index: any) => {
        const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
        if (foundItem?.numStr) {
          let newArr: any = getLitGrids(item.position, foundItem.numStr)
          newArr.forEach((arrItem: any) => {
            evolutionData.push(arrItem)
          })
        }
      })
      let grid = createEmptyGrid()
      for (let i = 0; i < evolutionData.length; i++) {
        const [y, x] = evolutionData[i];
        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          grid[y][x] = true;
        }
      }
      const stringRepresentation = grid
          .flat()
          .map(value => (value ? '1' : '0'))
          .join('');
      await getCellsPrice()
      let total = parseEther('0')

      state.cellPrices.forEach((item) => {
        total = total+item
      });
      let cell = state.cellsList.map((item: any) => {
        return [item.id, item.position]
      })
      let newCell = cell.map((item: any) => {
        return [item[0],item[1]+1]
      })
      let cellsTokenId = state.cellsList.map((item: any) => {
        return item.id
      })
      let bitLifePrice: any = 0
      showGlobalMessage('Minting...', 'Mint')
      const nonce = await getTransactionCount(config, {
        address: address
      })
      for (let i = 0; i < currentCount.value; i ++) {
        User.getPrice(parseInt(total.toString()), cellsTokenId.toString()).then((res: any) => {
          let price = (parseFloat(formatEther(total)) * (1+0.05*(res.data+1))).toFixed(18)
          bitLifePrice = ethers.utils.parseEther(price.toString())
          let formData = {
            price: bitLifePrice.toString(),
            cell: newCell
          }
          mintCompound(formData, nonce+i).then((res: any) => {
            let formData = {
              roleImage: state.imgId,
              matrixInfo: stringRepresentation
            }
            User.updateRoleImage(formData).then((res: any) => {
              state.mintVisible = false
              state.craftSuccessVisible = true
              showGlobalMessage('Successfully Mint')
              computedLoading.value = false
              completeCount.value++
            })
          })
              .catch((error: any) => {
                completeCount.value++
                if (error.toString().substring(0,32) === 'Error: EstimateGasExecutionError') {
                  showGlobalMessage('Insufficient Balance')
                }
                if (error.toString().substring(0,21) === 'Error: network error') {
                  showGlobalMessage('Network error')
                }
                computedLoading.value = false
              })
        })
      }
    } else {
      showGlobalMessage('Insufficient Balance')
      computedLoading.value = false
    }
  }
})
const computedNFT = debounce(computedNFTs, 20);


const evolveStep = (() => {
  let input: any = [];
  const game: any = new GameOfLife();
  const activeArray = getGridPositions()
  activeArray.forEach((item: any, index: any) => {
    const foundItem: Cell | undefined = state.cellTotalList.find((items: any) => items.tokenId === item.id);
    if (foundItem?.numStr) {
      let arr: any = getLitGrids(item.position, foundItem.numStr)
      arr.forEach((item: any) => {
        input.push(item)
        game.addCell(item[0],item[1])
      })
    }
  })
  let countArr = []
  let indexArr = []
  for (let i = 0; i < 188; i++) {
    game.step();
    indexArr.push(i+1)
    countArr.push(game.activeCells.length)
  }
  let domItem: any = document.getElementById('echarts')
  state.moreVisible = true
  echartsStart(indexArr,countArr)
})
const echartsStart = ((indexArr: any, countArr: any, oldArr?: any) => {
  let testCountArr = []
  if (oldArr) {
    testCountArr = countArr
  } else {
    testCountArr = countArr.map((item: any, index: any, array: any) => {
      return array.slice(0, index + 1).reduce((acc: any, curr: any) => acc + curr, 0);
    });
  }
  const array = Array.from({ length: 2000 }, (_, index) => index + 1);
  const array2 = Array.from({ length: 188 }, (_, index) => index + 1);
  indexArr = state.moreVisible ? array2 : array
  let aa: any = document.getElementById('echarts')
  const myChartVolume = echarts.init(document.getElementById('echarts')!)
  myChartVolume.setOption({
    xAxis: {
      type: 'category',
      data: indexArr,
      splitLine: {
        show: false
      },
      interval: 2,
      axisLine: {
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10],
        symbolOffset: [0, 8],
        lineStyle: {
          color: '#119088',
          width: 2
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
      axisLine: {
        show: true,
        symbol: ['none', 'arrow'],
        symbolSize: [8, 10],
        symbolOffset: [0, 8],
        lineStyle: {
          color: '#119088',
          width: 2
        }
      },
      axisLabel: {
        show: true,
        color: '#FFE500',
        fontSize: 10
      }
    },
    grid: {
      top: '9%',
      left: '25%',
      right: '2%',
      bottom: '3%',
      containLabel: false
    },
    series: [
      {
        data: testCountArr,
        type: 'line',
        smooth: false,
        name: 'new',
        itemStyle: {
          color: '#05FFDB'
        }
      },
      {
        data: oldArr ? oldArr : state.oldArr,
        type: 'line',
        smooth: false,
        name: 'old',
        itemStyle: {
          color: '#F34E00'
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#008974',
      textStyle: {
        color: '#F8F0D8',
        fontWeight: 'bold'
      },
      formatter: function (params: any) {
        let result = `<div style="color: #F8F0D8">${params[0].axisValueLabel}</div>`;
        params.forEach((param: any) => {
          result += `<div style="color: ${param.color};"><span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${param.color};"></span>${param.seriesName}: ${param.data}</div>`;
        });
        return result;
      }
    },
  })
  aa.setAttribute('_echarts_instance_', '');
  window.addEventListener('resize', function() {
    myChartVolume.resize();
  });
  state.oldArr = testCountArr
  state.oldCells.push(getGridPositions())
})

watch(
    () => state.pageNum,
    () => {
      state.isAll = false
      state.show = false
      setTimeout(() => {
        state.show = true
        sortableMounted(true)
      }, 100)
      setTimeout(() => {
        sortableMounted()
      }, 200)
    }
)
const closeDialog = (() => {
  state.evolutionData = []
})
const switchPage = (num: number) => {
  state.isAll = false
  state.pageNum = num
  getCellsList()
}

const removeElement = ((event: any) => {
  const parentContainer = event.target.parentNode;
  parentContainer.innerHTML = '';
  parentContainer.className = '';
  parentContainer.id = '';
  parentContainer.classList.add('cell-item', 'nft-index', 'placeholder-img');
  parentContainer.style.display = 'block'
  const music = localStorage.getItem('musicStatus')
  if (music !== 'false') {
    const musicDelete = new Audio(deleteMusic)
    musicDelete.play()
  }
  elementCount.value --
  cyclicDom()
  evolveStep()
  const arr = getGridPositions()
  if (arr.length > 1) {
    // state.imgId = getRandomInteger()
    getRoleImage()
  } else {
    state.imgId = null
  }
})

// canvas
const image = new Image();
image.src = LifePng
const canvas: any = ref(null);
const ctx: any = ref(null);
const cellSize = ref(23);
const gridWidth = 9;
const gridHeight = 9;
const grid = ref(createEmptyGrid());
function createEmptyGrid() {
  return Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));
}

const draw = (() => {
  ctx.value.clearRect(0, 0, canvas.value.width + 10, canvas.value.height + 10);
  ctx.value.lineWidth = 1;
  const spacing = 1;
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      ctx.value.beginPath();
      ctx.value.strokeStyle = '#01493F';
      ctx.value.globalCompositeOperation = 'destination-over';
      drawRoundedRect(ctx.value, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
      ctx.value.stroke();

      if (grid.value[y][x]) {
        ctx.value.fillStyle = '#000000';
        ctx.value.drawImage(image, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value);
        // ctx.value.globalCompositeOperation = 'source-over';
      } else {
        ctx.value.fillStyle = '#01493F';
      }
      drawRoundedRect(ctx.value, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
      ctx.value.fill();
    }
  }
})

function drawRoundedRect(ctx: any, x: any, y: any, width: any, height: any, borderRadius: any) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + borderRadius, y);
  ctx.lineTo(x + width - borderRadius, y);
  ctx.arcTo(x + width, y, x + width, y + borderRadius, borderRadius);
  ctx.lineTo(x + width, y + height - borderRadius);
  ctx.arcTo(x + width, y + height, x + width - borderRadius, y + height, borderRadius);
  ctx.lineTo(x + borderRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - borderRadius, borderRadius);
  ctx.lineTo(x, y + borderRadius);
  ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
  ctx.closePath();
  ctx.restore()
}


function batchLightUp(coords: any) {
  for (let i = 0; i < coords.length; i++) {
    const [y, x] = coords[i];
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      grid.value[y][x] = true;
    }
  }
  draw();
}
const closeMintVisible = () => {
  resetCanvas()
  state.mintVisible = false
}
const getScrollPosition = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    return container.scrollTop;
  } else {
    return 0;
  }
};

const setScrollPosition = (containerId: string, scrollPosition: string) => {
  const container: any = document.getElementById(containerId);
  if (container) {
    container.scrollTop = scrollPosition;
  }
};
watch(
    () => state.mintVisible,
    () => {
      if (state.mintVisible) {
        clickMusic()
      } else {
        closeMusic()
      }
    }
)
watch(
    () => state.evolutionModal,
    () => {
      if (state.evolutionModal) {
        clickMusic()
      } else {
        closeMusic()
      }
    }
)
const { craftSuccessVisible, pageNum, isAll, mintVisible, reloadVisible, cellList, show, evolutionModal, evolutionData, cellPrices, cellsList, moreVisible, cellTotalList, imgId} = toRefs(state)
</script>

<template>
  <div class="craft-container">
    <div class="craft-main">
      <div class="left-container">
        <div class="title">
          BitCell Table
          <n-popover class="tips-text-container tips-text-container-bottom" trigger="hover">
            <template #trigger>
              <img class="tips" src="img/layout/tips-icon-2.png" alt="">
            </template>
            <div class="tips-text">BitCells are used to forge BitLife, and you can select them based on the number of live BitCells. </div>
          </n-popover>
        </div>
        <div class="page-container">
          <div class="page-item" @click="isAll = !isAll" :class="isAll ? 'page-item-active' : ''">
            <div class="item">All</div>
          </div>
          <div class="page-item" @click="switchPage(item)" :class="!isAll && pageNum === item ? 'page-item-active' : ''"
               v-for="item in 9">
            <div class="item">{{ item }}</div>
          </div>
        </div>
        <div v-if="show" class="cell-container" ref="nftContainer" id="dragList">
          <div v-if="cellList.length" class="cell-box nft-index" :class="item.tokenId ? `${item.tokenId}${pageNum}` : 'no-tokenId'" :id="item.tokenId ? `tokenId${item.tokenId}${pageNum}` : `tokenId${index}${pageNum}`"
               v-for="(item, index) in isAll ? cellTotalList : paginate(cellList, 600, 1)" :key="index">
            <img class="cell" :src="item.image" alt="" loading="lazy">
            <img @click.stop="removeElement($event)" :id="`imgId${item.tokenId}${pageNum}`" class="close-visible" src="img/workbench/del.png" alt="">
          </div>
        </div>
      </div>
      <div class="new-container">
        <div class="center-container">
          <div class="title">
            Crafting Table
            <n-popover class="tips-text-container tips-text-container-bottom" trigger="hover">
              <template #trigger>
                <img class="tips" src="img/layout/tips-icon-2.png" alt="">
              </template>
              <div class="tips-text">
                Drag and drop 2-9 cells from the cell table to the crafting table
              </div>
            </n-popover>
          </div>
          <div class="center-box">
            <div class="cell-container">
              <div class="cell-box-container" ref="checkerboard" v-if="reloadVisible" id="gridContainer">
                <div class="cell-item nft-index placeholder-img" v-for="item in 9" :key="item"></div>
              </div>
            </div>
            <div class="button-container">
              <div @click="cleanList" class="refresh"></div>
              <div @click="openEvoVisible" class="play"></div>
            </div>
          </div>
        </div>
        <div class="right-container">
          <div class="echarts-container">
            <div class="avatar-container">
              <div v-if="imgId" class="avatar-img" :style="{backgroundImage: `url('${imgId}')`}"></div>
              <div v-else class="avatar-img"></div>
            </div>
            <div class="echarts-box">
              <div class="title">
                Hashrate Curve
                <n-popover class="tips-text-container" trigger="hover">
                  <template #trigger>
                    <img class="tips" src="img/layout/tips-icon-2.png" alt="">
                  </template>
                  <div class="tips-text">
                    Formed by 7 day’s BitLife Hashrate change
                  </div>
                </n-popover>
              </div>
              <div class="description-title">Hashrate</div>
              <div class="echarts">
                <div v-if="moreVisible" class="get-more" @click="getMoreEvolution">View&nbsp;More</div>
                <div class="echarts-main" id="echarts"></div>
              </div>
              <div class="description" v-if="!moreVisible">
                <span>1D</span>
                <span>7D</span>
              </div>
              <div class="description" v-else>
                <span></span>
                <span>1D</span>
              </div>
            </div>
            <div class="button-container">
              <Count :currentCount="currentCount" @addCount="currentCount++" @subtractCount="currentCount--"></Count>
              <div class="mint-button-craft" :class="elementCount < 2 ? 'mint-button-craft-disable' : ''" @click="openMintVisible">Mint</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="mintVisible">
      <div class="mint-visible">
        <img @click="closeMintVisible" class="close-icon" src="img/layout/close.png" alt="">
        <div class="model-main mass-main">
          <div class="title">Mass Minting BitLife</div>
          <div class="title-container">
            <div class="title-item">BitLife</div>
            <div class="title-item">Mint Price</div>
            <div class="title-item">Quantity</div>
            <div class="title-item">Details</div>
          </div>
          <div class="data-container">
            <div class="data-item" v-for="item in currentCount">
              <div class="cover-container">
                <div class="cover" :style="{backgroundImage: `url('${imgId}')`}"></div>
              </div>
              <div class="price">{{ truncateNumber((truncateNumber(formatEther(totalPrice), 6) * (1 + 0.05 * item)),6) }}[BNB]</div>
              <div class="count">1</div>
              <div class="detail">
                <n-popover class="tips-text-container" :show-arrow="false" placement="bottom-end" trigger="click">
                  <template #trigger>
                    <img class="detail-icon" src="img/mint/detail.png" alt="">
                  </template>
                  <div class="nft-popover">
                    <div class="title-container">
                      <div class="title-item"></div>
                      <div class="title-item">ID</div>
                      <div class="title-item">Price</div>
                      <div class="title-item">Quantity</div>
                    </div>
                    <div class="nft-container">
                      <div class="nft-item" v-for="(cell, index) in cellsList">
                        <div class="cell-img">
                          <img :src="state.cellTotalList.find((items: any) => items.tokenId === cell.id).image" alt="">
                        </div>
                        <div class="id">{{ cell.id }}</div>
                        <div class="price">{{ truncateNumber((parseFloat(formatEther(cellPrices[index])) * (1 + 0.05 * item)),6) }}</div>
                        <div class="qty">1</div>
                      </div>
                    </div>
                  </div>
                </n-popover>
              </div>
            </div>
          </div>
          <div class="data-border"></div>
          <div class="total-container">
            <div class="total-price">Total≈ <span class="total-price">{{totalSum(currentCount, truncateNumber(formatEther(totalPrice),6))}}[BNB]</span></div>
            <div class="qty">{{ currentCount }}</div>
          </div>
        </div>
        <div class="button-container-modal">
          <ModalButton @click="computedNFT" button-text="Mint"></ModalButton>
        </div>
      </div>
    </n-modal>
    <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="craftSuccessVisible">
      <div class="mint-visible">
        <img @click="craftSuccessVisible = false" class="close-icon" src="img/layout/close.png" alt="">
        <div class="model-main visible-main">
          <div class="header">
            <div class="cover" id="cover">
              <div v-if="imgId" class="avatar-img" :style="{backgroundImage: `url('${imgId}')`}"></div>
            </div>
<!--            <div class="right">-->
<!--              <div class="title">-->
<!--                <div class="label">Mint Price</div>-->
<!--              </div>-->
<!--              <div class="value">-->
<!--                <div class="label">{{ parseFloat(formatEther(totalPrice)).toFixed(6) }}</div>-->
<!--                <div class="label">[BNB]</div>-->
<!--              </div>-->
<!--            </div>-->
          </div>
          <div class="craft-description">Congratulations on completing the minting process!</div>
        </div>
        <div class="button-container-modal">
          <ModalButton type="small" @click="craftSuccessVisible = false" button-text="Mint More"></ModalButton>
          <ModalButton type="small" @click="router.push('/home')" button-text="Gain Energy"></ModalButton>
        </div>
      </div>
    </n-modal>
    <n-modal v-model:show="evolutionModal" :on-after-leave="closeDialog">
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
.craft-container {
  width: 1580px;
  height: 750px;
  transform: translateX(130px) translateY(80px);
  .craft-main {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 0.96fr 0.9fr;
    .left-container {
      width: 530px;
      height: 735px;
      background-size: 100% 100%;
      background-image: url("img/workbench/left-background.png");
      padding: 42px 45px 52px 52px;
      .title {
        color: #A9EEFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 32px;
        margin-bottom: 28px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .page-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 4px;
        padding-right: 28px;
        .page-item {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          cursor: pointer;
          background-color: rgb(10,26,60);
          border: 2px solid rgb(43,83,153);
          .item {
            width: 30px;
            height: 30px;
            font-size: 16px;
            border-radius: 50%;
            text-align: center;
            line-height: 34px;
            color: #2A5196;
          }
        }

        .page-item-active {
          box-shadow: 0px 1.865px 1.865px 0px #2A5196 inset, 0px 1.865px 1.865px 0px #2A5196, 0px 0px 8.066px 0px #2A5196;
          border: 2px solid rgb(47,160,249);
          .item {
            background: rgb(23,60,125);
            color: #30A5FF;
          }
        }
      }

      .cell-container {
        display: grid;
        margin-top: 12px;
        height: 520px;
        grid-gap: 22px 12px;
        overflow-y: auto;
scrollbar-gutter: stable;
        grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
        grid-auto-rows: 78px;
        //padding-right: 20px;
        padding-top: 4px;
        padding-left: 4px;
        padding-bottom: 6px;
        scrollbar-gutter: stable;
        .cell-item {
          display: none;
        }
        .close-visible {
          display: none;
        }
        .no-tokenId {
          pointer-events: none;
          opacity: 0.6;
        }

        .sortable-ghost {
          //display: none!important;
        }

        .cell-box {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85px;
          height: 85px;
          background-image: url("img/workbench/cell.png");
          background-size: 100% 100%;
          .cell {
            width: 90%;
            height: 90%;
          }
        }
        .cell-box:hover {
          background-image: unset;
          position: relative;
          &:after {
            content: '';
            position: absolute;
            width: 103px;
            height: 103px;
            left: -10px;
            top: -10px;
            background-size: 100% 100%;
            background-image: url("img/workbench/cell-hover.png");
          }
        }
      }
      .cell-container::-webkit-scrollbar{
        width:20px;
        display: block;
      }
      .cell-container::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .cell-container::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
    }
    .new-container {
      width: 1084px;
      height: 747px;
      background-size: 100% 100%;
      display: flex;
      gap: 12px;
      padding: 52px 58px 42px 48px;
      background-image: url("img/workbench/new-left.png");
    }
    .center-container {
      z-index: 100;
      position: relative;
      .title {
        color: #A9EEFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 32px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .center-box {
        height: 555px;
        width: 446px;
        background-size: 100% 100%;
        background-image: url("img/workbench/center-container.png");
        margin-top: 36px;
        .cell-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 40px;
          .cell-box-container {
            width: 362px;
            height: 362px;
            display: flex;
            align-content: flex-start;
            flex-flow: row wrap;
            justify-content: center;
            background-image: url("img/craft/grid-background.png");
            background-size: 120.5px 120.5px;
            padding: 1px;

            .cell-box {
              width: 120px;
              height: 120px;
              display: flex!important;
              //overflow: hidden;
              img {
                width: 100%;
                height: 100%;
              }
              .close-visible {
                width: 22px;
                height: 22px;
                position: absolute;
                top: -12px;
                right: -12px;
                cursor: pointer;
                display: none;
              }
            }
            .cell-box:hover {
              position: relative;
              .close-visible {
                display: block;
                z-index: 2;
              }
            }

            .cell-item {
              width: 120px;
              height: 120px;
              background-size: 100% 100%;
            }
          }
        }
      }

      .button-container {
        margin-top: 44px;
        display: flex;
        justify-content: center;
        gap: 34px;
        align-items: center;
        position: absolute;
        bottom: 56px;
        width: 100%;
        padding-left: 12px;
        .play, .refresh {
          width: 90px;
          height: 90px;
          background-image: url("img/craft/play.png");
          background-size: 100% 100%;
          cursor: pointer;
        }

        .play:hover {
          background-image: url("img/craft/play-hover.png");
        }

        .refresh {
          background-image: url("img/craft/refresh.png");
        }

        .refresh:hover {
          background-image: url("img/craft/reload-hover.png");
        }
      }
    }

    .right-container {
      width: 488px;
      .echarts-container {
        height: 100%;
        .avatar-container {
          width: 263px;
          height: 202px;
          background-size: 100% 100%;
          background-image: url("img/craft/avatar-background.png");
          margin-left: 50%;
          transform: translateX(-50%) translateY(32px);
          display: flex;
          align-items: center;
          justify-content: center;
          .avatar-img {
            width: 256px;
            height: 256px;
            animation: AvatarWalk 1.2s steps(1) infinite;
            background-size: 4090px 256px;
            background-repeat: no-repeat;
            position: relative;
            background-position: -256px -10px;
            background-image: url("img/home/avatar-test.png");
            transform: translateY(-65px) translateX(-5px);
          }
        }
        .echarts-box {
          height: 234px;
          background-size: 100% 100%;
          position: relative;
          margin-top: 40px;
          .title {
            color: #A9EEFF;
            font-size: 22px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .description-title {
            font-size: 18px;
            color: #337FC4;
            margin-bottom: 6px;
          }
          .echarts {
            height: 230px;
            background-size: 100% 100%;
            width: 420px;
            margin-left: 64px;
            background-image: url("img/featured/grid.png");
            position: relative;
            background-repeat: no-repeat;
            z-index: 3;
            .echarts-main {
              //width: calc(30% + 44px);
              width: 560px;
              height: 250px;
              position: absolute;
              left: -138px;
              top: -12px;
              z-index: 2;
            }
            .get-more {
              position: absolute;
              color: #FFE500;
              font-size: 14px;
              top: -20px;
              right: 0;
              cursor: pointer;
              z-index: 3;
            }
            .echarts-main-long {

            }
          }

          .description {
            font-size: 15px;
            color: #337FC4;
            margin-top: 6px;
            padding-left: 86px;
            padding-right: 54px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            &:after {
              content: 'Time';
              position: absolute;
              right: 4px;
              top: 2px;
            }
          }
        }

        .button-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 80px;
          padding-left: 12px;
          .mint-button-craft {
            width: 282px;
            height: 72px;
            background-image: url("img/mint/btn-craft.png");
            color: #0AF3A5;
            font-size: 36px;
            text-align: center;
            line-height: 72px;
            cursor: pointer;
            background-size: 100% 100%;
          }
          .mint-button-craft:hover {
            background: url("img/mint/btn-craft-hover.png");
            background-size: 100% 100%;
          }
          .mint-button-craft-disable {
            color: #50617C;
            background-image: url("img/mint/btn-craft-disable.png");
          }
          .mint-button-craft-disable:hover {
            background-image: url("img/mint/btn-craft-disable.png");
          }
        }
      }
    }
  }
}

.mint-visible {
  width: 1176px;
  height: 669px;
  background-size: 100% 100%;
  background-image: url("img/layout/mint-visible.png");
  .model-main {
    padding: 80px 60px 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    .header {
      display: flex;
      align-items: center;
      gap: 90px;
      .cover {
        width: 263px;
        height: 202px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: 100% 100%;
        background-image: url("img/featured/avatar-bottom.png");
        .avatar-img {
          width: 256px;
          height: 256px;
          background-size: 4090px 256px;
          background-repeat: no-repeat;
          position: relative;
          background-position: -256px -10px;
          background-image: url("img/home/avatar-test.png");
          transform: translateY(-65px) translateX(-5px);
          animation: AvatarWalk 1.2s steps(1) infinite;
        }
      }
      .right {
        width: 342px;
        .label {
          font-size: 36px;
        }
        .title {
          display: flex;
          justify-content: space-between;
          color: #A9EEFF;
          text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
          font-size: 40px;
        }
        .value {
          display: flex;
          justify-content: space-between;
          margin-top: 52px;
          .label {
            color: #1AEB72;
            font-size: 40px;
          }
        }
      }
    }
    .craft-description {
      width: 100%;
      font-size: 32px;
      margin: 100px 0;
      color: #4C9EE8;
      text-align: center;
    }
    .cell-container {
      width: 100%;
      background-size: 100% 100%;
      margin-top: 32px;
      height: 251px;
      padding: 16px 17px 16px 24px;
      background-image: url("img/layout/cell-container.png");
      .title {
        display: grid;
        grid-template-columns: 0.3fr 1fr 1fr 1fr;
        text-align: center;
        margin-bottom: 24px;
        .item {
          color: #4C9EE8;
          font-size: 32px;
        }
      }
      .cell-box {
        overflow-y: auto;
scrollbar-gutter: stable;
        height: 150px;
        padding-right: 20px;
      }
      .cell-box::-webkit-scrollbar{
        width:20px;
        display: block;
      }
      .cell-box::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .cell-box::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
      .cell-item {
        display: grid;
        grid-template-columns: 0.3fr 1fr 1fr 1fr;
        text-align: center;
        align-items: center;
        margin: 8px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #24417E;
        .cover-container {
          display: flex;
          justify-content: left;
          .cover {
            width: 55px;
            height: 55px;
            padding: 4px;
            img {
              width: 100%;
              height: 100%;
            }
          }
        }
        .item {
          color: #337FC4;
          text-align: center;
          font-size: 26px;
        }
      }
    }
  }
}

</style>