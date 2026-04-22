import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiEdit, FiFileText, FiTarget, FiMessageSquare } from 'react-icons/fi';

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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

          {/* Digital Passport Card */}
          <Link
            to="/dashboard/digital-passport"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiFileText />
            </div>
            <h3 className="font-bold mb-2">Цифровой паспорт</h3>
            <p className="text-sm text-gray-600">Ваш профиль и интересы</p>
          </Link>

          {/* Recommendations Card */}
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

          {/* Messages Card */}
          <Link
            to="/dashboard/messages"
            className="card hover:shadow-md transition transform hover:scale-105"
          >
            <div className="text-accent text-3xl mb-4">
              <FiMessageSquare />
            </div>
            <h3 className="font-bold mb-2">Сообщения</h3>
            <p className="text-sm text-gray-600">Диалоги с HR</p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <h4 className="text-sm text-gray-600 mb-2">Мои отклики</h4>
            <p className="text-3xl font-bold text-accent">0</p>
            <p className="text-xs text-gray-500 mt-2">на вакансии</p>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <h4 className="text-sm text-gray-600 mb-2">Записи на экскурсии</h4>
            <p className="text-3xl font-bold text-success">0</p>
            <p className="text-xs text-gray-500 mt-2">запланировано</p>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <h4 className="text-sm text-gray-600 mb-2">Рекомендации</h4>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-gray-500 mt-2">предприятий</p>
          </div>
        </div>
      </div>
    </div>
  );
}
