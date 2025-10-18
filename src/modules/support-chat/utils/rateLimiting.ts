/**
 * Support Chat Rate Limiting Utilities
 * Handles rate limiting for support chat functionality
 */

import { MESSAGE_CONFIG } from "../constants";
import { RateLimitData } from "../types";

export class SupportChatRateLimiter {
  private static rateLimits = new Map<string, RateLimitData>();

  /**
   * Checks if user can send message based on rate limit
   */
  static canSendMessage(userId: string): boolean {
    const now = Date.now();
    const rateLimit = this.rateLimits.get(userId) || {
      messageCount: 0,
      lastReset: now,
    };

    // Reset if window has passed
    if (now - rateLimit.lastReset >= MESSAGE_CONFIG.RATE_LIMIT.WINDOW_MS) {
      rateLimit.messageCount = 0;
      rateLimit.lastReset = now;
    }

    // Check if limit exceeded
    if (rateLimit.messageCount >= MESSAGE_CONFIG.RATE_LIMIT.MAX_MESSAGES) {
      return false;
    }

    // Increment counter
    rateLimit.messageCount++;
    this.rateLimits.set(userId, rateLimit);

    return true;
  }

  /**
   * Gets remaining messages for user
   */
  static getRemainingMessages(userId: string): number {
    const rateLimit = this.rateLimits.get(userId);
    if (!rateLimit) {
      return MESSAGE_CONFIG.RATE_LIMIT.MAX_MESSAGES;
    }

    const now = Date.now();
    if (now - rateLimit.lastReset >= MESSAGE_CONFIG.RATE_LIMIT.WINDOW_MS) {
      return MESSAGE_CONFIG.RATE_LIMIT.MAX_MESSAGES;
    }

    return Math.max(
      0,
      MESSAGE_CONFIG.RATE_LIMIT.MAX_MESSAGES - rateLimit.messageCount
    );
  }

  /**
   * Gets time until rate limit resets
   */
  static getTimeUntilReset(userId: string): number {
    const rateLimit = this.rateLimits.get(userId);
    if (!rateLimit) {
      return 0;
    }

    const now = Date.now();
    const timeSinceReset = now - rateLimit.lastReset;
    const timeUntilReset = MESSAGE_CONFIG.RATE_LIMIT.WINDOW_MS - timeSinceReset;

    return Math.max(0, timeUntilReset);
  }

  /**
   * Resets rate limit for user
   */
  static resetRateLimit(userId: string): void {
    this.rateLimits.delete(userId);
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
    const isLimited = !canSend;

    return {
      canSend,
      remaining,
      timeUntilReset,
      isLimited,
    };
  }
}
