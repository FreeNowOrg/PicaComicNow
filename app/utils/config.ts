import { version } from '../../package.json'

export const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const PROJECT_NAME = 'Pica Comic Now'
export const VERSION = version

export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'PicaComicNow'
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
const year = new Date().getFullYear()
export const COPYRIGHT_YEAR = 2021
export const COPYRIGHT_STR =
  year === COPYRIGHT_YEAR ? String(COPYRIGHT_YEAR) : `${COPYRIGHT_YEAR} - ${year}`
