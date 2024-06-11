<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

interface Message {
  id: number;
  text: string;
}

const messages = ref<Message[]>([]);

let nextMessageId = 0;
let loadingMessage = ref('')
let loadingMessageVisible = ref(false)
const showMessage = (msg: string, type?:string) => {
  console.log(type, loadingMessage.value);
  if (msg === loadingMessage.value) {
    closeLoadingMessage()
  } else {
    if (type === 'info') {
      const id = nextMessageId++;
      messages.value.push({ id, text: msg });

      setTimeout(() => {
        messages.value = messages.value.filter(message => message.id !== id);
      }, 5000);
    } else {
      if (type === 'close') {
        setTimeout(() => {
          progressValue.value = 0
          loadingMessageVisible.value = false
          loadingMessage.value = ''
        }, 200)
      } else {
        loadingMessageVisible.value = true
        loadingMessage.value = msg
        increaseProgressBar(5000,90)
      }
    }
  }
};
const progressValue = ref(0)
function increaseProgressBar(duration: number, target: number) {
  let start = 0;
  const end = target;
  const incrementTime = duration / end;
  const interval = setInterval(() => {
    start++;
    progressValue.value = start
    if (!loadingMessageVisible.value) {
      clearInterval(interval);
    }
    if (start >= end) {
      clearInterval(interval);
    }
  }, incrementTime);
}
onUnmounted(() => {
  messages.value = [];
});
function closeMessage(id: number) {
  messages.value = messages.value.filter(message => message.id !== id);
}
function closeLoadingMessage() {
  loadingMessageVisible.value = false
  loadingMessage.value = ''
  progressValue.value = 0
}
defineExpose({ showMessage });
</script>

<template>
  <div class="GlobalMessage-container">
      <div class="global-container">
        <transition-group
            enter-active-class="animate__animated animate__bounceInRight"
            leave-active-class="animate__animated animate__bounceOutRight"
            mode="out-in"
            tag="div"
        >
          <div
              class="global-message"
              v-if="loadingMessageVisible"
          >
            <div class="message-container">
              <div class="text">{{ loadingMessage }}</div>
              <div class="progress-container">
                <div class="progress-block" :style="{width: `${progressValue}%`}"></div>
              </div>
              <div @click="closeLoadingMessage" class="message-close"></div>
            </div>
          </div>
        </transition-group>
      </div>
      <div class="global-container">
        <transition-group
            enter-active-class="animate__animated animate__bounceInRight"
            leave-active-class="animate__animated animate__bounceOutRight"
            mode="out-in"
            tag="div"
        >
        <div
            class="global-message"
            v-for="message in messages"
            :key="message.id"
        >
          <div class="message-container default-message">
            <div class="text">{{ message.text }}</div>
            <div @click="closeMessage(message.id)" class="message-close"></div>
          </div>
        </div>
        </transition-group>
      </div>
  </div>
</template>

<style lang="scss">
.GlobalMessage-container {
  z-index: 100000;
  position: fixed;
  top: 120px;
  right: 50px;
  .global-container {
  }
  .global-message {
    width: 359px;
    height: 124px;
    background-image: url("img/layout/message.png");
    background-size: 100% 100%;
    padding: 10px 40px;
    border-radius: 4px;
    color: #FFF372;
    text-align: center;
    text-shadow: 0px 0px 9.016px #C85C04, 0px 0px 5.152px #C85C04, 0px 0px 3.005px #C85C04, 0px 0px 1.503px #C85C04, 0px 0px 0.429px #C85C04, 0px 0px 0.215px #C85C04;
    font-size: 20px;
    margin-bottom: 12px;
    .message-container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      .progress-container {
        width: 239px;
        height: 16px;
        background-size: 14px 16px;
        background-image: url("img/layout/message-block-no.png");

        position: absolute;
        bottom: 16px;
        .progress-block {
          width: 14px;
          height: 16px;
          background-size: 14px 16px;
          background-image: url("img/layout/message-block.png");
        }
      }
    }
    .default-message {
      position: relative;
      .progress-container {
        display: none;
      }
    }
    .message-close {
      position: absolute;
      background-image: url("img/layout/message-close.png");
      background-size: 100% 100%;
      width: 19px;
      height: 17px;
      right: 0;
      top: 10px;
      cursor: pointer;
    }
  }
  .text {
    max-width: 230px;
    word-wrap: break-word;
    text-align: center;
    font-size: 17px;
    margin-top: -5px;
  }
}
</style>
