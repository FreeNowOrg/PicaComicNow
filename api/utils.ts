import { VercelRequest, VercelResponse } from '@vercel/node'
import { HandleResponse } from 'serverless-kit'
import { FileThumb } from '../src/types'
import { PicaComicAPI } from '@l2studio/picacomic-api'

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
          .replace('storage1.picacomic.com', 'storage.wikawika.xyz')
          .replace('img.picacomic.com', 'img.tipatipa.xyz')
          .replace('www.picacomic.com', 'pica-pica.wikawika.xyz')
      }
    }
    // Object
    else if (typeof val === 'object') {
      obj[key] = replaceFileUrl(val)
      if (val.fileServer && val.path) {
        obj[key].fileUrl = PicaComicAPI.prototype.stringifyImageUrl(val)
      }
    }
  }

  return obj
}

export function getFileUrl(image: FileThumb) {
  const { path, fileServer } = image
  const url = new URL(
    `${fileServer.replace(/\/$/, '')}/static/${path.replace(/^\//, '')}`
  )

  if (url.pathname.startsWith('/static/tobeimg')) {
    url.host = 'img.tipatipa.xyz'
    url.pathname = url.pathname.replace('/static/tobeimg', '')
    return url.href
  }

  if (url.pathname.startsWith('/static/static')) {
    url.host = `storage.${url.host}`
    url.pathname = url.pathname.replace('/static/static', '/static')
  }
  return url.href
}
