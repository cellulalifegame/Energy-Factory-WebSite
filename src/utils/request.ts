import Axios, { AxiosResponse } from 'axios'
import { Debounced } from 'src/utils/utils'
import { useUserStore } from 'store/modules/user'
import { computed } from 'vue';
import { networkList } from 'src/hooks/web3/network';
const UserStore = useUserStore()

const networkStatus = computed(() => {
    return UserStore.networkStatus
})
// interface Result<T = any> {
//   code: number
//   type: 'success' | 'error' | 'warning'
//   message: string
//   result: T
// }

const envMode = import.meta.env.MODE
// const network = localStorage.getItem('network')
// if (network) {
//     UserStore.setNetworkStatus(parseInt(network))
// }
const URL = networkList[networkStatus.value].api
let baseURL: any = '/api'
if (envMode === 'development') {
    // baseURL = URL
} else {
    baseURL = URL
}

const axios = Axios.create({
    baseURL,
    timeout: 50000,
    withCredentials: true
})
axios.defaults.withCredentials = true

// const responseHandle = {
//   200: () => {}
// }

axios.interceptors.request.use(
    (config) => {
        config.withCredentials = true
        const token = localStorage.getItem('token')
        if (token) {
            // @ts-ignore
            config.headers['token'] = token
        }
        // const token = ''
        // token && (config.headers.Authorization = token)
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
const alertInformation = (async () => {
    localStorage.clear()
    window.$message.warning('Login information expired please log in again')
    let url = location.origin + '/#/collections/trade'
    window.location.href = url
})
const debouncedUse: any = new Debounced().use(alertInformation, 2000)
axios.interceptors.response.use(
    (response: AxiosResponse<any>) => {
        const {status, data}: any = response
        if (data.code !== 200 && data.code !== 401 && data.code !== 403) {
            if (data.msg) {
                window.$message.error(data.msg)
            }
        }
        if (data.code === 401) {
            response.data.data = null
            debouncedUse()
        }
        return response.data
    },
    (error) => {
        if (error.response && error.response.data) {
            const code = error.response.status
            const msg = error.response.data.message
        } else {
        }
        return Promise.reject(error)
    }
)

export default axios