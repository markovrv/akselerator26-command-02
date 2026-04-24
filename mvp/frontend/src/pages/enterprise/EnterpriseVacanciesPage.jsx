import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function EnterpriseVacanciesPage() {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVacancies = async () => {
    try {
      const { data } = await enterpriseAPI.getVacancies();
      setVacancies(data.vacancies || []);
    } catch (err) {
      toast.error('Ошибка загрузки вакансий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить вакансию?')) return;
    try {
      await enterpriseAPI.deleteVacancy(id);
      toast.success('Вакансия удалена');
      fetchVacancies();
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Вакансии</h2>
        <Link to="/enterprise/vacancies/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Добавить
        </Link>
      </div>

      {vacancies.length === 0 ? (
        <p className="text-gray-500 text-center">Нет вакансий</p>
      ) : (
        <div className="grid gap-4">
          {vacancies.map((vac) => (
            <div key={vac.id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{vac.title}</h3>
                <p className="text-sm text-gray-500">
                  {vac.employmentType} • {vac.salaryFrom}–{vac.salaryTo} ₽
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  vac.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {vac.status}
                </span>
              </div>
              <div className="flex gap-2">
                <Link to={`/enterprise/vacancies/${vac.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <FiEdit2 />
                </Link>
                <button onClick={() => handleDelete(vac.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}