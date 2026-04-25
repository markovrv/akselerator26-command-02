# API Documentation

## Base URL
`http://localhost:3000/api/v1`

## Authentication

All protected endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer {accessToken}
```

---

## Auth Endpoints

### Register
```
POST /auth/register

Body:
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Ivan Ivanov",
  "role": "seeker" | "student"
}

Response:
{
  "accessToken": "jwt...",
  "refreshToken": "jwt...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "seeker",
    "status": "pending"
  }
}
```

### Login
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: (same as Register)
```

### Refresh Token
```
POST /auth/refresh-token

Body:
{
  "refreshToken": "jwt..."
}

Response: (same as Login)
```

### Verify Email
```
POST /auth/verify-email
Headers: Authorization: Bearer {accessToken}

Response:
{
  "message": "Email verified",
  "user": { ... }
}
```

---

## Profile Endpoints

### Get Profile
```
GET /profile
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "seeker",
  "status": "active",
  "emailVerified": true,
  "profile": {
    "id": "uuid",
    "fullName": "Ivan Ivanov",
    "phone": "+79001234567",
    "city": "Moscow",
    "age": 28,
    "relocationReady": false,
    "desiredPosition": "Developer",
    "desiredSalaryFrom": 100000,
    "preferredSchedule": "5/2",
    "healthLimitations": null,
    ...
  }
}
```

### Update Profile
```
PATCH /profile
Headers: Authorization: Bearer {accessToken}

Body: (any profile field)
{
  "phone": "+79001234567",
  "city": "St. Petersburg",
  ...
}

Response: (updated profile)
```

### Set Role
```
POST /profile/role
Headers: Authorization: Bearer {accessToken}

Body:
{
  "role": "seeker" | "student" | "enterprise_user"
}

Response:
{
  "user": { ... }
}
```

---

## Assessment Endpoints

### Get Questions
```
GET /assessment/questions

Response:
{
  "questions": [
    {
      "code": "q1",
      "text": "Какой формат работы вам подходит?",
      "type": "single_choice",
      "options": ["Сменный график", "Пятидневка", "Вахта", "Не определился"]
    },
    ...
  ]
}
```

### Start Assessment
```
POST /assessment/start
Headers: Authorization: Bearer {accessToken}

Body:
{
  "roleContext": "seeker" | "student"
}

Response:
{
  "sessionId": "uuid",
  "questions": [ ... ]
}
```

### Answer Question
```
POST /assessment/{sessionId}/answer
Headers: Authorization: Bearer {accessToken}

Body:
{
  "questionCode": "q1",
  "answer": "Сменный график" | true | 4 | ["option1", "option2"]
}

Response:
{
  "id": "uuid",
  "sessionId": "uuid",
  "questionCode": "q1",
  "answerValue": { ... },
  "weight": 1.0
}
```

### Complete Assessment
```
POST /assessment/{sessionId}/complete
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "status": "completed",
  "scoreJson": { ... },
  "completedAt": "2024-01-01T12:00:00Z"
}
```

---

## Recommendations Endpoints

### Generate Recommendations
```
POST /recommendations/generate
Headers: Authorization: Bearer {accessToken}

Query Params:
- sessionId: uuid (required)
- region?: string
- salary?: number
- format?: string

Response:
{
  "count": 10,
  "recommendations": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "enterpriseId": "uuid",
      "vacancyId": "uuid",
      "matchScore": 87,
      "explanation": "Подходит по графику, зарплате и близости региона",
      "factors": [
        { "name": "location", "weight": 0.9 },
        { "name": "salary", "weight": 0.8 }
      ],
      "rankOrder": 0,
      "Enterprise": { ... },
      "Vacancy": { ... }
    },
    ...
  ]
}
```

### Get Recommendations
```
GET /recommendations
Headers: Authorization: Bearer {accessToken}

Query Params:
- sessionId: uuid (required)

Response:
{
  "count": 10,
  "recommendations": [ ... ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields" | "Validation error"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided" | "Invalid token"
}
```

### 404 Not Found
```json
{
  "error": "User not found" | "Session not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting. Will be added in production.

---

## WebSocket Events (Future)

For real-time notifications:
- `message:new` - новое сообщение
- `tour:booked` - запись на экскурсию подтверждена
- `application:status_changed` - статус отклика изменился
