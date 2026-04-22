import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { vacanciesAPI } from '../services/api';
import { FiMapPin, FiDollarSign, FiBriefcase, FiFilter } from 'react-icons/fi';

export default function VacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchVacancies = useCallback(async (fetchFilters = {}) => {
    setLoading(true);
    try {
      const { data } = await vacanciesAPI.getAll(fetchFilters);
      setVacancies(data.vacancies || []);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchVacancies(newFilters);
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Полная занятость',
      internship: 'Стажировка',
      practice: 'Практика',
      shift: 'Вахта',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Каталог вакансий</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <FiFilter className="text-gray-400" />
            <select
              className="input max-w-xs"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            >
              <option value="">Все города</option>
              <option value="Екатеринбург">Екатеринбург</option>
              <option value="Нижний Новгород">Нижний Новгород</option>
              <option value="Казань">Казань</option>
            </select>
            <select
              className="input max-w-xs"
              value={filters.employmentType || ''}
              onChange={(e) => handleFilterChange('employmentType', e.target.value)}
            >
              <option value="">Все типы</option>
              <option value="full_time">Полная занятость</option>
              <option value="practice">Практика</option>
              <option value="internship">Стажировка</option>
              <option value="shift">Вахта</option>
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isStudentAvailable === 'true'}
                onChange={(e) => handleFilterChange('isStudentAvailable', e.target.checked ? 'true' : '')}
              />
              <span className="text-sm">Только для студентов</span>
            </label>
          </div>
        </div>

        {/* Vacancies List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Вакансии не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="card hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {vacancy.Enterprise?.name?.substring(0, 2) || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{vacancy.title}</h3>
                      <p className="text-accent font-medium">{vacancy.Enterprise?.name}</p>
                      <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <FiMapPin size={14} />
                          {vacancy.Enterprise?.city}
                        </span>
                        <span>{vacancy.department}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">
                      {vacancy.salaryFrom?.toLocaleString('ru-RU')} — {vacancy.salaryTo?.toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-gray-600 text-sm">{vacancy.schedule}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {getEmploymentTypeLabel(vacancy.employmentType)}
                  </span>
                  {vacancy.isStudentAvailable && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Для студентов
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-4 line-clamp-2">
                  {vacancy.responsibilities}
                </p>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Опубликовано: {new Date(vacancy.publishedAt).toLocaleDateString('ru-RU')}
                  </span>
                  <Link
                    to={`/vacancy/${vacancy.id}`}
                    className="btn-primary btn-sm"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
