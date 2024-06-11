<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset' | 'small' | 'back' | 'small-button';
  disabled?: boolean;
  buttonText: string;
}>()

const emit = defineEmits<{
  (e: 'click'): void;
}>()

const onClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<template>
  <button
      :class="props.type || 'button'"
      :disabled="props.disabled"
      @click="onClick">
    {{ props.buttonText }}
  </button>
</template>

<style scoped lang="scss">
button {
  border: none;
  cursor: pointer;
  border-radius: 9.691px;
  font-family: Snasm;
  color: #0AF3A5;
  font-size: 36px;
  width: 566px;
  height: 72px;
  padding: unset;
  background: url("img/featured/mint-btn.png");
  background-size: 100% 100%;
  line-height: 72px;
  outline: none!important;
  &:disabled {
    cursor: not-allowed;
  }
}
button:hover {
  color: #0AF3A5;
  background: url("img/featured/btn-mint-hover.png");
  background-size: 100% 100%;
}
.small {
  width: 489px;
  height: 72px;
  background-image: url("img/layout/small-btn.png");
  background-size: 100% 100%;
}
.small:hover {
  background-image: url("img/layout/small-btn-hover.png");
}
.small-button {
  scale: 0.8;
  &:nth-of-type(1) {
    transform: translateX(42px);
  }
  &:nth-of-type(2) {
    transform: translateX(-42px);
  }
}
.small-button:hover {

}
.back {
  background-image: url("img/layout/back-btn.png");
  color: #569DDD;
}
.back:hover {
  color: #78BFFF;
  background-image: url("img/layout/back-btn-hover.png");
}
.cancel {
  background: url("img/layout/cancel.png");
  color: #ECE2CB;
  background-size: 100% 100%;
  line-height: 60px;
  background-position-y: 4px;
}
</style>