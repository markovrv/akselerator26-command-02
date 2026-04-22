# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register User
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "Иван Иванов",
  "role": "seeker"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## Users

### Get Profile
```
GET /users/profile
Authorization: Bearer <token>
```

### Update Profile
```
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Новое имя",
  "phone": "+7 (999) 123-45-67"
}
```

## Enterprises

### Get All Enterprises
```
GET /enterprises
```

### Get Enterprise by ID
```
GET /enterprises/:id
```

### Create Enterprise (Admin)
```
POST /enterprises
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Завод Промтехмаш",
  "description": "Описание предприятия",
  "contactEmail": "info@promtech.ru",
  "contactPhone": "+7 (495) 123-45-67",
  "city": "Москва",
  "address": "ул. Промышленная, д. 15"
}
```

### Update Enterprise (Admin)
```
PUT /enterprises/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Enterprise (Admin)
```
DELETE /enterprises/:id
Authorization: Bearer <token>
```

## Vacancies

### Get All Vacancies
```
GET /vacancies
Query params: ?enterpriseId=1&city=Москва&salaryMin=50000
```

### Get Vacancy by ID
```
GET /vacancies/:id
```

### Create Vacancy (Admin)
```
POST /vacancies
Authorization: Bearer <token>
Content-Type: application/json

{
  "enterpriseId": 1,
  "title": "Инженер-конструктор",
  "description": "Описание вакансии",
  "jobInstructions": "Должностные инструкции",
  "salaryCalculation": "Порядок расчета ЗП",
  "salaryMin": 60000,
  "salaryMax": 90000,
  "city": "Москва",
  "requirements": "Требования",
  "collectiveAgreementUrl": "https://example.com/agreement.pdf",
  "threeDModelUrl": "https://example.com/model.glb"
}
```

### Update Vacancy (Admin)
```
PUT /vacancies/:id
Authorization: Bearer <token>
Content-Type: application/json
```

### Delete Vacancy (Admin)
```
DELETE /vacancies/:id
Authorization: Bearer <token>
```

## Tests

### Get Test Questions
```
GET /tests/questions
Authorization: Bearer <token>
```

### Submit Test
```
POST /tests/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "answer": ["Машиностроение", "Энергетика"]
    },
    {
      "questionId": 2,
      "answer": "Да"
    }
  ]
}
```

### Get Test Results
```
GET /tests/results
Authorization: Bearer <token>
```

## Excursions

### Get All Excursions
```
GET /excursions
```

### Register for Excursion
```
POST /excursions/:id/register
Authorization: Bearer <token>
```

### Get My Registrations
```
GET /excursions/my
Authorization: Bearer <token>
```

### Get Medical Referral
```
GET /excursions/registrations/:id/referral
Authorization: Bearer <token>
```

### Get All Registrations (Admin)
```
GET /excursions/registrations
Authorization: Bearer <token>
```

## Files

### Upload File (Admin)
```
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

### Download File
```
GET /files/:filename
```

### Delete File (Admin)
```
DELETE /files/:filename
Authorization: Bearer <token>
```

## Health Check

```
GET /health
```
