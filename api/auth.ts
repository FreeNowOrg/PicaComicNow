import { VercelRequest, VercelResponse } from '@vercel/node'
import { PicaComicAPI } from '@l2studio/picacomic-api'
import { HandleResponse } from 'serverless-kit'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  if (req.method !== 'POST') {
    return http.send(403, 'Method not allowed')
  }
  const email = req.body?.email
  const password = req.body?.password
  if (!email || !password) {
    return http.send(400, 'Missing params')
  }
  const client = new PicaComicAPI({})
  try {
    const token = await client.signIn({ email, password })
    res.setHeader('cache-control', 'no-cache')
    res.setHeader('set-cookie', `PICA_TOKEN=${token}; path=/; secure`)
    http.send(200, 'ok', { token })
  } catch (err) {
    http.axiosError(err)
  }
}
