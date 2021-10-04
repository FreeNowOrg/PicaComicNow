import { FileThumb } from '../types/File'

export function replaceFileUrl(obj: Record<string, any>) {
  for (const i in obj) {
    const key = i
    const val = obj[i]
    if (typeof val === 'string') {
      if (val.startsWith('https://')) {
        obj[key] = val
          .replace('storage1.picacomic.com', 'storage.wikawika.xyz')
          .replace('img.picacomic.com', 'img.tipatipa.xyz')
          .replace('www.picacomic.com', 'pica-pica.wikawika.xyz')
      }
    } else if (typeof val === 'object') {
      obj[key] = replaceFileUrl(val)
      if (val.fileServer && val.path) {
        obj[key].fileUrl = getFileUrl(val)
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
