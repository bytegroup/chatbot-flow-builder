# Technology Stack - Updated Versions
## Chatbot Flow Builder Dashboard

**Last Updated:** February 11, 2026  
**Status:** Using Latest Stable Versions

---

## 🆕 Updated Technology Versions

### Frontend Stack

| Technology | Version Used | Previous | Notes |
|------------|-------------|----------|-------|
| **Next.js** | **16.1.6** | 15.x | Latest with App Router improvements |
| **React** | **19.x** | 19.x | Server Components, Actions |
| **Tailwind CSS** | **4.x** | 3.x | New CSS-first configuration |
| **TypeScript** | **5.7+** | 5.x | Latest stable |
| React Flow | Latest | Latest | @xyflow/react |
| Zustand | Latest | Latest | State management |
| React Query | Latest (v5) | Latest | @tanstack/react-query |
| Socket.IO Client | Latest | Latest | Real-time communication |

### Backend Stack

| Technology | Version Used | Previous | Notes |
|------------|-------------|----------|-------|
| **NestJS** | **11.x** | 10.x | Latest major version |
| Node.js | 22.x LTS | 20.x | Latest LTS recommended |
| TypeScript | 5.7+ | 5.x | Latest stable |
| MongoDB | 8.x | 7.x | Latest stable |
| Mongoose | Latest | Latest | ODM for MongoDB |
| Socket.IO | Latest | Latest | WebSocket server |

---

## 📦 Installation Commands (Updated)

### Frontend Setup

```bash
cd frontend

# Create Next.js 16 app
npx create-next-app@latest . --typescript --tailwind --app --turbopack

# Install dependencies
npm install @xyflow/react zustand @tanstack/react-query axios socket.io-client
npm install react-hook-form zod @hookform/resolvers
npm install lucide-react clsx tailwind-merge
npm install date-fns uuid

# Install dev dependencies
npm install -D @types/uuid @types/node
```

### Backend Setup

```bash
cd backend

# Create NestJS 11 app
npx @nestjs/cli@latest new . --package-manager npm --skip-git

# Install dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/jwt bcrypt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/swagger
npm install class-validator class-transformer
npm install uuid

# Install dev dependencies
npm install -D @types/passport-jwt @types/passport-local @types/bcrypt
npm install -D @types/socket.io @types/uuid
```

---

## 🎨 Tailwind CSS 4.x Configuration

### Important Changes in Tailwind 4

Tailwind 4 uses **CSS-first configuration** instead of `tailwind.config.js`.

### New Setup (Tailwind 4)

**1. Create `src/app/globals.css`:**

```css
@import "tailwindcss";

@theme {
  /* Custom design tokens */
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "Fira Code", monospace;
  
  /* Custom spacing */
  --spacing-section: 4rem;
  
  /* Breakpoints (if needed) */
  --breakpoint-xs: 480px;
  --breakpoint-3xl: 1920px;
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

/* Custom components */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}
```

**2. No `tailwind.config.js` needed!**

Tailwind 4 reads configuration directly from CSS using `@theme`.

**3. Optional: If you need JS config (plugins, etc.):**

Create `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Theme is now in CSS via @theme
  plugins: [
    // Add any plugins you need
  ],
} satisfies Config
```

---

## ⚡ Next.js 16 Key Features & Changes

### 1. Turbopack is Now Default

```bash
# Development (uses Turbopack automatically in Next.js 16)
npm run dev

# Build (production)
npm run build
```

### 2. Enhanced App Router

**Server Actions are stable:**

```typescript
// app/actions.ts
'use server'

export async function createFlow(formData: FormData) {
  // Server-side logic
  const name = formData.get('name')
  // ...
}
```

**Use in components:**

```typescript
// app/flows/new/page.tsx
import { createFlow } from '@/app/actions'

export default function NewFlowPage() {
  return (
    <form action={createFlow}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  )
}
```

### 3. Partial Prerendering (PPR)

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Enable Partial Prerendering
  },
}

module.exports = nextConfig
```

### 4. Improved Caching

```typescript
// Fine-grained cache control
import { unstable_cache } from 'next/cache'

const getCachedFlows = unstable_cache(
  async (userId: string) => {
    return await fetchFlows(userId)
  },
  ['flows'],
  { revalidate: 3600 } // 1 hour
)
```

### 5. React 19 Server Components

```typescript
// app/flows/page.tsx
async function FlowList() {
  // This runs on the server
  const flows = await db.flows.find()
  
  return (
    <div>
      {flows.map(flow => (
        <FlowCard key={flow._id} flow={flow} />
      ))}
    </div>
  )
}
```

---

## 🏗️ NestJS 11 Key Features & Changes

### 1. Enhanced Performance

NestJS 11 includes optimizations for:
- Faster startup time
- Improved dependency injection
- Better memory management

### 2. Updated Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0"
  }
}
```

### 3. Improved WebSocket Support

```typescript
// chat/chat.gateway.ts
import { 
  WebSocketGateway, 
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('chat:message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    // Handle message
  }
}
```

### 4. Enhanced Validation

```typescript
// flows/dto/create-flow.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes: NodeDto[];
}
```

---

## 🔄 Migration Notes

### From Next.js 15 to 16

**Changes needed:**
1. ✅ Turbopack is now default (no config change needed)
2. ✅ Update `next.config.js` if using experimental features
3. ✅ Review deprecated APIs (Next.js provides codemod tools)

**No breaking changes for most apps!**

### From Tailwind 3 to 4

**Major changes:**
1. ❗ **CSS-first configuration** - Move from `tailwind.config.js` to CSS
2. ❗ **New syntax** for theme customization using `@theme`
3. ✅ **Automatic JIT** - Always on, no config needed
4. ✅ **Better performance** - Faster builds
5. ✅ **Simpler setup** - Less configuration

**Migration steps:**
```bash
# 1. Update Tailwind
npm install tailwindcss@latest

# 2. Move theme to CSS (see globals.css above)

# 3. Remove old tailwind.config.js (optional)
# Keep only if you need plugins or complex JS logic
```

### From NestJS 10 to 11

**Changes needed:**
1. ✅ Update all `@nestjs/*` packages to v11
2. ✅ Update peer dependencies (RxJS, etc.)
3. ✅ Test WebSocket connections (improved in v11)
4. ✅ Review middleware (some optimizations)

**Run migration:**
```bash
npm install @nestjs/cli@latest -g
nest update
```

---

## 📝 Updated Package.json Examples

### Frontend package.json

```json
{
  "name": "chatbot-flow-builder-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@xyflow/react": "^12.0.0",
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "socket.io-client": "^4.8.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "date-fns": "^4.1.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.7.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "16.1.6"
  }
}
```

### Backend package.json

```json
{
  "name": "chatbot-flow-builder-backend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/mongoose": "^10.1.0",
    "mongoose": "^8.8.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "passport-local": "^1.0.0",
    "@nestjs/jwt": "^10.2.0",
    "bcrypt": "^5.1.0",
    "@nestjs/websockets": "^11.0.0",
    "@nestjs/platform-socket.io": "^11.0.0",
    "socket.io": "^4.8.0",
    "@nestjs/swagger": "^8.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "uuid": "^10.0.0",
    "rxjs": "^7.8.0",
    "reflect-metadata": "^0.2.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/schematics": "^11.0.0",
    "@nestjs/testing": "^11.0.0",
    "@types/node": "^22.0.0",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/socket.io": "^3.0.0",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.7.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.2.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.0"
  }
}
```

---

## 🎯 Updated Project Configuration Files

### next.config.js (Next.js 16)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack is default in dev, no config needed
  
  experimental: {
    // Enable if you want Partial Prerendering
    ppr: true,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Environment variables (public)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
}

export default nextConfig
```

### tsconfig.json (Frontend - Next.js 16)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
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

---

## 🚀 Performance Optimizations for Latest Versions

### Next.js 16 with Turbopack

**Development is significantly faster:**
- ⚡ Up to 700x faster than Webpack
- 🔄 Instant hot module replacement (HMR)
- 📦 Optimized bundle sizes

### Tailwind 4 with Oxide Engine

**Build performance improvements:**
- ⚡ Up to 10x faster than Tailwind 3
- 🎨 Better tree-shaking
- 📉 Smaller CSS output

### NestJS 11 Optimizations

**Runtime improvements:**
- ⚡ Faster dependency injection
- 🚀 Improved startup time
- 💾 Better memory usage

---

## ✅ Updated Development Checklist

### Version Verification

```bash
# Check Next.js version
npx next --version  # Should be 16.1.6

# Check NestJS version
npx nest --version  # Should be 11.x

# Check Node version
node --version  # Should be 22.x or 20.x LTS

# Check npm version
npm --version  # Should be 10.x+
```

### First-Time Setup

```bash
# 1. Install latest Node.js 22 LTS
nvm install 22
nvm use 22

# 2. Update npm
npm install -g npm@latest

# 3. Install NestJS CLI
npm install -g @nestjs/cli@latest

# 4. Create projects with latest versions
# (See installation commands above)
```

---

## 📚 Additional Resources for Latest Versions

### Next.js 16
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Turbopack Documentation](https://nextjs.org/docs/architecture/turbopack)
- [React 19 with Next.js](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)

### Tailwind CSS 4
- [Tailwind 4 Alpha Docs](https://tailwindcss.com/docs/v4-alpha)
- [CSS-First Configuration](https://tailwindcss.com/docs/v4-alpha/configuration)
- [Migration Guide](https://tailwindcss.com/docs/v4-alpha/upgrade-guide)

### NestJS 11
- [NestJS 11 Release Notes](https://docs.nestjs.com/migration-guide)
- [Performance Optimizations](https://docs.nestjs.com/fundamentals/performance)

---

## 🔄 Summary of Changes

| Component | Old Version | New Version | Impact |
|-----------|------------|-------------|--------|
| Next.js | 15.x | **16.1.6** | Turbopack default, PPR available |
| Tailwind | 3.x | **4.x** | CSS-first config, faster builds |
| NestJS | 10.x | **11.x** | Better performance, WebSocket improvements |
| Node.js | 20.x | 22.x | Latest LTS |
| React | 19.x | 19.x | No change |
| TypeScript | 5.x | 5.7+ | Latest stable |

---

**All documentation will now reference these latest versions. The architecture and implementation plan remain the same, with configuration adjustments for the newer versions.**

**Document Version:** 1.1  
**Last Updated:** February 11, 2026  
**Status:** Updated for Latest Tech Stack
