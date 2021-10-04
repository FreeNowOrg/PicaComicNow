import { VercelRequest, VercelResponse } from '@vercel/node'
import { PicaComicAPI } from '@l2studio/picacomic-api'
import { HandleResponse } from 'serverless-kit'
import { replaceFileUrl, toUpperCamelCase } from '../utils'

const controllerList = [
  'Categories',
  'Comics',
  'Comic',
  'ComicEpisodes',
  'ComicEpisodePages',
]

type Controller =
  | 'Categories'
  | 'Comics'
  | 'Comic'
  | 'ComicEpisodes'
  | 'ComicEpisodePages'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)

  const controller = toUpperCamelCase(
    req.query.controller as string
  ) as Controller
  if (!controllerList.includes(controller)) {
    return http.send(
      400,
      `Invalid controller: ${controller}`,
      {},
      { valid: { controllers: controllerList } }
    )
  }

  const token =
    req.query.token || req.headers.authorization || req.cookies?.['PICA_TOKEN']
  if (!token) {
    return http.send(403, 'Please login')
  }

  delete req.query.controller
  req.query.token = token

  const client = new PicaComicAPI({})
  try {
    const data = await client[`fetch${controller}`](req.query as any)
    http.send(200, 'ok', replaceFileUrl(data))
  } catch (err) {
    http.axiosError(err)
  }
}
