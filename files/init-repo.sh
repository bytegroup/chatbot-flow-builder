#!/bin/bash

# Chatbot Flow Builder - GitHub Repository Setup Script
# This script initializes the project structure and creates necessary files

set -e  # Exit on any error

echo "🚀 Initializing Chatbot Flow Builder Project..."
echo ""

# Project name
PROJECT_NAME="chatbot-flow-builder"

# Create main project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

echo "📁 Creating project structure..."

# Initialize git repository
git init
git branch -M main

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment variables
.env
.env.local
.env.production
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.temp/
.tmp/
*.tsbuildinfo
EOF

# Create main README
cat > README.md << 'EOF'
# 🤖 Chatbot Flow Builder Dashboard

A visual, drag-and-drop chatbot flow builder for configuring conversational flows with live preview and backend synchronization.

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- ✅ **Visual Flow Builder**: Drag-and-drop interface for creating chatbot flows
- ✅ **8 Node Types**: Start, End, Message, Input, Condition, API, Delay, Jump
- ✅ **Flow Management**: Create, edit, delete, duplicate, activate/deactivate flows
- ✅ **Flow Validation**: Real-time error detection and broken connection warnings
- ✅ **Live Preview**: WebSocket-based real-time chatbot preview
- ✅ **Authentication**: Secure JWT-based user authentication
- ✅ **Auto-save**: Automatic flow state preservation

### Bonus Features
- ⭐ **Version Control**: Track flow changes and rollback capability
- ⭐ **Import/Export**: JSON-based flow portability
- ⭐ **Rich Editor**: Enhanced message editing with media support

## 🎥 Demo

- **Live Demo**: [https://chatbot-flow-builder.vercel.app](https://chatbot-flow-builder.vercel.app)
- **Demo Video**: [Watch on YouTube](https://youtube.com/...)
- **API Docs**: [https://api.chatbot-flow-builder.com/docs](https://api.chatbot-flow-builder.com/docs)

### Screenshots

![Flow Builder](./docs/images/flow-builder.png)
*Visual Flow Builder Interface*

![Live Preview](./docs/images/live-preview.png)
*Real-time Chat Preview*

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Next.js   │ ◄─────► │   NestJS    │ ◄─────► │   MongoDB   │
│  Frontend   │  REST/  │   Backend   │         │   Database  │
│             │  WebSocket│            │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **State Management**: Zustand + React Query
- **Flow Builder**: React Flow
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### DevOps
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render / Railway
- **Database**: MongoDB Atlas
- **Monitoring**: (Optional) Sentry

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm/yarn/pnpm
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/chatbot-flow-builder.git
cd chatbot-flow-builder
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run start:dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Environment Variables

#### Backend (.env)
```env
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/chatbot-flow-builder

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 📁 Project Structure

```
chatbot-flow-builder/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities, hooks, stores
│   └── public/              # Static assets
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared code
│   │   └── config/         # Configuration
│   └── test/               # Tests
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
├── .github/                 # GitHub workflows
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
└── README.md
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
POST   /api/auth/refresh     - Refresh access token
GET    /api/auth/me          - Get current user
```

### Flow Endpoints

```
GET    /api/flows            - Get all flows (paginated)
POST   /api/flows            - Create new flow
GET    /api/flows/:id        - Get flow by ID
PUT    /api/flows/:id        - Update flow
DELETE /api/flows/:id        - Delete flow
POST   /api/flows/:id/duplicate  - Duplicate flow
PATCH  /api/flows/:id/activate   - Activate flow
```

### WebSocket Events

```
Client → Server:
- chat:start          - Start chat session
- chat:message        - Send user message
- chat:reset          - Reset conversation

Server → Client:
- chat:connected      - Connection established
- chat:bot_message    - Bot response
- chat:typing         - Typing indicator
- chat:error          - Error occurred
```

For complete API documentation, visit the Swagger UI at `/api/docs`

## 🚀 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy automatically

### Backend (Render/Railway)

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start:prod`
5. Configure environment variables
6. Deploy

For detailed deployment instructions, see [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage

# Frontend tests
cd frontend
npm run test           # Jest tests
npm run test:e2e       # Playwright tests
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 Known Limitations

- Single active flow per user in MVP
- Mock API calls only (no real webhook integration)
- Desktop-first design (limited mobile support)
- English language only
- WebSocket may require special configuration for some free hosting

## 🗺️ Roadmap

- [ ] Multi-user collaboration
- [ ] Flow templates library
- [ ] Analytics dashboard
- [ ] A/B testing flows
- [ ] Integration with actual chatbot platforms
- [ ] Mobile app
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- React Flow for the amazing flow builder library
- NestJS team for the excellent framework
- Anthropic for Claude AI assistance

## 📞 Support

For support, email support@chatbotflowbuilder.com or open an issue in the GitHub repository.

---

**Built with ❤️ using Next.js, NestJS, and MongoDB**
EOF

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Chatbot Flow Builder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

# Create CONTRIBUTING.md
cat > CONTRIBUTING.md << 'EOF'
# Contributing to Chatbot Flow Builder

Thank you for your interest in contributing! We welcome contributions from everyone.

## Code of Conduct

Please be respectful and constructive in all interactions.

## How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Ensure tests pass**: `npm run test`
6. **Commit with conventional commits**: `git commit -m 'feat: add new feature'`
7. **Push to your fork**: `git push origin feature/your-feature-name`
8. **Create a Pull Request**

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Development Setup

See the [README.md](./README.md) for setup instructions.

## Pull Request Process

1. Update documentation for any new features
2. Add tests for bug fixes or new features
3. Ensure CI/CD pipeline passes
4. Request review from maintainers
5. Address review comments
6. Wait for approval and merge

## Coding Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write unit tests for business logic

## Questions?

Open an issue or reach out to the maintainers.
EOF

# Create directory structure
echo "📂 Creating directory structure..."

# Frontend structure
mkdir -p frontend/{app,components,lib,public}
mkdir -p frontend/app/{auth,dashboard}
mkdir -p frontend/components/{auth,flow-builder,chat-preview,ui,layout}
mkdir -p frontend/lib/{api,hooks,stores,utils,types,constants}

# Backend structure
mkdir -p backend/{src,test}
mkdir -p backend/src/{modules,common,config}
mkdir -p backend/src/modules/{auth,users,flows,chat,health}
mkdir -p backend/src/common/{decorators,guards,filters,interceptors,pipes}
mkdir -p backend/test/{unit,integration,e2e}

# Docs structure
mkdir -p docs/{images,api}

# GitHub workflows
mkdir -p .github/{workflows,ISSUE_TEMPLATE}

# Create GitHub workflow files
cat > .github/workflows/frontend-ci.yml << 'EOF'
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
EOF

cat > .github/workflows/backend-ci.yml << 'EOF'
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ./backend

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test
      
      - name: Run e2e tests
        run: npm run test:e2e
      
      - name: Build application
        run: npm run build
EOF

# Create issue templates
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g. Chrome 90]
- OS: [e.g. macOS 12]
- Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem.
EOF

cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request.
EOF

# Create pull request template
cat > .github/PULL_REQUEST_TEMPLATE.md << 'EOF'
## Description
Please include a summary of the changes and which issue is fixed.

Fixes # (issue)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Please describe the tests that you ran to verify your changes.

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
EOF

# Create initial commit
git add .
git commit -m "chore: initial project structure setup

- Initialize project with frontend and backend directories
- Add comprehensive README with setup instructions
- Configure GitHub Actions for CI/CD
- Add issue and PR templates
- Setup LICENSE and CONTRIBUTING guidelines"

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Initialize frontend: cd frontend && npx create-next-app@latest . --typescript --tailwind --app"
echo "2. Initialize backend: cd backend && npx @nestjs/cli new . --package-manager npm"
echo "3. Create GitHub repository: gh repo create chatbot-flow-builder --public --source=."
echo "4. Push to GitHub: git push -u origin main"
echo ""
echo "🎉 Happy coding!"
EOF

chmod +x init-repo.sh

echo "Repository initialization script created successfully at /home/claude/init-repo.sh"
