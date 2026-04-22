import db from '../database';

const testResultStmts = {
  insert: db.prepare('INSERT INTO test_results (user_id, answers) VALUES (?, ?)'),
  findByUser: db.prepare('SELECT * FROM test_results WHERE user_id = ? ORDER BY completed_at DESC'),
  deleteByUserAndId: db.prepare('DELETE FROM test_results WHERE user_id = ? AND id = ?'),
};

const recommendedStmts = {
  insert: db.prepare('INSERT OR IGNORE INTO recommended_vacancies (user_id, vacancy_id, match_score, reason) VALUES (?, ?, ?, ?)'),
  findByUser: db.prepare('SELECT * FROM recommended_vacancies WHERE user_id = ? ORDER BY match_score DESC'),
  deleteByUserAndVacancy: db.prepare('DELETE FROM recommended_vacancies WHERE user_id = ? AND vacancy_id = ?'),
  clearByUser: db.prepare('DELETE FROM recommended_vacancies WHERE user_id = ?'),
};

export interface TestResult {
  id: number;
  user_id: number;
  answers: string;
  completed_at: string;
}

export interface RecommendedVacancy {
  id: number;
  user_id: number;
  vacancy_id: number;
  match_score: number;
  reason: string;
  created_at: string;
}

class PassportStore {
  // Test Results
  addTestResult(userId: number, answersJson: string): TestResult {
    const result = testResultStmts.insert.run(userId, answersJson);
    return testResultStmts.findByUser.get(userId) as TestResult;
  }

  getTestResults(userId: number): TestResult[] {
    return testResultStmts.findByUser.all(userId) as TestResult[];
  }

  deleteTestResult(userId: number, testId: number): boolean {
    const result = testResultStmts.deleteByUserAndId.run(userId, testId);
    return result.changes > 0;
  }

  // Recommended Vacancies
  addRecommendedVacancies(userId: number, vacancies: { vacancyId: number; matchScore: number; reason: string }[]): boolean {
    const insert = db.transaction(() => {
      for (const v of vacancies) {
        recommendedStmts.insert.run(userId, v.vacancyId, v.matchScore, v.reason);
      }
    });
    insert();
    return true;
  }

  getRecommendedVacancies(userId: number): RecommendedVacancy[] {
    return recommendedStmts.findByUser.all(userId) as RecommendedVacancy[];
  }

  deleteRecommendedVacancy(userId: number, vacancyId: number): boolean {
    const result = recommendedStmts.deleteByUserAndVacancy.run(userId, vacancyId);
    return result.changes > 0;
  }

  clearPassport(userId: number): void {
    recommendedStmts.clearByUser.run(userId);
    db.prepare('DELETE FROM test_results WHERE user_id = ?').run(userId);
  }
}

export const passportStore = new PassportStore();
