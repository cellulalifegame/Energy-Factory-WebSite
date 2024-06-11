<script setup lang="ts">
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  GlobalThemeOverrides
} from 'naive-ui'
import { networkList } from 'src/hooks/web3/network';
import { computed, provide, ref } from 'vue'
import GlobalMessage from '../src/view/layout/GlobalMessage.vue'
import { reconnect, watchAccount, watchConnections } from '@wagmi/core'
import { createWeb3Modal, useWeb3ModalEvents, useWeb3Modal } from '@web3modal/wagmi/vue'
import { onMounted, watch } from "vue";
import { config } from "./hooks/config";
import { useUserStore } from "store/modules/user";
import { useRouter, useRoute } from "vue-router";

const userInfo = useUserStore()
const projectId = '8b3fa7c95ab1c2257bfe4a9cd850ca57'

const themeColor: string = '#21846A'
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: themeColor,
  },
  Input: {
    borderFocus: themeColor,
    borderHover: themeColor,
    border: 'none',
    borderRadius: '25px'
  },
  Button: {
    borderFocus: themeColor,
    borderHover: themeColor,
    colorHoverPrimary: themeColor,
    colorFocusPrimary: themeColor,
    borderFocusPrimary: themeColor,
    borderHoverPrimary: themeColor,
    colorPressedPrimary: themeColor,
    borderPressedPrimary: themeColor
  },
  Select: {
    peers: {
      InternalSelection: {
        borderFocus: themeColor,
        borderHover: themeColor,
        border: 'none'
      },
    }
  },
  Pagination: {
    itemTextColorHover: themeColor,
    buttonBorder: 'none'
  },
  PageHeader: {
    backColorHover: themeColor,
    backColor: '#fff',
    titleTextColor: '#fff'
  },
  Slider: {
    railHeight: '0'
  }
}

const globalMessageRef = ref<any>(null);

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: false, // Optional - false as default
  allWallets: 'ONLY_MOBILE',
  featuredWalletIds: [
      '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
      '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',
      '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
      '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
      '7674bb4e353bf52886768a3ddc2a4562ce2f4191c80831291218ebd90f5f5e26',
      '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66'
  ]
})
const modal = useWeb3Modal()
onMounted(async () => {
  let connector = config.connectors[0]
  await reconnect(config, {connector} as any).then((res: any) => {
    if (!res.length) {
      const code = route.query.code
      const name = route.query.name
      if (code && !name) {
        router.push(`/welcome?code=${code}`)
      } else if (name && !code) {
        router.push(`/welcome?name=${name}`)
      } else if (name && code) {
        router.push(`/welcome?name=${name}&code=${code}`)
      } else {
        router.push('/welcome')
      }
      modal.open()
    }
  })
})
watch(
    () => watchAccount(config, {
      onChange(account) {
        if (account.address) {
          userInfo.setWalletAddress(account.address)
        }
      }
    }),
    () => {
    }
)
const networkStatus = computed(() => {
  return userInfo.networkStatus
})
watch(
    () => watchConnections(config, {
      onChange(data) {
        if (data.length) {
          let chainId = data[0].chainId
          if (chainId === networkList[networkStatus.value].id) {
            userInfo.setChainStatus(true)
          } else {
            userInfo.setChainStatus(false)
          }
        }
      }
    }),
    () => {
    }
)
const showGlobalMessage = (
    message: string,
    type = 'info',
    duration = 3000
) => {
  globalMessageRef.value?.showMessage(message, type, duration);
};
const event: any = useWeb3ModalEvents()
const router = useRouter()
const route = useRoute()
watch(
    () => event.data,
    () => {
      if (event.data?.properties?.connected === false) {
        userInfo.setWalletAddress(null)
        const code = route.query.code
        const name = route.query.name
        if (code && !name) {
          router.push(`/welcome?code=${code}`)
        } else if (name && !code) {
          router.push(`/welcome?name=${name}`)
        } else if (name && code) {
          router.push(`/welcome?name=${name}&code=${code}`)
        } else {
          router.push('/welcome')
        }
      }
    }
)
provide('showGlobalMessage', showGlobalMessage);
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <n-message-provider :duration="5000000">
      <n-dialog-provider>
        <n-loading-bar-provider>
          <router-view></router-view>
          <GlobalMessage ref="globalMessageRef"></GlobalMessage>
        </n-loading-bar-provider>
      </n-dialog-provider>
    </n-message-provider>
  </NConfigProvider>
</template>

<style lang="scss">
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: Snasm;
  line-height: normal;
  font-size: 12px;
  zoom: 100%;
  touch-action: manipulation;
  -ms-touch-action: manipulation;
  user-scalable: no;
  color: #F8F0D8;
  background-color: #111111;
}
*{
  box-sizing: border-box;
  font-size: 18px;
  background-size: 100% 100%;
}
::-webkit-scrollbar {
  width: 0px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
a{
  text-decoration:none;
  color:unset;
}
</style>
