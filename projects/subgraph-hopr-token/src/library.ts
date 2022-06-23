import { BigInt } from "@graphprotocol/graph-ts"
import { Account } from "../generated/schema"
import { zeroBigInt } from "./helpers"

export const initializeAccount = (accountId: string): Account => {
    let entity = new Account(accountId)
    entity.amount = zeroBigInt()
    return entity;
}

export const updateAccount = (accountId: string, val: BigInt, isPos: boolean): void => {
    let account = Account.load(accountId)

    if (account == null) {
        account = initializeAccount(accountId)
    }
    account.amount = isPos ? account.amount.plus(val) : account.amount.minus(val)
    account.save()
}