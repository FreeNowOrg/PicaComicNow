import { PicaComicAPI } from '@l2studio/picacomic-api'

export default defineEventHandler(async (event) => {
  const client = new PicaComicAPI({})
  const body = await readBody<{ email?: string; password?: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing params' })
  }

  try {
    const token = await client.signIn({
      email: body.email,
      password: body.password,
    })

    setResponseHeader(event, 'cache-control', 'no-cache')
    return { code: 200, message: 'ok', body: { token } }
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
