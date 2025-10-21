/**
 * Rate Limiting Service
 * Handles rate limiting for support chat operations
 */

import { logger } from "../utils/logger";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

export class RateLimitService {
  private static rateLimits = new Map<string, RateLimitData>();
  private static config: RateLimitConfig = {
    maxRequests: 10, // Max 10 messages per minute
    windowMs: 60 * 1000, // 1 minute
  };

  /**
   * Checks if user can send message
   */
  static canSendMessage(userId: string): boolean {
    const now = Date.now();
    const key = `message_${userId}`;
    const rateLimit = this.rateLimits.get(key);

    if (!rateLimit) {
      // First message
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Check if window has expired
    if (now >= rateLimit.resetTime) {
      // Reset window
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    // Check if within limit
    if (rateLimit.count < this.config.maxRequests) {
      rateLimit.count++;
      return true;
    }

    logger.warn("Rate limit exceeded", {
      userId,
      count: rateLimit.count,
      resetTime: rateLimit.resetTime,
    });

    return false;
  }

  /**
   * Gets remaining messages for user
   */
  static getRemainingMessages(userId: string): number {
    const key = `message_${userId}`;
    const rateLimit = this.rateLimits.get(key);

    if (!rateLimit) {
      return this.config.maxRequests;
    }

    const now = Date.now();
    if (now >= rateLimit.resetTime) {
      return this.config.maxRequests;
    }

    return Math.max(0, this.config.maxRequests - rateLimit.count);
  }

  /**
   * Gets time until reset in milliseconds
   */
  static getTimeUntilReset(userId: string): number {
    const key = `message_${userId}`;
    const rateLimit = this.rateLimits.get(key);

    if (!rateLimit) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, rateLimit.resetTime - now);
  }

  /**
   * Resets rate limit for user
   */
  static resetRateLimit(userId: string): void {
    const key = `message_${userId}`;
    this.rateLimits.delete(key);
  }

  /**
   * Clears all rate limits
   */
  static clearAllRateLimits(): void {
    this.rateLimits.clear();
  }

  /**
   * Gets rate limit status for user
   */
  static getRateLimitStatus(userId: string): {
    canSend: boolean;
    remaining: number;
    timeUntilReset: number;
    isLimited: boolean;
  } {
    const canSend = this.canSendMessage(userId);
    const remaining = this.getRemainingMessages(userId);
    const timeUntilReset = this.getTimeUntilReset(userId);

    return {
      canSend,
      remaining,
      timeUntilReset,
      isLimited: !canSend,
    };
  }

  /**
   * Updates rate limit configuration
   */
  static updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
