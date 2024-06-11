import { contractAbiMap, ContractAbiTypeEnum } from 'src/enums/contractAbiEnum'
import { networkList } from 'src/hooks/web3/network';
import { writeContract, waitForTransactionReceipt, getChainId, switchChain, readContract } from "@wagmi/core";
import { useWeb3ModalState } from '@web3modal/wagmi/vue'
import { config } from "../config";
import { useUserStore } from "store/modules/user";
import { computed } from "vue";
const userInfo = useUserStore()
const networkStatus = computed(() => {
    return userInfo.networkStatus
})
const abi = JSON.parse(contractAbiMap.get(ContractAbiTypeEnum.CHARGE) as string)
const contractAddress: any = networkList[networkStatus.value].chargeContract
export function useCharge() {
    const claimCharge = async (): Promise<any> => {
        const chainId = getChainId(config)
        const state = useWeb3ModalState()
        if (state.selectedNetworkId && parseInt(state.selectedNetworkId) !== chainId) {
            await switchChain(config, { chainId: chainId })
        }
        const resultHash = await writeContract(config, {
            abi,
            address: contractAddress,
            functionName: 'claim'
        } as any)
            .catch((error: any) => {
                throw new Error(error);
            })
        const result = await waitForTransactionReceipt(config, {
            hash: resultHash,
        })
        return result
    }
    const getClaimable = async (): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'claimable'
        } as any)
        return result
    }
    const getUserInfo = async (address: string): Promise<any> => {
        const result: any = await readContract(config, {
            abi,
            address: contractAddress,
            functionName: 'player',
            args: [address]
        } as any)
        return result
    }
    return {
        getClaimable,
        getUserInfo,
        claimCharge
    }
}