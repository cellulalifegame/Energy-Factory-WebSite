import { contractAbiMap, ContractAbiTypeEnum } from 'src/enums/contractAbiEnum'
import { networkList } from 'src/hooks/web3/network';
import {
    writeContract,
    readContract,
    waitForTransactionReceipt,
    estimateGas,
    getChainId,
    switchChain
} from "@wagmi/core";
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
import { ethers } from 'ethers'
import { parseGwei, formatEther } from "viem";
import { useWeb3ModalState } from "@web3modal/wagmi/vue";

const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const chainStatus = computed(() => {
    return userInfo.chainStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.CELLULA) as string)
const contractAddress: any = networkList[networkStatus.value].contract
export function useGame() {
    const mintNFT = async (price: any): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        if (!chainStatus.value) {
            throw new Error('network error')
        }
        const gasFeesPre = await estimateGas(config, {
            to: contractAddress
        })
        const nweGas = parseInt((parseInt(gasFeesPre.toString()) * 1.3).toString())
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'mintFromAuction',
            value: price,
            gas: nweGas.toString()
        } as any)
        const result = await waitForTransactionReceipt(config, {
            hash: resultHash,
        })
        return result
    }
    const mintCompound = async (formData: any, nonce?: number): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        if (!chainStatus.value) {
            throw new Error('network error')
        }
        const iface = new ethers.utils.Interface(abi)
        const data: any = iface.encodeFunctionData('createLife', [formData.cell])
        const gasFeesPre = await estimateGas(config, {
            to: contractAddress,
            value: formData.price.toString(),
            data: data
        })
            .catch((error: any) => {
                throw new Error(error);
            })
        const nweGas = parseInt((parseInt(gasFeesPre.toString()) * 1.3).toString())
        console.log(formatEther(formData.price), '--------', nonce);
        const resultHash: any = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'createLife',
            value: formData.price.toString(),
            args: [formData.cell],
            gas: nweGas.toString(),
            nonce: nonce
        } as any)
            .catch((error: any) => {
                throw new Error(error);
            })
        const result = await waitForTransactionReceipt(config, {
            hash: resultHash,
        })
        return result
    }
    const getMintPrice = async (): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'getCurrentVRGDAPrice',
        } as any)
        return result.toString()
    }
    const getTokenFee = async (cells: any): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'getWithdrawRentFee',
            args: [cells]
        } as any)
        return result.toString()
    }
    const getLifePrice = async (cells: string[]): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'getLifePrice',
            args: [cells]
        } as any)
        return result
    }
    const withdrawFee = async (cell: number[]): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        const iface = new ethers.utils.Interface(abi)
        const data: any = iface.encodeFunctionData('withdrawRentFee', [cell])
        const gasFeesPre = await estimateGas(config, {
            to: contractAddress,
            data: data
        })
            .catch((error: any) => {
                throw new Error(error);
            })
        const nweGas = parseInt((parseInt(gasFeesPre.toString()) * 1.3).toString())
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'withdrawRentFee',
            args: [cell],
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
    return {
        mintNFT,
        getMintPrice,
        getLifePrice,
        mintCompound,
        getTokenFee,
        withdrawFee
    }
}