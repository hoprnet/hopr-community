import { Text } from '@chakra-ui/react'
export const BoldText = ({
  children,
  fullstop = false,
}: {
  children: JSX.Element
  fullstop?: boolean
}): JSX.Element => (
  <Text display="inline" fontSize="xl" fontWeight="700">
    {children}
    {fullstop && '.'}
  </Text>
)
