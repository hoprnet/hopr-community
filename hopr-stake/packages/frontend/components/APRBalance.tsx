import { Text } from '@chakra-ui/react'

export const APRBalance = ({
  totalAPRBoost = 0,
}: {
  totalAPRBoost?: number
}): JSX.Element => {
  return (
    <>
      <Text d="inline" fontWeight="700" color="blue.600">
        {`${18.25 + totalAPRBoost}%`}
      </Text>
      <b>
        {' '}
        (18.25% +{' '}
        <Text d="inline" fontWeight="700" color="green.600">
          {totalAPRBoost.toFixed(2)}%
        </Text>
        )
      </b>
    </>
  )
}
