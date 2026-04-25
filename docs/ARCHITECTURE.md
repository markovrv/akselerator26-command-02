# Architecture Overview

## System Design

The application follows a client-server architecture with a React/Vite frontend and an Express.js backend, communicating via RESTful API over HTTP/JWT.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Vite)                 │
│                                                                 │
│  Header │ Home │ Auth │ Dashboard │ Assessment │ Recommendations│
└────────────────────────────┬────────────────────────────────────┘
                             │
                     HTTP/REST API (JWT)
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                     Backend (Express.js)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           API Routes & Controllers                       │  │
│  │  /auth │ /profile │ /assessment │ /recommendations      │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │                                             │
│  ┌────────────────┴──────────────────────────────────────────┐ │
│  │              Services (Business Logic)                    │ │
│  │  AuthService │ ProfileService │ MatchingService │ ...   │ │
│  └────────────────┬──────────────────────────────────────────┘ │
│                   │                                             │
│  ┌────────────────┴──────────────────────────────────────────┐ │
│  │         Models (Sequelize ORM)                           │ │
│  │  User │ Profile │ Enterprise │ Vacancy │ Assessment │    │ │
│  └────────────────┬──────────────────────────────────────────┘ │
└────────────────────┴──────────────────────────────────────────┘
                             │
                   ┌──────────┴───────────┐
                   │                      │
            SQLite DB (dev)     External Eval API
                   (PostgreSQL prod)   (LLM-based recommendations)
```

## Frontend Architecture

### Technology Stack
- **Framework**: React 19 with Vite 8 as build tool
- **Styling**: Tailwind CSS 4 via PostCSS
- **State Management**: Zustand 5
- **Form Handling**: React Hook Form 7
- **UI Components**: React Icons, React Hot Toast
- **Routing**: React Router DOM 7
- **HTTP Client**: Axios
- **Linting**: ESLint with React plugin
- **PostCSS**: Autoprefixer

### State Management (Zustand)
```
┌──────────────────────────────────────┐
│       Global State Stores            │
├──────────────────────────────────────┤
│ ├─ authStore                         │
│ │  ├─ user                           │
│ │  ├─ isAuthenticated                │
│ │  ├─ login()                        │
│ │  └─ logout()                       │
│ │                                    │
│ ├─ assessmentStore                   │
│ │  ├─ sessionId                      │
│ │  ├─ questions                      │
│ │  ├─ answers                        │
│ │  ├─ recommendations                │
│ │  ├─ startAssessment()              │
│ │  ├─ answerQuestion()               │
│ │  └─ completeAssessment()           │
└──────────────────────────────────────┘
```

### Page Structure
```
Home
├─ Hero Section
├─ How It Works
├─ Features
├─ CTA Section
└─ For Enterprises

Auth
├─ RegisterPage
│  └─ RegisterForm (3-step)
└─ LoginPage
   └─ LoginForm

Dashboard
├─ DashboardPage (overview)
├─ ProfilePage (edit profile)
├─ AssessmentPage (step-by-step quiz)
├─ RecommendationsPage (results)
├─ DigitalPassportPage (passport)
├─ MessagesPage (chat)
└─ ApplicationsPage (job applications)

Enterprises (Placeholder)
└─ EnterpriseDetailPage (full details)
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js with Express.js 5
- **ORM**: Sequelize 6 (SQLite for development, configurable for PostgreSQL)
- **Authentication**: JWT (jsonwebtoken 9) with bcryptjs 3 for password hashing
- **Validation**: Joi 18
- **Security**: Helmet 8, CORS
- **Email**: Nodemailer 8
- **Logging**: Winston 3
- **Environment**: Dotenv 17
- **HTTP Client**: Axios (for external API)
- **UUID**: uuid 14
- **Linting**: ESLint 10

### Request Flow
```
Request → Auth Middleware → Controller → Service → Database/External API
          ↓
       JWT Verification
       & CORS Check
```

### Matching Service (Core Logic)
```
┌─────────────────────────────────────────────┐
│      matchingService.generateRecommendations│
├─────────────────────────────────────────────┤
│                                             │
│ 1. Get Assessment Session & Answers        │
│ 2. Get User Profile                        │
│ 3. Get All Enterprises & Vacancies         │
│                                             │
│ 4. TRY: Call External Evaluation API        │
│    ├─ Send: user profile + answers         │
│    ├─ Receive: match scores + explanations │
│    └─ CATCH: Fallback to basicScoring()    │
│                                             │
│ 5. Save Results to MatchResult table       │
│ 6. Return Top 10 Recommendations           │
│                                             │
└─────────────────────────────────────────────┘
```

### Scoring Algorithm (Fallback)
```
Match Score Calculation:

Location Match: +20 (if same city) or +10 (if relocation ready)
Salary Match: +25 (if vacancy >= desired salary)
Position Match: +25 (if position title matches)
Schedule Match: +15 (if schedule matches preference)
Student Available: +10 (if isStudentAvailable)

Total: min(score, 100)
```

### External API Integration
**When:** After assessment completion, user requests recommendations
**What:** Send user profile + answers → Get ranked matches

**Contract:**
```javascript
// Request
POST https://external-service.com/api/v1/recommendations/evaluate
{
  userId,
  userProfile: { city, age, desiredPosition, salary, ... },
  assessmentAnswers: [ { questionCode, answer }, ... ],
  enterpriseIds: [],
  vacancyIds: []
}

// Response
{
  recommendations: [
    {
      enterpriseId,
      vacancyId,
      matchScore: 0-100,
      explanation: "...",
      factors: [ { name, weight }, ... ]
    }
  ]
}
```

**Error Handling:**
- Timeout: 10 seconds
- If fails: Use basicScoring() as fallback
- Log error for debugging

## Database Schema

### Core Tables (Sequelize Models)
```
users
├─ id (UUID)
├─ email (unique)
├─ passwordHash
├─ role (seeker, student, enterprise_user, superadmin)
├─ status (active, pending, blocked)
└─ timestamps

user_profiles
├─ id (UUID)
├─ userId (FK)
├─ fullName
├─ phone
├─ city
├─ desiredPosition
├─ desiredSalaryFrom
├─ relocationReady
├─ healthLimitations
└─ studentInfoJson (JSONB for students)

enterprises
├─ id (UUID)
├─ name
├─ slug (unique)
├─ industry
├─ region, city, address
├─ description
├─ laborConditions
├─ moderationStatus (draft, pending, approved, rejected)
└─ timestamps

vacancies
├─ id (UUID)
├─ enterpriseId (FK)
├─ title
├─ employmentType (full_time, practice, shift)
├─ salaryFrom, salaryTo
├─ schedule
├─ requirements
├─ isStudentAvailable
├─ status (draft, published, archived)
└─ timestamps

assessment_sessions
├─ id (UUID)
├─ userId (FK)
├─ roleContext (seeker, student)
├─ status (in_progress, completed)
├─ scoreJson (JSONB)
├─ completedAt
└─ timestamps

assessment_answers
├─ id (UUID)
├─ sessionId (FK)
├─ questionCode
├─ answerValue (JSONB)
├─ weight
└─ timestamps

match_results
├─ id (UUID)
├─ sessionId (FK)
├─ enterpriseId (FK)
├─ vacancyId (FK, nullable)
├─ matchScore (0-100)
├─ explanation
├─ factors (JSONB)
├─ rankOrder
└─ timestamps
```

*Note: In development, SQLite is used. In production, PostgreSQL is configured via environment variables.*

## Security

### Authentication
- Passwords: bcryptjs with salt rounds=10
- JWT tokens: HS256 algorithm
- Access token: 24h expiry
- Refresh token: 7d expiry

### Authorization
- RBAC: seeker, student, enterprise_user, superadmin roles
- Middleware checks role on protected routes

### Validation
- Email format validation (Joi)
- Password strength: min 6 chars
- Input sanitization on all endpoints

### CORS
- Allow origin: frontend URL only
- Credentials enabled

## Error Handling
```javascript
// Middleware catches all errors:
errorHandler(err, req, res, next) {
  if (err.statusCode) → return with that status
  if (ValidationError) → 400
  if (UniqueConstraintError) → 400
  else → 500
}
```

## Deployment

### Environment Variables
```
# .env file (backend)
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
PORT, NODE_ENV
JWT_SECRET, JWT_EXPIRES_IN
EXTERNAL_EVAL_API_URL, EXTERNAL_EVAL_API_KEY
FRONTEND_URL
```

### Database
- **Development**: SQLite (file-based)
- **Production**: PostgreSQL (configured via environment variables)
- **Sequelize CLI** used for migrations and seeding:
  ```bash
  npx sequelize-cli db:migrate
  npx sequelize-cli db:seed:all
  ```

### Frontend Build
```bash
npm run build  # Outputs to dist/
```

### Docker & Docker-Compose
- Multi-stage Docker builds for both frontend and backend
- Backend: Node.js production build
- Frontend: Vite build served via nginx
- Network isolation with bridge network
- Persistent volumes for data and uploads

## Performance

### Caching
- Recommendations: cached for 1 hour per session
- Enterprise catalog: cached for 30 minutes

### Optimization
- Lazy-load pages (React Router)
- Image optimization (for future 3D assets)
- API response pagination (planned for future)

### Database
- Indexes on userId, enterpriseId, vacancyId
- Connection pooling: min=0, max=5

## Monitoring & Logging

### Logs
- Winston logger: info, warn, error levels
- Log file: backend/logs/app.log

### Events (Analytics)
- user:registered
- assessment:completed
- recommendation:viewed
- application:submitted
- tour:booked
