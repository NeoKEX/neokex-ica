# Rate Limiting in neokex-ica

## Zero Client-Side Rate Limiting

**This API implements ZERO client-side rate limiting.**

### What This Means

✅ **All requests are sent immediately** - No artificial delays or throttling  
✅ **No request queuing** - Messages are sent the instant you call the method  
✅ **No automatic retry delays** - The API never sleeps or waits between requests  
✅ **Maximum speed** - Your bot can send requests as fast as possible  

### Code Verification

```javascript
// These requests are sent IMMEDIATELY with no delays:
await bot.sendMessage(threadId, "Message 1");
await bot.sendMessage(threadId, "Message 2");
await bot.sendMessage(threadId, "Message 3");
// All 3 are sent as fast as your network allows
```

The only `sleep()` in the codebase is for the polling interval (default 2 seconds between inbox checks), NOT for rate limiting requests.

## Instagram Server Rate Limits

While **this API has no rate limiting**, Instagram's servers may enforce their own limits:

### Server-Side Behavior

Instagram may:
- Return `429 Too Many Requests` status
- Temporarily block your account
- Require CAPTCHA challenges
- Shadowban your activity

### Handling Server Rate Limits

The API provides an event to detect when Instagram returns rate limit errors:

```javascript
bot.onRateLimit((data) => {
  console.log(`Instagram server rate limit detected`);
  console.log(`Retry after: ${data.retryAfter} seconds`);
  
  // You must implement your own handling:
  // - Pause sending
  // - Queue messages
  // - Switch accounts
  // - Wait and retry
});
```

**Note:** The `onRateLimit` event is only for **notification** - it does NOT automatically slow down or stop your requests.

## Implementing Your Own Rate Limiting

If you want to control request speed, implement it in your bot code:

### Example: Manual Delay Between Messages

```javascript
async function sendWithDelay(bot, threadId, messages, delayMs = 1000) {
  for (const message of messages) {
    await bot.sendMessage(threadId, message);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

// Usage: Send messages with 1 second delay between each
await sendWithDelay(bot, threadId, ["Hi", "How are you?", "Bye"], 1000);
```

### Example: Token Bucket Rate Limiter

```javascript
class RateLimiter {
  constructor(maxRequests, perMilliseconds) {
    this.maxRequests = maxRequests;
    this.perMilliseconds = perMilliseconds;
    this.tokens = maxRequests;
    this.lastRefill = Date.now();
  }

  async acquire() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const refillAmount = (timePassed / this.perMilliseconds) * this.maxRequests;
    
    this.tokens = Math.min(this.maxRequests, this.tokens + refillAmount);
    this.lastRefill = now;

    if (this.tokens < 1) {
      const waitTime = ((1 - this.tokens) / this.maxRequests) * this.perMilliseconds;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.tokens = 0;
    } else {
      this.tokens -= 1;
    }
  }
}

// Usage: Limit to 10 requests per 10 seconds
const limiter = new RateLimiter(10, 10000);

async function sendRateLimited(bot, threadId, message) {
  await limiter.acquire();
  return await bot.sendMessage(threadId, message);
}
```

### Example: Queue-Based Approach

```javascript
class MessageQueue {
  constructor(bot, messagesPerSecond = 1) {
    this.bot = bot;
    this.interval = 1000 / messagesPerSecond;
    this.queue = [];
    this.processing = false;
  }

  add(threadId, message) {
    this.queue.push({ threadId, message });
    this.process();
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { threadId, message } = this.queue.shift();
      
      try {
        await this.bot.sendMessage(threadId, message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
      
      if (this.queue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, this.interval));
      }
    }
    
    this.processing = false;
  }
}

// Usage: Process 1 message per second
const queue = new MessageQueue(bot, 1);

queue.add(threadId, "Message 1");
queue.add(threadId, "Message 2");
queue.add(threadId, "Message 3");
```

## Best Practices

1. **Start conservatively**: Test with low request rates first
2. **Monitor for rate limits**: Listen to the `onRateLimit` event
3. **Implement backoff**: If rate limited, wait progressively longer
4. **Spread requests**: Don't burst all requests at once
5. **Use multiple accounts**: Distribute load across accounts if needed
6. **Respect Instagram**: Excessive automation may violate ToS

## Philosophy

This API gives you **complete control** over request timing. It doesn't impose artificial limitations because:

- Different use cases need different speeds
- You know your requirements better than the library
- Instagram's limits change and vary by account
- Some users have higher limits (verified, business accounts)
- Allows maximum performance when needed

**You are responsible for implementing rate limiting appropriate for your use case.**

---

**Summary:** neokex-ica has ZERO built-in rate limiting. All requests are immediate. You must implement your own rate limiting if needed.
