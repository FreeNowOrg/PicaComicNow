import { VercelRequest, VercelResponse } from '@vercel/node'
import { PicaComicAPI } from '@l2studio/picacomic-api'
import { HandleResponse } from 'serverless-kit'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const token = req.cookies?.['PICA_TOKEN']
  const client = new PicaComicAPI({})
  try {
    const data = await client.fetchCategories({ token })
    http.send(200, 'ok', data)
  } catch (err) {
    http.axiosError(err)
  }
}
