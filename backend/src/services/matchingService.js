const axios = require('axios');
const { AssessmentSession, MatchResult, Enterprise, UserProfile } = require('../models');
const env = require('../config/env');

class MatchingService {
  async generateRecommendations(sessionId, _filters) {
    // Get session with answers
    const session = await AssessmentSession.findByPk(sessionId, {
      include: ['AssessmentAnswers', 'User'],
    });

    if (!session) {
      throw { statusCode: 404, message: 'Session not found' };
    }

    if (session.status !== 'completed') {
      throw { statusCode: 400, message: 'Assessment not completed' };
    }

    // Get user profile
    const userProfile = await UserProfile.findOne({ where: { userId: session.userId } });

    // Get enterprises and vacancies based on filters
    const enterprises = await Enterprise.findAll({
      where: { moderationStatus: 'approved' },
      include: ['Vacancies'],
    });

    let recommendations = [];
    try {
      // Попытка вызвать внешний API оценки
      recommendations = await this.callExternalEvaluationAPI(
        session,
        userProfile,
        enterprises
      );
    } catch (error) {
      console.error('External API error:', error.message);
      // Fallback to basic scoring
      recommendations = await this.basicScoring(
        session,
        userProfile,
        enterprises
      );
    }

    // Save match results to DB
    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      await MatchResult.create({
        sessionId,
        enterpriseId: rec.enterpriseId,
        vacancyId: rec.vacancyId,
        matchScore: rec.matchScore,
        explanation: rec.explanation,
        factors: rec.factors || [],
        rankOrder: i,
      });
    }

    return recommendations.slice(0, 10); // Return top 10
  }

  async callExternalEvaluationAPI(session, userProfile, enterprises) {
    const payload = {
      userId: session.userId,
      userProfile: {
        city: userProfile?.city,
        age: userProfile?.age,
        desiredPosition: userProfile?.desiredPosition,
        relocationReady: userProfile?.relocationReady,
        desiredSalary: userProfile?.desiredSalaryFrom,
        healthLimitations: userProfile?.healthLimitations ? [userProfile.healthLimitations] : [],
      },
      assessmentAnswers: session.AssessmentAnswers.map(a => ({
        questionCode: a.questionCode,
        answer: a.answerValue,
      })),
      enterpriseIds: enterprises.map(e => e.id),
      vacancyIds: enterprises.flatMap(e => e.Vacancies.map(v => v.id)),
    };

    const response = await axios.post(
      env.externalEval.apiUrl,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${env.externalEval.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.recommendations || [];
  }

  async basicScoring(session, userProfile, enterprises) {
    const answers = session.AssessmentAnswers;
    const recommendations = [];

    for (const enterprise of enterprises) {
      for (const vacancy of enterprise.Vacancies || []) {
        const score = this.calculateMatchScore(
          answers,
          userProfile,
          enterprise,
          vacancy
        );

        if (score.score > 30) {
          recommendations.push({
            enterpriseId: enterprise.id,
            vacancyId: vacancy.id,
            matchScore: score.score,
            explanation: score.explanation,
            factors: score.factors,
          });
        }
      }
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    return recommendations;
  }

  calculateMatchScore(answers, userProfile, enterprise, vacancy) {
    let score = 0;
    const factors = [];

    // Convert answers array to map for easy access
    const answerMap = {};
    answers.forEach(a => answerMap[a.questionCode] = a.answerValue);

    // 1. График работы (Q1)
    const scheduleAnswer = answerMap.q1;
    if (scheduleAnswer && vacancy.schedule && vacancy.schedule.includes(scheduleAnswer)) {
      score += 15;
      factors.push({ name: 'schedule', weight: 0.8, value: `График ${scheduleAnswer} подходит` });
    }

    // 2. Готовность к переезду (Q2)
    const relocationAnswer = answerMap.q2;
    if (relocationAnswer === true) {
      // Если пользователь готов к переезду – бонус
      score += 20;
      factors.push({ name: 'relocation', weight: 0.8, value: 'Готов к переезду' });
    }

    // 3. Важность карьерного роста (Q3) – оценка 1..5
    const careerAnswer = answerMap.q3;
    if (careerAnswer) {
      const careerScore = (careerAnswer / 5) * 20;
      score += careerScore;
      factors.push({ name: 'career', weight: 0.6, value: `Карьерный рост: ${careerAnswer}/5` });
    }

    // 4. Ограничения по здоровью (Q4)
    const healthAnswer = answerMap.q4;
    if (healthAnswer && healthAnswer.length) {
      score += 10;
      factors.push({ name: 'health', weight: 0.5, value: 'Учтены ограничения здоровья' });
    } else {
      score += 15;
      factors.push({ name: 'health', weight: 0.6, value: 'Нет ограничений здоровья' });
    }

    // 5. Ожидания по зарплате (Q5)
    const salaryAnswer = answerMap.q5;
    if (salaryAnswer) {
      // Здесь можно сравнить с зарплатой в вакансии, если есть поле vacancy.salaryFrom
      if (vacancy.salaryFrom && salaryAnswer <= vacancy.salaryFrom) {
        score += 20;
        factors.push({ name: 'salary', weight: 0.7, value: `Зарплата ${vacancy.salaryFrom} соответствует ожиданиям` });
      } else {
        score += 10;
        factors.push({ name: 'salary', weight: 0.5, value: `Ожидание ${salaryAnswer}, требуется уточнение` });
      }
    }

    // 6. Интерес к практике/стажировке (Q6)
    const practiceAnswer = answerMap.q6;
    if (practiceAnswer === true && vacancy.isStudentAvailable) {
      score += 20;
      factors.push({ name: 'practice', weight: 0.5, value: 'Интересует практика/стажировка' });
    }

    // Ограничиваем итоговый балл диапазоном 0–100
    score = Math.min(100, Math.max(0, score));

    const explanation = factors.length > 0
      ? factors.map(f => f.value).join('. ')
      : 'Нет явных совпадений, но вакансия может быть интересна';

    return {
      score,
      explanation,
      factors,
    };
  }

  async getRecommendations(sessionId) {
    const matches = await MatchResult.findAll({
      where: { sessionId },
      include: ['Enterprise', 'Vacancy'],
      order: [['rankOrder', 'ASC']],
    });
    return matches;
  }
}

module.exports = new MatchingService();