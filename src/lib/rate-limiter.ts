/**
 * Simple in-memory rate limiter for Next.js API routes.
 * In a production environment with multiple instances, use Redis.
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
    limit: number;     // max requests
    windowMs: number;  // time window in milliseconds
}

export function rateLimit(ip: string, config: RateLimitConfig): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    
    // Clean up expired entries occasionally (basic GC)
    if (Object.keys(store).length > 1000) {
        for (const k in store) {
            if (store[k].resetTime < now) delete store[k];
        }
    }

    if (!store[ip] || store[ip].resetTime < now) {
        store[ip] = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        return { success: true, remaining: config.limit - 1, reset: store[ip].resetTime };
    }

    store[ip].count++;

    if (store[ip].count > config.limit) {
        return { 
            success: false, 
            remaining: 0, 
            reset: store[ip].resetTime 
        };
    }

    return { 
        success: true, 
        remaining: config.limit - store[ip].count, 
        reset: store[ip].resetTime 
    };
}
