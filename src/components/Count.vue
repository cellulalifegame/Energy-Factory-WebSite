<script setup lang="ts">
const props = defineProps({
  currentCount: {
    type: Number,
    default: 1
  }
})
const addCount = () => {
  if (props.currentCount < 10) {
    emit('addCount')
  }
}
const subtractCount = () => {
  if (props.currentCount > 1) {
    emit('subtractCount')
  }
}
const emit = defineEmits(['addCount', 'subtractCount'])
</script>

<template>
<div class="step-container">
  <div class="button" @click="subtractCount"></div>
  <div class="value">{{ currentCount }}</div>
  <div class="button add" @click="addCount"></div>
</div>
</template>

<style scoped lang="scss">
.step-container {
  width: 158px;
  height: 54px;
  background: rgb(24,41,68);
  border: 2px solid rgb(41,69,112);
  position: relative;
  border-radius: 12px;
  line-height: 56px;
  text-align: center;
  .value {
    color: #569DDD;
    font-size: 30px;
  }
  .button {
    left: -17px;
    position: absolute;
    width: 54px;
    height: 54px;
    background-size: 100% 100%;
    top: -2px;
    cursor: pointer;
    background-image: url("img/mint/subtract.png");
  }
  .add {
    left: unset;
    right: -13px;
    background-image: url("img/mint/add.png");
  }
}
</style>