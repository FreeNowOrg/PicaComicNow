export default defineEventHandler(async (event) => {
  const client = createPicaClient()
  const body = await readBody(event)

  const required = ['name', 'email', 'password', 'birthday', 'gender',
    'question1', 'question2', 'question3', 'answer1', 'answer2', 'answer3']
  for (const key of required) {
    if (!body?.[key]) {
      throw createError({ statusCode: 400, statusMessage: `Missing field: ${key}` })
    }
  }

  try {
    const { raw } = await client.fetch('auth/register', {
      method: 'POST',
      json: body,
    })

    setResponseHeader(event, 'cache-control', 'no-cache')
    return { code: 200, message: raw?.message || 'ok' }
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err.message,
      data: err,
    })
  }
})
