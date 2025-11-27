import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let redisConnectionAttempted = false;
let redisConnectionFailed = false;

export async function getRedisClient(): Promise<RedisClientType | null> {
  // If Redis connection was already attempted and failed, don't retry
  if (redisConnectionFailed) {
    return null;
  }

  // If client already exists and is connected, return it
  if (redisClient) {
    return redisClient;
  }

  // If connection was already attempted but client is null, don't retry
  if (redisConnectionAttempted && !redisClient) {
    return null;
  }

  redisConnectionAttempted = true;
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  
  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2000, // 2 second connection timeout
        reconnectStrategy: false, // Don't auto-reconnect
      },
    }) as RedisClientType;

    redisClient.on("error", (err) => {
      // Only log first error, then mark as failed
      if (!redisConnectionFailed) {
        console.warn("Redis Client Error (caching disabled):", err.message);
        redisConnectionFailed = true;
        redisClient = null;
      }
    });

    redisClient.on("connect", () => {
      console.log("Redis Client Connected");
      redisConnectionFailed = false;
    });

    // Try to connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Redis connection timeout")), 2000)
      ),
    ]);
    
    // Connection successful
    redisConnectionFailed = false;
  } catch (error) {
    console.warn("Failed to connect to Redis, caching disabled:", (error as Error).message);
    redisConnectionFailed = true;
    redisClient = null;
  }

  return redisClient;
}

export async function getCachedRoute(cacheKey: string): Promise<{
  distanceKm: number;
  durationMin: number;
  durationInTrafficMin: number;
} | null> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return null; // Redis not available, skip cache
    }

    // Try to get from cache with timeout
    const cached = await Promise.race([
      client.get(cacheKey),
      new Promise<string | null>((resolve) => setTimeout(() => resolve(null), 1000)), // 1 second timeout
    ]);
    
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    // Silently fail - Redis is optional
    return null;
  }
}

export async function setCachedRoute(
  cacheKey: string,
  data: {
    distanceKm: number;
    durationMin: number;
    durationInTrafficMin: number;
  },
  ttlSeconds: number = 30 * 24 * 60 * 60 // 30 days default
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) {
      return; // Redis not available, skip caching
    }

    // Try to set cache with timeout
    await Promise.race([
      client.setEx(cacheKey, ttlSeconds, JSON.stringify(data)),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis set timeout")), 1000)), // 1 second timeout
    ]);
  } catch (error) {
    // Silently fail - Redis is optional, caching is not critical
  }
}
