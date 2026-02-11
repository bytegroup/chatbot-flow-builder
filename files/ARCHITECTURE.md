# System Architecture & Design Document
## Chatbot Flow Builder Dashboard

### 1. ARCHITECTURE OVERVIEW

#### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │  React Flow  │  │  Socket.IO   │          │
│  │   Frontend   │  │   Canvas     │  │   Client     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                   │
└─────────┼─────────────────┼──────────────────┼───────────────────┘
          │                 │                  │
          │ REST API        │                  │ WebSocket
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    NestJS Backend                       │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │    │
│  │  │   Auth   │  │   Flow   │  │  Socket  │  │  Flow  │ │    │
│  │  │  Module  │  │  Module  │  │ Gateway  │  │ Engine │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘ │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MongoDB    │  │    Redis     │  │   S3/CDN     │          │
│  │   (Atlas)    │  │   (Cache)    │  │   (Media)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.2 Architecture Style
- **Pattern:** Layered Architecture with Event-Driven components
- **Communication:** REST API + WebSocket
- **Deployment:** Microservices-ready monolith
- **Scalability:** Horizontal scaling capability

---

### 2. FRONTEND ARCHITECTURE

#### 2.1 Technology Stack

```typescript
// Core
- Next.js 15.x (App Router)
- React 19.x
- TypeScript 5.x

// State Management
- Zustand (lightweight, performant)
- React Query (server state)

// UI & Styling
- Tailwind CSS
- Shadcn/ui (optional component library)
- Lucide React (icons)

// Flow Builder
- React Flow / @xyflow/react
- React DnD Kit (alternative)

// Real-time
- Socket.IO Client

// Forms & Validation
- React Hook Form
- Zod (schema validation)

// Utilities
- Axios (HTTP client)
- date-fns (date handling)
- lodash-es (utilities)
```

#### 2.2 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── flows/
│   │   │   ├── page.tsx          # Flow list
│   │   │   ├── [flowId]/
│   │   │   │   └── page.tsx      # Flow editor
│   │   │   └── new/
│   │   │       └── page.tsx      # Create flow
│   │   └── layout.tsx
│   ├── layout.tsx                # Root layout
│   ├── globals.css
│   └── providers.tsx             # Context providers
├── components/
│   ├── auth/                     # Auth components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── flow-builder/             # Flow editor components
│   │   ├── FlowCanvas.tsx
│   │   ├── NodePalette.tsx
│   │   ├── PropertyPanel.tsx
│   │   ├── Toolbar.tsx
│   │   └── nodes/                # Custom node types
│   │       ├── StartNode.tsx
│   │       ├── MessageNode.tsx
│   │       ├── ConditionNode.tsx
│   │       ├── InputNode.tsx
│   │       ├── ApiNode.tsx
│   │       ├── DelayNode.tsx
│   │       ├── JumpNode.tsx
│   │       └── EndNode.tsx
│   ├── chat-preview/             # Live preview components
│   │   ├── ChatWidget.tsx
│   │   ├── ChatMessage.tsx
│   │   └── ChatInput.tsx
│   ├── flow-management/
│   │   ├── FlowList.tsx
│   │   ├── FlowCard.tsx
│   │   └── FlowFilters.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   └── ...
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api/                      # API client
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── flows.ts
│   │   └── socket.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useFlow.ts
│   │   ├── useSocket.ts
│   │   └── useAutoSave.ts
│   ├── stores/                   # Zustand stores
│   │   ├── authStore.ts
│   │   ├── flowStore.ts
│   │   └── previewStore.ts
│   ├── utils/                    # Utility functions
│   │   ├── flowValidator.ts
│   │   ├── localStorageHelper.ts
│   │   └── formatters.ts
│   ├── types/                    # TypeScript types
│   │   ├── flow.types.ts
│   │   ├── node.types.ts
│   │   └── api.types.ts
│   └── constants/
│       ├── nodeTypes.ts
│       └── config.ts
├── public/
│   ├── icons/
│   └── images/
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

#### 2.3 State Management Strategy

```typescript
// Zustand Store Example
interface FlowStore {
  // State
  currentFlow: Flow | null;
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  isDirty: boolean;
  
  // Actions
  setFlow: (flow: Flow) => void;
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  setSelectedNode: (node: Node | null) => void;
  resetFlow: () => void;
  markDirty: () => void;
  markClean: () => void;
}

// Server State with React Query
const useFlowQuery = (flowId: string) => {
  return useQuery({
    queryKey: ['flow', flowId],
    queryFn: () => api.flows.getById(flowId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

#### 2.4 Component Architecture

**Atomic Design Pattern:**
- **Atoms:** Button, Input, Icon
- **Molecules:** InputField, NodeHeader
- **Organisms:** FlowCanvas, ChatWidget
- **Templates:** DashboardLayout, EditorLayout
- **Pages:** FlowListPage, FlowEditorPage

---

### 3. BACKEND ARCHITECTURE

#### 3.1 Technology Stack

```typescript
// Core
- NestJS 10.x
- TypeScript 5.x
- Node.js 20.x

// Database
- MongoDB (Mongoose ODM)
- Redis (caching, session)

// Authentication
- Passport.js
- JWT
- bcrypt

// Real-time
- Socket.IO
- @nestjs/websockets

// Validation
- class-validator
- class-transformer

// Documentation
- @nestjs/swagger

// Testing
- Jest
- Supertest

// Utilities
- uuid
- date-fns
```

#### 3.2 Project Structure

```
backend/
├── src/
│   ├── main.ts                   # Application entry point
│   ├── app.module.ts             # Root module
│   ├── config/                   # Configuration
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── socket.config.ts
│   ├── common/                   # Shared code
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── ws-jwt.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── ws-exception.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/
│   │   └── constants/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── user.schema.ts
│   │   │   └── dto/
│   │   ├── flows/
│   │   │   ├── flows.module.ts
│   │   │   ├── flows.controller.ts
│   │   │   ├── flows.service.ts
│   │   │   ├── schemas/
│   │   │   │   ├── flow.schema.ts
│   │   │   │   └── flow-version.schema.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-flow.dto.ts
│   │   │   │   ├── update-flow.dto.ts
│   │   │   │   └── flow-response.dto.ts
│   │   │   └── validators/
│   │   │       └── flow-validator.service.ts
│   │   ├── chat/
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.gateway.ts
│   │   │   ├── chat.service.ts
│   │   │   └── execution/
│   │   │       └── flow-executor.service.ts
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   └── database/
│       ├── database.module.ts
│       └── database.providers.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

#### 3.3 Module Architecture

```typescript
// Flow Module Example
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Flow.name, schema: FlowSchema },
      { name: FlowVersion.name, schema: FlowVersionSchema },
    ]),
  ],
  controllers: [FlowsController],
  providers: [
    FlowsService,
    FlowValidatorService,
  ],
  exports: [FlowsService],
})
export class FlowsModule {}
```

#### 3.4 API Design

**RESTful Endpoints:**

```
Authentication:
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Logout
GET    /api/auth/me                # Get current user

Flows:
GET    /api/flows                  # List all flows (paginated)
POST   /api/flows                  # Create new flow
GET    /api/flows/:id              # Get flow by ID
PUT    /api/flows/:id              # Update flow
DELETE /api/flows/:id              # Delete flow
POST   /api/flows/:id/duplicate    # Duplicate flow
PATCH  /api/flows/:id/activate     # Activate flow
PATCH  /api/flows/:id/deactivate   # Deactivate flow

Flow Versions (Bonus):
GET    /api/flows/:id/versions     # List versions
POST   /api/flows/:id/versions     # Create version
GET    /api/flows/:id/versions/:versionId  # Get specific version
POST   /api/flows/:id/versions/:versionId/restore  # Restore version

Import/Export:
POST   /api/flows/import           # Import flow JSON
GET    /api/flows/:id/export       # Export flow JSON

Health:
GET    /api/health                 # Health check
```

**WebSocket Events:**

```typescript
// Client -> Server
chat:start          // Start chat session
chat:message        // Send user message
chat:reset          // Reset conversation
chat:disconnect     // End session

// Server -> Client
chat:connected      // Connection established
chat:bot_message    // Bot response
chat:typing         // Bot typing indicator
chat:error          // Error occurred
chat:ended          // Session ended
```

---

### 4. DATABASE DESIGN

#### 4.1 MongoDB Schema Design

```typescript
// User Schema
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  role: Enum ['user', 'admin'],
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
}

// Flow Schema
{
  _id: ObjectId,
  userId: ObjectId (indexed, ref: 'User'),
  name: String,
  description: String,
  status: Enum ['draft', 'active', 'inactive'],
  nodes: [{
    id: String (UUID),
    type: Enum ['start', 'end', 'message', 'input', 'condition', 'api', 'delay', 'jump'],
    position: { x: Number, y: Number },
    data: {
      // Type-specific data
      label: String,
      message: String,
      conditions: Array,
      delay: Number,
      apiConfig: Object,
      // ... other fields
    },
  }],
  edges: [{
    id: String (UUID),
    source: String,
    target: String,
    sourceHandle: String,
    targetHandle: String,
    label: String,
  }],
  viewport: {
    x: Number,
    y: Number,
    zoom: Number,
  },
  tags: [String],
  version: Number,
  createdAt: Date,
  updatedAt: Date,
  lastEditedAt: Date,
}

// Flow Version Schema (Bonus)
{
  _id: ObjectId,
  flowId: ObjectId (indexed, ref: 'Flow'),
  versionNumber: Number,
  snapshot: Object, // Complete flow state
  changeDescription: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
}

// Chat Session Schema (Optional - for analytics)
{
  _id: ObjectId,
  flowId: ObjectId (ref: 'Flow'),
  userId: ObjectId (ref: 'User'),
  messages: [{
    role: Enum ['user', 'bot'],
    content: String,
    timestamp: Date,
    nodeId: String,
  }],
  currentNodeId: String,
  variables: Object, // Flow variables
  startedAt: Date,
  endedAt: Date,
}
```

#### 4.2 Indexes

```typescript
// Performance optimization
User:
  - email (unique)
  - createdAt

Flow:
  - userId + status
  - userId + updatedAt
  - tags
  - name (text index for search)

FlowVersion:
  - flowId + versionNumber
  - flowId + createdAt
```

---

### 5. FLOW EXECUTION ENGINE

#### 5.1 Execution Algorithm

```typescript
class FlowExecutor {
  async executeFlow(flowId: string, sessionId: string) {
    const flow = await this.getFlow(flowId);
    const session = await this.initializeSession(sessionId, flow);
    
    let currentNode = this.findStartNode(flow);
    
    while (currentNode && currentNode.type !== 'end') {
      const result = await this.executeNode(currentNode, session);
      
      if (result.waitForUser) {
        // Pause execution, wait for user input
        await this.saveSessionState(session);
        return;
      }
      
      currentNode = this.getNextNode(currentNode, result, flow);
    }
    
    await this.endSession(session);
  }
  
  private async executeNode(node: Node, session: Session) {
    switch (node.type) {
      case 'message':
        return this.executeMessageNode(node, session);
      case 'input':
        return this.executeInputNode(node, session);
      case 'condition':
        return this.executeConditionNode(node, session);
      case 'api':
        return this.executeApiNode(node, session);
      case 'delay':
        return this.executeDelayNode(node, session);
      case 'jump':
        return this.executeJumpNode(node, session);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }
}
```

#### 5.2 Node Execution Logic

**Message Node:**
- Interpolate variables in message
- Send message to client via WebSocket
- Continue to next node

**Input Node:**
- Send input request to client
- Wait for user response
- Validate response
- Store in session variables
- Continue to next node

**Condition Node:**
- Evaluate condition against session variables
- Determine which branch to follow
- Continue to appropriate next node

**API Node (Mock):**
- Simulate API call with delay
- Return mock response
- Store response in variables
- Continue to success/failure branch

**Delay Node:**
- Wait for specified duration
- Continue to next node

**Jump Node:**
- Find target node by ID
- Continue from target node

---

### 6. SECURITY ARCHITECTURE

#### 6.1 Authentication Flow

```
┌────────┐                 ┌────────┐                 ┌────────┐
│ Client │                 │  API   │                 │   DB   │
└────┬───┘                 └───┬────┘                 └───┬────┘
     │                         │                          │
     │  POST /auth/register    │                          │
     ├────────────────────────>│                          │
     │                         │  Hash password           │
     │                         │  Save user               │
     │                         ├─────────────────────────>│
     │                         │                          │
     │  { token, user }        │                          │
     │<────────────────────────┤                          │
     │                         │                          │
     │  POST /auth/login       │                          │
     ├────────────────────────>│                          │
     │                         │  Validate credentials    │
     │                         ├─────────────────────────>│
     │                         │                          │
     │                         │  Generate JWT            │
     │  { token, user }        │                          │
     │<────────────────────────┤                          │
     │                         │                          │
     │  GET /flows             │                          │
     │  Header: Bearer token   │                          │
     ├────────────────────────>│                          │
     │                         │  Verify JWT              │
     │                         │  Extract userId          │
     │                         │  Query flows             │
     │                         ├─────────────────────────>│
     │                         │                          │
     │  { flows: [...] }       │                          │
     │<────────────────────────┤                          │
```

#### 6.2 Security Measures

**Frontend:**
- HttpOnly cookies for token storage (optional)
- CSRF token validation
- Input sanitization
- XSS prevention (React escaping)
- Secure WebSocket connection (WSS)

**Backend:**
- Password hashing (bcrypt, rounds: 10)
- JWT with expiration (15min access, 7d refresh)
- Rate limiting (express-rate-limit)
- CORS configuration
- Helmet.js for HTTP headers
- Request validation (class-validator)
- SQL injection prevention (Mongoose ODM)
- Audit logging

---

### 7. DEPLOYMENT ARCHITECTURE

#### 7.1 Deployment Diagram

```
┌──────────────────────────────────────────────────────────┐
│                      Users                                │
└──────────────┬───────────────────────────────────────────┘
               │
               │ HTTPS
               ▼
┌──────────────────────────────────────────────────────────┐
│                   Vercel (Frontend)                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │            Next.js Application                      │  │
│  │  - Static pages (SSG)                              │  │
│  │  - Server components (SSR)                         │  │
│  │  - API routes (Edge functions)                     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────┘
               │
               │ REST API / WebSocket
               ▼
┌──────────────────────────────────────────────────────────┐
│              Render / Railway (Backend)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │            NestJS Application                       │  │
│  │  - REST API endpoints                              │  │
│  │  - WebSocket server                                │  │
│  │  - Flow execution engine                           │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────┘
               │
               │ MongoDB Protocol
               ▼
┌──────────────────────────────────────────────────────────┐
│                MongoDB Atlas (Database)                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │  - User data                                        │  │
│  │  - Flow data                                        │  │
│  │  - Version history                                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘

Optional:
┌──────────────────────────────────────────────────────────┐
│            Redis (Upstash/Redis Labs)                     │
│  - Session caching                                        │
│  - Rate limiting                                          │
└──────────────────────────────────────────────────────────┘
```

#### 7.2 CI/CD Pipeline

```yaml
# GitHub Actions Workflow
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend-test:
    - Checkout code
    - Setup Node.js
    - Install dependencies
    - Run linting
    - Run tests
    - Build application
  
  backend-test:
    - Checkout code
    - Setup Node.js
    - Install dependencies
    - Run linting
    - Run unit tests
    - Run integration tests
  
  deploy-frontend:
    - Deploy to Vercel (automatic)
  
  deploy-backend:
    - Deploy to Render/Railway
    - Run migrations
    - Health check
```

---

### 8. SCALABILITY CONSIDERATIONS

#### 8.1 Performance Optimization

**Frontend:**
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Lazy loading components
- Virtual scrolling for large lists
- Canvas virtualization (react-flow)
- Debouncing user input
- Memoization (React.memo, useMemo)

**Backend:**
- Database indexing
- Query optimization
- Caching (Redis)
- Connection pooling
- Compression (gzip)
- Load balancing (future)

#### 8.2 Horizontal Scaling Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
└───────────┬────────────────────────┬────────────────────┘
            │                        │
            ▼                        ▼
┌───────────────────┐    ┌───────────────────┐
│   Backend Node 1  │    │   Backend Node 2  │
│   - REST API      │    │   - REST API      │
│   - WebSocket     │    │   - WebSocket     │
└─────────┬─────────┘    └─────────┬─────────┘
          │                        │
          └────────────┬───────────┘
                       │
                       ▼
            ┌──────────────────┐
            │  Redis Adapter   │
            │  (Socket.IO)     │
            └──────────────────┘
                       │
                       ▼
            ┌──────────────────┐
            │     MongoDB      │
            └──────────────────┘
```

---

### 9. MONITORING & OBSERVABILITY

#### 9.1 Logging Strategy

**Levels:**
- ERROR: Critical failures
- WARN: Potential issues
- INFO: Important events
- DEBUG: Detailed debugging (dev only)

**What to Log:**
- API requests/responses
- Authentication events
- Flow executions
- WebSocket connections
- Database queries (slow queries)
- Errors with stack traces

#### 9.2 Metrics to Track

**Application Metrics:**
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- Active WebSocket connections
- Flow execution time

**Business Metrics:**
- User registrations
- Flows created
- Active flows
- Chat sessions
- Node usage statistics

---

### 10. TESTING STRATEGY

#### 10.1 Test Pyramid

```
              ┌─────────┐
              │   E2E   │  10%
              ├─────────┤
           ┌──┴─────────┴──┐
           │  Integration  │  30%
           ├───────────────┤
        ┌──┴───────────────┴──┐
        │       Unit           │  60%
        └──────────────────────┘
```

#### 10.2 Test Coverage

**Frontend:**
- Unit: Components, hooks, utilities (>70%)
- Integration: API client, stores
- E2E: Critical user flows (Playwright/Cypress)

**Backend:**
- Unit: Services, validators (>80%)
- Integration: Controllers, gateways (>70%)
- E2E: API endpoints, WebSocket

**Test Scenarios:**
- User registration/login
- Create/edit/delete flow
- Drag and drop nodes
- Connect nodes
- Flow validation
- Live preview execution
- Auto-save functionality
- Import/Export

---

### 11. TECHNOLOGY TRADE-OFFS

| Decision | Chosen | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Frontend Framework | Next.js | Vite + React | SEO, SSR, built-in routing |
| State Management | Zustand | Redux Toolkit | Simpler, less boilerplate |
| Flow Library | React Flow | Custom Canvas | Battle-tested, feature-rich |
| Backend Framework | NestJS | Express.js | TypeScript, structure, DI |
| Database | MongoDB | PostgreSQL | Flexible schema, fast MVP |
| Real-time | Socket.IO | WebRTC | Easier implementation |
| Deployment | Vercel + Render | AWS | Free tier, simpler setup |

---

### 12. FUTURE ARCHITECTURE ENHANCEMENTS

**Phase 2:**
- Microservices architecture
- Event sourcing for flow versions
- GraphQL API
- Server-side rendering for preview
- CDN for media assets

**Phase 3:**
- Kubernetes orchestration
- Distributed tracing (Jaeger)
- Message queue (RabbitMQ/Kafka)
- Multi-region deployment
- Real-time collaboration (CRDT)

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Architecture Review Date:** Sprint 2
