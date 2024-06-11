<script setup lang="ts">
import { ref } from "vue";
import time0 from "../../assets/images/coming/0.png"
import time1 from "../../assets/images/coming/1.png"
import time2 from "../../assets/images/coming/2.png"
import time3 from "../../assets/images/coming/3.png"
import time4 from "../../assets/images/coming/4.png"
import time5 from "../../assets/images/coming/5.png"
import time6 from "../../assets/images/coming/6.png"
import time7 from "../../assets/images/coming/7.png"
import time8 from "../../assets/images/coming/8.png"
import time9 from "../../assets/images/coming/9.png"
import { useRouter } from "vue-router";
const timeImage = [time0,time1,time2,time3,time4,time5,time6,time7,time8,time9]
const router = useRouter()
function startCountdown(targetTimestamp: number, updateCallback: (countdown: string) => void): () => void {
  let intervalId: ReturnType<typeof setInterval>;
  const updateCountdown = () => {
    const now = new Date().getTime();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
      clearInterval(intervalId);
      updateCallback('00:00:00:00');
      setTimeout(async () => {
        const reload = localStorage.getItem('reload')
        if (reload) {
          await router.push('/welcome')
        } else {
          localStorage.setItem('reload', 'true')
          location.reload()
        }
      }, 1000);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const formattedCountdown = [
      days.toString().padStart(2, '0'),
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');

    updateCallback(formattedCountdown);
  };

  updateCountdown();
  intervalId = setInterval(updateCountdown, 1000);

  return () => clearInterval(intervalId);
}
const targetTimestamp = 1713153600000;
let timeValue: any = ref('00:00:00:00')
const stopCountdown = startCountdown(targetTimestamp, (countdown) => {
  timeValue.value = countdown
});
const openUrl = ((url: string) => {
  window.open(url)
})
</script>

<template>
  <div class="coming-soon-container">
    <div class="title">Website Launching Soon</div>
    <div class="title-2">
      Launching In
    </div>
    <div class="count-down-container">
      <div class="label">UTC<br/><div>(-4)</div></div>
      <div class="description">
        <div class="item">Day</div>
        <div class="item">Hours</div>
        <div class="item">Minutes</div>
        <div class="item">Seconds</div>
      </div>
      <div class="count-down">
        <img :src="timeImage[timeValue[0]]" alt="">
        <img :src="timeImage[timeValue[1]]" alt="">
        <img :src="timeImage[timeValue[3]]" alt="">
        <img :src="timeImage[timeValue[4]]" alt="">
        <img src="img/coming/colon.png" alt="">
        <img :src="timeImage[timeValue[6]]" alt="">
        <img :src="timeImage[timeValue[7]]" alt="">
        <img src="img/coming/colon.png" alt="">
        <img :src="timeImage[timeValue[9]]" alt="">
        <img :src="timeImage[timeValue[10]]" alt="">
      </div>
    </div>
    <div class="footer-container">
      <div class="button-item" @click="openUrl('https://medium.com/@cellulalifegame/come-get-your-one-million-cell-token-in-the-cellula-game-9feaa4c1cbbb')">Introduction</div>
      <div class="social-item twitter" @click="openUrl('https://twitter.com/cellulalifegame')"></div>
      <div class="social-item discord" @click="openUrl('https://discord.com/invite/2PMU2NvDcm')"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.coming-soon-container {
  width: 1920px;
  height: 1080px;
  background-image: url("src/assets/images/welcome/background.png");
  background-repeat: no-repeat;
  background-size: 1920px 1080px;
  position: relative;
  padding-top: 180px;
  .title {
    color: #FFE662;
    text-align: center;
    text-shadow: 0px 0px 23.912px #C25E00, 0px 0px 13.664px #C25E00, 0px 0px 7.971px #C25E00, 0px 0px 3.985px #C25E00, 0px 0px 1.139px #C25E00, 0px 0px 0.569px #C25E00;
    font-size: 70px;
  }
  .title-2 {
    color: #A9EEFF;
    font-size: 60px;
    text-align: center;
    margin-top: 20px;
  }
  .count-down-container {
    width: 1338px;
    height: 288px;
    margin-top: 92px;
    margin-left: 50%;
    transform: translateX(-50%);
    background-size: 100% 100%;
    background-image: url("img/coming/count-down.png");
    position: relative;
    .label {
      color: #A9EEFF;
      text-shadow: 0px 0px 14.616px #2A86FE, 0px 0px 8.352px #2A86FE, 0px 0px 4.872px #2A86FE, 0px 0px 2.436px #2A86FE, 0px 0px 0.696px #2A86FE, 0px 0px 0.348px #2A86FE;
      font-size: 60px;
      position: absolute;
      top: 78px;
      left: 121px;
      text-align: center;
      div {
        font-size: 40px;
      }
    }
    .count-down {
      position: absolute;
      left: 351px;
      top: 78px;
      img {
        width: 64px;
        height: 100px;
        &:nth-of-type(1) {
          margin-right: 43px;
        }
        &:nth-of-type(2) {
          margin-right: 69px;
        }
        &:nth-of-type(3) {
          margin-right: 45px;
        }
        &:nth-of-type(4) {
          margin-right: 3px;
        }
        &:nth-of-type(5) {
          margin-right: 3px;
        }
        &:nth-of-type(6) {
          margin-right: 43px;
        }
        &:nth-of-type(7) {
          margin-right: 5px;
        }
        &:nth-of-type(8) {
          margin-right: 1px;
        }
        &:nth-of-type(9) {
          margin-right: 46px;
        }
      }
      display: flex;
    }
    .description {
      position: absolute;
      display: flex;
      left: 404px;
      bottom: 33px;
      .item {
        color: #62B3FF;
        font-size: 30px;
        &:nth-of-type(1) {
          margin-right: 156px;
        }
        &:nth-of-type(2) {
          margin-right: 128px;
        }
        &:nth-of-type(3) {
          margin-right: 100px;
        }
      }
    }
  }
  .footer-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
    .button-item {
      width: 291px;
      height: 90px;
      line-height: 90px;
      text-align: center;
      background-image: url("img/layout/btn-social.png");
      color: #569DDD;
      font-size: 32px;
      background-size: 100% 100%;
      cursor: pointer;
    }
    .button-item:hover {
      background-image: url("img/layout/btn-social-hover.png");
      color: #FFE78B;
      text-shadow: 0px 0px 13.306px #D65600, 0px 0px 7.603px #D65600, 0px 0px 4.435px #D65600, 0px 0px 2.218px #D65600, 0px 0px 0.634px #D65600, 0px 0px 0.317px #D65600;
    }
    .social-item {
      width: 90px;
      height: 90px;
      background-size: 100% 100%;
      cursor: pointer;
    }
    .twitter {
      background-image: url("img/layout/twitter.png");
    }
    .twitter:hover {
      background-image: url("img/layout/twitter-hover.png");
    }
    .discord {
      background-image: url("img/layout/discord.png");
    }
    .discord:hover {
      background-image: url("img/layout/discord-hover.png");
    }
  }
}
</style>