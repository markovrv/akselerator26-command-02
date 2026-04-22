const { AssessmentSession, AssessmentAnswer } = require('../models');

const ASSESSMENT_QUESTIONS = [
  {
    code: 'q1',
    text: 'Какой формат работы вам подходит?',
    type: 'single_choice',
    options: ['Сменный график', 'Пятидневка', 'Вахта', 'Не определился'],
  },
  {
    code: 'q2',
    text: 'Готовы ли вы к переезду?',
    type: 'boolean',
  },
  {
    code: 'q3',
    text: 'Насколько важен карьерный рост?',
    type: 'scale_1_5',
  },
  {
    code: 'q4',
    text: 'Есть ли ограничения по условиям труда?',
    type: 'multi_choice',
    options: ['Высокие температуры', 'Химические вещества', 'Физическая нагрузка', 'Нет ограничений'],
  },
  {
    code: 'q5',
    text: 'Какой уровень зарплаты вы ожидаете?',
    type: 'range',
  },
  {
    code: 'q6',
    text: 'Интересует ли вас практика/стажировка?',
    type: 'boolean',
  },
];

class AssessmentService {
  async startAssessment(userId, roleContext = 'seeker') {
    const session = await AssessmentSession.create({
      userId,
      roleContext,
      status: 'in_progress',
    });

    return {
      sessionId: session.id,
      questions: ASSESSMENT_QUESTIONS,
    };
  }

  async answerQuestion(sessionId, questionCode, answerValue) {
    const session = await AssessmentSession.findByPk(sessionId);
    if (!session) {
      throw { statusCode: 404, message: 'Assessment session not found' };
    }

    const question = ASSESSMENT_QUESTIONS.find(q => q.code === questionCode);
    if (!question) {
      throw { statusCode: 400, message: 'Invalid question code' };
    }

    const answer = await AssessmentAnswer.create({
      sessionId,
      questionCode,
      answerValue,
      weight: 1.0,
    });

    return answer;
  }

  async completeAssessment(sessionId) {
    const session = await AssessmentSession.findByPk(sessionId, {
      include: ['AssessmentAnswers'],
    });

    if (!session) {
      throw { statusCode: 404, message: 'Assessment session not found' };
    }

    // Calculate basic score based on answers
    const scoreJson = this.calculateScore(session.AssessmentAnswers);

    session.status = 'completed';
    session.scoreJson = scoreJson;
    session.completedAt = new Date();
    await session.save();

    return session;
  }

  calculateScore(answers) {
    const score = {
      schedule: 0,
      relocation: 0,
      careerGrowth: 0,
      healthLimitations: 0,
      salary: 0,
      practice: 0,
    };

    answers.forEach(answer => {
      switch (answer.questionCode) {
        case 'q1':
          score.schedule = answer.answerValue === 'Сменный график' ? 0.8 : 0.5;
          break;
        case 'q2':
          score.relocation = answer.answerValue ? 0.9 : 0.3;
          break;
        case 'q3':
          score.careerGrowth = (answer.answerValue || 3) / 5;
          break;
        case 'q4':
          score.healthLimitations = (answer.answerValue?.length || 0) > 0 ? 0.6 : 1.0;
          break;
        case 'q5':
          score.salary = 0.7; // Will be refined by external API
          break;
        case 'q6':
          score.practice = answer.answerValue ? 1.0 : 0.5;
          break;
      }
    });

    return score;
  }

  getQuestions() {
    return ASSESSMENT_QUESTIONS;
  }
}

module.exports = new AssessmentService();
