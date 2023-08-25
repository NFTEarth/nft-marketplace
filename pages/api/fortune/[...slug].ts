import type { NextApiRequest, NextApiResponse } from 'next'

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query, body, method } = req
  const { slug } = query
  // Isolate the query object
  delete query.slug

  let endpoint: string = ''

  // convert the slug array into a path string: [a, b] -> 'a/b'
  if (typeof slug === 'string') {
    endpoint = slug
  } else {
    endpoint = (slug || ['']).join('/')
  }

  const chainPrefix = endpoint.split('/')[0]

  const url = new URL(
    `/api/${[process.env.SUBGRAPH_API_KEY]}/subgraphs/id/9mikCCFvdsoizPJvrVjodsLg6ozWjh46wA7MZjkpTtFD`,
    `https://gateway-${chainPrefix}.network.thegraph.com`.replace('-ethereum', '')
  )

  try {
    const options: RequestInit | undefined = {
      method,
    }

    const headers = new Headers()

    if (typeof body === 'object') {
      headers.set('Content-Type', 'application/json')
      options.body = JSON.stringify(body)
    }

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

    if (contentType?.includes('image/')) {
      res.setHeader('Content-Type', 'text/html')
      res.status(200).send(Buffer.from(data))
    } else {
      res.status(200).json(data)
    }
  } catch (error) {
    res.status(400).json(error)
  }
}

export default proxy
