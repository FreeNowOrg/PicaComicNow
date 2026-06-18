// Cloudflare Workers declares console.createTask but throws
// ERR_METHOD_NOT_IMPLEMENTED when called. This breaks hookable's
// feature detection. Delete the property so hookable falls back
// to its no-op implementation.
if (typeof console.createTask === 'function') {
  try {
    console.createTask('_test')
  } catch {
    // @ts-expect-error -- intentional deletion of broken method
    delete console.createTask
  }
}

export default defineNitroPlugin(() => {})
