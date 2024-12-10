export class LRUMap<MKey = string, MValue = any> {
  private dataMap: Map<MKey, MValue>
  private lruKeysQueue: MKey[]
  private limit: number
  constructor(limit = 100) {
    this.dataMap = new Map()
    this.lruKeysQueue = []
    this.limit = limit
  }
  get(key: MKey) {
    if (this.dataMap.has(key)) {
      this.lruKeysQueue = this.lruKeysQueue.filter((v) => v !== key)
      this.lruKeysQueue.unshift(key)
      return this.dataMap.get(key)
    }
    return undefined
  }
  set(key: MKey, value: MValue) {
    if (this.dataMap.has(key)) {
      this.lruKeysQueue = this.lruKeysQueue.filter((v) => v !== key)
    } else if (this.lruKeysQueue.length >= this.limit) {
      const last = this.lruKeysQueue.pop()!
      this.dataMap.delete(last)
    }
    this.lruKeysQueue.unshift(key)
    this.dataMap.set(key, value)
  }
  has(key: MKey) {
    return this.dataMap.has(key)
  }
  delete(key: MKey) {
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
