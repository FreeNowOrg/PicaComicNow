import type { H3Event } from 'h3'
import { PicaComicAPI } from '@l2studio/picacomic-api'

export function createPicaClient() {
  const config = useRuntimeConfig()
  const proxy =
    config.picaProxyHost && config.picaProxyPort
      ? { host: config.picaProxyHost, port: Number(config.picaProxyPort) }
      : undefined
  return new PicaComicAPI({ proxy })
}

export function getTokenFromReq(event: H3Event): string | null {
  const query = getQuery(event)
  return (
    (query.token as string) ||
    getHeader(event, 'authorization')?.replace(/^Bearer\s+/, '') ||
    getCookie(event, 'PICA_TOKEN') ||
    null
  )
}

export function replaceFileUrl(obj: Record<string, any>): Record<string, any> {
  const config = useRuntimeConfig()
  const PICA_S3_BASE = config.picaS3Base || 'https://s3.picacomic.com'

  for (const key in obj) {
    const val = obj[key]

    if (typeof val === 'string') {
      if (val.startsWith('https://')) {
        obj[key] = val
          .replace('https://storage1.picacomic.com', PICA_S3_BASE)
          .replace('https://storage-b.picacomic.com', PICA_S3_BASE)
          .replace('https://img.picacomic.com', PICA_S3_BASE)
          .replace(
            'https://www.picacomic.com',
            'https://pica-pica.wikawika.xyz'
          )
      }
    } else if (typeof val === 'object' && val !== null) {
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
