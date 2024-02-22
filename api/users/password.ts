import { PicaComicAPI } from '@l2studio/picacomic-api'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { getTokenFromReq } from '../utils.js'
import { HandleResponse } from 'serverless-kit'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const client = new PicaComicAPI({})

  if (req.method !== 'PUT') {
    return http.send(405, 'Method Not Allowed')
  }

  const authorization = getTokenFromReq(req)
  if (!authorization) {
    return http.send(403, 'Please login')
  }

  try {
    const { message } = await client
      .fetch('users/password', {
        headers: {
          authorization,
        },
        method: 'PUT',
        body: req.body,
      })
      .json<any>()

    res.setHeader('cache-control', 'no-cache')
    res.setHeader(
      'set-cookie',
      `PICA_TOKEN=; expires=${new Date(0).toUTCString()}; path=/; secure`
    )
    res.setHeader('refresh', '0;URL=/auth')
    return http.send(200, message)
  } catch (e) {
    return http.axiosError(e)
  }
}
