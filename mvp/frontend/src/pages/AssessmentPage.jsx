import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';

export default function AssessmentPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    sessionId,
    questions,
    answers,
    status,
    currentQuestionIndex,
    isLoading,
    error,
    fetchQuestions,
    startAssessment,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    completeAssessment,
  } = useAssessmentStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (!sessionId) {
      fetchQuestions();
    }
  }, [isAuthenticated, navigate, sessionId, fetchQuestions]);

  useEffect(() => {
    if (!sessionId && status === 'idle') {
      startAssessment('seeker');
    }
  }, [sessionId, status, startAssessment]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Загрузка анкеты...</p>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    navigate('/dashboard/recommendations');
    return null;
  }

  if (!questions.length) {
    return <div className="text-center py-8">Загрузка вопросов...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (value) => {
    answerQuestion(currentQuestion.code, value);
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    }
  };

  const handleCompleteAssessment = async () => {
    await completeAssessment();
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Шаг {currentQuestionIndex + 1} из {questions.length}</h3>
              <span className="text-sm text-gray-600">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.text}</h2>

            {currentQuestion.type === 'single_choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label key={option} className="flex items-center p-3 border-2 border-gray-300 rounded cursor-pointer hover:border-accent transition"
                    style={{ borderColor: answers[currentQuestion.code] === option ? '#0066cc' : '#d0d0d0' }}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={answers[currentQuestion.code] === option}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'boolean' && (
              <div className="space-y-3">
                {['Да', 'Нет'].map((option) => (
                  <label key={option} className="flex items-center p-3 border-2 border-gray-300 rounded cursor-pointer hover:border-accent transition"
                    style={{ borderColor: answers[currentQuestion.code] === (option === 'Да') ? '#0066cc' : '#d0d0d0' }}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option === 'Да'}
                      checked={answers[currentQuestion.code] === (option === 'Да')}
                      onChange={(e) => handleAnswer(e.target.value === 'true')}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === 'scale_1_5' && (
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(value)}
                    className={`w-10 h-10 rounded border-2 font-bold transition ${
                      answers[currentQuestion.code] === value
                        ? 'bg-accent text-white border-accent'
                        : 'border-gray-300 hover:border-accent'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multi_choice' && (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label key={option} className="flex items-center p-3 border-2 border-gray-300 rounded cursor-pointer hover:border-accent transition">
                    <input
                      type="checkbox"
                      checked={(answers[currentQuestion.code] || []).includes(option)}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQuestion.code] || [];
                        if (e.target.checked) {
                          handleAnswer([...currentAnswers, option]);
                        } else {
                          handleAnswer(currentAnswers.filter(a => a !== option));
                        }
                      }}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 btn-secondary disabled:opacity-50"
            >
              ← Назад
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleCompleteAssessment}
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Завершение...' : 'Завершить и получить рекомендации'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion.code]}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Далее →
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-error px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
