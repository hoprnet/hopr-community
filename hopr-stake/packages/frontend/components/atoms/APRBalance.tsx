import { Text, Box } from '@chakra-ui/react'

export const APRBalance = ({
  totalAPRBoost = 0,
}: {
  totalAPRBoost?: number
}): JSX.Element => {
  return (
    <Box d="inline">
      <Text d="inline" fontWeight="700" color="blue.600" fontSize="xl">
        {`${18.25 + totalAPRBoost / 317}%`}
      </Text>
      <Text d="inline" fontWeight="700" fontSize="xl">
        {' '}
        (18.25% +{' '}
      </Text>
      <Text d="inline" fontWeight="700" color="green.600" fontSize="xl">
        {(totalAPRBoost / 317).toFixed(2)}%
      </Text>
      )
    </Box>
  )
}
