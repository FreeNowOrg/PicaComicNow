import localforage from 'localforage'
import { LRUMap } from './LRUMap'

export class PicaCache<T = any> {
  static DB_NAME = 'PicaComicNow'
  static CACHE_TIMEOUT = 1000 * 60 * 60 * 24 * 30 // 30 days

  readonly db: LocalForage
  readonly lru: LRUMap<string, T>

  constructor(
    readonly storeName: string,
    public maxAge: number = PicaCache.CACHE_TIMEOUT
  ) {
    this.db = PicaCache.createDatabase(storeName)
    this.lru = new LRUMap<string, T>(150)
  }

  static createDatabase(storeName: string) {
    return localforage.createInstance({
      name: PicaCache.DB_NAME,
      storeName,
    })
  }

  async get(key: string) {
    const memory = this.lru.get(key)
    if (memory) {
      return memory
    }
    const data = await this.loadFromDBWithExpiry(key)
    if (data) {
      this.lru.set(key, data)
    }
    return data
  }

  async set(key: string, value: T) {
    this.lru.set(key, value)
    return this.db.setItem(key, {
      time: Date.now(),
      value,
    })
  }

  async loadFromDBWithExpiry(key: string) {
    const data = await this.db.getItem<{ time: number; value: T }>(key)
    if (!data) {
      return null
    }
    if (Date.now() - data.time > this.maxAge) {
      return null
    }
    return data.value
  }

  /**
   * [DANGER] Use with caution!
   * Clear both memory and indexedDB cache
   */
  async clear() {
    this.lru.clear()
    await this.db.clear()
    return this
  }
}
