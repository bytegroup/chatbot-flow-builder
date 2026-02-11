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