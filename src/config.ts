import axios from 'axios'
import * as Cookies from 'js-cookie'
import { version } from '../package.json'

export const ENV = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'
export const API_BASE =
  ENV === 'prod' ? '/api' : 'https://pica-comic.vercel.app/api'
export const PROJECT_NAME = 'Pica Comic Now'
export const VERSION = version

// Copyright
export const GITHUB_OWNER = 'FreeNowOrg'
export const GITHUB_REPO = 'PicaComicNow'
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
const year = new Date().getFullYear()
export const COPYRIGHT_YEAR = 2021
export const COPYRIGHT_STR =
  year === COPYRIGHT_YEAR ? COPYRIGHT_YEAR : `${COPYRIGHT_YEAR} - ${year}`

// Eject axios
axios.interceptors.request.use(
  async (req) => {
    if (ENV !== 'prod') {
      req.params = req.params || {}
      try {
        req.params.token = (await import('./token.dev')).default
        console.info('[Axios]', 'Request with local token')
      } catch (err) {
        // Do nothing
      }
    }
    return req
  },
  (err) => {
    // 该返回的数据则是axios.catch(err)中接收的数据
    return Promise.reject(err)
  }
)
