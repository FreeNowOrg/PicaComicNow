import { VercelRequest, VercelResponse } from '@vercel/node'
import kit from 'serverless-kit'
const { HandleResponse } = kit

export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  http.send(403, 'Invalid endpoint')
}

export function getTokenFromReq(req: VercelRequest): string | null {
  return (
    (req.query.token as string) ||
    req.headers.authorization ||
    req.cookies?.['PICA_TOKEN'] ||
    null
  )
}

export function toUpperCamelCase(str: string) {
  const s = str.split('')
  const t = s.map((item, index) => {
    if (index === 0) {
      return item.toUpperCase()
    }
    if (item === '_' || item === '-') {
      s[index + 1] = s[index + 1].toUpperCase()
      return ''
    }
    return item
  })
  return t.join('')
}

export function replaceFileUrl(obj: Record<string, any>) {
  for (const i in obj) {
    const key = i
    const val = obj[i]

    // String
    if (typeof val === 'string') {
      if (val.startsWith('https://')) {
        obj[key] = val
          .replace('storage1.picacomic.com', 's3.picacomic.com')
          .replace('img.picacomic.com', 's3.picacomic.com')
          .replace('www.picacomic.com', 'pica-pica.wikawika.xyz')
      }
    }
    // Object
    else if (typeof val === 'object') {
      obj[key] = replaceFileUrl(val)
      if (val.fileServer && val.path) {
        obj[key].fileUrl = `${val.fileServer.replace(
          /\/$/,
          ''
        )}/static/${val.path.replace(/^\//, '')}`.replace(
          '/static/static',
          '/static'
        )
      }
    }
  }

  return obj
}
