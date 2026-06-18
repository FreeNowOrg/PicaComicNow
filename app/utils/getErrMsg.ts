export function getErrMsg(err: any): string {
  return err?.response?.data?.message || err.message || 'HTTP Timeout'
}
