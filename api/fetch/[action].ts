import { VercelRequest, VercelResponse } from '@vercel/node'
import { PicaComicAPI } from '@l2studio/picacomic-api'
import { HandleResponse } from 'serverless-kit'
import { toUpperCamelCase } from '../utils'

const controllers = [
  'Categories',
  'Comics',
  'Comic',
  'ComicEpisodes',
  'ComicEpisodePages',
]

type Action =
  | 'Categories'
  | 'Comics'
  | 'Comic'
  | 'ComicEpisodes'
  | 'ComicEpisodePages'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const action = toUpperCamelCase(req.query.action as string) as Action
  if (!controllers.includes(action)) {
    return http.send(400, `Invalid action: ${action}`, {}, { controllers })
  }
  const token = req.cookies?.['PICA_TOKEN']
  req.query.token = req.query.token || token
  const client = new PicaComicAPI({})
  try {
    const data = await client[`fetch${action}`](req.query as any)
    http.send(200, 'ok', data)
  } catch (err) {
    http.axiosError(err)
  }
}
