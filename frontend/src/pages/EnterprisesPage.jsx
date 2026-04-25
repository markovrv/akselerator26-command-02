import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { enterprisesAPI } from '../services/api';
import { FiMapPin, FiBriefcase, FiFilter } from 'react-icons/fi';

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const fetchEnterprises = useCallback(async (fetchFilters = {}) => {
    setLoading(true);
    try {
      const { data } = await enterprisesAPI.getAll(fetchFilters);
      setEnterprises(data.enterprises || []);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnterprises();
  }, [fetchEnterprises]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchEnterprises(newFilters);
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-8">Каталог предприятий</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex items-center gap-4">
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
              value={filters.industry || ''}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
            >
              <option value="">Все отрасли</option>
              <option value="Машиностроение">Машиностроение</option>
              <option value="Металлургия">Металлургия</option>
              <option value="Химическая промышленность">Химическая промышленность</option>
            </select>
          </div>
        </div>

        {/* Enterprises Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Загрузка...</p>
          </div>
        ) : enterprises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Предприятия не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterprises.map((enterprise) => (
              <div key={enterprise.id} className="card hover:shadow-lg transition">
                <div className="h-32 bg-gradient-to-br from-accent to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {enterprise.name.substring(0, 2)}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2">{enterprise.name}</h3>

                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FiMapPin size={16} />
                  <span>{enterprise.city}, {enterprise.region}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FiBriefcase size={16} />
                  <span>{enterprise.industry}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {enterprise.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {enterprise.Vacancies?.length || 0} вакансий
                  </span>
                  <Link
                    to={`/enterprise/${enterprise.slug}`}
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
