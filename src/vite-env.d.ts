/// <reference types="vite/client" />
export {}

// eslint-disable-next-line no-unused-vars
interface ImportMetaEnv {
    VITE_BASE_API: string
}
declare module 'vanta/dist/vanta.cells.min.js';

declare global {
    interface Window {
        $message: any
        $dialog: any
        ethereum: any
    }
    interface evo {
        qtyCount: number,
        step: number
    }
    interface Cell {
        image: string
        numStr: string
        price: number | null
        tokenId: string
        livingNum: number
        avgPrice: number
        cellMintRecordVos: CellLog[]
        contractAddress: string
        network: string
        position: number
    }
    interface CellLog {
        dateTime: string
        mintIncome: number
        ownerAddress: string
        price: number
    }
    interface Life {
        cells: Cell[]
        evoHistories: evo[]
        image: string
        lastPrice: number | null
        numStr: string
        oneDayPerformance: number | null
        oneDayProduced: number | null
        sevenDayPerformance: number | null
        trend: string
        energyProduced: number
        evo: string
        livingQty: number
        nowStep: number
        tokenId: string
        step: number
        positions: number[][]
        roleImage: string
        geneBaseId: number
        mintCount: number
        fourteenDayPerformance: number | null
    }
    interface Detail {
        energySum: number
        evoHistories: evo[]
        image: string
        lifeEnergyList: Energy[]
        livingQty: number
        mintPrice: number
        network: string
        nowStep: number
        roleImage: string | null
        tokenId: string
    }
    interface Energy {
        capacity: number
        claimStatus: number
        createTime: number
        id: number
        livingCount: number
        ownerAddress: string
        proportion: string
        sourceType: number
        tokenId: string
        worldQty: number
        capacitySum: number
        collectTime: number
        ethAddress: string
        qtySum: number
        worldSum: number
    }
    interface Player {
        ethAddress: string
        qtySum: number
    }
    interface Cellula {
        geneBaseId: number
        image: string
        tokenId: string
        algebra: number
        livingQty: number
        roleImage: string | null
        numStr: string
    }
    interface rentFeeLog {
        amount: number
        createTime: number
        ethAddress: string
        id: number
        txHash: string
    }
    interface mintInfo {
        blocks: number
        myEnergy: number
        myQty: number
        proportion: string
        waitClaimEnergy: number
        worldAllQty: number
        roleImages: string[]
        lifeCount: number
        coefficient: number
        nowBlockId: number
    }
    interface pointLog {
        claimEnergy: number,
        claimTime: string,
        txHash: string
    }

    interface workCellula {
        expireTime: number
        image: string
        leftPercentage: string
        livingQty: number
        roleImage: string
        tokenId: any
        popoverShow: boolean
        countdown: any
        currentDay: number
        convertList: number[]
    }
    interface useQuest {
        integral: number
        lifeCount: number
        nowLivingQty: number
        teamLevel: number
        claimCount: number
        userQuestVos: questVos[]
    }
    interface questVos {
        claimStatus: number
        doStatus: number
        questId: number
        questName: string
        reward: string
    }
    interface dailyTask {
        claimStatus: number
        dailyTaskId: number
        dailyTaskName: string
        doStatus: number
        reward: number
    }
    interface teamInfo {
        additionCoefficient: number
        captain: boolean
        memberCount: number
        teamLivingQty: number
        teamName: string | null
        teamTg: string | null
    }
    interface teamMember {
        ethAddress: string
        nowQty: number
        restLifeCount: number
        workingLifeCount: number
    }
    interface InviteMember {
        ethAddress: string
        mintStatus: number
    }
    interface UserInvite {
        ethAddress: string
        integral: number
        inviteCount: number
        rank: number
    }

    interface UserAssets {
        tokenCount: number
        lifeCount: number
        receiveStatus: number
        allEnergy: number
        percent: string
        promotionStatus: number
    }

    interface PayBill {
        tokenId: string | number
        currentDay: number
        convertList: number[]
    }
}
