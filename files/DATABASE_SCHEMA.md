# Database Schema Design
## Chatbot Flow Builder - MongoDB Schema

### 1. OVERVIEW

**Database Type:** MongoDB (Document-based NoSQL)  
**ODM:** Mongoose  
**Database Name:** `chatbot_flow_builder`

---

### 2. COLLECTIONS

#### 2.1 Users Collection

**Collection Name:** `users`

```typescript
interface User {
  _id: ObjectId;                    // Auto-generated
  email: string;                    // Unique, lowercase
  password: string;                 // Hashed with bcrypt
  name: string;                     // User's full name
  role: 'user' | 'admin';          // User role
  avatar?: string;                  // Optional avatar URL
  settings: {
    theme: 'light' | 'dark';       // UI theme preference
    autoSave: boolean;              // Auto-save preference
    autoSaveInterval: number;       // In seconds
  };
  lastLoginAt?: Date;               // Last login timestamp
  emailVerified: boolean;           // Email verification status
  createdAt: Date;                  // Auto-generated
  updatedAt: Date;                  // Auto-generated
}
```

**Mongoose Schema:**
```typescript
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: String,
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    autoSave: {
      type: Boolean,
      default: true,
    },
    autoSaveInterval: {
      type: Number,
      default: 30,
    },
  },
  lastLoginAt: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for flows
UserSchema.virtual('flows', {
  ref: 'Flow',
  localField: '_id',
  foreignField: 'userId',
});

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};
```

---

#### 2.2 Flows Collection

**Collection Name:** `flows`

```typescript
interface NodeData {
  label?: string;                   // Node label
  message?: string;                 // Message content (for message nodes)
  inputType?: 'text' | 'number' | 'email' | 'choice';  // Input type
  placeholder?: string;             // Input placeholder
  validation?: {
    required: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  conditions?: Array<{              // For condition nodes
    id: string;
    variable: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains';
    value: any;
    targetNodeId: string;
  }>;
  apiConfig?: {                     // For API nodes
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    responseVariable?: string;
    timeout?: number;
  };
  delay?: number;                   // Delay in milliseconds
  targetNodeId?: string;            // For jump nodes
  richContent?: {                   // For rich message nodes
    type: 'text' | 'image' | 'link' | 'card';
    content: any;
  };
}

interface Node {
  id: string;                       // UUID
  type: 'start' | 'end' | 'message' | 'input' | 'condition' | 'api' | 'delay' | 'jump';
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  style?: Record<string, any>;      // Custom styling
}

interface Edge {
  id: string;                       // UUID
  source: string;                   // Source node ID
  target: string;                   // Target node ID
  sourceHandle?: string;            // Source handle ID
  targetHandle?: string;            // Target handle ID
  label?: string;                   // Edge label
  type?: 'default' | 'step' | 'smoothstep' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
}

interface Flow {
  _id: ObjectId;
  userId: ObjectId;                 // Reference to User
  name: string;                     // Flow name
  description?: string;             // Flow description
  status: 'draft' | 'active' | 'inactive';
  nodes: Node[];                    // Array of nodes
  edges: Edge[];                    // Array of edges
  viewport: {                       // Canvas viewport state
    x: number;
    y: number;
    zoom: number;
  };
  variables: Array<{                // Flow-level variables
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    defaultValue?: any;
  }>;
  tags: string[];                   // Searchable tags
  version: number;                  // Current version number
  isTemplate: boolean;              // Template flag
  templateCategory?: string;        // If template
  stats: {
    totalRuns: number;
    successfulRuns: number;
    averageCompletionTime: number;  // In seconds
    lastRunAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastEditedAt: Date;
}
```

**Mongoose Schema:**
```typescript
const FlowSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
    index: true,
  },
  nodes: [{
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['start', 'end', 'message', 'input', 'condition', 'api', 'delay', 'jump'],
      required: true,
    },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    style: Schema.Types.Mixed,
  }],
  edges: [{
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true },
    sourceHandle: String,
    targetHandle: String,
    label: String,
    type: String,
    animated: Boolean,
    style: Schema.Types.Mixed,
  }],
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 },
  },
  variables: [{
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['string', 'number', 'boolean', 'array', 'object'],
      required: true,
    },
    defaultValue: Schema.Types.Mixed,
  }],
  tags: {
    type: [String],
    index: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  templateCategory: String,
  stats: {
    totalRuns: { type: Number, default: 0 },
    successfulRuns: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 },
    lastRunAt: Date,
  },
  lastEditedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound indexes
FlowSchema.index({ userId: 1, status: 1 });
FlowSchema.index({ userId: 1, updatedAt: -1 });
FlowSchema.index({ name: 'text', description: 'text' });
FlowSchema.index({ isTemplate: 1, templateCategory: 1 });

// Ensure only one active flow per user (optional constraint)
FlowSchema.index(
  { userId: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_flow_per_user'
  }
);

// Update lastEditedAt on save
FlowSchema.pre('save', function(next) {
  this.lastEditedAt = new Date();
  next();
});
```

---

#### 2.3 Flow Versions Collection (Bonus)

**Collection Name:** `flow_versions`

```typescript
interface FlowVersion {
  _id: ObjectId;
  flowId: ObjectId;                 // Reference to Flow
  versionNumber: number;            // Sequential version
  snapshot: {                       // Complete flow snapshot
    name: string;
    description?: string;
    nodes: Node[];
    edges: Edge[];
    viewport: any;
    variables: any[];
  };
  changeDescription?: string;       // What changed
  changeType: 'manual' | 'auto';   // How it was created
  createdBy: ObjectId;              // Reference to User
  createdAt: Date;
  fileSize: number;                 // In bytes
}
```

**Mongoose Schema:**
```typescript
const FlowVersionSchema = new Schema({
  flowId: {
    type: Schema.Types.ObjectId,
    ref: 'Flow',
    required: true,
    index: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  snapshot: {
    name: String,
    description: String,
    nodes: [Schema.Types.Mixed],
    edges: [Schema.Types.Mixed],
    viewport: Schema.Types.Mixed,
    variables: [Schema.Types.Mixed],
  },
  changeDescription: String,
  changeType: {
    type: String,
    enum: ['manual', 'auto'],
    default: 'manual',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileSize: Number,
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Compound indexes
FlowVersionSchema.index({ flowId: 1, versionNumber: -1 });
FlowVersionSchema.index({ flowId: 1, createdAt: -1 });

// Unique constraint
FlowVersionSchema.index(
  { flowId: 1, versionNumber: 1 },
  { unique: true }
);

// Calculate file size before save
FlowVersionSchema.pre('save', function(next) {
  this.fileSize = JSON.stringify(this.snapshot).length;
  next();
});
```

---

#### 2.4 Chat Sessions Collection (Optional - for Analytics)

**Collection Name:** `chat_sessions`

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  nodeId?: string;                  // Which node generated this
  metadata?: Record<string, any>;
}

interface ChatSession {
  _id: ObjectId;
  sessionId: string;                // UUID for session tracking
  flowId: ObjectId;                 // Reference to Flow
  userId?: ObjectId;                // Optional user reference
  status: 'active' | 'completed' | 'abandoned' | 'error';
  messages: ChatMessage[];
  currentNodeId?: string;           // Current position in flow
  variables: Record<string, any>;   // Session variables
  startedAt: Date;
  endedAt?: Date;
  duration?: number;                // In seconds
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
```

**Mongoose Schema:**
```typescript
const ChatSessionSchema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  flowId: {
    type: Schema.Types.ObjectId,
    ref: 'Flow',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'error'],
    default: 'active',
    index: true,
  },
  messages: [{
    id: String,
    role: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true,
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    nodeId: String,
    metadata: Schema.Types.Mixed,
  }],
  currentNodeId: String,
  variables: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  startedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  endedAt: Date,
  duration: Number,
  ipAddress: String,
  userAgent: String,
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true,
});

// Indexes
ChatSessionSchema.index({ flowId: 1, startedAt: -1 });
ChatSessionSchema.index({ userId: 1, startedAt: -1 });
ChatSessionSchema.index({ status: 1, startedAt: -1 });

// Calculate duration on end
ChatSessionSchema.pre('save', function(next) {
  if (this.endedAt && this.startedAt) {
    this.duration = Math.floor((this.endedAt.getTime() - this.startedAt.getTime()) / 1000);
  }
  next();
});

// TTL index - auto-delete after 30 days
ChatSessionSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);
```

---

#### 2.5 Refresh Tokens Collection

**Collection Name:** `refresh_tokens`

```typescript
interface RefreshToken {
  _id: ObjectId;
  userId: ObjectId;                 // Reference to User
  token: string;                    // Hashed refresh token
  expiresAt: Date;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
  };
  createdAt: Date;
}
```

**Mongoose Schema:**
```typescript
const RefreshTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// TTL index - auto-delete expired tokens
RefreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
```

---

### 3. RELATIONSHIPS

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────┐       ┌──────────────────┐
│    Flows    │◄──1:N─┤  Flow Versions   │
└──────┬──────┘       └──────────────────┘
       │
       │ 1:N
       │
┌──────▼──────────┐
│  Chat Sessions  │
└─────────────────┘
```

---

### 4. DATA MIGRATION STRATEGY

#### 4.1 Initial Setup
```typescript
// Create indexes
await User.createIndexes();
await Flow.createIndexes();
await FlowVersion.createIndexes();
await ChatSession.createIndexes();
await RefreshToken.createIndexes();

// Create default admin user
const adminUser = await User.create({
  email: 'admin@example.com',
  password: await bcrypt.hash('Admin123!', 10),
  name: 'Admin User',
  role: 'admin',
  emailVerified: true,
});
```

#### 4.2 Sample Data (Development)
```typescript
// Create sample flow
const sampleFlow = await Flow.create({
  userId: adminUser._id,
  name: 'Welcome Flow',
  description: 'A simple welcome chatbot flow',
  status: 'active',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 100, y: 100 },
      data: { label: 'Start' },
    },
    {
      id: 'message-1',
      type: 'message',
      position: { x: 100, y: 200 },
      data: {
        label: 'Welcome',
        message: 'Hello! Welcome to our chatbot.',
      },
    },
    {
      id: 'end-1',
      type: 'end',
      position: { x: 100, y: 300 },
      data: { label: 'End' },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'start-1',
      target: 'message-1',
    },
    {
      id: 'e2',
      source: 'message-1',
      target: 'end-1',
    },
  ],
  tags: ['welcome', 'simple'],
});
```

---

### 5. PERFORMANCE OPTIMIZATION

#### 5.1 Query Optimization

```typescript
// Efficient flow listing with pagination
async getFlows(userId: ObjectId, page: number = 1, limit: number = 10) {
  return await Flow.find({ userId })
    .select('name description status tags updatedAt')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // Returns plain JS objects
}

// Efficient flow loading with only needed fields
async getFlowForEditor(flowId: ObjectId, userId: ObjectId) {
  return await Flow.findOne({ _id: flowId, userId })
    .select('name description nodes edges viewport variables')
    .lean();
}
```

#### 5.2 Aggregation Pipelines

```typescript
// Get flow statistics
async getFlowStats(userId: ObjectId) {
  return await Flow.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRuns: { $sum: '$stats.totalRuns' },
      },
    },
  ]);
}

// Get popular tags
async getPopularTags(userId: ObjectId) {
  return await Flow.aggregate([
    { $match: { userId } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
}
```

---

### 6. DATA VALIDATION

#### 6.1 Application-Level Validation

```typescript
// DTO for creating flow
export class CreateFlowDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  nodes: NodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges: EdgeDto[];
}

// Custom validation for flow structure
export class FlowValidator {
  static validate(flow: Flow): ValidationResult {
    const errors: string[] = [];

    // Must have exactly one start node
    const startNodes = flow.nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Flow must have a start node');
    } else if (startNodes.length > 1) {
      errors.push('Flow can only have one start node');
    }

    // Must have at least one end node
    const endNodes = flow.nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Flow must have at least one end node');
    }

    // All edges must reference existing nodes
    const nodeIds = new Set(flow.nodes.map(n => n.id));
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${edge.id} references non-existent source node ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${edge.id} references non-existent target node ${edge.target}`);
      }
    }

    // Check for orphaned nodes (except start)
    const connectedNodes = new Set<string>();
    flow.edges.forEach(e => {
      connectedNodes.add(e.source);
      connectedNodes.add(e.target);
    });
    
    const orphans = flow.nodes
      .filter(n => n.type !== 'start' && !connectedNodes.has(n.id))
      .map(n => n.id);
    
    if (orphans.length > 0) {
      errors.push(`Orphaned nodes found: ${orphans.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

---

### 7. BACKUP STRATEGY

#### 7.1 Automated Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mongodump \
  --uri="$MONGODB_URI" \
  --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

#### 7.2 Point-in-Time Recovery

```typescript
// Enable oplog for point-in-time recovery
// In MongoDB Atlas, this is automatic
// For self-hosted, enable replica sets

// Restore to specific point
mongorestore \
  --uri="$MONGODB_URI" \
  --oplogReplay \
  --oplogLimit=1640000000:1 \
  /path/to/backup
```

---

### 8. MONITORING QUERIES

```typescript
// Slow query monitoring
db.setProfilingLevel(1, { slowms: 100 });

// Check current operations
db.currentOp();

// Database statistics
db.stats();

// Collection statistics
db.flows.stats();

// Index usage
db.flows.aggregate([{ $indexStats: {} }]);
```

---

**Document Version:** 1.0  
**Last Updated:** February 10, 2026  
**Next Review:** After Sprint 2
