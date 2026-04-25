// src/pages/enterprise/EnterpriseApplicationsPage.jsx
import { useEffect, useState } from 'react';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

const STATUS_OPTIONS = ['new', 'viewed', 'invited', 'rejected', 'hired'];

export default function EnterpriseApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null); // для модального окна

  const fetchApplications = async () => {
    try {
      const { data } = await enterpriseAPI.getApplications();
      setApplications(data.applications || []);
    } catch (err) {
      toast.error('Ошибка загрузки откликов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (appId, newStatus) => {
    try {
      await enterpriseAPI.updateApplicationStatus(appId, newStatus);
      toast.success('Статус обновлён');
      // Обновим статус в локальном состоянии и в модальном окне, если оно открыто
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const openDetails = (app) => {
    setSelectedApp(app);
  };

  const closeDetails = () => {
    setSelectedApp(null);
  };

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-8">Отклики на вакансии</h2>

      {applications.length === 0 ? (
        <p className="text-gray-500 text-center">Пока нет откликов</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Соискатель</th>
                <th className="text-left p-4">Вакансия</th>
                <th className="text-left p-4">Дата</th>
                <th className="text-left p-4">Статус</th>
                <th className="text-left p-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetails(app)}
                >
                  <td className="p-4">
                    {app.User?.UserProfile?.fullName || app.User?.email}
                  </td>
                  <td className="p-4">{app.Vacancy?.title}</td>
                  <td className="p-4">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно с деталями отклика */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{backgroundColor: '#00000080'}}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Детали отклика</h3>
              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Информация о соискателе */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Соискатель</h4>
                <p>
                  <span className="font-medium">ФИО:</span>{' '}
                  {selectedApp.User?.UserProfile?.fullName || '—'}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{' '}
                  {selectedApp.User?.email || '—'}
                </p>
                <p>
                  <span className="font-medium">Телефон:</span>{' '}
                  {selectedApp.User?.UserProfile?.phone || '—'}
                </p>
                {selectedApp.User?.UserProfile?.city && (
                  <p>
                    <span className="font-medium">Город:</span>{' '}
                    {selectedApp.User?.UserProfile?.city}
                  </p>
                )}
              </div>

              {/* Информация о вакансии */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Вакансия</h4>
                <p>
                  <span className="font-medium">Название:</span>{' '}
                  {selectedApp.Vacancy?.title || '—'}
                </p>
                {selectedApp.Vacancy?.employmentType && (
                  <p>
                    <span className="font-medium">Тип занятости:</span>{' '}
                    {selectedApp.Vacancy?.employmentType}
                  </p>
                )}
              </div>

              {/* Текст отклика (coverNote) */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Текст отклика
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedApp.coverNote || 'Без сопроводительного письма'}
                </p>
              </div>

              {/* Статус */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">Статус:</span>
                <select
                  value={selectedApp.status}
                  onChange={(e) => updateStatus(selectedApp.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Дата создания */}
              <div>
                <span className="font-medium text-gray-700">Дата отклика:</span>{' '}
                {new Date(selectedApp.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}