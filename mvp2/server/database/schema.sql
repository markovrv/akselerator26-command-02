-- Database Schema for "Вперёд по маршрутам промышленности"
-- SQLite 3+

-- Включить проверку внешних ключей
PRAGMA foreign_keys = ON;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'student', 'admin')),
    phone TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- ENTERPRISES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enterprises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    city TEXT NOT NULL,
    address TEXT,
    website TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_enterprises_city ON enterprises(city);

-- ============================================
-- VACANCIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vacancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    job_instructions TEXT,
    salary_calculation TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    city TEXT NOT NULL,
    requirements TEXT,
    collective_agreement_url TEXT,
    three_d_model_url TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vacancies_enterprise_id ON vacancies(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_vacancies_city ON vacancies(city);
CREATE INDEX IF NOT EXISTS idx_vacancies_salary_range ON vacancies(salary_min, salary_max);

-- ============================================
-- TEST QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'text', 'numeric')),
    options TEXT,
    placeholder TEXT,
    is_required INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TEST RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers TEXT NOT NULL,
    completed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);

-- ============================================
-- RECOMMENDED VACANCIES TABLE (Digital Passport)
-- ============================================
CREATE TABLE IF NOT EXISTS recommended_vacancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vacancy_id INTEGER NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    reason TEXT,
    test_result_id INTEGER REFERENCES test_results(id),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, vacancy_id)
);

CREATE INDEX IF NOT EXISTS idx_recommended_vacancies_user_id ON recommended_vacancies(user_id);

-- ============================================
-- EXCURSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS excursions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enterprise_id INTEGER NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date_time TEXT NOT NULL,
    excursion_type TEXT NOT NULL CHECK (excursion_type IN ('online', 'offline')),
    address TEXT,
    stream_url TEXT,
    max_participants INTEGER DEFAULT 20,
    available_slots INTEGER DEFAULT 20,
    registration_deadline TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_excursions_enterprise_id ON excursions(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_excursions_date_time ON excursions(date_time);

-- ============================================
-- EXCURSION REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS excursion_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    excursion_id INTEGER NOT NULL REFERENCES excursions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    registered_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, excursion_id)
);

CREATE INDEX IF NOT EXISTS idx_excursion_registrations_user_id ON excursion_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_excursion_registrations_excursion_id ON excursion_registrations(excursion_id);

-- ============================================
-- FILES TABLE
-- ============================================
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

CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);

-- ============================================
-- NOTIFICATIONS LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    enterprise_id INTEGER REFERENCES enterprises(id),
    notification_type TEXT NOT NULL,
    payload TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    sent_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TRIGGERS (auto update updated_at)
-- ============================================
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

CREATE TRIGGER IF NOT EXISTS test_questions_update_ts AFTER UPDATE ON test_questions
BEGIN
    UPDATE test_questions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS excursions_update_ts AFTER UPDATE ON excursions
BEGIN
    UPDATE excursions SET updated_at = datetime('now') WHERE id = NEW.id;
END;
