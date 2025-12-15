# ARTY

ARTY is a platform for artisans to showcase and sell their handcrafted products, offer workshops, and connect with customers.

## 🚨 Common Issues

### "Copilot Token Usage" Rate Limit Error

If you're seeing an error like:
```
Sorry, you have exceeded your Copilot token usage. Please review our Terms of Service. Error Code: rate_limited
```

**This is NOT an error from the ARTY application.** This error comes from your AI development platform (Lovable.dev, GitHub Copilot, etc.).

**Quick Fixes:**
- Wait 5-10 minutes and try again
- Check your AI platform's usage dashboard
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions

## 📚 Documentation

- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Solutions to common errors
- [Development Environment Guide](./docs/DEVELOPMENT_ENVIRONMENT.md) - Setup and workflow options

## 🏗️ Project Structure

```
ARTY/
├── Back/          # FastAPI backend
│   ├── app/       # Application code
│   ├── alembic/   # Database migrations
│   └── tests/     # Backend tests
├── Front/         # React + TypeScript frontend
│   ├── src/       # Source code
│   └── public/    # Static assets
└── docs/          # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup

```bash
cd Back
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
# Edit .env with your configuration
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd Front
npm install
npm run dev
```

## 🛠️ Development

You can develop ARTY using:
- Traditional local development setup
- AI-powered development platforms (Lovable.dev, Cursor, etc.)

See [Development Environment Guide](./docs/DEVELOPMENT_ENVIRONMENT.md) for more details.

## 📖 Features

- **Product Marketplace**: Artisans can list and sell handcrafted products
- **Workshops**: Offer and book creative workshops
- **User Profiles**: Showcase artisan portfolios
- **Shopping Cart**: Complete e-commerce functionality
- **Reviews & Ratings**: Customer feedback system
- **Admin Panel**: Manage products, orders, and users

## 🧪 Testing

```bash
# Backend tests
cd Back
pytest

# Frontend tests
cd Front
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: File issues on GitHub
- **Documentation**: Check the docs/ directory
- **AI Platform Issues**: Contact your platform's support