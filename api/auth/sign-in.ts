import { VercelRequest, VercelResponse } from '@vercel/node'
import { PicaComicAPI } from '@l2studio/picacomic-api'
import { HandleResponse } from 'serverless-kit'

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const client = new PicaComicAPI({})

  if (req.method !== 'POST') {
    return http.send(405, 'Method Not Allowed')
  }

  const { email, password } = req.body || {}
  if (!email || !password) {
    return http.send(400, 'Missing params')
  }

  try {
    const token = await client.signIn({ email, password })
    const time = new Date()
    time.setTime(time.getTime() + 180 * 24 * 60 * 60 * 1000)
    res.setHeader('cache-control', 'no-cache')
    res.setHeader(
      'set-cookie',
      `PICA_TOKEN=${token}; expires=${time.toUTCString()}; path=/; secure`
    )
    http.send(200, 'ok', { token })
  } catch (err) {
    http.axiosError(err)
  }
}
