<script setup lang="ts">
import { getSrc } from 'src/utils/utils'
import { onMounted, onUnmounted, ref } from 'vue'
import { GameOfLife } from 'src/utils/gameOfLife'
import LifePng from 'img/workbench/life.png'
import endImg from 'img/craft/start-active.png'
import button2 from 'img/craft/start.png'
const image = new Image();
image.src = LifePng

const canvas: any = ref(null);
const ctx: any = ref(null);
const cellSize = ref(48);
const evolutionSpeed = ref(50);
const canvasPosition = ref({ x: 0, y: 0 });
let activeCells: any = ref([])

const gridWidth = 100;
const gridHeight = 100;
let animationId: any = null;
const generation: any = ref(0)
const props = defineProps({
  evolutionData: {
    type: Array as any,
    default: null
  }
})
const isStart = ref(false)
let globalBounds: [number, number, number, number] = [0, 0, 0, 0];
const draw = (activeCells: Array<[number, number]>): void => {
  ctx.value.clearRect(0, 0, canvas.value.width + 10, canvas.value.height + 10);
  ctx.value.save(); // Save the context state
  ctx.value.lineWidth = 1;
  const offsetXTranslate = Math.max(0, offset.value.x);
  const offsetYTranslate = Math.max(0, offset.value.y);
  ctx.value.translate(offsetXTranslate, offsetYTranslate);
  const spacing = 1;

  const activeCellSet: Set<string> = new Set(activeCells.map(([row, col]) => `${row},${col}`));

  const bounds: [number, number, number, number] = calculateBounds(activeCells)
  const offsetRow = Math.max(0, -bounds[0]);
  const offsetCol = Math.max(0, -bounds[2]);

  for (let row = bounds[0]; row <= bounds[1]; row++) {
    for (let col = bounds[2]; col <= bounds[3]; col++) {
      ctx.value.beginPath();
      ctx.value.strokeStyle = 'rgba(0,0,0,0)';
      ctx.value.globalCompositeOperation = 'destination-over';
      drawRoundedRect(ctx.value, (col + offsetCol) * (cellSize.value + spacing), (row + offsetRow) * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
      ctx.value.stroke();

      if (activeCellSet.has(`${row},${col}`)) {
        ctx.value.drawImage(image, (col + offsetCol) * (cellSize.value + spacing), (row + offsetRow) * (cellSize.value + spacing), cellSize.value, cellSize.value);
      } else {
        ctx.value.fillStyle = 'rgba(0,0,0,0)';
      }
      drawRoundedRect(ctx.value, (col + offsetCol) * (cellSize.value + spacing), (row + offsetRow) * (cellSize.value + spacing), cellSize.value, cellSize.value, 5);
      ctx.value.fill();
    }
  }
  ctx.value.restore();
};
const calculateBounds = (activeCells: Array<[number, number]>): [number, number, number, number] => {
  const newBounds = activeCells.reduce(
      ([minRow, maxRow, minCol, maxCol], [row, col]) => [
        Math.min(minRow, row),
        Math.max(maxRow, row),
        Math.min(minCol, col),
        Math.max(maxCol, col),
      ],
      [Infinity, -Infinity, Infinity, -Infinity]
  );

  globalBounds = [
    Math.min(globalBounds[0], newBounds[0]),
    Math.max(globalBounds[1], newBounds[1]),
    Math.min(globalBounds[2], newBounds[2]),
    Math.max(globalBounds[3], newBounds[3]),
  ];

  return globalBounds;
};
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

function gameLoop() {
  const game: any = new GameOfLife()
  activeCells.value.forEach((cell: any) => {
    game.addCell(+cell[0],+cell[1])
  })
  game.step();
  activeCells.value = game.activeCells
  draw(activeCells.value);
  animationId = setTimeout(gameLoop, (101 - evolutionSpeed.value) * 10);
  generation.value++
}

function start() {
  isStart.value = !isStart.value
  if (!animationId) {
    gameLoop();
  } else {
    stop()
  }
}

function stop() {
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
}

function clear() {
  stop();
  isStart.value = false
  offset.value.x = 0
  offset.value.y = 0
  globalBounds = [0,0,0,0]
  canvas.value.style.transform = `translate(${0}px, ${0}px)`;
  ctx.value = canvas.value.getContext('2d');
  cellSize.value = 48
  canvas.value.width = 1505;
  canvas.value.height = 1450;
  activeCells.value = props.evolutionData
  draw(activeCells.value);
  generation.value = 0
}

let isMouseDown = false;


function handleMouseUp() {
  isMouseDown = false;
}
const offset = ref({
  x: 0,
  y: 0
})
function handleWheel(event: any) {
  event.preventDefault();
  const { offsetX, offsetY } = event;
  const prevCellSize = cellSize.value;

  if (event.deltaY < 0) {
    if (cellSize.value < 48 && cellSize.value + 2 <= 48) {
      cellSize.value += 2;
    } else {
      cellSize.value = 48;
    }
  } else {
    if (cellSize.value > 5) {
      cellSize.value = Math.max(5, cellSize.value - 2);
    }
  }

  // Calculate the new offsets based on the mouse position and the changed cell size.
  const scaleChange = cellSize.value / prevCellSize;
  const newXOffset = offsetX * (1 - scaleChange);
  const newYOffset = offsetY * (1 - scaleChange);

  // Set limits for the offsets to keep the content within the canvas.
  const minXOffset = Math.min(0, canvas.value.width - gridWidth * cellSize.value);
  const minYOffset = Math.min(0, canvas.value.height - gridHeight * cellSize.value);

  // Apply the offsets within the limits.
  offset.value.x = Math.min(0, Math.max(minXOffset, offset.value.x + newXOffset));
  offset.value.y = Math.min(0, Math.max(minYOffset, offset.value.y + newYOffset));
  // const bounds: [number, number, number, number] = calculateBounds(activeCells.)
  // let maxBounds = Math.max.apply(null, bounds)
  // console.log(maxBounds)
  canvas.value.width = gridWidth * cellSize.value + 10;
  canvas.value.height = gridHeight * cellSize.value + 10;
  draw(activeCells.value);
}

function getCurrentGeneration() {
  return activeCells.value.length;
}
let startX = 0;
let startY = 0;
let checkerboard: any = ref(null)

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
const formatTooltip = ((value: any) => `${(value / 10)} T / S`)
const emit = defineEmits(['closeEvolutionVisible'])
const closeEvolutionVisible = (() => {
  emit('closeEvolutionVisible')
})
const tooltip = ref(false)
onMounted(() => {
  activeCells.value = props.evolutionData
  ctx.value = canvas.value.getContext('2d');
  canvas.value.width = 1505;
  canvas.value.height = 1450;
  image.addEventListener('load', () => {
    draw(activeCells.value);
  });
  setTimeout(() => {
    tooltip.value = true
  }, 1000)
});

onUnmounted(() => {
  stop();
});

</script>

<template>
  <div class="Evolution-container">
    <div class="close-img" @click="closeEvolutionVisible"></div>
    <div class="view-main">
      <div class="plotting-scale">
        1&nbsp;/&nbsp;{{ cellSize === 48 ? 1 : (cellSize / 48).toFixed(1) }}
      </div>
      <div class="chessboard">
        <div
            class="checkerboard"
            ref="checkerboard"
            @mousedown="handleDragStart"
            @mousemove="handleDragMove"
            @mouseup="handleDragEnd"
            @wheel.prevent="handleWheel"
        >
          <canvas ref="canvas" @mouseup="handleMouseUp"></canvas>
        </div>
      </div>
      <div class="data-view">
        <div class="data-block">
          <div class="label">Generation:</div>
          <div class="value">{{ generation }}</div>
        </div>
        <div class="data-block">
          <div class="label">Active Cell&nbsp;Now:</div>
          <div class="value">{{ getCurrentGeneration() }}</div>
        </div>
      </div>
      <div class="button-container">
        <div class="progress">
          <img class="step" :style="`width: calc(${evolutionSpeed}% - 20px);`" src="img/craft/step.png" alt="">
          <div class="progress-step"></div>
          <n-slider :tooltip="tooltip" v-model:value="evolutionSpeed" :format-tooltip="formatTooltip" :min="10">
            <template #thumb>
              <n-icon-wrapper :size="24" :border-radius="12">
                <img class="step-img" src="img/craft/sliding.png" alt="">
              </n-icon-wrapper>
            </template>
          </n-slider>
        </div>
        <div class="button1" @click="clear"></div>
        <div class="button2" :class="isStart ? 'button2-active' : ''" @click="start"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Evolution-container {
  width: 715px;
  height: 645px;
  background-image: url("img/craft/evolation.png");
  background-size: 100% 100%;
  padding-top: 63px;
  padding-left: 40px;
  position: relative;
  margin-left: 50%;
  transform: translateX(-50%);
  .plotting-scale {
    position: absolute;
    width: 183px;
    height: 42px;
    background-image: url("img/craft/plotting.png");
    background-size: 100% 100%;
    left: 50%;
    transform: translate(-50%, 0);
    bottom: 122px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #3178CB;
    font-size: 20px;
    line-height: 42px;
    letter-spacing: 0.06em;
    z-index: 1;
  }

  .close-img {
    width: 62px;
    height: 62px;
    background-size: 100% 100%;
    background-image: url("img/layout/close.png");
    position: absolute;
    top: 32px;
    right: 38px;
    cursor: pointer;
  }
  .close-img:hover {
    background-image: url("img/layout/close-hover.png");
  }
  .view-main {
    width: 628px;
  }

  .chessboard {
    height: 452px;
    border-radius: 27px;
    box-sizing: border-box;
    padding: 20px 60px 42px;
    .checkerboard {
      height: 100%;
      overflow: hidden;
      position: relative;
    }
  }

  .data-view {
    display: flex;
    margin-top: 26px;
    gap: 22px;
    padding-left: 12px;
    .data-block {
      width: 280px;
      height: 78px;
      background-size: 100% 100%;
      box-sizing: border-box;
      line-height: 26px;
      padding-top: 12px;
      .label {
        color: #0ADCF3;
        font-size: 20px;
      }

      .value {
        font-size: 20px;
        color: #F1BB2B;
      }
    }
  }

  .button-container {
    display: flex;
    align-items: center;
    margin-top: 15px;
    width: 704px;
    position: absolute;
    bottom: -96px;
    left: 10px;
    .button1 {
      width: 90px;
      height: 90px;
      background-image: url("img/craft/reload.png");
      background-size: 100% 100%;
      cursor: pointer;
    }
    .button1:hover {
      background-image: url("img/craft/reload-hover.png");
    }

    .button2 {
      width: 159px;
      height: 90px;
      margin-left: 10px;
      cursor: pointer;
      background-size: 100% 100%;
      background-image: url("img/craft/start.png");
    }
    .button2:hover {
      background-image: url("img/craft/start-active.png");
    }
    .button2-active {
      background-image: url("img/workbench/pause.png");
    }
    .button2-active:hover {
      background-image: url("img/workbench/pause-hover.png");
    }
    .progress {
      height: 36px;
      width: 427px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      position: relative;
      margin-right: 22px;
      .progress-step {
        height: 36px;
        width: 427px;
        position: absolute;
        left: 0;
        top: 0;
        background-image: url("img/craft/progress-container.png");
        background-size: 100% 100%;
      }
      .step-img {
        width: 40px;
        height: 34px;
        z-index: 5;
      }
      .n-slider {
        width: 89%;
        margin-left: 32px;
      }
      .step {
        width: calc(100% - 20px);
        height: 12px;
        //object-fit: cover;
        position: absolute;
        //margin-left: 32px;
      }
    }
  }
}
</style>
