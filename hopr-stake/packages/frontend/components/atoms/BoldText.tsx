import { Text } from '@chakra-ui/react'
export const BoldText = ({ children }: { children: JSX.Element }) => (
  <Text display="inline" fontSize="xl" fontWeight="700">
    {children}
  </Text>
)
