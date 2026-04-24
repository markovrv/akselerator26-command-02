// src/pages/enterprise/EnterpriseVacancyFormPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const DEFAULT_VACANCY = {
  title: '',
  department: '',
  employmentType: 'full_time',
  salaryFrom: '',
  salaryTo: '',
  schedule: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  medicalRequirements: '',
  isStudentAvailable: false,
  status: 'draft',
};

export default function EnterpriseVacancyFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const [form, setForm] = useState(DEFAULT_VACANCY);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      (async () => {
        try {
          const { data } = await enterpriseAPI.getVacancies();
          const vac = data.vacancies?.find((v) => v.id === id);
          if (vac) setForm(vac);
        } catch (err) {
          toast.error('Не удалось загрузить вакансию');
        }
      })();
    }
  }, [isEditing, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing) {
        await enterpriseAPI.updateVacancy(id, form);
        toast.success('Вакансия обновлена');
      } else {
        await enterpriseAPI.createVacancy(form);
        toast.success('Вакансия создана');
      }
      navigate('/enterprise/vacancies');
    } catch (err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6">
        {isEditing ? 'Редактировать вакансию' : 'Новая вакансия'}
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
        {/* Название */}
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
            required
          />
        </div>

        {/* Отдел */}
        <div>
          <label className="block text-sm font-medium mb-1">Отдел</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Тип занятости */}
        <div>
          <label className="block text-sm font-medium mb-1">Тип занятости</label>
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-600"
          >
            <option value="full_time">Полная занятость</option>
            <option value="shift">Сменный график</option>
            <option value="practice">Практика</option>
            <option value="internship">Стажировка</option>
            <option value="remote">Удалённая</option>
          </select>
        </div>

        {/* Зарплата */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Зарплата от</label>
            <input
              type="number"
              name="salaryFrom"
              value={form.salaryFrom}
              onChange={handleChange}
              placeholder="50000"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Зарплата до</label>
            <input
              type="number"
              name="salaryTo"
              value={form.salaryTo}
              onChange={handleChange}
              placeholder="80000"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* График работы */}
        <div>
          <label className="block text-sm font-medium mb-1">График работы</label>
          <input
            type="text"
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            placeholder="например, 5/2, Вахтовый метод (15/15)"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Требования */}
        <div>
          <label className="block text-sm font-medium mb-1">Требования</label>
          <textarea
            name="requirements"
            value={form.requirements}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Обязанности */}
        <div>
          <label className="block text-sm font-medium mb-1">Обязанности</label>
          <textarea
            name="responsibilities"
            value={form.responsibilities}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Условия / Бенефиты */}
        <div>
          <label className="block text-sm font-medium mb-1">Бенефиты и условия</label>
          <textarea
            name="benefits"
            value={form.benefits}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Медицинские требования */}
        <div>
          <label className="block text-sm font-medium mb-1">Медицинские требования</label>
          <textarea
            name="medicalRequirements"
            value={form.medicalRequirements}
            onChange={handleChange}
            rows={2}
            placeholder="Отсутствие противопоказаний для работы на высоте и с электрооборудованием"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
          />
        </div>

        {/* Доступно студентам */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isStudentAvailable"
            checked={form.isStudentAvailable}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded"
          />
          <label className="text-sm font-medium">Доступно для студентов</label>
        </div>

        {/* Статус (только для редактирования) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:border-blue-600"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликована</option>
              <option value="archived">Архив</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium"
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}