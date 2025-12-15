# Troubleshooting Guide

## Rate Limiting Errors

### "Sorry, you have exceeded your Copilot token usage" Error

**Error Message:**
```
Sorry, you have been rate-limited. Please wait a moment before trying again. Learn More

Server Error: Sorry, you have exceeded your Copilot token usage. Please review our Terms of Service. Error Code: rate_limited
```

#### What This Means

This error is **NOT** from the ARTY application itself, but from your development environment or AI coding assistant service (such as Lovable.dev, GPT Engineer, or similar AI-powered development platforms).

#### Why This Happens

AI-powered development platforms use token-based billing for API calls to AI services (like OpenAI's GPT). When you exceed your allocated quota:
- Free tier limits have been reached
- Your subscription plan's token limit has been exceeded
- Too many requests in a short time period

#### How to Resolve

1. **Wait and Retry**
   - Most rate limits are temporary
   - Wait 5-10 minutes before trying again
   - For hourly limits, wait until the next hour

2. **Check Your Service Dashboard**
   - Log into your AI development platform (Lovable.dev, etc.)
   - Check your usage statistics and quotas
   - Review your current plan limits

3. **Upgrade Your Plan**
   - If you frequently hit limits, consider upgrading to a higher tier
   - Review the Terms of Service and pricing for your platform
   - Contact support for enterprise options if needed

4. **Optimize Your Usage**
   - Make smaller, more focused requests
   - Avoid regenerating entire files when only small changes are needed
   - Use manual coding for simple changes
   - Clear your session and start fresh if stuck in a loop

5. **Alternative Solutions**
   - Switch to manual development temporarily
   - Use a different AI coding assistant
   - Set up local development environment to continue work

#### This is NOT an Application Error

Important: This error does not indicate a problem with the ARTY application code or configuration. It's a limitation of your development tooling, not the application itself.

---

## Application-Level Rate Limiting

The ARTY backend includes rate limiting capabilities using `slowapi` to protect API endpoints from abuse.

### Configuration

Rate limiting is configured via environment variables in `.env`:

```bash
# Rate Limiting (to be implemented)
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```

### Expected Application Rate Limit Response

When the ARTY application rate limits a request, you'll see:
```json
{
  "error": "Rate limit exceeded",
  "detail": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

This is different from the AI development platform error mentioned above.

---

## Other Common Issues

### Database Connection Errors
- Check DATABASE_URL in your `.env` file
- Ensure PostgreSQL is running
- Verify database credentials

### CORS Errors
- Check ALLOWED_ORIGINS in `.env`
- Ensure frontend URL is included in allowed origins
- Verify CORS middleware is properly configured

### Authentication Errors
- Verify SECRET_KEY is set in `.env`
- Check token expiration settings
- Ensure user credentials are correct

For more help, please file an issue on our GitHub repository.
