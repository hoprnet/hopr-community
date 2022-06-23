import { Transfer } from "../generated/HOPR/HOPR"
import { ADDRESS_ZERO } from "./helpers"
import { updateAccount } from "./library"

export function handleTransfer(event: Transfer): void {
  let adrFrom = event.params.from.toHex()
  let adrTo = event.params.to.toHex()
  if (adrFrom != ADDRESS_ZERO) {
    updateAccount(adrFrom, event.params.value, false)
  }
  if (adrTo != ADDRESS_ZERO) {
    updateAccount(adrTo, event.params.value, true)
  }
}
