// Addapted from `helpers.ts` of Uniswap 
// https://github.com/graphprotocol/uniswap-subgraph/blob/master/src/helpers.ts
import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { HoprStake } from '../generated/HoprStake/HoprStake'
import { HoprBoost } from '../generated/HoprBoost/HoprBoost'

/************************************
 ********** General Helpers *********
 ************************************/

export function exponentToBigDecimal(decimals: number): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = 0; i < decimals; i++) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function bigDecimalExp18(): BigDecimal {
  return BigDecimal.fromString('1000000000000000000')
}

export function zeroBD(): BigDecimal {
  return BigDecimal.fromString('0')
}

export function zeroBigInt(): BigInt {
  return BigInt.fromI32(0)
}

export function oneBigInt(): BigInt {
  return BigInt.fromI32(1)
}

export function convertEthToDecimal(eth: BigInt): BigDecimal {
  return eth.toBigDecimal().div(exponentToBigDecimal(18))
}

export function equalToZero(value: BigDecimal): boolean {
  const formattedVal = parseFloat(value.toString())
  const zero = parseFloat(zeroBD().toString())
  if (zero == formattedVal) {
    return true
  }
  return false
}

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

/************************************
 ********* Specific Helpers *********
 ************************************/

const STAKE_CONTRACT_ADDRESS = "0x912F4d6607160256787a2AD40dA098Ac2aFE57AC"
export const BOOST_CONTRACT_ADDRESS = "0x43d13D7B83607F14335cF2cB75E87dA369D056c7"

export function computeRate(amount: BigInt, numerator: BigInt): BigInt {
  return amount.times(numerator)
}

export function computeActualBaseRate(amount: BigInt): BigInt {
  if (amount.equals(zeroBigInt())) {
    return zeroBigInt()
  }
  const stakeContract = HoprStake.bind(Address.fromString(STAKE_CONTRACT_ADDRESS))
  const baseRate = stakeContract.BASIC_FACTOR_NUMERATOR()
  return computeRate(amount, baseRate)
}

export function computeVirtualBaseRate(amount: BigInt): BigInt {
  if (amount.equals(zeroBigInt())) {
    return zeroBigInt()
  }
  const stakeContract = HoprStake.bind(Address.fromString(STAKE_CONTRACT_ADDRESS))
  const baseRate = stakeContract.SEED_FACTOR_NUMERATOR()
  return computeRate(amount, baseRate)
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'