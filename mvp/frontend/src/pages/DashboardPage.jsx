import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { FiEdit, FiTrendingUp, FiTarget, FiClipboard } from 'react-icons/fi';
import { applicationsAPI } from '../services/api';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { recommendations, getRecommendations, sessionId } = useAssessmentStore();
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    // Загружаем отклики
    const fetchApplications = async () => {
      try {
        const { data } = await applicationsAPI.getMyApplications();
        setApplicationsCount(data.count);
      } catch (err) {
        console.error('Failed to load applications:', err);
        setApplicationsCount(0);
      }
    };
    fetchApplications();

    // Если есть активная сессия, но рекомендации ещё не загружены – подгружаем
    if (sessionId && (!recommendations || recommendations.length === 0)) {
      getRecommendations();
    }
  }, [isAuthenticated, navigate, sessionId, getRecommendations]);

  if (!isAuthenticated) {
    return null;
  }

  const recommendationsCount = recommendations?.length || 0;

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-12">Личный кабинет</h1>

        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* Profile Card */}
          <Link
            to="/dashboard/profile"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiEdit />
            </div>
            <h3 className="font-bold mb-2">Мой профиль</h3>
            <p className="text-sm text-gray-600">Отредактировать данные</p>
          </Link>

          {/* My Recommendations Card (заменяет Цифровой паспорт) */}
          <Link
            to="/dashboard/recommendations"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiTrendingUp />
            </div>
            <h3 className="font-bold mb-2">Мои рекомендации</h3>
            <p className="text-sm text-gray-600">Список подобранных вакансий</p>
          </Link>

          {/* Assessment Card */}
          <Link
            to="/dashboard/assessment"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiTarget />
            </div>
            <h3 className="font-bold mb-2">Пройти анкету</h3>
            <p className="text-sm text-gray-600">Получить рекомендации</p>
          </Link>

          {/* My Applications Card */}
          <Link
            to="/dashboard/applications"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiClipboard />
            </div>
            <h3 className="font-bold mb-2">Мои отклики</h3>
            <p className="text-sm text-gray-600">Отклики на вакансии</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h4 className="text-sm text-gray-600 mb-2">Мои отклики</h4>
            <p className="text-3xl font-bold text-accent">
              {applicationsCount !== null ? applicationsCount : '...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">на вакансии</p>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h4 className="text-sm text-gray-600 mb-2">Записи на экскурсии</h4>
            <p className="text-3xl font-bold text-success">0</p>
            <p className="text-xs text-gray-500 mt-2">запланировано</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <h4 className="text-sm text-gray-600 mb-2">Рекомендации</h4>
            <p className="text-3xl font-bold">{recommendationsCount}</p>
            <p className="text-xs text-gray-500 mt-2">предприятий и вакансий</p>
          </div>
        </div>
      </div>
    </div>
  );
}