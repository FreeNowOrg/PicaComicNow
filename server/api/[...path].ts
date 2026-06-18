export default defineEventHandler(async (event) => {
  const client = createPicaClient()
  const path = event.context.params?.path
  const query = { ...getQuery(event) }
  const method = event.method as 'GET' | 'POST' | 'PUT'

  const authorization = getTokenFromReq(event) || undefined

  let body: any = undefined
  if (method === 'POST' || method === 'PUT') {
    body = await readBody(event).catch(() => undefined)
  }

  console.info(`[${method}] ${path}`, query, body)

  try {
    const { data } = await client
      .fetch(path as string, {
        headers: { authorization },
        method,
        searchParams: query as Record<string, string>,
        json:
          typeof body === 'object' && body && Object.keys(body).length > 0
            ? body
            : undefined,
      })
      .json<any>()

    return {
      code: 200,
      message: 'ok',
      body: replaceFileUrl({
        ...data,
        debug: { body, params: query },
      }),
    }
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
