import { Account, Program } from "../generated/schema"
import { zeroBigInt } from "./helpers"

export const initializeAccount = (accountId: string): Account => {
    let entity = new Account(accountId)
    entity.actualStake = zeroBigInt()
    entity.virtualStake = zeroBigInt()
    entity.unclaimedRewards = zeroBigInt()
    entity.boostRate = zeroBigInt()
    entity.appliedBoosts = new Array<string>();
    entity.ignoredBoosts = new Array<string>();
    return entity;
}

export const initializeProgram = (programAddress: string): Program => {
    let entity = new Program(programAddress)
    entity.currentRewardPool = zeroBigInt()
    entity.totalActualStake = zeroBigInt()
    entity.totalVirtualStake = zeroBigInt()
    entity.totalUnclaimedRewards = zeroBigInt()
    return entity;
}