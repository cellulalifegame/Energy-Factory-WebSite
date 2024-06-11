import { contractAbiMap, ContractAbiTypeEnum } from 'src/enums/contractAbiEnum'
import { networkList } from 'src/hooks/web3/network';
import { writeContract, waitForTransactionReceipt, getChainId, switchChain } from "@wagmi/core";
import { useWalletInfo, useWeb3ModalState } from '@web3modal/wagmi/vue'
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.POINT) as string)
const contractAddress: any = networkList[networkStatus.value].pointContract
export function usePoint() {
    const userClaimEnergy = async (): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'sendClaimEnergyRequest'
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
        userClaimEnergy
    }
}