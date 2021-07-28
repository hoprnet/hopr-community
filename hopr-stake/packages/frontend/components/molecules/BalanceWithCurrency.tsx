import { Box, BoxProps } from '@chakra-ui/react'

export const BalanceWithCurrency = ({
  balanceElement,
  currencyElement,
  props,
}: {
  balanceElement: JSX.Element
  currencyElement: JSX.Element
  props?: BoxProps
}): JSX.Element => {
  return (
    <Box d="flex" alignItems="baseline" {...props}>
      {balanceElement}
      {currencyElement}
    </Box>
  )
}
