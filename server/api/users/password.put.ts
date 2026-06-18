export default defineEventHandler(async (event) => {
  const client = createPicaClient()
  const authorization = getTokenFromReq(event)

  if (!authorization) {
    throw createError({ statusCode: 403, statusMessage: 'Please login' })
  }

  const body = await readBody(event)

  try {
    const { raw } = await client.fetch('users/password', {
      headers: { authorization },
      method: 'PUT',
      json: body,
    })

    setResponseHeader(event, 'cache-control', 'no-cache')
    setCookie(event, 'PICA_TOKEN', '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    })
    setResponseHeader(event, 'refresh', '0;URL=/auth')

    return { code: 200, message: raw?.message }
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
