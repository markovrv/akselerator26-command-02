# API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer {accessToken}
```

Tokens are obtained via `/auth/login` or `/auth/register`.

---

## 1. Auth Endpoints

### 1.1 Register

**POST** `/auth/register`

Creates a new user account.

**Request Body:**

| Field      | Type     | Required | Description                     |
|------------|----------|----------|---------------------------------|
| email      | string   | ✅       | User email address              |
| password   | string   | ✅       | Min 6 characters                |
| fullName   | string   | ✅       | User’s full name                |
| role       | string   | ❌       | `seeker`, `student`, `enterprise_user` (default `seeker`) |

**Response:** `201 Created`

```json
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

### 1.2 Login

**POST** `/auth/login`

**Request Body:**

| Field    | Type   | Required |
|----------|--------|----------|
| email    | string | ✅       |
| password | string | ✅       |

**Response:** `200 OK` (same as Register)

### 1.3 Refresh Token

**POST** `/auth/refresh-token`

**Request Body:**

| Field        | Type   | Required |
|--------------|--------|----------|
| refreshToken | string | ✅       |

**Response:** `200 OK` (same as Login)

### 1.4 Verify Email

**POST** `/auth/verify-email`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `200 OK`

```json
{
  "message": "Email verified",
  "user": { ... }
}
```

---

## 2. Profile Endpoints

### 2.1 Get Profile

**GET** `/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `200 OK`

```json
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
    "healthLimitations": null
  }
}
```

### 2.2 Update Profile

**PATCH** `/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:** any fields from profile (e.g., `fullName`, `phone`, `city`, `age`, `relocationReady`, `desiredPosition`, `desiredSalaryFrom`, `preferredSchedule`, `healthLimitations`, etc.)

**Response:** `200 OK` (updated profile)

### 2.3 Set Role

**POST** `/profile/role`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**

| Field | Type   | Required | Description                                |
|-------|--------|----------|--------------------------------------------|
| role  | string | ✅       | `seeker`, `student`, `enterprise_user`     |
| enterpriseId | string | ❌ (условно) | Required when role = `enterprise_user` |

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "...",
    "role": "enterprise_user"
  }
}
```

---

## 3. Assessment Endpoints

### 3.1 Get Questions

**GET** `/assessment/questions`

**Response:** `200 OK`

```json
{
  "questions": [
    {
      "code": "q1",
      "text": "Какой формат работы вам подходит?",
      "type": "single_choice",
      "options": ["Сменный график", "Пятидневка", "Вахта", "Не определился"]
    },
    {
      "code": "q2",
      "text": "Готовы ли вы к переезду?",
      "type": "boolean"
    },
    {
      "code": "q3",
      "text": "Насколько важен карьерный рост?",
      "type": "scale_1_5"
    },
    {
      "code": "q4",
      "text": "Есть ли ограничения по условиям труда?",
      "type": "multi_choice",
      "options": ["Высокие температуры", "Химические вещества", "Физическая нагрузка", "Нет ограничений"]
    },
    {
      "code": "q5",
      "text": "Какой уровень зарплаты вы ожидаете?",
      "type": "single_choice",
      "options": ["до 40 000 ₽", "40 000 - 60 000 ₽", "60 000 - 80 000 ₽", "80 000 - 120 000 ₽", "свыше 120 000 ₽"]
    },
    {
      "code": "q6",
      "text": "Интересует ли вас практика/стажировка?",
      "type": "boolean"
    }
  ]
}
```

### 3.2 Start Assessment

**POST** `/assessment/start`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**

| Field        | Type   | Required | Default  |
|--------------|--------|----------|----------|
| roleContext  | string | ❌       | `seeker` |

**Response:** `201 Created`

```json
{
  "sessionId": "uuid",
  "questions": [ ... ]   // same as in 3.1
}
```

### 3.3 Answer Question

**POST** `/assessment/{sessionId}/answer`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**

| Field        | Type             | Required | Description                     |
|--------------|------------------|----------|---------------------------------|
| questionCode | string           | ✅       | e.g., `q1`, `q2`...             |
| answer       | string/boolean/number/array | ✅ | Depends on question type |

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "questionCode": "q1",
  "answerValue": "Сменный график",
  "weight": 1.0
}
```

### 3.4 Complete Assessment

**POST** `/assessment/{sessionId}/complete`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "completed",
  "scoreJson": { ... },
  "completedAt": "2024-01-01T12:00:00Z"
}
```

---

## 4. Recommendations Endpoints

### 4.1 Generate Recommendations

**POST** `/recommendations/generate?sessionId={sessionId}&region={region}&salary={salary}&format={format}`

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| sessionId | string | ✅       | Assessment session ID|
| region    | string | ❌       | Filter by region     |
| salary    | number | ❌       | Salary filter        |
| format    | string | ❌       | Work format filter   |

**Response:** `200 OK`

```json
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
      "factors": [ { "name": "location", "weight": 0.9 } ],
      "rankOrder": 0,
      "Enterprise": { ... },
      "Vacancy": { ... }
    }
  ]
}
```

### 4.2 Get Recommendations (saved)

**GET** `/recommendations?sessionId={sessionId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Query Parameters:**

| Parameter | Type   | Required |
|-----------|--------|----------|
| sessionId | string | ✅       |

**Response:** same as 4.1

---

## 5. Public Catalog Endpoints

### 5.1 Enterprises

#### 5.1.1 Get All Enterprises

**GET** `/enterprises?region={region}&industry={industry}&city={city}`

**Authentication:** optional

**Query Parameters:** all optional

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| region    | string | Filter by region   |
| industry  | string | Filter by industry |
| city      | string | Filter by city     |

**Response:** `200 OK`

```json
{
  "count": 15,
  "enterprises": [
    {
      "id": "uuid",
      "name": "Росатом",
      "slug": "rosatom",
      "industry": "energy",
      "region": "Moscow",
      "city": "Moscow",
      "description": "...",
      "Vacancies": [ ... ]
    }
  ]
}
```

#### 5.1.2 Get Enterprise by Slug

**GET** `/enterprises/{slug}`

**Authentication:** optional

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Росатом",
  "slug": "rosatom",
  "industry": "energy",
  "region": "Moscow",
  "city": "Moscow",
  "description": "...",
  "laborConditions": "...",
  "Vacancies": [ ... ],
  "Tours": [ ... ]
}
```

#### 5.1.3 Create Enterprise (admin only)

**POST** `/enterprises`

**Response:** `201 Created` (enterprise object)

#### 5.1.4 Update Enterprise (admin only)

**PATCH** `/enterprises/{id}`

**Response:** `200 OK`

---

### 5.2 Vacancies

#### 5.2.1 Get All Vacancies

**GET** `/vacancies?employmentType=full_time&salaryFrom=50000&city=Moscow&isStudentAvailable=true`

**Authentication:** optional

**Query Parameters:**

| Parameter           | Type    | Description                           |
|---------------------|---------|---------------------------------------|
| employmentType      | string  | `full_time`, `internship`, `practice`, `shift` |
| salaryFrom          | number  | Minimum salary                        |
| city                | string  | City filter                           |
| isStudentAvailable  | boolean | `true` or `false`                     |

**Response:** `200 OK`

```json
{
  "count": 5,
  "vacancies": [
    {
      "id": "uuid",
      "title": "Инженер-технолог",
      "employmentType": "full_time",
      "salaryFrom": 80000,
      "salaryTo": 100000,
      "schedule": "5/2",
      "requirements": "...",
      "Enterprise": { ... }
    }
  ]
}
```

#### 5.2.2 Get Vacancy by ID

**GET** `/vacancies/{id}`

**Authentication:** optional

**Response:** `200 OK` (single vacancy object)

---

### 5.3 Tours

#### 5.3.1 Get All Tours

**GET** `/tours?format=offline&enterpriseId={uuid}`

**Authentication:** optional

**Query Parameters:**

| Parameter    | Type   | Description                |
|--------------|--------|----------------------------|
| format       | string | `offline` or `online`      |
| enterpriseId | string | Filter by enterprise       |

**Response:** `200 OK`

```json
{
  "count": 3,
  "tours": [
    {
      "id": "uuid",
      "title": "Экскурсия на завод",
      "format": "offline",
      "description": "...",
      "startAt": "2025-05-10T10:00:00Z",
      "capacity": 20,
      "status": "open",
      "Enterprise": { ... }
    }
  ]
}
```

#### 5.3.2 Get Tour by ID

**GET** `/tours/{id}`

**Authentication:** optional

**Response:** `200 OK` (single tour with bookings count)

#### 5.3.3 Book a Tour

**POST** `/tours/{id}/book`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "tourId": "uuid",
  "userId": "uuid",
  "status": "new"
}
```

#### 5.3.4 Get My Tour Bookings

**GET** `/tours/me/bookings`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `200 OK`

```json
{
  "count": 2,
  "bookings": [
    {
      "id": "uuid",
      "status": "new",
      "Tour": { ... },
      "createdAt": "..."
    }
  ]
}
```

---

## 6. Applications (Job Applications)

### 6.1 Create Application

**POST** `/applications`

**Headers:** `Authorization: Bearer {accessToken}`

**Request Body:**

| Field      | Type   | Required | Description                       |
|------------|--------|----------|-----------------------------------|
| vacancyId  | string | ✅       | ID of the vacancy                 |
| type       | string | ❌       | `job_application` (default) or `practice_application` |
| coverNote  | string | ❌       | Optional cover letter             |

**Response:** `201 Created` (application object)

### 6.2 Get My Applications

**GET** `/applications/me`

**Headers:** `Authorization: Bearer {accessToken}`

**Response:** `200 OK`

```json
{
  "count": 2,
  "applications": [
    {
      "id": "uuid",
      "status": "new",
      "createdAt": "...",
      "Vacancy": { ... },
      "Enterprise": { ... }
    }
  ]
}
```

### 6.3 Get Enterprise Applications (for HR)

**GET** `/applications/enterprise?enterpriseId={uuid}`

**Headers:** `Authorization: Bearer {accessToken}` (enterprise_user only)

**Query Parameters:**

| Parameter    | Type   | Required |
|--------------|--------|----------|
| enterpriseId | string | ✅       |

**Response:** same as 6.2

### 6.4 Update Application Status

**PATCH** `/applications/{id}/status`

**Headers:** `Authorization: Bearer {accessToken}` (enterprise_user only)

**Request Body:**

| Field   | Type   | Required | Description                                 |
|---------|--------|----------|---------------------------------------------|
| status  | string | ✅       | `new`, `viewed`, `invited`, `rejected`, `hired` |

**Response:** `200 OK` (updated application)

---

## 7. Enterprise Private Endpoints (for Enterprise Users)

These endpoints require `role = enterprise_user` and the user must be associated with an enterprise (`enterpriseId` in JWT). All requests must include `Authorization: Bearer {accessToken}`.

Base path: `/enterprise`

### 7.1 Dashboard

**GET** `/enterprise/dashboard`

**Response:** `200 OK`

```json
{
  "vacanciesCount": 5,
  "applicationsCount": 12,
  "toursCount": 2
}
```

### 7.2 Manage Vacancies

#### 7.2.1 Get My Vacancies

**GET** `/enterprise/vacancies`

**Response:** `200 OK`

```json
{
  "vacancies": [ ... ]
}
```

#### 7.2.2 Create Vacancy

**POST** `/enterprise/vacancies`

**Request Body:** same as in public creation

**Response:** `201 Created` (vacancy object)

#### 7.2.3 Update Vacancy

**PUT** `/enterprise/vacancies/{id}`

**Request Body:** any fields of vacancy

**Response:** `200 OK`

#### 7.2.4 Delete (Archive) Vacancy

**DELETE** `/enterprise/vacancies/{id}`

**Response:** `204 No Content`

### 7.3 Manage Applications

#### 7.3.1 Get Enterprise Applications

**GET** `/enterprise/applications`

**Response:** `200 OK`

```json
{
  "applications": [ ... ]   // full details including user profiles
}
```

#### 7.3.2 Update Application Status

**PATCH** `/enterprise/applications/{id}/status`

**Request Body:**

| Field   | Type   | Required | Description (same as 6.4) |
|---------|--------|----------|---------------------------|

**Response:** `200 OK`

### 7.4 Manage Tours

#### 7.4.1 Get My Tours

**GET** `/enterprise/tours`

**Response:** `200 OK`

```json
{
  "tours": [ ... ]
}
```

#### 7.4.2 Create Tour

**POST** `/enterprise/tours`

**Request Body:**

| Field       | Type   | Required | Description                         |
|-------------|--------|----------|-------------------------------------|
| title       | string | ✅       | Tour title                          |
| format      | string | ❌       | `offline` or `online` (default `offline`) |
| description | string | ❌       |                                     |
| startAt     | string | ✅       | ISO date-time (must be in future)   |
| capacity    | number | ❌       | Default 20                          |
| status      | string | ❌       | `planned`, `open`, `closed`, `cancelled` |

**Response:** `201 Created`

#### 7.4.3 Update Tour

**PUT** `/enterprise/tours/{id}`

**Request Body:** any fields above

**Response:** `200 OK`

#### 7.4.4 Get Tour Bookings

**GET** `/enterprise/tours/{id}/bookings`

**Response:** `200 OK`

```json
{
  "bookings": [
    {
      "id": "uuid",
      "status": "new",
      "User": { "id": "...", "email": "...", "UserProfile": { ... } }
    }
  ]
}
```

### 7.5 Manage Enterprise Profile

#### 7.5.1 Get Enterprise Profile

**GET** `/enterprise/profile`

**Response:** `200 OK` (public enterprise object)

#### 7.5.2 Update Enterprise Profile

**PATCH** `/enterprise/profile`

**Request Body:** any fields of Enterprise model (name, description, laborConditions, safetyInfo, address, city, region, logo, etc.)

**Response:** `200 OK` (updated enterprise)

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error description"
}
```

| Status Code | Description                 |
|-------------|-----------------------------|
| 400         | Bad request / validation    |
| 401         | Unauthorized (no/invalid token) |
| 403         | Forbidden (insufficient role) |
| 404         | Resource not found           |
| 500         | Internal server error        |

---

## Rate Limiting

Currently none. Will be added in production.

---

## WebSocket Events (Future)

Real-time notifications for:
- `message:new` – new message
- `tour:booked` – tour booking confirmed
- `application:status_changed` – application status update

---

## Notes

- All IDs are UUID v4.
- Timestamps are in ISO 8601 format.
- Pagination is not implemented in MVP but can be added later via `?page=1&limit=10`.
- The external evaluation API (used in recommendations) is optional; if unavailable, a basic scoring fallback is used.