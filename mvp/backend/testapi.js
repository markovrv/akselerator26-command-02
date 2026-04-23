// test-enterprise-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

const TEST_ENTERPRISE_ID = '46bfe857-9150-49fc-8e4e-bae8b74d477c'; // замените на реальный UUID предприятия

const testUser = {
  email: 'enterprise@example.com',
  password: 'test123',
  fullName: 'Test Enterprise User',
  role: 'enterprise_user',
  enterpriseId: TEST_ENTERPRISE_ID,
};

let accessToken = null;
let createdVacancyId = null;
let createdTourId = null;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

const log = (title, data) => {
  console.log(`\n✅ ${title}`);
  console.log(JSON.stringify(data, null, 2));
};

const logError = (title, error) => {
  console.error(`\n❌ ${title}`);
  if (error.response) {
    console.error('Status:', error.response.status);
    console.error('Response:', error.response.data);
  } else {
    console.error(error.message);
  }
};

// 1. Регистрация (или логин)
async function registerOrLogin() {
  try {
    const registerData = {
      email: testUser.email,
      password: testUser.password,
      fullName: testUser.fullName,
      role: testUser.role,
    };
    const registerRes = await api.post('/auth/register', registerData);
    accessToken = registerRes.data.accessToken;
    log('Регистрация успешна', { user: registerRes.data.user });
    return;
  } catch (err) {
    if (err.response?.status === 400 && err.response?.data?.error === 'Email already registered') {
      try {
        const loginRes = await api.post('/auth/login', {
          email: testUser.email,
          password: testUser.password,
        });
        accessToken = loginRes.data.accessToken;
        log('Логин успешен', { user: loginRes.data.user });
      } catch (loginErr) {
        logError('Ошибка логина', loginErr);
        throw loginErr;
      }
    } else {
      logError('Ошибка регистрации', err);
      throw err;
    }
  }
}

// 2. Назначить роль enterprise_user и привязать enterpriseId
async function setEnterpriseRole() {
  try {
    const res = await api.post('/profile/role', { // изменили с patch на post
      role: 'enterprise_user',
      enterpriseId: testUser.enterpriseId,
    });
    log('Роль enterprise_user назначена', res.data);
    return true;
  } catch (err) {
    logError('Ошибка назначения роли', err);
    return false;
  }
}

// 3. Повторный логин для получения нового токена с enterpriseId в payload
async function relogin() {
  try {
    const loginRes = await api.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    accessToken = loginRes.data.accessToken;
    log('Повторный логин (токен обновлён)', { user: loginRes.data.user });
  } catch (err) {
    logError('Ошибка повторного логина', err);
    throw err;
  }
}

// 4. Получить дашборд
async function testDashboard() {
  try {
    const res = await api.get('/enterprise/dashboard');
    log('Дашборд предприятия', res.data);
  } catch (err) {
    logError('Ошибка получения дашборда', err);
  }
}

// 5. Работа с вакансиями
async function testVacancies() {
  try {
    const getRes = await api.get('/enterprise/vacancies');
    log('Список вакансий', getRes.data);

    const newVacancy = {
      title: 'Тестовая вакансия',
      department: 'IT',
      employmentType: 'full_time',
      salaryFrom: 70000,
      salaryTo: 90000,
      schedule: '5/2',
      requirements: 'Опыт работы с Node.js',
      responsibilities: 'Разработка API',
      benefits: 'ДМС, обед',
      isStudentAvailable: false,
      status: 'published',
    };
    const createRes = await api.post('/enterprise/vacancies', newVacancy);
    createdVacancyId = createRes.data.id;
    log('Создана вакансия', createRes.data);

    const updateRes = await api.put(`/enterprise/vacancies/${createdVacancyId}`, {
      title: 'Обновленная тестовая вакансия',
      salaryFrom: 80000,
    });
    log('Обновлена вакансия', updateRes.data);

    const deleteRes = await api.delete(`/enterprise/vacancies/${createdVacancyId}`);
    log('Вакансия удалена', { status: deleteRes.status });
  } catch (err) {
    logError('Ошибка при работе с вакансиями', err);
  }
}

// 6. Работа с откликами
async function testApplications() {
  try {
    const getRes = await api.get('/enterprise/applications');
    log('Список откликов', getRes.data);

    if (getRes.data.applications && getRes.data.applications.length > 0) {
      const appId = getRes.data.applications[0].id;
      const patchRes = await api.patch(`/enterprise/applications/${appId}/status`, {
        status: 'viewed',
      });
      log('Статус отклика обновлён', patchRes.data);
    } else {
      console.log('Нет откликов для обновления статуса');
    }
  } catch (err) {
    logError('Ошибка при работе с откликами', err);
  }
}

// 7. Работа с экскурсиями
async function testTours() {
  try {
    const getRes = await api.get('/enterprise/tours');
    log('Список экскурсий', getRes.data);

    const newTour = {
      title: 'Тестовая экскурсия',
      format: 'offline',
      description: 'Посещение производства',
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      capacity: 20,
      status: 'open',
    };
    const createRes = await api.post('/enterprise/tours', newTour);
    createdTourId = createRes.data.id;
    log('Создана экскурсия', createRes.data);

    const updateRes = await api.put(`/enterprise/tours/${createdTourId}`, {
      title: 'Обновлённая экскурсия',
      capacity: 25,
    });
    log('Обновлена экскурсия', updateRes.data);

    const bookingsRes = await api.get(`/enterprise/tours/${createdTourId}/bookings`);
    log('Бронирования экскурсии', bookingsRes.data);
  } catch (err) {
    logError('Ошибка при работе с экскурсиями', err);
  }
}

// 8. Работа с профилем предприятия
async function testProfile() {
  try {
    const getRes = await api.get('/enterprise/profile');
    log('Профиль предприятия', getRes.data);

    const updateRes = await api.patch('/enterprise/profile', {
      description: 'Новое описание предприятия',
      laborConditions: 'Обычные условия труда',
    });
    log('Профиль обновлён', updateRes.data);
  } catch (err) {
    logError('Ошибка при работе с профилем предприятия', err);
  }
}

async function runTests() {
  console.log('🚀 Начинаем тестирование API предприятия\n');
  await registerOrLogin();
  if (!accessToken) {
    console.error('Не удалось получить токен, тесты прерваны');
    return;
  }

  // Назначаем роль enterprise_user и привязываем enterpriseId
  const roleSet = await setEnterpriseRole();
  if (!roleSet) {
    console.error('Не удалось назначить роль, тесты прерваны');
    return;
  }

  // Повторный логин для обновления токена (теперь с enterpriseId в payload)
  await relogin();

  await testDashboard();
  await testVacancies();
  await testApplications();
  await testTours();
  await testProfile();
  console.log('\n🏁 Тестирование завершено');
}

runTests().catch(console.error);