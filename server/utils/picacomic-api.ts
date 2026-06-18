// PicaComic API client using native fetch.
// Auth/signature logic based on @l2studio/picacomic-api (MIT License)
// https://github.com/l2studio/picacomic-api

const API_BASE = 'https://picaapi.picacomic.com/'
const API_KEY = 'C69BAF41DA5ABD1FFEDC6D2FEA56B'
const SIGNATURE_KEY =
  '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn'

const APP_HEADERS = {
  accept: 'application/vnd.picacomic.com.v1+json',
  'api-key': API_KEY,
  'app-channel': '2',
  'app-version': '2.2.1.2.3.3',
  'app-uuid': 'defaultUuid',
  'app-platform': 'android',
  'app-build-version': '44',
  'user-agent': 'okhttp/3.8.1',
  'image-quality': 'original',
  'content-type': 'application/json; charset=UTF-8',
} as const

async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function uuid(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export class PicaComicError extends Error {
  constructor(
    public readonly code: number,
    public readonly error: string,
    message: string,
    public readonly detail?: string,
    public readonly statusCode?: number
  ) {
    super(message)
    this.name = 'PicaComicError'
  }
}

export interface PicaFetchOptions {
  method?: string
  headers?: Record<string, string | undefined>
  searchParams?: Record<string, string | undefined>
  json?: unknown
}

export class PicaComicAPI {
  async fetch(path: string, opts: PicaFetchOptions = {}) {
    const method = (opts.method || 'GET').toUpperCase()
    const url = new URL(path, API_BASE)

    if (opts.searchParams) {
      for (const [k, v] of Object.entries(opts.searchParams)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, v)
      }
    }

    const nonce = uuid()
    const time = Math.floor(Date.now() / 1000).toString()
    const raw = url.pathname.replace(/^\//, '') +
      (url.search ? url.search : '') +
      time + nonce + method + API_KEY
    const signature = await hmacSha256Hex(SIGNATURE_KEY, raw.toLowerCase())

    const headers: Record<string, string> = {
      ...APP_HEADERS,
      time,
      nonce,
      signature,
    }

    if (opts.headers) {
      for (const [k, v] of Object.entries(opts.headers)) {
        if (v !== undefined) headers[k] = v
      }
    }

    const response = await globalThis.fetch(url.toString(), {
      method,
      headers,
      body: opts.json !== undefined ? JSON.stringify(opts.json) : undefined,
      redirect: 'manual',
    })

    const text = await response.text()
    let data: any
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }

    if (!response.ok) {
      throw new PicaComicError(
        data?.code ?? -1,
        data?.error ?? 'Error',
        data?.message ?? response.statusText,
        data?.detail,
        response.status
      )
    }

    return { data: data?.data, response, raw: data }
  }

  async signIn(payload: { email: string; password: string }): Promise<string> {
    const { data } = await this.fetch('auth/sign-in', {
      method: 'POST',
      json: { email: payload.email, password: payload.password },
    })
    return data.token
  }
}
