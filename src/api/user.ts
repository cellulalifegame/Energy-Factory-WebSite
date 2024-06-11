import request from '../utils/request'

const URL = {
    GET_CELL: 'cells',
    GET_USER_CELL: 'myCell',
    GET_USER_LIFE: 'myLives',
    GET_HOT_LIFE: 'hotLives',
    GET_CAPACITY_RECORDS: 'capacityRecords',
    GET_CELL_INFO: 'cellInfo',
    GET_TOP_PLAYER: 'topPlayers',
    GET_TOP_CELLULA: 'topCellulaGene',
    GET_CELLULA: 'getCellulas',
    GET_EVOLUTION: 'simulatedEvolution',
    CLAIM: 'claim',
    SAVE_CLAIM_LOG: 'saveRevenueExtractionRecords',
    GET_CLAIM_LOG: 'revenueExtractionRecords',
    MINING_INFO: 'miningInfo',
    CLAIM_RECORDS: 'claimRecords',
    GET_WORK_CELLULA: 'workOrRestCellulas',
    STAKE_TOKEN: 'inject',
    UPDATE_IMAGE: 'updateRoleImage',
    GET_ROLE_IMAGE: 'getRoleImage',
    GET_LIFE_DETAIL: 'lifeDetail',
    GET_ENERGY_HISTORIES: 'energyHistories',
    GET_CELL_MINTED_RECORDS: 'cellMintedRecords',
    GET_REST_TOKEN_IDS: 'getRestTokenIds',
    SYNC_USER: 'syncUser',
    GET_USER_QUEST_INFO: 'userQuestInfo',
    CLAIM_QUEST: 'claimQuestReward',
    GET_DAILY_TASK: 'dailyTask',
    CLAIM_DAILY: 'claimDailyTaskReward',
    CHECK_TASK: 'checkUserNotClaimReward',
    CHECK_USER: 'checkNewUser',
    CHECK_ADDRESS: 'checkAddress',
    CLAIM_LIFE: 'claimLife',
    TEAM_INFO: 'teamInfo',
    CREATE_TEAM: 'createTeam',
    EDIT_TEAM: 'editTeam',
    JOIN_TEAM: 'joinTeam',
    TEAM_MEMBER: 'teamMembers',
    GET_TEAM_CODE: 'getMyTeamCode',
    GET_INVITE_CODE: 'getInviteCode',
    ACCEPT_INVITE: 'acceptInvitation',
    CLAIM_INVITE_ENERGY: 'claimInviteEnergy',
    IS_INVITE_ENERGY: 'myInviteMintEnergy',
    MY_INVITED_MEMBER: 'myInvitedMember',
    GET_PRICE: 'coefficient',
    SHARE: 'shareX',
    GET_POSITION: 'getCellPicByNumStr',
    RENAME: 'renameAction',
    MY_INVITE_RANK: 'myIntegralRank',
    USER_INVITE_RANK: 'integralRank',
    CLAIM_TOKEN: 'promotion/claim',
    MY_ASSETS: 'promotion/result',
    MY_TOKEN: 'promotion/myToken',
    REFUND_AMOUNT: 'refundAmount',
    FEED_HISTORY: 'feedHistory',
    GET_MY_INVITE_RANK: 'myInviteRank',
    GET_INVITE_RANK: 'inviteRank',
    GET_RESTING_LIVES: 'myRestingLives',
    GET_ACTIVITY_LIST: 'getActivityList',
    GET_CLAIM_BITLIFE_IMG: 'getClaimBitLifeRoleImage',
    CHECK_CHARGE: 'checkCharge',
    GET_USER_SOURCE: 'getUserSource',
    RECORD_SOURCE: 'recordSource',
    CLAIM_INFO: 'claimInfo',
    SAVE_RECORD: 'saveRecord',
    SAVE_ERR_LOG: 'saveErrLog'
}
export default {
    getCellsList(pageNum: number, pageSize: number, qty?: number) {
        return request.get(URL.GET_CELL, {
            params: {
                pageNum: pageNum,
                pageSize: pageSize,
                qty: qty
            }
        })
    },
    getMyCell(address: any, pageNum: number, pageSize: number) {
        return request.get(URL.GET_USER_CELL, {
            params: {
                ethAddress: address,
                pageNum: pageNum,
                pageSize: pageSize
            }
        })
    },
    getMyLife(address: any, pageNum: number, pageSize: number,day: number, rule?: number, type?: number) {
        return request.get(URL.GET_USER_LIFE, {
            params: {
                ethAddress: address,
                rule: rule,
                type: type,
                day: day,
                pageNum: pageNum,
                pageSize: pageSize
            }
        })
    },
    getHotLife(rule: number, type:number, priceRule: number) {
        return request.get(URL.GET_HOT_LIFE, {
            params: {
                rule: rule,
                type: type,
                priceRule: priceRule
            }
        })
    },
    getCapacityRecords(dayOffset: number, address: any, sourceType: number, tokenId: any,pageNum: any, pageSize: any) {
        return request.get(URL.GET_CAPACITY_RECORDS, {
            params: {
                dayOffset: dayOffset,
                ethAddress: address,
                sourceType: sourceType,
                tokenId: tokenId,
                pageSize: pageSize,
                pageNum: pageNum
            }
        })
    },
    getCellInfo(tokenId: any, ethAddress: string, dayOffset: number) {
        return request.get(URL.GET_CELL_INFO, {
            params: {
                cellTokenId: tokenId,
                ethAddress: ethAddress,
                dayOffset: dayOffset
            }
        })
    },
    getTopPlayer(ethAddress: string) {
        return request.get(URL.GET_TOP_PLAYER, {
            params: {
                ethAddress: ethAddress
            }
        })
    },
    getTopCellula() {
        return request.get(URL.GET_TOP_CELLULA)
    },
    getCellula(geneBaseId: number, pageNum: number,pageSize: number) {
        return request.get(URL.GET_CELLULA, {
            params: {
                geneBaseId: geneBaseId,
                pageNum: pageNum,
                pageSize: pageSize
            }
        })
    },
    getEvolution(matrixInfo: any) {
        return request.get(URL.GET_EVOLUTION, {
            params: {
                matrixInfo: matrixInfo
            }
        })
    },
    claimFeeLog(formData: any) {
        return request.post(URL.SAVE_CLAIM_LOG, formData)
    },
    getClaimLog(ethAddress: any,pageNum: number, pageSize: number) {
        return request.get(URL.GET_CLAIM_LOG, {
            params: {
                ethAddress: ethAddress,
                pageNum: pageNum,
                pageSize: pageSize
            }
        })
    },
    getMiningInfo(ethAddress: any) {
        return request.get(URL.MINING_INFO, {
            params: {
                ethAddress: ethAddress
            }
        })
    },
    savePoints(ethAddress: any,txHash: string) {
        return request.post(URL.CLAIM, {
            ethAddress: ethAddress,
            txHash: txHash
        })
    },
    getPointLog(ethAddress: any, pageNum: number, pageSize: number) {
        return request.get(URL.CLAIM_RECORDS, {
            params: {
                ethAddress: ethAddress,
                pageNum: pageNum,
                pageSize: pageSize
            }
        })
    },
    getWorkCellula(ethAddress: any, workStatus: number, pageNum: number, pageSize: number, sortType?: number, maxHashRate?: number, minHashRate?: number) {
        return request.get(URL.GET_WORK_CELLULA, {
            params: {
                ethAddress: ethAddress,
                workStatus: workStatus,
                sortType: sortType,
                pageNum: pageNum,
                pageSize: pageSize,
                maxHashRate: maxHashRate,
                minHashRate: minHashRate
            }
        })
    },
    stakeToken(formData: any) {
        return request.post(URL.STAKE_TOKEN, formData)
    },
    updateRoleImage(formData: any) {
        return request.post(URL.UPDATE_IMAGE, formData)
    },
    getRoleImage(matrixInfo: string) {
        return request.get(URL.GET_ROLE_IMAGE, {
            params: {
                matrixInfo: matrixInfo
            }
        })
    },
    getLifeDetail(ethAddress: any, tokenId: any) {
        return request.get(URL.GET_LIFE_DETAIL, {
            params: {
                ethAddress: ethAddress,
                tokenId: tokenId
            }
        })
    },
    getEnergyHistories(address: any) {
        return request.get(URL.GET_ENERGY_HISTORIES, {
            params: {
                ethAddress: address
            }
        })
    },
    getCellMintedRecords(address: any, tokenId: any, pageNum: number, pageSize: number, dayOffset: number) {
        return request.get(URL.GET_CELL_MINTED_RECORDS, {
            params: {
                dayOffset: dayOffset,
                ethAddress: address,
                pageSize: pageSize,
                pageNum: pageNum,
                cellTokenId: tokenId
            }
        })
    },
    getRestTokenIds(address: any) {
        return request.get(URL.GET_REST_TOKEN_IDS, {
            params: {
                ethAddress: address
            }
        })
    },
    syncUser(address: any) {
        return request.get(URL.SYNC_USER, {
            params: {
                ethAddress: address
            }
        })
    },
    getUserQuest(address: any) {
        return request.get(URL.GET_USER_QUEST_INFO, {
            params: {
                ethAddress: address
            }
        })
    },
    claimQuest(formData: any) {
        return request.post(URL.CLAIM_QUEST, formData)
    },
    getDailyTask(address: any) {
        return request.get(URL.GET_DAILY_TASK, {
            params: {
                ethAddress: address
            }
        })
    },
    claimDaily(formData: any) {
        return request.post(URL.CLAIM_DAILY, formData)
    },
    checkTask(address: any) {
        return request.get(URL.CHECK_TASK, {
            params: {
                ethAddress: address
            }
        })
    },
    checkUser(address: any) {
        return request.get(URL.CHECK_USER, {
            params: {
                ethAddress: address
            }
        })
    },
    checkAddress(address: any) {
        return request.get(URL.CHECK_ADDRESS, {
            params: {
                ethAddress: address
            }
        })
    },
    claimLife(address: any) {
        return request.post(URL.CLAIM_LIFE, {ethAddress: address})
    },
    teamInfo(teamCode: any, address: any) {
        return request.get(URL.TEAM_INFO, {
            params: {
                teamCode: teamCode,
                ethAddress: address
            }
        })
    },
    createTeam(address: any) {
        return request.post(URL.CREATE_TEAM, {ethAddress: address})
    },
    joinTeam(formData: any) {
        return request.post(URL.JOIN_TEAM, formData)
    },
    getMyTeamCode(address: any) {
        return request.get(URL.GET_TEAM_CODE, {
            params: {
                ethAddress: address
            }
        })
    },
    editTeam(formData: any) {
        return request.post(URL.EDIT_TEAM, formData)
    },
    getTeamMember(pageNum: number, pageSize: number, teamCode: string) {
        return request.get(URL.TEAM_MEMBER, {
            params: {
                pageNum: pageNum,
                pageSize: pageSize,
                teamCode: teamCode
            }
        })
    },
    getInviteCode(address: string) {
        return request.get(URL.GET_INVITE_CODE, {
            params: {
                ethAddress: address
            }
        })
    },
    acceptInvite(formData: any) {
        return request.post(URL.ACCEPT_INVITE, formData)
    },
    claimInviteEnergy(address: any) {
        return request.post(URL.CLAIM_INVITE_ENERGY, {ethAddress: address})
    },
    getInviteEnergy(address: any) {
        return request.get(URL.IS_INVITE_ENERGY, {
            params: {
                ethAddress: address
            }
        })
    },
    getInviteMember(pageNum: number, pageSize: number, ethAddress: any) {
        return request.get(URL.MY_INVITED_MEMBER, {
            params: {
                pageNum: pageNum,
                pageSize: pageSize,
                ethAddress: ethAddress
            }
        })
    },
    getPrice(price: number, tokenIds: string) {
        return request.get(URL.GET_PRICE, {
            params: {
                price: price,
                tokenIds: tokenIds
            }
        })
    },
    shareTwitter(address: any) {
        return request.get(URL.SHARE, {
            params: {
                ethAddress: address
            }
        })
    },
    getPosition(numStr: string) {
        return request.get(URL.GET_POSITION, {
            params: {
                numStr: numStr
            }
        })
    },
    renameAction(address: any) {
        return request.get(URL.RENAME, {
            params: {
                ethAddress: address
            }
        })
    },
    getMyPointRank(address: any) {
        return request.get(URL.MY_INVITE_RANK, {
            params: {
                ethAddress: address
            }
        })
    },
    getPointRank(pageNum: number, pageSize: number) {
        return request.get(URL.USER_INVITE_RANK, {
            params: {
                pageSize: pageSize,
                pageNum: pageNum
            }
        })
    },
    claimToken(address: any) {
        return request.post(URL.CLAIM_TOKEN, {
            ethAddress: address
        })
    },
    getMyAssets(address: any) {
        return request.get(URL.MY_ASSETS, {
            params: {
                ethAddress: address
            }
        })
    },
    getMyToken(address: any) {
        return request.get(URL.MY_TOKEN, {
            params: {
                ethAddress: address
            }
        })
    },
    getRefundAmount(address: any) {
        return request.get(URL.REFUND_AMOUNT, {
            params: {
                ethAddress: address
            }
        })
    },
    getFeedHistory(address: any, promotionId: number) {
        return request.get(URL.FEED_HISTORY, {
            params: {
                ethAddress: address,
                promotionId: promotionId
            }
        })
    },
    getInviteRank(pageNum: number, pageSize: number) {
        return request.get(URL.GET_INVITE_RANK, {
            params: {
                pageSize: pageSize,
                pageNum: pageNum
            }
        })
}   ,
    getMyInviteRank(address: any) {
        return request.get(URL.GET_MY_INVITE_RANK, {
            params: {
                ethAddress: address,
            }
        })
    },
    getRestingLives(address: any, hashRateSortType?: any, mintPriceSortType?: any, maxHashRate?: any, minHashRate?: any) {
        return request.get(URL.GET_RESTING_LIVES, {
            params: {
                ethAddress: address,
                hashRateSortType: hashRateSortType,
                mintPriceSortType: mintPriceSortType,
                maxHashRate: maxHashRate,
                minHashRate: minHashRate
            }
        })
    },
    getActivityList(activityStatus: number) {
        return request.get(URL.GET_ACTIVITY_LIST, {
            params: {
                activityStatus: activityStatus
            }
        })
    },
    getClaimBitlifeImg(address: any) {
        return request.get(URL.GET_CLAIM_BITLIFE_IMG, {
            params: {
                ethAddress: address
            }
        })
    },
    checkCharge(address: any, tokenId: string) {
        return request.get(URL.CHECK_CHARGE, {
            params: {
                ethAddress: address,
                tokenId: tokenId
            }
        })
    },
    getUserSource(address: any) {
        return request.get(URL.GET_USER_SOURCE, {
            params: {
                ethAddress: address
            }
        })
    },
    recordSource(address: any, source: number) {
        return request.get(URL.RECORD_SOURCE, {
            params: {
                ethAddress: address,
                source: source
            }
        })
    },
    getClaimCount() {
        return request.get(URL.CLAIM_INFO)
    },
    saveClaimRecord(address: any, tokenId: string) {
        return request.post(URL.SAVE_RECORD, {
            ethAddress: address,
            tokenId: tokenId
        })
    },
    saveErrLog(address: any, errResponse: string, requestParam: string) {
        return request.post(URL.SAVE_ERR_LOG, {
            errResponse: errResponse,
            ethAddress: address,
            requestParam: requestParam
        })
    }
}