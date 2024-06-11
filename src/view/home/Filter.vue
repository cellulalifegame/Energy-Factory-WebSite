<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  filterData: {
    type: Object as any,
    default: 1
  },
  type: {
    type: String,
    default: 'work'
  }
})
const value = ref([0,5000])
const options = ref(['Hashrate high to low', `${props.type === 'convert' ? 'Cost' : 'Token ID'} high to low`, 'Hashrate  low to high', `${props.type === 'convert' ? 'Cost' : 'Token ID'} low to high`])
const currentIndex = ref(0)
const confirmFilter = () => {
  const firstNumber = value.value[0];
  const secondNumber = value.value[1];

  const maxHashRate = Math.max(firstNumber, secondNumber);
  const minHashRate = Math.min(firstNumber, secondNumber);

  const formData = {
    sortType: currentIndex.value + 1,
    maxHashRate: maxHashRate,
    minHashRate: minHashRate
  };
  emit('confirmFilter', formData)
};
if (props.filterData !== null) {
  value.value[0] = props.filterData.minHashRate
  value.value[1] = props.filterData.maxHashRate
  currentIndex.value = props.filterData.sortType - 1
}
const emit = defineEmits(['confirmFilter', 'resetFilter'])
watch(
    () => value.value[0],
    (newValue, oldValue) => {
      if (newValue < 0) {
        value.value[0] = 0;
      }
      const minGap = 100;
      if (value.value[1] - newValue < minGap) {
        value.value[1] = newValue + minGap;
        if (value.value[1] > 5000) {
          value.value[1] = 5000;
          value.value[0] = value.value[1] - minGap;
        }
      }
    },
    { immediate: true }
);

watch(
    () => value.value[1],
    (newValue, oldValue) => {
      if (newValue > 5000) {
        value.value[1] = 5000;
      }
      const minGap = 100;
      if (newValue - value.value[0] < minGap) {
        value.value[0] = newValue - minGap;
        if (value.value[0] < 0) {
          value.value[0] = 0;
          value.value[1] = value.value[0] + minGap;
        }
      }
    },
    { immediate: true }
);
</script>

<template>
<div class="filter-container">
  <div class="title-top">
    Hashrate
  </div>
  <div class="scale-container">
    <div class="radius">{{value[0]}}~{{value[1]}}</div>
    <n-slider :min="0" :max="5000" v-model:value="value" range :step="100" />
    <div class="text-container">
      <div class="text">0</div>
      <div class="text">1K</div>
      <div class="text">2K</div>
      <div class="text">3K</div>
      <div class="text">4K</div>
      <div class="text">5K+</div>
    </div>
  </div>
  <div class="sort-title">Sort</div>
  <div class="option-container">
    <div class="option-item" @click="currentIndex = index" :class="index === currentIndex ? 'option-item-active' : ''" v-for="(item, index) in options" :key="index">
      {{ item }}
    </div>
  </div>
  <div class="button-container">
    <div class="button" @click="emit('resetFilter')">
      <div class="reset-icon"></div>
      Reset
    </div>
    <div class="button" @click="confirmFilter">
      <div class="confirm-icon"></div>
      Confirm
    </div>
  </div>
</div>
</template>

<style scoped lang="scss">
.filter-container {
  width: 514px;
  height: 617px;
  background-size: 100% 100%;
  background-image: url("img/filter/bg.png");
  padding: 35px;
  transform: translateX(38px);
  .title-top {
    color: #3775AD;
    font-size: 30px;
    padding-left: 12px;
  }
  .scale-container {
    margin-top: 18px;
    width: 439px;
    height: 24px;
    background-size: 100% 100%;
    background-image: url("img/filter/slider-bg.png");
    padding: 7px 24px 12px;
    position: relative;
    .radius {
      position: absolute;
      color: #FFE78B;
      font-size: 14px;
      left: 50%;
      top: -24px;
      transform: translateX(-50%);
    }
    .text-container {
      width: 100%;
      position: absolute;
      bottom: -14px;
      left: 0;
      display: grid;
      grid-template-columns: 27px 1fr 1fr 1fr 1fr 1fr;
      .text {
        color: #FFF;
        font-size: 14px;
        text-align: right;
      }
    }
  }
  .sort-title {
    color: #3775AD;
    font-size: 28px;
    margin-top: 44px;
    padding-left: 12px;
  }
  .option-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-right: 8px;
    padding-top: 25px;
    gap: 35px;
    .option-item {
      width: 378px;
      height: 45px;
      background-size: 100% 100%;
      background-image: url("img/filter/option.png");
      color: #3780C1;
      font-size: 24px;
      text-align: center;
      line-height: 44px;
      cursor: pointer;
    }
    .option-item-active {
      color: #FFE78B;
      background-image: url("img/filter/option-active.png");
    }
  }
  .button-container {
    margin-top: 22px;
    display: flex;
    align-items: center;
    gap: 14px;
    justify-content: center;
    .button {
      color: #569DDD;
      text-align: center;
      font-size: 22px;
      width: 184px;
      height: 68px;
      background-size: 100% 100%;
      line-height: 72px;
      cursor: pointer;
      background-image: url("img/filter/btn.png");
      display: flex;
      align-items: center;
      justify-content: center;
      .confirm-icon {
        width: 36px;
        height: 30px;
        background-size: 100% 100%;
        background-image: url("img/filter/confirm.png");
      }
      .reset-icon {
        width: 36px;
        height: 35px;
        background-size: 100% 100%;
        background-image: url("img/filter/reset.png");
        margin-right: 6px;
      }
    }
    .button:hover {
      background-image: url("img/filter/btn-hover.png");
      text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 0px 13.306px #D65600, 0px 0px 7.603px #D65600, 0px 0px 4.435px #D65600, 0px 0px 2.218px #D65600, 0px 0px 0.634px #D65600, 0px 0px 0.317px #D65600;
      color: #FFE78B;
      .confirm-icon {
        background-image: url("img/filter/confirm-hover.png");
      }
      .reset-icon {
        background-image: url("img/filter/reset-hover.png");
      }
    }
  }
}
</style>