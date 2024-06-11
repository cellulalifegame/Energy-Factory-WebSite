<script setup lang="ts">
import Button from 'comps/Button.vue'
import {computed, inject, onMounted, onUnmounted, reactive, Ref, ref, toRefs, watch} from "vue";
import { getSrc, getLitGrids, formatDate, clickMusic, closeMusic, debounce, canContinuePaging } from "src/utils/utils";
import { useRoute, useRouter } from "vue-router";
import { useGame } from "src/hooks/web3/useGame";
import {useUserStore} from "store/modules/user";
import { User } from "src/api";
import {utils} from "web3/dist/web3.min.js";
import ModalButton from "comps/ModalButton.vue";
import { networkList } from 'src/hooks/web3/network';
import { useLoadingBar } from 'naive-ui'
import LifePng from "img/workbench/life.png"
const loadingBar = useLoadingBar()
const showGlobalMessage: any = inject('showGlobalMessage');


const userInfo = useUserStore()
const { getMintPrice, mintNFT, getTokenFee, withdrawFee } = useGame()
const address = computed(() => {
  return userInfo.walletAddress
})

const router = useRouter()
const state = reactive({
  nftIndex: 0,
  mintPrice: 0,
  cellList: [] as Cell [],
  leavePage: false,
  evolutionData: [] as any,
  totalEarnings: '0',
  logVisible: false,
  claimLog: [] as rentFeeLog[],
  pageSize: 30,
  pageNum: 1,
  totalCount: 0
})
const goToDetail = (id: string) => {
  if (id) {
    router.push(`/bitcell/${id}`)
  }
}

const mintCell = () => {
  getMintPrice().then((res: any) => {
    state.mintPrice = res
    mintNFT(state.mintPrice).then((res: any) => {
    })
  })
}

const loading = ref(false)
const getMyCell = () => {
  if (address.value) {
    loadingBar.start()
    loading.value = true
    state.pageNum = 1
    state.cellList = []
    User.getMyCell(address.value, state.pageNum, state.pageSize).then((res: any) => {
      state.cellList = res.data.list
      state.totalCount = res.data.total
      let tokens = res.data.list.map((item: any) => { return item.tokenId })
      getTokenFee(tokens).then((res: any) => {
        state.totalEarnings = res
      })
      loadingBar.finish()
      loading.value = false
    })
    getClaimLog()
  }
}

watch(
    () => address.value,
    () => {
      if (address.value) {
        getMyCell()
      }
    }
)
onMounted(() => {
  initCanvas()
  getMyCell()
  if (dataContainer.value) {
    dataContainer.value.addEventListener('scroll', handlePage);
  }
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
    User.getMyCell(address.value, state.pageNum, state.pageSize).then((res: any) => {
      res.data.list.forEach((item: any) => {
        state.cellList.push(item)
      })
      pageLoading.value = false
    })
  }
};
onUnmounted(() => {
  state.leavePage = true
  stop()
  clear()
  if (dataContainer.value) {
    dataContainer.value.removeEventListener('scroll', handlePage);
  }
});
function stop() {
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
}
const clear = async () => {
  stop();
  grid.value = createEmptyGrid();
  draw();
  generation.value = 0
  batchLightUp(state.evolutionData)
}
const switchDefaultNFT = (async (index: any) => {
  state.nftIndex = index
  let arr: any = getLitGrids(0, state.cellList[index].numStr, 3)
  state.evolutionData = arr
  clear()
})
let startX = 0;
let startY = 0;
function handleDragStart(event: any) {
  isMouseDown = true;
  startX = event.clientX - canvasPosition.value.x;
  startY = event.clientY - canvasPosition.value.y;
}
function handleDragMove(event: any) {
  if (!isMouseDown) return;
  const newX = event.clientX - startX;
  const newY = event.clientY - startY;
  canvasPosition.value = { x: newX, y: newY };
  canvas.value.style.transform = `translate(${newX}px, ${newY}px)`;
}

function handleDragEnd() {
  isMouseDown = false;
}
const initCanvas = async () => {
  ctx.value = canvas.value.getContext('2d');
  canvas.value.width = gridWidth * cellSize.value + 10;
  canvas.value.height = gridHeight * cellSize.value + 10;
  if (state.cellList.length) {
    image.addEventListener('load', () => {
      batchLightUp(getLitGrids(0, state.cellList[state.nftIndex].numStr, 3))
    });
    await switchDefaultNFT(0)
  }
  canvas.value.addEventListener("mousedown", handleDragStart);
  canvas.value.addEventListener("mousemove", handleDragMove);
  canvas.value.addEventListener("mouseup", handleDragEnd);
}
function batchLightUp(coords: any) {
  for (let i = 0; i < coords.length; i++) {
    const [y, x] = coords[i];
    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      grid.value[y+gridWidth/2-2][x+gridHeight/2-2] = true;
    }
  }
  draw();
}
const image = new Image();
image.src = LifePng

const canvas: any = ref(null);
const ctx: any = ref(null);
const cellSize = ref(24);
const cellValue = 24
const evolutionSpeed = ref(1000);
const canvasPosition = ref({ x: 0, y: 0 });

const gridWidth = 48;
const gridHeight = 48;
const grid = ref(createEmptyGrid());
let animationId: any = null;
const generation: any = ref(0)
const isStart = ref(false)
let isMouseDown = false;
function createEmptyGrid() {
  return Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill(false));
}
function handleMouseUp() {
  isMouseDown = false;
}

function handleWheel(event: any) {
  event.preventDefault();
  if (event.deltaY < 0) {
    if (cellSize.value < cellValue && cellSize.value + 2 <= cellValue) {
      cellSize.value += 2;
    } else {
      cellSize.value = cellValue;
    }
  } else {
    if (cellSize.value > 5) {
      cellSize.value = Math.max(5, cellSize.value - 2);
    }
  }
  canvas.value.width = gridWidth * cellSize.value + 10;
  canvas.value.height = gridHeight * cellSize.value + 10;
  draw();
}
const draw = (() => {
  if (!state.leavePage) {
    ctx.value.clearRect(0, 0, canvas.value.width + 10, canvas.value.height + 10);
    ctx.value.lineWidth = 1;
    const spacing = 1;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        ctx.value.beginPath();
        ctx.value.strokeStyle = 'rgba(0,0,0,0)';
        ctx.value.globalCompositeOperation = 'destination-over';
        drawRoundedRect(ctx.value, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
        ctx.value.stroke();
        if (grid.value[y][x]) {
          ctx.value.drawImage(image, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value);
          // ctx.value.globalCompositeOperation = 'source-over';
        } else {
          ctx.value.fillStyle = 'rgba(0,0,0,0)';
        }
        drawRoundedRect(ctx.value, x * (cellSize.value + spacing), y * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
        ctx.value.fill();
      }
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
function getCurrentGeneration() {
  let aliveCount = 0;
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (grid.value[y][x]) {
        aliveCount++;
      }
    }
  }
  return aliveCount;
}
function gameLoop() {
  update();
  draw();
  if (getCurrentGeneration()) {
    animationId = setTimeout(gameLoop, evolutionSpeed.value);
    generation.value++
  } else {
    switchNFT(state.nftIndex)
  }
}
function update() {
  const newGrid = createEmptyGrid();

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const neighbors = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
      ].reduce((acc, [dx, dy]) => {
        const newY = y + dy;
        const newX = x + dx;

        if (newY >= 0 && newY < gridHeight && newX >= 0 && newX < gridWidth) {
          return acc + (grid.value[newY][newX] ? 1 : 0);
        }

        return acc;
      }, 0);

      if (grid.value[y][x]) {
        newGrid[y][x] = neighbors === 2 || neighbors === 3;
      } else {
        newGrid[y][x] = neighbors === 3;
      }
    }
  }

  grid.value = newGrid;
}
async function start() {
  isStart.value = !isStart.value
  if (!animationId) {
    await gameLoop();
  } else {
    // stop()
  }
}
const switchNFT = (async (index: any) => {
  state.nftIndex = index
  let arr: any = getLitGrids(0, state.cellList[index].numStr,3)
  state.evolutionData = arr
  await clear()
  setTimeout(async () => {
    await start()
  }, 1000)
})
const claimFees = () => {
  clickMusic()
  let cell = state.cellList.map((item: any) => {
    return parseInt(item.tokenId)
  })
  if (state.totalEarnings !== '0') {
    if (cell.length) {
      loadingBar.start()
      showGlobalMessage('Claiming...', 'Claim')
      withdrawFee(cell).then((res: any) => {
        loadingBar.finish()
        showGlobalMessage('Claiming...', 'close')
        showGlobalMessage('Claiming Successful')
        let formData = {
          amount: state.totalEarnings,
          ethAddress: address.value,
          txHash: res.transactionHash
        }
        User.claimFeeLog(formData).then((res: any) => {
        })
        getMyCell()
      })
          .catch((error: any) => {
            showGlobalMessage('Claiming...', 'close')
            loadingBar.finish()
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
const claimFee = debounce(claimFees, 2000);

watch(
    () => state.cellList,
    async () => {
      if (state.cellList.length) {
        await switchDefaultNFT(0)
      } else {
        state.evolutionData = []
        clear()
      }
    }
)
const getClaimLog = () => {
  setTimeout(() => {
    User.getClaimLog(address.value, 1, 1000).then((res: any) => {
      state.claimLog = res.data.list
    })
  }, 1000)
}

const networkStatus = computed(() => {
  return userInfo.networkStatus
})

const goToHashDetail = (url: string) => {
  window.open(`${networkList[networkStatus.value].blockExplorerUrls}/tx/${url}`)
}
const goToPage = (url: string) => {
  window.open(url)
}
watch(
    () => state.logVisible,
    () => {
      if (state.logVisible) {
        clickMusic()
      } else {
        closeMusic()
      }
    }
)
const route = useRoute()
const { nftIndex, cellList, totalEarnings, logVisible, claimLog } = toRefs(state)
</script>

<template>
<div class="cell-container">
  <div class="navigation-container-my">
    <div class="nav-item" @click="router.push({name: 'BitLife'})" :class="route.name === 'BitLife' ? 'nav-item-active' : ''">My BitLife</div>
    <div class="nav-item" @click="router.push({name: 'BitCell'})" :class="route.name === 'BitCell' ? 'nav-item-active' : ''">My BitCell</div>
  </div>
  <div class="evolution-box">
    <div class="evolution-canvas">
      <div class="id">Token ID: {{cellList[nftIndex]?.tokenId}}</div>
      <div class="canvas">
        <canvas ref="canvas" @mouseup="handleMouseUp" @wheel.passive="handleWheel"></canvas>
      </div>
      <div class="no-data-cell" v-if="!loading && !cellList.length">
        <div class="no-data">
          <n-empty size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </div>
      </div>
    </div>
    <div @click="goToDetail(cellList[nftIndex]?.tokenId)" class="button">Detail</div>
  </div>
  <div class="right-container">
    <div class="shop-container">
      <div class="shop-left">
<!--        <div class="shop-item" @click="goToPage('https://testnets.opensea.io/collection/ccc-62')">-->
<!--          <img src="img/cell/opensea.png" alt="">-->
<!--          open sea-->
<!--        </div>-->
<!--        <div class="shop-item">-->
<!--          <img src="img/cell/bnb.png" alt="">-->
<!--          op BNB-->
<!--        </div>-->
      </div>
      <div class="shop-right">
        <div @click="logVisible = true" class="book-icon"></div>
        Earnings
        <n-popover class="tips-text-container" trigger="hover">
          <template #trigger>
            <img class="tips" src="img/layout/tips-icon.png" alt="">
          </template>
          <div class="tips-text">When other users mint BitLife using your BitCell, you can earn minting fees. The fees are determined through dynamic auctions on VRGDA.</div>
        </n-popover>
        :
        {{ utils.fromWei(totalEarnings).slice(0, 8) }} BNB
        <div @click="claimFee" class="withdraw">Withdraw</div>
      </div>
    </div>
    <div class="nft-container">
      <div class="nft-box-container" ref="dataContainer">
        <div v-if="cellList.length" class="nft-box">
          <div class="nft-item" @click="switchNFT(index)"
               @mouseleave="stop()"
               :class="nftIndex === index ? 'nft-item-active' : ''" v-for="(item, index) in cellList">
            <div class="cover-container">
              <img class="cover" :src="item.image" alt="">
            </div>
            <div class="token-id">Token ID</div>
            <div class="address">{{ item.tokenId }}</div>
          </div>
        </div>
        <div v-else-if="!loading" class="no-data">
          <n-empty size="huge">
            <template #icon>
              <img class="empty-icon" src="img/layout/empty.png" alt="">
            </template>
          </n-empty>
        </div>
      </div>
    </div>
  </div>
  <n-modal :mask-closable="false" :close-on-esc="false" v-model:show="logVisible">
    <div class="rewards-log">
      <img @click="logVisible = false" class="close-icon" src="img/layout/close.png" alt="">
      <div class="model-main ">
        <div class="title">Earnings withdrawal record</div>
        <div class="table-title">
          <div class="table-item">
            Time
          </div>
          <div class="table-item">
            RentFee
          </div>
          <div class="table-item">
            Transaction
          </div>
        </div>
        <div class="table-box">
          <div v-if="claimLog.length" class="table" :key="index" v-for="(item, index) in claimLog">
            <div class="table-item">
              {{ formatDate(item.createTime) }}
            </div>
            <div class="table-item active2">
              +{{ item.amount }}
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
</div>
</template>

<style scoped lang="scss">
.cell-container {
  height: 1080px;
  position: relative;
  .right-container-mask {
    width: 1022px;
    height: 706px;
    background-size: 100% 100%;
    position: absolute;
    top: 158px;
    left: 720px;
    background-image: url("img/cell/right.png");
  }
  .right-container {
    left: 130px;
    position: absolute;
    top: 80px;
    width: 1046px;
    height: 735px;
    background-size: 100% 100%;
    background-image: url("img/featured/bitlife-background.png");
    padding: 52px 46px 52px 62px;
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 22px;
      .left {
        display: flex;
        align-items: center;
        font-size: 32px;
        .book {
          width: 62px;
          height: 51px;
          margin-right: 8px;
          cursor: pointer;
        }
        .value {
          font-size: 32px;
          color: #FFE500;
        }
      }
    }
    .description {
      color: #8B8B8B;
      font-size: 18px;
      margin: 22px 0;
      padding: 0 22px;
    }
    .shop-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 98px;
      border-bottom: 2px solid #3775AD;
      padding-bottom: 10px;
      .shop-left {
        display: flex;
        align-items: center;
        gap: 20px;
      }
      .shop-right {
        display: flex;
        align-items: center;
        color: #0ADCF3;
        text-shadow: 0px 0px 0.284px #1158B6;
        font-size: 22px;
        gap: 4px;
        font-family: SnasmBook;
        .book-icon {
          width: 40px;
          height: 40px;
          background-size: 100% 100%;
          background-image: url("img/cell/book.png");
          cursor: pointer;
        }
        .withdraw {
          width: 167px;
          height: 44px;
          text-align: center;
          line-height: 44px;
          color: #559CDC;
          font-size: 22px;
          background-size: 100% 100%;
          cursor: pointer;
          background-image: url("img/cell/withdraw.png");
        }
        .withdraw:hover {
          color: #FFD570;
          background-image: url("img/cell/withdraw-hover.png");
        }
        .book-icon:hover {
          background-image: url("img/cell/book-hover.png");
        }
      }
      .shop-item, .title {
        font-size: 26px;
      }
      .shop-item {
        display: flex;
        align-items: center;
        cursor: pointer;
        img {
          width: 38px;
          height: 38px;
          margin-right: 8px;
        }
      }
    }
    .nft-container {
      margin-top: 14px;
      .nft-box-container {
        width: 100%;
        height: 456px;
        overflow-y: auto;
scrollbar-gutter: stable;
        padding-top: 12px;
      }
      .nft-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        flex-flow: row wrap;
        gap: 32px;
      }
      .nft-box-container::-webkit-scrollbar{
        width:20px;
        display: block;
      }
      .nft-box-container::-webkit-scrollbar-track {
        border-radius: 20px;
        background: #000;
      }
      .nft-box-container::-webkit-scrollbar-thumb{
        border-radius: 20px;
        background: #3780C1;
      }
      .nft-item {
        width: 154px;
        height: 196px;
        background-image: url("img/cell/nft-background.png");
        background-size: 100% 100%;
        cursor: pointer;
        .cover-container {
          width: 85px;
          height: 85px;
          margin-top: 26px;
          margin-left: 50%;
          transform: translateX(-50%);
          background-image: url("img/cell/cover.png");
          background-size: 100% 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          .cover {
            width: 90%;
            height: 90%;
          }
        }
        .token-id {
          text-align: center;
          margin-top: 26px;
          color: #48A2F4;
          text-shadow: 0px 0px 0.284px #1158B6;
          font-size: 22px;
        }
        .address {
          text-align: center;
          color: #27DCF1;
          text-shadow: 0px 0px 0.284px #1158B6;
          font-size: 22px;
        }
      }
      .nft-item-active {
        position: relative;
        //background-image: unset;
        &:after {
          content: '';
          position: absolute;
          width: 174px;
          height: 216px;
          top: -10px;
          left: -10px;
          background-size: 100% 100%;
          background-image: url("img/cell/nft-background-active.png");
        }
      }
    }
  }
  .evolution-box {
    position: absolute;
    right: 150px;
    top: 113px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .evolution-canvas {
      width: 601px;
      height: 627px;
      background-size: 100% 100%;
      background-image: url("img/cell/canvas.png");
      position: relative;
      .no-data-cell {
        position: relative;
        top: 200px;
      }
      .id {
        width: 100%;
        text-align: center;
        top: 66px;
        position: absolute;
        color: #A9EEFF;
        text-shadow: 0px 0px 11.915px #1158B6, 0px 0px 6.808px #1158B6, 0px 0px 3.972px #1158B6, 0px 0px 1.986px #1158B6, 0px 0px 0.567px #1158B6, 0px 0px 0.284px #1158B6;
        font-size: 28px;
        z-index: 2;
      }
      .canvas {
        width: 90%;
        height: 450px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: 120px;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
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
      z-index: 2;
    }
    .button:hover {
      background-image: url("img/mine/btn-detail-hover.png");
    }
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
    top: 55px;
    right: 76px;
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

    .table-title {
      display: grid;
      grid-template-columns: 0.8fr 0.7fr 1fr;
      text-align: center;
      padding: 0 44px;
      .table-item {
        font-size: 32px;
        color: #0ADCF3;
        &:nth-of-type(2) {
          text-align: right;
        }
      }
    }
    .table-box {
      padding: 12px 44px;
      margin-top: 12px;
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
        grid-template-columns: 0.8fr 0.7fr 1fr;
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
</style>