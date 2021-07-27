import { Button } from '@chakra-ui/react'

export const SyncButton = ({
  isLoading,
  syncHandler,
}: {
  isLoading: boolean
  syncHandler: () => void
}): JSX.Element => (
  <Button
    size="md"
    bg="blackAlpha.900"
    color="whiteAlpha.900"
    isLoading={isLoading}
    onClick={syncHandler}
  >
    Sync Rewards
  </Button>
)
