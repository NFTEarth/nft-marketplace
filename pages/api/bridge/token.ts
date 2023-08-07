import type {NextApiRequest, NextApiResponse} from "next";
import {paths} from "@reservoir0x/reservoir-sdk";

import supportedChains from "utils/chains";
import fetcher from "utils/fetcher";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {chain, contract, token_id} = req.query;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json')

  const {reservoirBaseUrl, apiKey} =
  supportedChains.find((c) =>  c.id === parseInt(chain as string)) || {}

  if (!apiKey) {
    return res.json(null);
  }

  headers.set('x-api-key', apiKey || '')

  let tokensQuery: paths['/tokens/v6']['get']['parameters']['query'] = {
    tokens: [`${contract}:${token_id}`],
  }

  const tokensPromise = fetcher(
    `${reservoirBaseUrl}/tokens/v6`,
    tokensQuery,
    {
      headers
    }
  )

  const tokensResponse = await tokensPromise
  const tokens = tokensResponse.data
    ? (tokensResponse.data as paths['/tokens/v6']['get']['responses']['200']['schema'])
    : {}

  return res.json(tokens?.tokens?.[0]);
}

const a = {
  "token": {
    "contract": "0xd955e7bd8ca9f2aad391760f849cfa4ee2d80d57",
    "tokenId": "34",
    "name": "HELIX -  PREDATOR JET",
    "description": "Rule the skies with the Predator Jet, an advanced aircraft designed for aerial superiority in HELIX. With its sleek and aggressive design, the Predator Jet combines speed, maneuverability, and firepower to outclass any opponent. Take to the skies and unleash devastation from above with this cutting-edge aircraft.",
    "image": "https://i.seadn.io/gcs/files/6c67ea8e1c8b9727df41b512d5f5ff49.png?w=500&auto=format",
    "imageSmall": "https://i.seadn.io/gcs/files/6c67ea8e1c8b9727df41b512d5f5ff49.png?w=250&auto=format",
    "imageLarge": "https://i.seadn.io/gcs/files/6c67ea8e1c8b9727df41b512d5f5ff49.png?w=1000&auto=format",
    "metadata": {"imageOriginal": "https://helix-item-nft.s3.amazonaws.com/34.png"},
    "media": null,
    "kind": "erc1155",
    "isFlagged": false,
    "lastFlagUpdate": "2023-08-06T13:14:04.603Z",
    "lastFlagChange": null,
    "supply": "909",
    "remainingSupply": "912",
    "rarity": 25.638,
    "rarityRank": 28,
    "collection": {
      "id": "0xd955e7bd8ca9f2aad391760f849cfa4ee2d80d57",
      "name": "HELIX - COLLECTABLES",
      "image": "https://i.seadn.io/gcs/files/ac23df0119611860083056b3e9838273.png?w=500&auto=format",
      "slug": "helix-collectables"
    },
    "owner": "0x00a7f425feec9372d2be854fbbb03978e619de39"
  },
  "market": {
    "floorAsk": {
      "id": "0x8311c426a8901a583e2484cbfad5087b7a876b6228e463735ed16df3f706d6d6",
      "price": {
        "currency": {
          "contract": "0x0000000000000000000000000000000000000000",
          "name": "Ether",
          "symbol": "ETH",
          "decimals": 18
        }, "amount": {"raw": "19999000000000000", "decimal": 0.02, "usd": 36.69958, "native": 0.02}
      },
      "maker": "0x3a6db8be94092202cc7e42d69972525c87308823",
      "validFrom": 1691337035,
      "validUntil": 1691941832,
      "source": {
        "id": "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073",
        "domain": "opensea.io",
        "name": "OpenSea",
        "icon": "https://raw.githubusercontent.com/reservoirprotocol/indexer/v5/src/models/sources/opensea-logo.svg",
        "url": "https://opensea.io/assets/ethereum/0xd955e7bd8ca9f2aad391760f849cfa4ee2d80d57/34"
      }
    }
  }
}