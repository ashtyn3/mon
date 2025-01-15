import { SECRET_UPSTASH_REDIS_REST_TOKEN, SECRET_UPSTASH_REDIS_REST_URL } from '$env/static/private'
import { Redis } from '@upstash/redis'

export const redis = new Redis({
    url: SECRET_UPSTASH_REDIS_REST_URL,
    token: SECRET_UPSTASH_REDIS_REST_TOKEN,
})

