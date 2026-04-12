import { llmService, LLMMessage } from './llmService';

export interface TestAnswer {
  questionId: number;
  answer: string | string[];
}

export interface VacancyMatch {
  vacancyId: number;
  matchScore: number;
  reason: string;
}

export interface VacancyForLLM {
  id: number;
  title: string;
  description: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  requirements: string | null;
}

/**
 * Маппинг ID вопросов к их смыслу для fallback-скоринга.
 *
 * Q1 — интересующая сфера (multiple_choice)
 * Q2 — готовность к переезду (single_choice)
 * Q3 — ограничения по здоровью (text)
 * Q4 — ожидания по ЗП (single_choice)
 * Q5 — предпочитаемый тип работы (multiple_choice)
 */
const QUESTION_MAP: Record<number, string> = {
  1: 'interests',
  2: 'relocation',
  3: 'health',
  4: 'salary',
  5: 'workType'
};

export class VacancyMatchingService {
  /**
   * Главный метод: подбор вакансий через LLM с fallback.
   */
  static async matchVacancies(
    answers: TestAnswer[],
    availableVacancies: VacancyForLLM[]
  ): Promise<VacancyMatch[]> {
    if (!availableVacancies.length) {
      console.warn('⚠️  No vacancies available for matching');
      return [];
    }

    // Проверяем доступность LLM
    if (!llmService.isAvailable()) {
      console.warn('⚠️  LLM not available, using fallback matching');
      return this.fallbackMatch(answers, availableVacancies);
    }

    console.log('🤖 Using LLM for vacancy matching...');

    // Формируем промпт для LLM
    const messages = this.buildPrompt(answers, availableVacancies);

    const response = await llmService.parseJsonResponse(messages, 0.2);

    if (!response.success || !response.content) {
      console.error('❌ LLM matching failed, using fallback:', response.error);
      return this.fallbackMatch(answers, availableVacancies);
    }

    try {
      const result = JSON.parse(response.content);

      if (!result.matches || !Array.isArray(result.matches)) {
        throw new Error('Invalid response format: no matches array');
      }

      // Валидируем каждый match
      const validMatches: VacancyMatch[] = [];
      for (const m of result.matches) {
        if (
          typeof m.vacancyId === 'number' &&
          typeof m.matchScore === 'number' &&
          typeof m.reason === 'string'
        ) {
          validMatches.push({
            vacancyId: m.vacancyId,
            matchScore: Math.max(0, Math.min(100, m.matchScore)),
            reason: m.reason
          });
        }
      }

      if (!validMatches.length) {
        throw new Error('No valid matches in LLM response');
      }

      console.log(`✅ LLM matched ${validMatches.length} vacancies`);
      return validMatches.sort((a, b) => b.matchScore - a.matchScore);
    } catch {
      console.error('❌ Failed to parse LLM response, using fallback');
      return this.fallbackMatch(answers, availableVacancies);
    }
  }

  // ============================================================
  //  Fallback-алгоритм: многфакторный скоринг
  // ============================================================
  private static fallbackMatch(
    answers: TestAnswer[],
    vacancies: VacancyForLLM[]
  ): VacancyMatch[] {
    const parsed = this.parseAnswers(answers);

    const scored = vacancies.map(vacancy => {
      let score = 0;
      const reasons: string[] = [];

      // --- Q1: Сфера интересов (до +40 баллов) ---
      if (parsed.interests.length > 0) {
        const interestMatch = this.checkInterestMatch(parsed.interests, vacancy);
        score += interestMatch.score;
        if (interestMatch.reason) reasons.push(interestMatch.reason);
      }

      // --- Q2: Переезд (до +15 баллов) ---
      if (parsed.relocation === 'Нет') {
        // Не готов к переезду — penalize, если город не совпадает с дефолтным
        // Пока даём нейтральный балл
        score += 5;
      } else if (parsed.relocation === 'Да') {
        score += 15;
        reasons.push('Готов к переезду');
      } else {
        score += 10; // Рассматриваю
      }

      // --- Q3: Ограничения по здоровью (до +10 баллов) ---
      if (parsed.healthRestrictions.length > 0) {
        // Если есть ограничения — проверяем, не конфликтуют ли с вакансией
        score += 10;
        reasons.push('Учтены ограничения по здоровью');
      } else {
        score += 10; // Нет ограничений — полный балл
      }

      // --- Q4: Зарплатные ожидания (до +25 баллов) ---
      if (parsed.expectedSalary > 0) {
        const salaryScore = this.calcSalaryScore(parsed.expectedSalary, vacancy);
        score += salaryScore;
        if (salaryScore >= 20) reasons.push('ЗП соответствует ожиданиям');
      } else {
        score += 15; // Не указал — нейтральный балл
      }

      // --- Q5: Тип работы (до +10 баллов) ---
      if (parsed.workType.length > 0) {
        const typeMatch = this.checkWorkTypeMatch(parsed.workType, vacancy);
        score += typeMatch.score;
        if (typeMatch.reason) reasons.push(typeMatch.reason);
      }

      const finalScore = Math.max(0, Math.min(100, score));

      return {
        vacancyId: vacancy.id,
        matchScore: finalScore,
        reason: reasons.length > 0 ? reasons.join('. ') : 'Базовое соответствие'
      };
    });

    return scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  // ============================================================
  //  Парсинг ответов
  // ============================================================
  private static parseAnswers(answers: TestAnswer[]) {
    const result = {
      interests: [] as string[],
      relocation: '',
      healthRestrictions: [] as string[],
      expectedSalary: 0,
      workType: [] as string[]
    };

    for (const a of answers) {
      const type = QUESTION_MAP[a.questionId];
      if (!type) continue;

      const val = Array.isArray(a.answer) ? a.answer : String(a.answer || '');

      switch (type) {
        case 'interests':
          result.interests = Array.isArray(a.answer) ? a.answer : [];
          break;
        case 'relocation':
          result.relocation = String(a.answer);
          break;
        case 'health':
          result.healthRestrictions = val.length > 0 ? [val] : [];
          break;
        case 'salary':
          result.expectedSalary = this.parseSalaryExpectation(String(a.answer));
          break;
        case 'workType':
          result.workType = Array.isArray(a.answer) ? a.answer : [];
          break;
      }
    }

    return result;
  }

  // ============================================================
  //  Под-методы скоринга
  // ============================================================
  private static checkInterestMatch(
    interests: string[],
    vacancy: VacancyForLLM
  ): { score: number; reason: string } {
    const text = `${vacancy.title} ${vacancy.description} ${vacancy.requirements}`.toLowerCase();

    const keywordMap: Record<string, string[]> = {
      'Машиностроение': ['машиностроение', 'конструктор', 'механич', 'чпу', 'станок', 'инженер'],
      'Металлургия': ['металлург', 'плавк', 'сталь', 'прокат', 'металл'],
      'Химическая промышленность': ['химическ', 'химик', 'нефть', 'газ', 'хим'],
      'Энергетика': ['энергетик', 'электро', 'энерг', 'электростанц', 'тепло'],
      'Строительство': ['строит', 'монтаж', 'стройк'],
      'IT и автоматизация': ['автоматизац', 'программ', 'it', 'it-инженер', 'программист', 'кибер', 'робот']
    };

    let score = 0;
    const matchedInterests: string[] = [];

    for (const interest of interests) {
      const keywords = keywordMap[interest] || [];
      const found = keywords.some(kw => text.includes(kw));
      if (found) {
        score += 15;
        matchedInterests.push(interest);
      }
    }

    return {
      score: Math.min(score, 40),
      reason: matchedInterests.length > 0
        ? `Совпадение интересов: ${matchedInterests.join(', ')}`
        : ''
    };
  }

  private static calcSalaryScore(
    expected: number,
    vacancy: VacancyForLLM
  ): number {
    if (!vacancy.salaryMax) return 15; // ЗП не указана — нейтрально

    if (vacancy.salaryMax >= expected) return 25; // Максимум выше ожидания
    if (vacancy.salaryMin && vacancy.salaryMin >= expected * 0.85) return 20; // Минимум близко
    if (vacancy.salaryMax >= expected * 0.7) return 12; // Чуть ниже
    return 5; // Существенно ниже
  }

  private static checkWorkTypeMatch(
    workTypes: string[],
    vacancy: VacancyForLLM
  ): { score: number; reason: string } {
    const text = `${vacancy.title} ${vacancy.description} ${vacancy.requirements}`.toLowerCase();

    const typeKeywords: Record<string, string[]> = {
      'Офисная работа': ['офис', 'проектирование', 'конструктор', 'инженер-проектировщик'],
      'Работа на производстве': ['производств', 'цех', 'станок', 'чпу', 'плавильщик', 'свар'],
      'Полевая работа': ['полев', 'командировк', 'выезд', 'объект'],
      'Удаленная работа': ['удаленн', 'remote', 'дистанцион'],
      'Сменный график': ['сменн', 'смена', 'вахт']
    };

    let score = 0;
    const matchedTypes: string[] = [];

    for (const wt of workTypes) {
      const keywords = typeKeywords[wt] || [];
      const found = keywords.some(kw => text.includes(kw));
      if (found) {
        score += 10;
        matchedTypes.push(wt);
      }
    }

    return {
      score: Math.min(score, 10),
      reason: matchedTypes.length > 0
        ? `Тип работы: ${matchedTypes.join(', ')}`
        : ''
    };
  }

  // ============================================================
  //  Промпт для LLM
  // ============================================================
  private static buildPrompt(
    answers: TestAnswer[],
    vacancies: VacancyForLLM[]
  ): LLMMessage[] {
    const systemMessage: LLMMessage = {
      role: 'system',
      content: `Ты — профессиональный HR-консультант и эксперт по подбору персонала в сфере промышленности.

Твоя задача:
1. Внимательно проанализировать ответы пользователя на тест профориентации.
2. Оценить каждую вакансию по следующим критериям:
   - Совпадение сферы интересов пользователя с описанием и требованиями вакансии
   - Соответствие зарплатных ожиданий
   - Готовность к переезду vs город вакансии
   - Соответствие типа работы предпочтениям пользователя
   - Наличие конфликтующих ограничений по здоровью

3. Вернуть ТОП-10 наиболее подходящих вакансий (или меньше, если вакансий мало).

Формат ответа — СТРОГО JSON:
{
  "matches": [
    {
      "vacancyId": <число, ID вакансии>,
      "matchScore": <число от 0 до 100>,
      "reason": "<1-2 предложения с объяснением, почему эта вакансия подходит>"
    }
  ]
}

Правила:
- matchScore 80-100: отличное совпадение по всем критериям
- matchScore 60-79: хорошее совпадение с небольшими расхождениями
- matchScore 40-59: среднее совпадение, есть значимые расхождения
- matchScore 0-39: слабое совпадение, существенные конфликты
- Сортируй по убыванию matchScore
- Не возвращай вакансии с matchScore 0
- reason должен быть кратким и понятным для соискателя`
    };

    const formattedAnswers = answers.map(a => {
      const label = QUESTION_MAP[a.questionId] || `Вопрос #${a.questionId}`;
      const value = Array.isArray(a.answer) ? a.answer.join(', ') : a.answer;
      return `- [${label}] ${value || 'не ответили'}`;
    }).join('\n');

    const formattedVacancies = vacancies.map(v => `
{
  "id": ${v.id},
  "title": "${v.title}",
  "description": "${v.description.replace(/"/g, '\\"')}",
  "city": "${v.city}",
  "salaryMin": ${v.salaryMin ?? 'null'},
  "salaryMax": ${v.salaryMax ?? 'null'},
  "requirements": "${(v.requirements || '').replace(/"/g, '\\"')}"
}`).join('\n');

    const userMessage: LLMMessage = {
      role: 'user',
      content: `Ответы пользователя:
${formattedAnswers}

Доступные вакансии (JSON):
${formattedVacancies}

Верни JSON с подходящими вакансиями.`
    };

    return [systemMessage, userMessage];
  }

  // ============================================================
  //  Утилиты
  // ============================================================
  private static parseSalaryExpectation(answer: string): number {
    if (!answer) return 0;

    const salaryMap: Record<string, number> = {
      'до 40 000₽': 40000,
      '40 000₽ - 60 000₽': 50000,
      '60 000₽ - 90 000₽': 75000,
      '90 000₽ - 120 000₽': 105000,
      'от 120 000₽': 120000
    };

    // Проверяем точное совпадение
    if (salaryMap[answer]) return salaryMap[answer];

    // Пробуем извлечь число из строки
    const numMatch = answer.match(/(\d[\d\s]*)/);
    if (numMatch) {
      return parseInt(numMatch[1].replace(/\s/g, ''), 10) || 0;
    }

    return 0;
  }
}
