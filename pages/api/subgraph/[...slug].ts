import type { NextApiRequest, NextApiResponse } from 'next'
import {setParams} from "@reservoir0x/reservoir-sdk";
import {Redis} from "@upstash/redis";

//https://subgraph.satsuma-prod.com/nftearth/fortune/api

const redis = Redis.fromEnv()

const subgraph = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, body, method } = req
  const { slug } = query

  delete query.slug
  let endpoint: string = ''

  // convert the slug array into a path string: [a, b] -> 'a/b'
  if (typeof slug === 'string') {
    endpoint = slug
  } else {
    endpoint = (slug || ['']).join('/')
  }

  const cacheKey = `${endpoint}:${JSON.stringify(body)}`
  const existingData = await redis.get(cacheKey);
  if (existingData) {
    return res.json(existingData)
  }

  const url = new URL(endpoint, 'https://subgraph.satsuma-prod.com')
  setParams(url, query)

  try {
    const options: RequestInit | undefined = {
      method,
    }

    const headers = new Headers()

    headers.set('origin', 'nftearth.exchange')
    headers.set('x-api-key', process.env.SUBGRAPH_QUERY_KEY as string)
    headers.set('Content-Type', 'application/json')

    options.body = JSON.stringify(body)

    options.headers = headers

    const response = await fetch(url.href, options)

    let data: any

    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) throw data

    await redis.setex(cacheKey, 5, JSON.stringify(data))

    res.status(200).json(data)
  } catch (error) {
    res.status(400).json(error)
  }
}

export default subgraph