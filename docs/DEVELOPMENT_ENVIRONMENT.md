# Development Environment Guide

## Overview

ARTY can be developed using traditional development tools or AI-powered development platforms.

## Development Options

### Option 1: Traditional Development

**Requirements:**
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL 14+
- Redis 7+

**Setup:**
```bash
# Backend
cd Back
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload

# Frontend
cd Front
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Option 2: AI-Powered Development Platforms

ARTY can be developed using AI coding assistants such as:
- **Lovable.dev** (formerly GPT Engineer)
- **GitHub Copilot**
- **Cursor**
- **Replit**
- Other AI-powered IDEs

#### Important Considerations

When using AI development platforms:

1. **Token Limits:**
   - Most platforms have usage limits (free and paid tiers)
   - Token consumption varies based on request complexity
   - Monitor your usage to avoid hitting limits

2. **Best Practices:**
   - Make incremental changes rather than large rewrites
   - Be specific in your requests to reduce token usage
   - Review generated code before applying
   - Use version control (git) to track changes

3. **Rate Limiting:**
   - AI platforms have their own rate limits
   - These are separate from ARTY application rate limits
   - See TROUBLESHOOTING.md for handling rate limit errors

## Understanding Error Messages

### Platform Errors vs Application Errors

**AI Platform Errors** (not from ARTY):
```
"Sorry, you have exceeded your Copilot token usage"
"Rate limit exceeded on AI service"
"Too many requests to AI API"
```

**ARTY Application Errors** (from the app):
```json
{
  "error": "Database connection failed",
  "detail": "Could not connect to PostgreSQL"
}
```

If you see a "Copilot token usage" error, refer to the [Troubleshooting Guide](../TROUBLESHOOTING.md#rate-limiting-errors).

## Recommended Workflow

1. **Initial Setup:**
   - Use AI platforms to generate boilerplate and scaffolding
   - Set up project structure and basic configurations

2. **Active Development:**
   - Mix AI assistance with manual coding
   - Use AI for complex logic, manual editing for simple changes
   - Always review and test AI-generated code

3. **Debugging:**
   - Use traditional debugging tools (print, debugger, logs)
   - AI platforms can help explain errors but may consume tokens
   - Refer to documentation and Stack Overflow for common issues

4. **Production:**
   - Thoroughly test all code before deployment
   - Use manual code review for critical changes
   - Set up proper CI/CD pipelines

## Version Control

Always use Git for version control:

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Create feature branches
git checkout -b feature/your-feature-name

# Regular commits
git add .
git commit -m "Descriptive commit message"

# Push to remote
git push origin feature/your-feature-name
```

## Getting Help

- **ARTY Issues:** File issues on GitHub repository
- **AI Platform Issues:** Contact platform support
- **General Development:** Community forums, Stack Overflow
- **Documentation:** Check docs/ directory

## Switching Between Environments

You can seamlessly switch between AI-assisted and traditional development:

1. **From AI Platform to Local:**
   ```bash
   git clone <repository-url>
   # Follow traditional setup above
   ```

2. **From Local to AI Platform:**
   - Commit and push your changes
   - Import repository into AI platform
   - Continue development

Both approaches work with the same codebase and configuration.
