export class LRUMap<K = string, V = any> {
  private dataMap: Map<K, V>
  private lruKeysQueue: K[]
  private limit: number
  constructor(limit = 100) {
    this.dataMap = new Map()
    this.lruKeysQueue = []
    this.limit = limit
  }
  get(key: K) {
    if (this.dataMap.has(key)) {
      this.lruKeysQueue = this.lruKeysQueue.filter((v) => v !== key)
      this.lruKeysQueue.unshift(key)
      return this.dataMap.get(key)
    }
    return undefined
  }
  set(key: K, value: V) {
    if (this.dataMap.has(key)) {
      this.lruKeysQueue = this.lruKeysQueue.filter((v) => v !== key)
    } else if (this.lruKeysQueue.length >= this.limit) {
      const last = this.lruKeysQueue.pop()!
      this.dataMap.delete(last)
    }
    this.lruKeysQueue.unshift(key)
    this.dataMap.set(key, value)
  }
  has(key: K) {
    return this.dataMap.has(key)
  }
  delete(key: K) {
    if (this.dataMap.has(key)) {
      this.lruKeysQueue = this.lruKeysQueue.filter((v) => v !== key)
      this.dataMap.delete(key)
    }
  }
  clear() {
    this.dataMap.clear()
    this.lruKeysQueue = []
  }
  get size() {
    return this.dataMap.size
  }
  get keys() {
    return this.dataMap.keys()
  }
  get values() {
    return this.dataMap.values()
  }
  get entries() {
    return this.dataMap.entries()
  }
  get [Symbol.iterator]() {
    return this.dataMap[Symbol.iterator]()
  }
}
