const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const {
  User, UserProfile, Enterprise, Vacancy, Tour, TourBooking, Application, AssessmentSession, AssessmentAnswer, MatchResult
} = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✓ Database synced');

    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate([
      {
        email: 'seeker1@test.local',
        passwordHash,
        role: 'seeker',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'seeker2@test.local',
        passwordHash,
        role: 'seeker',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'student1@test.local',
        passwordHash,
        role: 'student',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'hr1@zavod.local',
        passwordHash,
        role: 'enterprise_user',
        status: 'active',
        emailVerified: true,
      },
      {
        email: 'admin@test.local',
        passwordHash,
        role: 'superadmin',
        status: 'active',
        emailVerified: true,
      },
    ]);
    console.log('✓ Users created:', users.length);

    // Create user profiles
    const profiles = await UserProfile.bulkCreate([
      {
        userId: users[0].id,
        fullName: 'Алексей Смирнов',
        phone: '+79001234567',
        city: 'Екатеринбург',
        age: 28,
        relocationReady: false,
        desiredPosition: 'Оператор станков с ЧПУ',
        desiredSalaryFrom: 70000,
        desiredSalaryTo: 95000,
        preferredSchedule: 'Сменный график',
        experienceSummary: 'Опыт работы 5 лет на производстве',
        educationInfo: 'Среднее профессиональное образование',
      },
      {
        userId: users[1].id,
        fullName: 'Ирина Котова',
        phone: '+79001234568',
        city: 'Пермь',
        age: 35,
        relocationReady: true,
        desiredPosition: 'Электромонтер',
        desiredSalaryFrom: 65000,
        desiredSalaryTo: 85000,
        preferredSchedule: 'Пятидневка',
        experienceSummary: 'Опыт работы 10 лет в энергетике',
        educationInfo: 'Высшее техническое образование',
      },
      {
        userId: users[2].id,
        fullName: 'Марина Белова',
        phone: '+79001234569',
        city: 'Казань',
        age: 20,
        relocationReady: false,
        desiredPosition: 'Практикант',
        desiredSalaryFrom: 25000,
        desiredSalaryTo: 35000,
        preferredSchedule: 'Сменный график',
        experienceSummary: 'Студент 3 курса',
        studentInfoJson: {
          institution: 'Казанский колледж технологий',
          course: 3,
          specialty: 'Механообработка',
          format: 'practice',
        },
      },
      {
        userId: users[3].id,
        fullName: 'Ольга Власова',
        phone: '+79001234570',
        city: 'Екатеринбург',
        desiredPosition: 'HR-специалист',
      },
    ]);
    console.log('✓ Profiles created:', profiles.length);

    // Create enterprises
    const enterprises = await Enterprise.bulkCreate([
      {
        name: 'АО «Северный машзавод»',
        slug: 'severny-mashzavod',
        industry: 'Машиностроение',
        region: 'Уральский федеральный округ',
        city: 'Екатеринбург',
        address: 'ул. Промышленная, 1',
        description: 'Крупнейшее машиностроительное предприятие Урала. Производство деталей и узлов для промышленности, включая нефтегазовое оборудование, элементы конструкций и запасные части.',
        laborConditions: 'Современное оборудование, соблюдение всех норм охраны труда, регулярные медосмотры, выдача СИЗ',
        safetyInfo: 'Обучение по охране труда при приёме, ежеквартальные инструктажи, аттестация рабочих мест',
        salaryCalcInfo: 'Оклад + премия (до 30%). Оплата сдельная и повременная. 13-я зарплата по итогам года.',
        medicalExamInfo: 'Предварительный медосмотр при трудоустройстве, периодические осмотры 1 раз в год',
        collectiveAgreementUrl: '/documents/collective-agreement-severny.pdf',
        logo: 'https://via.placeholder.com/150?text=СМЗ',
        moderationStatus: 'approved',
      },
      {
        name: 'ПАО «ВолгаМеталл»',
        slug: 'volgametall',
        industry: 'Металлургия',
        region: 'Приволжский федеральный округ',
        city: 'Нижний Новгород',
        address: 'пр. Металлургов, 15',
        description: 'Ведущий производитель металлопроката в Поволжье. Производство листового и сортового проката, труб, метизной продукции для строительства и машиностроения.',
        laborConditions: 'Цеха с повышенной температурой, обязательное использование СИЗ, душевые и комнаты отдыха',
        safetyInfo: 'Строгий контроль охраны труда, обучение промышленной безопасности, регулярные проверки',
        salaryCalcInfo: 'Оклад по разряду + районный коэффициент (15%) + северные надбавки. Оплата больничных и отпускных полная.',
        medicalExamInfo: 'Медосмотр при приёме, периодические осмотры с участием терапевта, невролога, офтальмолога',
        collectiveAgreementUrl: '/documents/collective-agreement-volga.pdf',
        logo: 'https://via.placeholder.com/150?text=ВМ',
        moderationStatus: 'approved',
      },
      {
        name: 'ООО «ХимПром Регион»',
        slug: 'himprom-region',
        industry: 'Химическая промышленность',
        region: 'Приволжский федеральный округ',
        city: 'Казань',
        address: 'Химический переулок, 7',
        description: 'Производство промышленных химических компонентов: кислоты, щёлочи, растворители, лаки, краски. Предприятие работает с 1995 года и поставляет продукцию по всей России.',
        laborConditions: 'Работа с химическими веществами, обязательное использование СИЗ, регулярный контроль воздуха рабочей зоны',
        safetyInfo: 'Инструктажи по химической безопасности, обучение работе с опасными веществами, регулярная проверка оборудования',
        salaryCalcInfo: 'Оклад + надбавка за вредность (15-25%) + премия за выполнение плана. Бесплатное питание в столовой.',
        medicalExamInfo: 'Предварительный и периодические медосмотры с участием токсиколога. Бесплатные путёвки в санаторий.',
        collectiveAgreementUrl: '/documents/collective-agreement-him.pdf',
        logo: 'https://via.placeholder.com/150?text=ХПР',
        moderationStatus: 'approved',
      },
    ]);
    console.log('✓ Enterprises created:', enterprises.length);

    // Create vacancies
    const vacancies = await Vacancy.bulkCreate([
      {
        enterpriseId: enterprises[0].id,
        title: 'Оператор станков с ЧПУ',
        department: 'Механообрабатывающий цех',
        employmentType: 'full_time',
        salaryFrom: 70000,
        salaryTo: 95000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Среднее профессиональное образование, опыт работы от 1 года, умение читать чертежи',
        responsibilities: 'Наладка и обслуживание станков с ЧПУ, изготовление деталей по чертежам, контроль качества',
        benefits: 'Официальное трудоустройство, ДМС, бесплатная спецодежда, обучение за счёт предприятия',
        medicalRequirements: 'Отсутствие противопоказаний для работы на производстве',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[0].id,
        title: 'Практикант в механообработке',
        department: 'Механообрабатывающий цех',
        employmentType: 'practice',
        salaryFrom: 25000,
        salaryTo: 35000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Студент 3-4 курса технического вуза/колледжа',
        responsibilities: 'Помощь операторам станков, изучение производственных процессов',
        benefits: 'Оплачиваемая практика, возможность трудоустройства после окончания обучения',
        medicalRequirements: 'Медосмотр для допуска к производству',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Электромонтер',
        department: 'Энергетический цех',
        employmentType: 'shift',
        salaryFrom: 65000,
        salaryTo: 85000,
        schedule: 'Вахтовый метод (15/15)',
        requirements: 'Среднее профессиональное образование, группа допуска по электробезопасности не ниже III',
        responsibilities: 'Обслуживание электрооборудования, проведение ремонтных работ, монтаж электрических сетей',
        benefits: 'Вахтовые надбавки, оплата проезда, предоставление жилья на вахте',
        medicalRequirements: 'Отсутствие противопоказаний для работы на высоте и с электрооборудованием',
        isStudentAvailable: false,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Лаборант химического анализа',
        department: 'ОТК',
        employmentType: 'full_time',
        salaryFrom: 50000,
        salaryTo: 70000,
        schedule: 'Пятидневка',
        requirements: 'Среднее профессиональное или высшее химическое образование, опыт работы в лаборатории',
        responsibilities: 'Проведение химических анализов, отбор проб, ведение документации',
        benefits: 'Официальное трудоустройство, ДМС, частичная оплата питания',
        medicalRequirements: 'Отсутствие аллергии на химические вещества',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
      {
        enterpriseId: enterprises[2].id,
        title: 'Оператор химического производства',
        department: 'Основное производство',
        employmentType: 'full_time',
        salaryFrom: 60000,
        salaryTo: 80000,
        schedule: 'Сменный график (2/2)',
        requirements: 'Среднее профессиональное образование, готовность к работе с химическими веществами',
        responsibilities: 'Ведение технологического процесса, контроль параметров производства, заполнение технологических карт',
        benefits: 'Надбавка за вредность, бесплатное питание, спецодежда, медосмотр за счёт предприятия',
        medicalRequirements: 'Отсутствие противопоказаний для работы с химическими веществами',
        isStudentAvailable: true,
        status: 'published',
        publishedAt: new Date(),
      },
    ]);
    console.log('✓ Vacancies created:', vacancies.length);

    // Create tours
    const tours = await Tour.bulkCreate([
      {
        enterpriseId: enterprises[0].id,
        title: 'Экскурсия по цеху металлообработки',
        format: 'offline',
        description: 'Посещение механообрабатывающего цеха, знакомство с оборудованием, встреча с сотрудниками',
        startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        capacity: 15,
        status: 'open',
      },
      {
        enterpriseId: enterprises[0].id,
        title: 'Онлайн-экскурсия: Виртуальный тур по заводу',
        format: 'online',
        description: 'Виртуальная прогулка по территории завода, показ производственных линий, онлайн-встреча с HR',
        startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
        endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        capacity: 50,
        status: 'open',
      },
      {
        enterpriseId: enterprises[1].id,
        title: 'Экскурсия на производство металлопроката',
        format: 'offline',
        description: 'Посещение прокатного цеха, знакомство с технологическим процессом, встреча с руководством',
        startAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 days
        endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        capacity: 20,
        status: 'open',
      },
      {
        enterpriseId: enterprises[2].id,
        title: 'Онлайн-знакомство с ХимПром',
        format: 'online',
        description: 'Презентация предприятия, рассказ о вакансиях и условиях работы, ответы на вопросы',
        startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 days
        endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        capacity: 30,
        status: 'open',
      },
    ]);
    console.log('✓ Tours created:', tours.length);

    // Create a completed assessment session for seeker1
    const assessmentSession = await AssessmentSession.create({
      userId: users[0].id,
      roleContext: 'seeker',
      status: 'completed',
      scoreJson: {
        schedule: 0.8,
        relocation: 0.3,
        careerGrowth: 0.6,
        healthLimitations: 1.0,
        salary: 0.75,
        practice: 0.5,
      },
      completedAt: new Date(),
    });

    // Create assessment answers
    await AssessmentAnswer.bulkCreate([
      { sessionId: assessmentSession.id, questionCode: 'q1', answerValue: 'Сменный график', weight: 1.0 },
      { sessionId: assessmentSession.id, questionCode: 'q2', answerValue: false, weight: 1.0 },
      { sessionId: assessmentSession.id, questionCode: 'q3', answerValue: 3, weight: 1.0 },
      { sessionId: assessmentSession.id, questionCode: 'q4', answerValue: [], weight: 1.0 },
      { sessionId: assessmentSession.id, questionCode: 'q5', answerValue: { from: 70000, to: 95000 }, weight: 1.0 },
      { sessionId: assessmentSession.id, questionCode: 'q6', answerValue: false, weight: 1.0 },
    ]);

    // Create match results
    await MatchResult.bulkCreate([
      {
        sessionId: assessmentSession.id,
        enterpriseId: enterprises[0].id,
        vacancyId: vacancies[0].id,
        matchScore: 87,
        explanation: 'Подходит по графику, зарплате и близости региона. Есть обучение новичков.',
        factors: [
          { name: 'location', weight: 0.9, value: 'Совпадает город' },
          { name: 'salary', weight: 0.85, value: 'Зарплата в диапазоне' },
          { name: 'schedule', weight: 0.8, value: 'Сменный график' },
        ],
        rankOrder: 0,
      },
      {
        sessionId: assessmentSession.id,
        enterpriseId: enterprises[1].id,
        vacancyId: vacancies[2].id,
        matchScore: 65,
        explanation: 'Требуется переезд, но зарплата и условия хорошие.',
        factors: [
          { name: 'salary', weight: 0.8, value: 'Высокая зарплата' },
          { name: 'relocation', weight: 0.3, value: 'Нужен переезд' },
        ],
        rankOrder: 1,
      },
    ]);
    console.log('✓ Assessment and match results created');

    // Create sample applications
    await Application.bulkCreate([
      {
        userId: users[0].id,
        vacancyId: vacancies[0].id,
        type: 'job_application',
        coverNote: 'Готов к работе на производстве, есть опыт.',
        status: 'new',
      },
      {
        userId: users[2].id,
        vacancyId: vacancies[1].id,
        type: 'practice_application',
        coverNote: 'Хочу пройти практику и развиваться в машиностроении.',
        status: 'viewed',
      },
    ]);
    console.log('✓ Applications created');

    // Create sample tour bookings
    await TourBooking.bulkCreate([
      {
        tourId: tours[0].id,
        userId: users[0].id,
        status: 'confirmed',
        comment: 'Хочу посмотреть производство',
      },
      {
        tourId: tours[1].id,
        userId: users[2].id,
        status: 'new',
        comment: 'Интересует виртуальный тур',
      },
    ]);
    console.log('✓ Tour bookings created');

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('Test accounts (password: password123):');
    console.log('  - seeker1@test.local (Соискатель)');
    console.log('  - student1@test.local (Студент)');
    console.log('  - hr1@zavod.local (HR)');
    console.log('  - admin@test.local (Админ)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
