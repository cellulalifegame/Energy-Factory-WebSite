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
import { useWeb3ModalState } from '@web3modal/wagmi/vue'
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
import { ethers } from "ethers";
const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.TOKEN1) as string)
const contractAddress: any = networkList[networkStatus.value].energyContract
export function useEnergyToken() {
    const claimEnergy = async (amount: bigint): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        const iface = new ethers.utils.Interface(abi)
        const data: any = iface.encodeFunctionData('sendClaimEnergyRequest', [amount])
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
            functionName: 'sendClaimEnergyRequest',
            args: [amount],
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
        claimEnergy
    }
}