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

    // Try to call external API, fallback to basic scoring if fails
    let recommendations = [];
    try {
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
    try {
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
    } catch (error) {
      console.error('External evaluation API error:', error.message);
      throw error;
    }
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

    // 1. Location match
    if (userProfile?.city && enterprise.city === userProfile.city) {
      score += 20;
      factors.push({ name: 'location', weight: 0.9, value: 'Близко к вам' });
    } else if (userProfile?.relocationReady) {
      score += 10;
      factors.push({ name: 'relocation', weight: 0.6, value: 'Готовы к переезду' });
    }

    // 2. Salary match
    if (vacancy.salaryFrom && userProfile?.desiredSalaryFrom) {
      if (vacancy.salaryFrom >= userProfile.desiredSalaryFrom) {
        score += 25;
        factors.push({ name: 'salary', weight: 0.8, value: `${vacancy.salaryFrom}-${vacancy.salaryTo}` });
      }
    }

    // 3. Position match
    if (userProfile?.desiredPosition && vacancy.title.toLowerCase().includes(userProfile.desiredPosition.toLowerCase())) {
      score += 25;
      factors.push({ name: 'position', weight: 0.95, value: 'Совпадает с желаемой должностью' });
    }

    // 4. Schedule match
    const scheduleAnswer = answers.find(a => a.questionCode === 'q1')?.answerValue;
    if (scheduleAnswer && vacancy.schedule?.includes(scheduleAnswer)) {
      score += 15;
      factors.push({ name: 'schedule', weight: 0.8, value: 'Подходящий график' });
    }

    // 5. Student availability
    const isStudentAnswer = answers.find(a => a.questionCode === 'q6')?.answerValue;
    if (isStudentAnswer && vacancy.isStudentAvailable) {
      score += 10;
      factors.push({ name: 'student', weight: 0.7, value: 'Есть практика/стажировка' });
    }

    const explanation = factors.length > 0
      ? factors.map(f => f.value).join(', ')
      : 'Подходит по параметрам';

    return {
      score: Math.min(100, score),
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
