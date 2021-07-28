import { Button } from '@chakra-ui/react'

export const CallButton = ({
  isLoading,
  handler,
  children
}: {
  isLoading: boolean
  handler: () => void
  children: JSX.Element | string
}): JSX.Element => (
  <Button
    size="md"
    bg="blackAlpha.900"
    color="whiteAlpha.900"
    isLoading={isLoading}
    onClick={handler}
  >
    { children }
  </Button>
)
