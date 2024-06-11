<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset';
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
      :type="props.type || 'button'"
      :disabled="props.disabled"
      @click="onClick">
    {{ props.buttonText }}
  </button>
</template>

<style scoped lang="scss">
button {
  padding: 8px 42px;
  border: none;
  font-size: 28px;
  cursor: pointer;
  border-radius: 10px;
  font-family: Snasm;
  color: #FFE500;
  background-image: url("img/layout/button.png")!important;
  background-size: 100% 100%;
  outline: none!important;
  &:hover {
    color: #111;
    background-image: url("img/layout/button-hover.png")!important;
  }
  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
}
</style>