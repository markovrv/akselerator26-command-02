import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(__dirname, '../../data/app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migrations
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'seeker' CHECK(role IN ('seeker', 'student', 'admin')),
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS enterprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    city TEXT,
    address TEXT,
    website TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vacancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    job_instructions TEXT,
    salary_calculation TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    city TEXT,
    requirements TEXT,
    collective_agreement_url TEXT,
    three_d_model_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK(question_type IN ('single_choice', 'multiple_choice', 'text', 'numeric')),
    options TEXT,
    placeholder TEXT,
    is_required INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers TEXT NOT NULL,
    completed_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS recommended_vacancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vacancy_id INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK(match_score >= 0 AND match_score <= 100),
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, vacancy_id)
  );

  CREATE TABLE IF NOT EXISTS excursions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date_time TEXT NOT NULL,
    excursion_type TEXT NOT NULL CHECK(excursion_type IN ('online', 'offline')),
    address TEXT,
    stream_url TEXT,
    max_participants INTEGER DEFAULT 20,
    available_slots INTEGER DEFAULT 20,
    registration_deadline TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS excursion_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    excursion_id INTEGER NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, excursion_id)
  );

  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_vacancies_enterprise ON vacancies(enterprise_id);
  CREATE INDEX IF NOT EXISTS idx_excursions_enterprise ON excursions(enterprise_id);
  CREATE INDEX IF NOT EXISTS idx_registrations_user ON excursion_registrations(user_id);
  CREATE INDEX IF NOT EXISTS idx_registrations_excursion ON excursion_registrations(excursion_id);
  CREATE INDEX IF NOT EXISTS idx_recommended_user ON recommended_vacancies(user_id);
`);

// Update trigger for updated_at
db.exec(`
  CREATE TRIGGER IF NOT EXISTS users_update_ts AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS enterprises_update_ts AFTER UPDATE ON enterprises
  BEGIN
    UPDATE enterprises SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS vacancies_update_ts AFTER UPDATE ON vacancies
  BEGIN
    UPDATE vacancies SET updated_at = datetime('now') WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS excursions_update_ts AFTER UPDATE ON excursions
  BEGIN
    UPDATE excursions SET updated_at = datetime('now') WHERE id = NEW.id;
  END;
`);

// Seed data (only if tables are empty)
const enterpriseCount = db.prepare('SELECT COUNT(*) as cnt FROM enterprises').get() as { cnt: number };
if (enterpriseCount.cnt === 0) {
  const insertEnterprise = db.prepare(`
    INSERT INTO enterprises (name, description, contact_email, contact_phone, city, address, website)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertEnterprise.run(
    'Завод "Промтехмаш"',
    'Ведущее предприятие по производству промышленного оборудования. Специализируется на проектировании и изготовлении нестандартного оборудования для нефтяной, газовой и химической промышленности.',
    'hr@promtechmash.ru', '+7 (495) 123-45-67', 'Москва', 'ул. Промышленная, д. 15', 'https://promtechmash.ru'
  );
  const e1Id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

  insertEnterprise.run(
    'ЭнергоСтрой',
    'Строительство и модернизация энергетических объектов. Монтаж оборудования тепловых и атомных электростанций.',
    'info@energostroy.ru', '+7 (812) 987-65-43', 'Санкт-Петербург', 'ул. Энергетиков, д. 8', 'https://energostroy.ru'
  );
  const e2Id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

  insertEnterprise.run(
    'УралМеталл',
    'Металлургическое предприятие полного цикла. Производство стали, проката и металлоизделий.',
    'careers@uralmetall.ru', '+7 (343) 555-12-34', 'Екатеринбург', 'ул. Металлургов, д. 1', 'https://uralmetall.ru'
  );
  const e3Id = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

  // Seed vacancies
  const insertVacancy = db.prepare(`
    INSERT INTO vacancies (enterprise_id, title, description, job_instructions, salary_calculation, salary_min, salary_max, city, requirements)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertVacancy.run(e1Id.id, 'Инженер-конструктор', 'Разработка и проектирование промышленного оборудования, создание 3D-моделей и чертежей.', '1. Разработка конструкторской документации.\n2. Проведение расчётов прочности.\n3. Взаимодействие с производственными подразделениями.', 'Оклад + премия по итогам квартала. Надбавка за квалификацию.', 60000, 90000, 'Москва', 'Высшее техническое образование, опыт от 1 года, знание AutoCAD/Компас-3D.');
  insertVacancy.run(e1Id.id, 'Технолог механической обработки', 'Разработка технологических процессов механической обработки деталей.', '1. Проектирование техпроцессов.\n2. Подбор оборудования и инструмента.', 'Оклад + премия за выполнение плана.', 55000, 80000, 'Москва', 'Высшее образование, опыт работы технологом от 2 лет.');
  insertVacancy.run(e2Id.id, 'Инженер по наладке оборудования', 'Наладка и обслуживание энергетического оборудования на объектах.', '1. Пусконаладочные работы.\n2. Техническое обслуживание.\n3. Диагностика неисправностей.', 'Оклад + суточные при командировках + премия.', 70000, 100000, 'Санкт-Петербург', 'Среднее специальное или высшее образование, готовность к командировкам.');
  insertVacancy.run(e3Id.id, 'Металлург-плавильщик', 'Управление процессом плавки металла в мартеновских и электрических печах.', '1. Ведение процесса плавки.\n2. Контроль состава стали.\n3. Управление оборудованием.', 'Оклад + вредность + премия за перевыполнение.', 65000, 95000, 'Екатеринбург', 'Опыт работы на металлургическом производстве, допуск к печам.');

  // Seed excursions
  const now = new Date();
  const excursion1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const excursion2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
  const deadline1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const deadline2 = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000).toISOString();

  const insertExcursion = db.prepare(`
    INSERT INTO excursions (enterprise_id, title, description, date_time, excursion_type, address, max_participants, available_slots, registration_deadline)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExcursion.run(e1Id.id, 'Экскурсия по цехам сборки', 'Познакомьтесь с процессом сборки промышленного оборудования от начала до конца.', excursion1, 'offline', 'г. Москва, ул. Промышленная, д. 15, цех №3', 20, 20, deadline1);
  insertExcursion.run(e2Id.id, 'Онлайн-тур по энергоблоку', 'Виртуальная экскурсия по современному энергоблоку в режиме реального времени.', excursion2, 'online', '', 50, 50, deadline2);

  // Seed admin user
  const adminCount = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'admin'").get() as { cnt: number };
  if (adminCount.cnt === 0) {
    db.prepare("INSERT INTO users (email, name, role) VALUES ('admin@forward-industry.ru', 'Администратор', 'admin')").run();
  }

  // Seed test questions
  const questionCount = db.prepare('SELECT COUNT(*) as cnt FROM test_questions').get() as { cnt: number };
  if (questionCount.cnt === 0) {
    const insertQ = db.prepare('INSERT INTO test_questions (question_text, question_type, options, placeholder, display_order) VALUES (?, ?, ?, ?, ?)');
    insertQ.run('Какая сфера промышленности вас интересует?', 'multiple_choice', JSON.stringify(['Машиностроение', 'Металлургия', 'Химическая промышленность', 'Энергетика', 'Строительство', 'IT и автоматизация']), null, 1);
    insertQ.run('Готовы ли вы к переезду в другой город?', 'single_choice', JSON.stringify(['Да', 'Нет', 'Рассматриваю варианты']), null, 2);
    insertQ.run('Какие у вас ограничения по здоровью?', 'text', null, 'Укажите ограничения или оставьте пустым', 3);
    insertQ.run('Какие ваши ожидания по заработной плате?', 'single_choice', JSON.stringify(['до 40 000₽', '40 000₽ - 60 000₽', '60 000₽ - 90 000₽', '90 000₽ - 120 000₽', 'от 120 000₽']), null, 4);
    insertQ.run('Какой тип работы вы предпочитаете?', 'multiple_choice', JSON.stringify(['Офисная работа', 'Работа на производстве', 'Полевая работа', 'Удаленная работа', 'Сменный график']), null, 5);
  }
}

console.log('✅ SQLite database initialized:', DB_PATH);

export default db;
