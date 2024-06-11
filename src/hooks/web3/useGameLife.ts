import { contractAbiMap, ContractAbiTypeEnum } from 'src/enums/contractAbiEnum'
import { networkList } from 'src/hooks/web3/network';
import {
    writeContract,
    readContract,
    waitForTransactionReceipt,
    estimateGas,
    getChainId,
    switchChain,
    getBytecode
} from "@wagmi/core";
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
import { ethers } from "ethers";
import { useWeb3ModalState } from "@web3modal/wagmi/vue";
const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const chainStatus = computed(() => {
    return userInfo.chainStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.LIFE) as string)
const contractAddress: any = networkList[networkStatus.value].lifeContract
const recycleContract: any = networkList[networkStatus.value].recycleContract

export function useGameLife() {
    const buyFood = async (tokenId: any,seconds: any, price: any): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        if (!chainStatus.value) {
            throw new Error('network error')
        }
        const iface = new ethers.utils.Interface(abi)
        const data: any = iface.encodeFunctionData('buyFood', [tokenId, seconds])
        const gasFeesPre = await estimateGas(config, {
            to: contractAddress,
            value: price.toString(),
            data: data
        })
            .catch((error: any) => {
                throw new Error(error);
            })
        const nweGas = parseInt((parseInt(gasFeesPre.toString()) * 1.3).toString())
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'buyFood',
            args: [tokenId, seconds],
            value: price,
            gas: nweGas.toString()
        } as any)
            .catch((error: any) => {
                throw new Error(error);
            })
        const result = await waitForTransactionReceipt(config, {
            hash: resultHash,
        })
        return result
    }
    const getFoodPrice = async (seconds: any): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: '_foodPrices',
            args: [seconds]
        } as any)
        return result.toString()
    }
    const getIsApprovedForAll = async (address: any): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'isApprovedForAll',
            args: [address, recycleContract]
        })
        return result
    }
    const setApprovalForAll = async (): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, {chainId: chainId})
        }
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'setApprovalForAll',
            args: [recycleContract, true]
        } as any)
            .catch((error: any) => {
                throw new Error(error);
            })
        const result = await waitForTransactionReceipt(config, {
            hash: resultHash,
        })
        return result
    }
    return {
        getFoodPrice,
        buyFood,
        getIsApprovedForAll,
        setApprovalForAll
    }
}