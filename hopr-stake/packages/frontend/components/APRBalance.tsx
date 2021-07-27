import { Text } from '@chakra-ui/react'

export const APRBalance = ({
  totalAPRBoost = 0,
}: {
  totalAPRBoost?: number
}): JSX.Element => {
  return (
    <>
      <Text d="inline" fontWeight="700" color="blue.600">
        {`${18.25 + (totalAPRBoost / 317)}%`}
      </Text>
      <b>
        {' '}
        (18.25% +{' '}
        <Text d="inline" fontWeight="700" color="green.600">
          {(totalAPRBoost / 317).toFixed(2)}%
        </Text>
        )
      </b>
    </>
  )
}
