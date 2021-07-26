import { Text, Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'

export const ParagraphLinks = (): JSX.Element => (
  <Text mt="2" fontSize="xl">
    You can swap xHOPR tokens via
    <Link
      px="1"
      href={`https://app.honeyswap.org/#/swap?inputCurrency=0xd057604a14982fe8d88c5fc25aac3267ea142a08&chainId=100`}
      isExternal
    >
      HoneySwap <ExternalLinkIcon />
    </Link>{' '}
    or
    <Link
      px="1"
      href={`https://ascendex.com/en/cashtrade-spottrading/usdt/hopr`}
      isExternal
    >
      AscendEX <ExternalLinkIcon />
    </Link>
    , and buy xDAI (needed for transactions) via{' '}
    <Link px="1" href={`https://buy.ramp.network/`} isExternal>
      Ramp <ExternalLinkIcon />
    </Link>{' '}
    or
    <Link
      px="1"
      href={`https://ascendex.com/en/cashtrade-spottrading/usdt/xdai`}
      isExternal
    >
      AscendEX <ExternalLinkIcon />
    </Link>
    . Unwrap wxHOPR rewards to xHOPR for restaking via{' '}
    <Link px="1" href={`https://wrapper.hoprnet.org/`} isExternal>
      our token wrapper <ExternalLinkIcon />
    </Link>
    . Follow our{' '}
    <Link href="https://twitter.com/hoprnet">
      Twitter <ExternalLinkIcon />
    </Link>{' '}
    to learn about new events.
  </Text>
)
