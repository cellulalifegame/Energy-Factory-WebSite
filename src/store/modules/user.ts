import { defineStore } from 'pinia'
import { store } from '../index'
import {networkList} from "src/hooks/web3/network";

interface UserState {
    walletAddress: string | null,
    routerHistory: Object | null,
    isSwap: Boolean,
    viewVisible: Boolean,
    isReload: Boolean,
    userLifeList: Array<any>
    shareVisible: Boolean,
    networkStatus: number,
    currentNetwork: string,
    points: number,
    taskVisible: boolean,
    homeVisible: boolean
    checkAddress: boolean,
    errorMsg: string,
    reloadData: boolean,
    chainStatus: boolean
}

export const useUserStore = defineStore({
    id: 'app-user',
    state: (): UserState => ({
        walletAddress: null,
        routerHistory: null,
        isSwap: false,
        viewVisible: false,
        isReload: false,
        userLifeList: [],
        shareVisible: false,
        networkStatus: 0,
        currentNetwork: networkList[0].chainId,
        points: 0,
        taskVisible: false,
        homeVisible: false,
        checkAddress: false,
        errorMsg: '',
        reloadData: false,
        chainStatus: true
    }),
    getters: {},
    actions: {
        setChainStatus(status: boolean) {
          this.chainStatus = status
        },
        setReloadData(value: boolean) {
          this.reloadData = value
        },
        setErrorMsg(msg: string) {
          this.errorMsg = msg
        },
        setCheckAddress(value: boolean) {
          this.checkAddress = value
        },
        setHomeVisible(value: boolean) {
          this.homeVisible = value
        },
        setTaskVisible(value: boolean) {
            this.taskVisible = value
        },
        setPoints(point: number) {
          this.points = point
        },
        setCurrentNetwork(chainId: string) {
            this.currentNetwork = chainId
        },
        setWalletAddress(walletAddress: any | null) {
            this.walletAddress = walletAddress
        },
        setShareVisible(visible: boolean) {
            this.shareVisible = visible
        },
        setRouterHistory(router: any) {
            this.routerHistory = router
        },
        setIsSwap(value: boolean) {
            this.isSwap = value
        },
        setViewVisible(value: boolean) {
            this.viewVisible = value
        },
        setReload(value: boolean) {
            this.isReload = value
        },
        setUserLifeList(lifeList: Array<any>) {
            this.userLifeList = lifeList
        },
        setNetworkStatus(status: number) {
            localStorage.setItem('network', status.toString())
            this.networkStatus = status
        }
    }
})

export function UserStore() {
    return useUserStore(store)
}
