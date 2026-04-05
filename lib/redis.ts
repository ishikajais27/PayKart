import Redis from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis | null }

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('[redis] REDIS_URL not set — caching disabled')
    return null
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    commandTimeout: 2000,
    retryStrategy(times) {
      if (times > 2) return null
      return Math.min(times * 200, 1000)
    },
    lazyConnect: true,
    tls: {}, // Required for Redis Cloud
  })

  client.on('error', (err) => {
    console.warn('[redis] error:', err.message)
  })

  return client
}

export const redis =
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : (globalForRedis.redis = createRedisClient())
