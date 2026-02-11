# Quick Start Guide
## Chatbot Flow Builder Dashboard - Complete Setup

### 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Initialization](#project-initialization)
3. [Development Environment Setup](#development-environment-setup)
4. [Running the Application](#running-the-application)
5. [Next Steps](#next-steps)

---

## 1. Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js**: v22.x LTS or v20.x LTS ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **MongoDB**: Local installation or Atlas account ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Optional but Recommended
- **VS Code**: [Download](https://code.visualstudio.com/)
- **MongoDB Compass**: GUI for MongoDB ([Download](https://www.mongodb.com/products/compass))
- **Postman**: API testing ([Download](https://www.postman.com/downloads/))
- **GitHub CLI**: `gh` command ([Download](https://cli.github.com/))

### Verify Installation
```bash
# Check versions
node --version    # Should be v22.x or v20.x LTS
npm --version     # Should be v10.x or higher
git --version     # Any recent version

# After setup, verify framework versions:
npx next --version    # Should be 16.1.6+
npx nest --version    # Should be 11.x
```

---

## 2. Project Initialization

### Step 1: Run Initialization Script

```bash
# Make the script executable
chmod +x init-repo.sh

# Run the initialization script
./init-repo.sh
```

This creates the complete project structure with all necessary files.

### Step 2: Initialize Frontend (Next.js)

```bash
cd chatbot-flow-builder/frontend

# Create Next.js 16 app with Turbopack
npx create-next-app@latest . --typescript --tailwind --app --turbopack

# Install additional dependencies
npm install @xyflow/react zustand @tanstack/react-query axios socket.io-client
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npm install date-fns uuid

# Install dev dependencies
npm install -D @types/uuid
```

**Important Notes for Next.js 16:**
- ✅ Turbopack is now the default dev server (much faster!)
- ✅ Uses React 19 with enhanced Server Components
- ✅ Partial Prerendering (PPR) available as experimental feature

### Step 3: Initialize Backend (NestJS)

```bash
cd ../backend

# Create NestJS 11 app
npx @nestjs/cli@latest new . --package-manager npm --skip-git

# Install additional dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/jwt bcrypt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/swagger
npm install class-validator class-transformer
npm install uuid

# Install dev dependencies
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
npm install -D @types/socket.io
```

**Important Notes for NestJS 11:**
- ✅ Enhanced performance and faster startup
- ✅ Improved WebSocket support
- ✅ Better dependency injection
- ✅ MongoDB 8.x compatibility

---

## 3. Development Environment Setup

### Step 1: Configure MongoDB

#### Option A: MongoDB Atlas (Recommended for beginners)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/chatbot_flow_builder`

#### Option B: Local MongoDB

```bash
# Install MongoDB locally
# macOS
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# Connection string: mongodb://localhost:27017/chatbot_flow_builder
```

### Step 2: Configure Backend Environment

```bash
cd backend

# Create .env file
cat > .env << EOF
# Application
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/chatbot_flow_builder
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatbot_flow_builder

# JWT
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Redis (Optional - for caching)
# REDIS_URL=redis://localhost:6379
EOF

# Create .env.example
cat > .env.example << EOF
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/chatbot_flow_builder
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
EOF
```

### Step 3: Configure Frontend Environment

```bash
cd ../frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF

# Create .env.local.example
cat > .env.local.example << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=http://localhost:3001
EOF
```

### Step 4: Configure TypeScript Paths

#### Frontend (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Backend (tsconfig.json)
Already configured by NestJS CLI

#### Tailwind CSS 4 Configuration

**Important:** Tailwind 4 uses CSS-first configuration!

Create/update `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Custom colors */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  
  /* Custom fonts */
  --font-sans: "Inter", system-ui, sans-serif;
}

/* Custom utilities */
@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
```

**Note:** No `tailwind.config.js` needed for basic setup!
See `TECH_STACK_UPDATED.md` for advanced Tailwind 4 configuration.

---

## 4. Running the Application

### Step 1: Start Backend

```bash
cd backend

# Install dependencies (if not done)
npm install

# Start development server
npm run start:dev

# Server should start on http://localhost:3001
# API docs available at http://localhost:3001/api/docs
```

**Expected Output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] AppModule dependencies initialized
[Nest] LOG [RoutesResolver] AppController {/api}:
[Nest] LOG [RouterExplorer] Mapped {/api/health, GET} route
[Nest] LOG [NestApplication] Nest application successfully started
[Nest] LOG Application listening on http://localhost:3001
```

### Step 2: Start Frontend

```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Server should start on http://localhost:3000
```

**Expected Output:**
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 3: Verify Setup

1. **Backend Health Check**
   - Open: http://localhost:3001/api/health
   - Should see: `{ "status": "ok", "database": "connected" }`

2. **Frontend**
   - Open: http://localhost:3000
   - Should see the home page

3. **API Documentation**
   - Open: http://localhost:3001/api/docs
   - Should see Swagger UI with all endpoints

---

## 5. Next Steps

### Development Workflow

```bash
# Create a new feature branch
git checkout -b feature/auth-system

# Make changes and commit
git add .
git commit -m "feat: implement user authentication"

# Push to GitHub
git push origin feature/auth-system

# Create pull request on GitHub
```

### Testing Setup

#### Backend Tests
```bash
cd backend

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

#### Frontend Tests
```bash
cd frontend

# Install testing libraries
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event

# Run tests
npm run test
```

### Code Quality

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

---

## 6. Common Issues and Solutions

### Issue 1: Port Already in Use

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Issue 2: MongoDB Connection Failed

**Check if MongoDB is running:**
```bash
# For local MongoDB
sudo systemctl status mongod  # Linux
brew services list             # macOS

# Test connection
mongosh "mongodb://localhost:27017"
```

**For MongoDB Atlas:**
- Verify connection string
- Check IP whitelist
- Verify database user credentials

### Issue 3: Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Restart TypeScript server in VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

---

## 7. Useful Commands

### Development
```bash
# Start both frontend and backend (from root)
npm run dev

# Start only backend
cd backend && npm run start:dev

# Start only frontend
cd frontend && npm run dev
```

### Database
```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/chatbot_flow_builder"

# Show databases
show dbs

# Use database
use chatbot_flow_builder

# Show collections
show collections

# Query users
db.users.find().pretty()
```

### Git
```bash
# Check status
git status

# View commit history
git log --oneline --graph

# Create and switch to branch
git checkout -b feature/new-feature

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Pull latest changes
git pull origin main
```

---

## 8. Project Structure Overview

```
chatbot-flow-builder/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and hooks
│   │   └── types/        # TypeScript types
│   ├── public/           # Static files
│   └── package.json
│
├── backend/              # NestJS application
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── common/      # Shared utilities
│   │   ├── config/      # Configuration
│   │   └── main.ts      # Entry point
│   ├── test/            # Tests
│   └── package.json
│
├── docs/                 # Documentation
├── .github/             # GitHub workflows
├── README.md
└── LICENSE
```

---

## 9. Development Tips

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- TypeScript Hero
- MongoDB for VS Code
- GitLens
- Thunder Client (API testing)
- Error Lens

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)

### Productivity Tips
1. Use `.nvmrc` file for Node version management
2. Set up Git hooks with Husky for pre-commit linting
3. Use VS Code snippets for common patterns
4. Keep terminal split for frontend/backend logs
5. Use MongoDB Compass for database visualization

---

## 10. Getting Help

### Documentation
- **Next.js**: https://nextjs.org/docs
- **NestJS**: https://docs.nestjs.com
- **React Flow**: https://reactflow.dev/
- **MongoDB**: https://docs.mongodb.com

### Community
- Create issues on GitHub repository
- Stack Overflow for technical questions
- Discord/Slack communities for framework support

---

## 11. Deployment Preview

Once development is complete:

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
```

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Configure environment variables
5. Deploy

---

**Quick Start Guide Version:** 1.0  
**Last Updated:** February 10, 2026  
**Support:** Create an issue on GitHub

---

## ✅ Checklist

Before starting development, ensure:

- [ ] Node.js 20.x+ installed
- [ ] MongoDB running (local or Atlas)
- [ ] Git initialized
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] Environment variables configured
- [ ] Both servers running successfully
- [ ] Can access health check endpoint
- [ ] Can access frontend homepage
- [ ] API documentation accessible

---

**You're all set! Happy coding! 🚀**
