import { Cache, Context, Dict, Schema } from 'koishi'
import LRU from 'lru-cache'

export default class LruCache extends Cache {
  #store: Dict<LRU<string, any>> = Object.create(null)

  constructor(ctx: Context, private config: Config) {
    super(ctx)
  }

  private prepare(table: keyof Cache.Tables) {
    if (this.#store[table]) return
    const config = this.table(table)
    if (!config) return
    this.#store[table] = new LRU({
      max: config.maxSize,
      maxAge: config.maxAge,
    })
  }

  async get(table: keyof Cache.Tables, key: string) {
    this.prepare(table)
    return this.#store[table]?.get(key)
  }

  async set(table: keyof Cache.Tables, key: string, value: any) {
    this.prepare(table)
    this.#store[table]?.set(key, value)
  }
}

export const name = 'cache-lru'

export interface Config {}

export const schema: Schema<Config> = Schema.object({})

export function apply(ctx: Context, config?: Config) {
  ctx.cache = new LruCache(ctx, config)
}
