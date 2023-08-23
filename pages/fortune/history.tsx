import {Head} from "../../components/Head";
import {
  Box,
  Button,
  Flex,
  FormatCryptoCurrency,
  Switch,
  Text,
  ToggleGroup,
  ToggleGroupItem
} from "../../components/primitives";
import Layout from "../../components/Layout";
import {faArrowLeft, faList, faTableCellsLarge} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";
import {ItemView} from "../../components/portfolio/ViewToggle";
import {ChangeEvent, useState} from "react";
import {zeroAddress} from "viem";
import Image from "next/image";
import ChainToggle from "../../components/common/ChainToggle";

const FortuneHistory = () => {
  const [type, setType] = useState<string>("all")
  const [onlyYourRound, setOnlyYourRound] = useState<boolean>(false)

  return (
    <Layout>
      <Head title={"History • Fortune | NFTEarth"}/>
      <Box
        css={{
          py: 24,
          px: '$6',
          height: '100%',
          pb: 160,
          '@md': {
            pb: 60,
          },
        }}
      >
        <Flex justify="between" css={{ mb: 30 }}>
          <Flex align="center" css={{ gap: 10 }}>
            <Image src="/icons/fortune.png" width={40} height={40} objectFit="contain" alt="Fortune"/>
            <Text style="h4">Fortune</Text>
          </Flex>
          <ChainToggle />
        </Flex>
        <Flex
          direction="column"
        >
          <Flex justify="between">
            <Flex
              direction="column"
              css={{
                gap: 20
              }}
            >
              <Link href="/fortune">
                <Flex align="center" css={{ gap: 20 }}>
                  <FontAwesomeIcon icon={faArrowLeft} width={16} height={16} color="hsl(145, 25%, 39%)" />
                  <Text css={{ color: '$primary13' }}>Current Round</Text>
                </Flex>
              </Link>
              <Flex
                align="center"
                css={{
                  gap: 10
                }}
              >
                <ToggleGroup
                  type="single"
                  value={type}
                  onValueChange={(value) => {
                    if (value) {
                      setType(value)
                    }
                  }}
                  css={{ flexShrink: 0 }}
                >
                  <ToggleGroupItem value="all" css={{ p: '$2' }}>
                    <Text>All</Text>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="completed" css={{ p: '$2' }}>
                    <Text>Completed</Text>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="canceled" css={{ p: '$2' }}>
                    <Text>Canceled</Text>
                  </ToggleGroupItem>
                </ToggleGroup>
                <Switch checked={onlyYourRound} onCheckedChange={setOnlyYourRound}/>
                <Text>Only your round</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              align="center"
              css={{
                border: '1px solid $primary13',
                borderRadius: 16,
                gap: 40,
                p: 16
              }}
            >
              <Flex
                direction="column"
                css={{ gap: 10 }}
              >
                <Text style="body3">Your Unclaimed Winnings</Text>
                <FormatCryptoCurrency
                  amount={BigInt(0)}
                  address={zeroAddress}
                  logoHeight={18}
                  textStyle={'h6'}
                />
              </Flex>
              <Button>Claim Now</Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Layout>
  )
}

export default FortuneHistory;