import { PicaComicAPI } from '@l2studio/picacomic-api'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { HandleResponse } from 'serverless-kit'
import { getTokenFromReq } from './utils'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const client = new PicaComicAPI({})
  const token = getTokenFromReq(req)

  if (!token) {
    return http.send(403, 'Please login')
  }

  try {
    const { data } = await client
      ._fetch('users/profile', {
        headers: { authorization: token },
      })
      .json()
    return http.send(200, 'ok', data)
  } catch (err) {
    return http.axiosError(err)
  }
}
