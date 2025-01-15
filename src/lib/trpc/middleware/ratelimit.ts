import { redis } from "$lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { t } from "../t";
import { TRPCError } from '@trpc/server';


const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, "1h"),
});

export const limiterMiddleware = t.middleware(async ({ path, next, ctx }) => {
    const ip = ctx.event.getClientAddress();
    const identifier = `${path}-${ip}`;

    const result = await ratelimit.limit(identifier);

    if (!result.success) {
        throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: JSON.stringify({
                limit: result.limit,
                remaining: result.remaining,
            })
        });
    }

    return next()
});

