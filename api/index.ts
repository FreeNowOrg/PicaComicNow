import { PicaComicAPI } from '@l2studio/picacomic-api'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { HandleResponse } from 'serverless-kit'
import { getTokenFromReq, replaceFileUrl } from './utils'
import FormData from 'form-data'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const client = new PicaComicAPI({})

  const authorization = getTokenFromReq(req) || undefined
  const { __PATH } = req.query
  delete req.query.__PATH

  let body: FormData
  if (req.body) {
    body = new FormData()
    for (const key in req.body) body.append(key, req.body[key])
  }

  try {
    const { data } = await client
      .fetch(__PATH as string, {
        headers: { authorization },
        method: req.method as 'GET' | 'POST' | 'PUT',
        searchParams: req.query as Record<string, string>,
        body,
      })
      .json()

    return http.send(200, 'ok', replaceFileUrl(data))
  } catch (e) {
    return http.axiosError(e)
  }
}
