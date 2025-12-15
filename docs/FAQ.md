# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is ARTY?
A: ARTY is a platform connecting artisans with customers, allowing artisans to sell handcrafted products and offer creative workshops.

### Q: What technologies does ARTY use?
A: 
- **Backend**: FastAPI (Python), PostgreSQL, Redis, Celery
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Authentication**: JWT tokens
- **Payments**: Stripe integration
- **Search**: Elasticsearch

## Development Questions

### Q: Why am I getting a "Copilot token usage" error?
A: This error is from your AI development platform (like Lovable.dev), not from ARTY. It means you've exceeded your AI service quota. See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md#rate-limiting-errors) for solutions.

### Q: Can I develop ARTY without AI tools?
A: Absolutely! ARTY can be developed using traditional tools. See [Development Environment Guide](./DEVELOPMENT_ENVIRONMENT.md#option-1-traditional-development).

### Q: Which IDE should I use?
A: Any IDE works! Popular choices:
- **VS Code** (recommended)
- **PyCharm** (for Python)
- **WebStorm** (for frontend)
- **Cursor** (AI-assisted)
- **Lovable.dev** (AI-powered)

### Q: How do I set up the development environment?
A: See the [Quick Start](../README.md#-quick-start) section in the README.

## Error Messages

### Q: "Database connection failed" - what do I do?
A: 
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in your `.env` file
3. Verify database credentials
4. Create the database if it doesn't exist: `createdb artizaho_db`

### Q: "CORS error when calling API" - how to fix?
A:
1. Check ALLOWED_ORIGINS in backend `.env`
2. Ensure your frontend URL is included
3. Restart the backend server after changing `.env`

### Q: "Module not found" errors?
A:
- **Backend**: Activate virtual environment and run `pip install -r requirements.txt`
- **Frontend**: Run `npm install`

### Q: "Rate limit exceeded" from the ARTY API?
A: This is different from the AI platform error. Check:
1. Are you making too many requests to the API?
2. Backend rate limiting settings in `.env`
3. Wait a moment and try again

## Features & Functionality

### Q: How do payments work?
A: ARTY uses Stripe for payment processing. You'll need:
1. A Stripe account
2. API keys configured in `.env`
3. Webhook endpoints set up for payment confirmations

### Q: Can artisans manage their own workshops?
A: Yes! Artisans can:
- Create workshop listings
- Set dates and times
- Manage bookings
- Set capacity limits
- Update workshop details

### Q: What payment methods are supported?
A: Through Stripe, ARTY supports:
- Credit/Debit cards
- Digital wallets (Apple Pay, Google Pay)
- Bank transfers (depending on region)

### Q: Is there a mobile app?
A: Currently, ARTY is a responsive web application. It works on mobile browsers but doesn't have native iOS/Android apps.

## Deployment Questions

### Q: How do I deploy ARTY to production?
A: Popular options:
- **Backend**: Railway, Render, AWS, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Managed PostgreSQL on AWS RDS, DigitalOcean, or Supabase

### Q: What environment variables are required?
A: See `Back/env.example` for a complete list. Critical ones:
- DATABASE_URL
- SECRET_KEY
- STRIPE_SECRET_KEY
- REDIS_URL

### Q: How do I handle database migrations?
A: Use Alembic:
```bash
cd Back
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Security Questions

### Q: How are passwords stored?
A: Passwords are hashed using bcrypt before storage. Plain text passwords are never stored.

### Q: How does authentication work?
A: ARTY uses JWT (JSON Web Tokens):
- Access tokens (short-lived, 30 minutes)
- Refresh tokens (long-lived, 7 days)

### Q: Is the API secure?
A: Security features include:
- HTTPS enforcement in production
- JWT authentication
- Rate limiting
- CORS configuration
- SQL injection prevention (via SQLAlchemy ORM)
- XSS protection

### Q: How do I report a security vulnerability?
A: Please email security issues privately to the maintainers rather than filing public issues.

## Performance Questions

### Q: How do I improve API performance?
A:
- Enable Redis caching
- Use database indexes
- Implement pagination
- Optimize queries
- Use CDN for static assets

### Q: Why is the frontend slow?
A: Check:
- Network tab in browser DevTools
- Bundle size (`npm run build`)
- API response times
- Implement code splitting
- Use production build (`npm run build`)

## AI Development Platform Questions

### Q: What's the difference between Lovable, Cursor, and GitHub Copilot?
A:
- **Lovable.dev**: Full-stack AI development platform
- **Cursor**: AI-powered IDE (VS Code fork)
- **GitHub Copilot**: AI pair programmer (works in many IDEs)

All can be used to develop ARTY, but they have different pricing and capabilities.

### Q: Can I switch from AI-assisted to manual development?
A: Yes! Simply:
1. Clone the repository
2. Set up your local environment
3. Continue development with traditional tools

### Q: How do I avoid hitting AI token limits?
A:
- Make smaller, focused requests
- Use AI for complex logic, manual edits for simple changes
- Review and understand generated code
- Don't regenerate entire files unnecessarily

## Contribution Questions

### Q: How can I contribute?
A:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a Pull Request
5. Respond to code review feedback

### Q: What should I work on?
A: Check:
- GitHub Issues labeled "good first issue"
- Issues labeled "help wanted"
- Project roadmap
- TODO comments in code

### Q: Do I need permission to submit a PR?
A: No! Open source means anyone can contribute. Just follow the contribution guidelines.

## Still Have Questions?

- Check the [Troubleshooting Guide](../TROUBLESHOOTING.md)
- File an issue on GitHub
- Check the code documentation
- Review existing issues and PRs
