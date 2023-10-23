import { PicaComicAPI } from '@l2studio/picacomic-api'
import { VercelRequest, VercelResponse } from '@vercel/node'
import { getTokenFromReq, replaceFileUrl } from './utils.js'
import kit from 'serverless-kit'
const { HandleResponse } = kit

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const client = new PicaComicAPI({})

  const authorization = getTokenFromReq(req) || undefined
  const { __PATH } = req.query
  delete req.query.__PATH

  console.info(`[${req.method}] ${__PATH}`, req.query, req.body)

  try {
    const { data } = await client
      .fetch(__PATH as string, {
        headers: { authorization },
        method: req.method as 'GET' | 'POST' | 'PUT',
        searchParams: req.query as Record<string, string>,
        json: Object.keys(req.body).length > 0 ? req.body : undefined,
      })
      .json<any>()

    return http.send(
      200,
      'ok',
      replaceFileUrl({ ...data, debug: { body: req.body, params: req.query } })
    )
  } catch (e) {
    return http.axiosError(e)
  }
}
