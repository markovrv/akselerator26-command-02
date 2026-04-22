import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { FiStar, FiMapPin, FiDollarSign } from 'react-icons/fi';

export default function RecommendationsPage() {
  const { isAuthenticated } = useAuthStore();
  const { recommendations, getRecommendations, isLoading, error } = useAssessmentStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    getRecommendations();
  }, [isAuthenticated, navigate, getRecommendations]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка рекомендаций...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-error font-bold mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard/assessment')}
            className="btn-primary"
          >
            Пройти анкету заново
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Нет рекомендаций</p>
          <button
            onClick={() => navigate('/dashboard/assessment')}
            className="btn-primary"
          >
            Пройти анкету
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-12">Ваши рекомендации</h1>

        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="card hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{rec.Enterprise?.name || 'Предприятие'}</h3>
                  <p className="text-gray-600">{rec.Enterprise?.industry}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-accent font-bold">
                    <FiStar size={20} className="fill-accent" />
                    <span className="text-3xl">{rec.matchScore}%</span>
                  </div>
                  <p className="text-sm text-gray-600">совпадение</p>
                </div>
              </div>

              {/* Enterprise Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FiMapPin size={16} />
                  <span>{rec.Enterprise?.city}, {rec.Enterprise?.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiDollarSign size={16} />
                  <span>
                    {rec.Vacancy?.salaryFrom?.toLocaleString('ru-RU')} —
                    {rec.Vacancy?.salaryTo?.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              {/* Why Recommended */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <h4 className="font-bold text-sm mb-2">Почему подходит:</h4>
                <p className="text-sm text-gray-700">{rec.explanation}</p>
              </div>

              {/* Vacancy Info */}
              {rec.Vacancy && (
                <div className="mb-4">
                  <h4 className="font-bold mb-2">Вакансия:</h4>
                  <p className="text-gray-700">{rec.Vacancy.title}</p>
                  <p className="text-sm text-gray-600">{rec.Vacancy.department}</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button className="flex-1 btn-primary">
                  Открыть предприятие
                </button>
                <button className="flex-1 btn-secondary text-primary">
                  Добавить в избранное
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
