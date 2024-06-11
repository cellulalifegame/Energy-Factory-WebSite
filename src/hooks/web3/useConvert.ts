import { contractAbiMap, ContractAbiTypeEnum } from 'src/enums/contractAbiEnum'
import { networkList } from 'src/hooks/web3/network';
import {
    writeContract,
    waitForTransactionReceipt,
    getChainId,
    switchChain,
    readContract,
    estimateGas
} from "@wagmi/core";
import { useWalletInfo, useWeb3ModalState } from '@web3modal/wagmi/vue'
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
import { parseGwei } from "viem";
import { ethers } from "ethers";
const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.RECYCLE) as string)
const contractAddress: any = networkList[networkStatus.value].recycleContract
export function useConvert() {
    const getEndTime = async (tokenId: any): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'miniEndTime',
            args: [tokenId]
        } as any)
        return result
    }
    const recycle = async (recycle_ids: any, charge_id: any): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        const iface = new ethers.utils.Interface(abi)
        const data: any = iface.encodeFunctionData('recycle', [recycle_ids, charge_id])
        const gasFeesPre = await estimateGas(config, {
            to: contractAddress,
            data: data
        })
            .catch((error: any) => {
                throw new Error(error);
            })
        console.log(gasFeesPre);
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'recycle',
            args: [recycle_ids, charge_id],
            gasPrice: '1000001234',
            gas: gasFeesPre
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
        recycle,
        getEndTime
    }
}