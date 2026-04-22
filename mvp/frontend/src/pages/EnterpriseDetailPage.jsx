import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enterprisesAPI, toursAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FiMapPin, FiDollarSign, FiCalendar, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';

export default function EnterpriseDetailPage() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [enterprise, setEnterprise] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [bookingTourId, setBookingTourId] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const fetchEnterprise = useCallback(async () => {
    try {
      const { data } = await enterprisesAPI.getBySlug(slug);
      setEnterprise(data);
    } catch (error) {
      console.error('Error fetching enterprise:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchTours = useCallback(async () => {
    try {
      const { data } = await toursAPI.getAll();
      setTours(data.tours || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    }
  }, []);

  useEffect(() => {
    fetchEnterprise();
    fetchTours();
  }, [slug, fetchEnterprise, fetchTours]);

  const handleBookTour = async (tourId) => {
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите для записи на экскурсию');
      return;
    }

    setBookingTourId(tourId);
    try {
      await toursAPI.book(tourId);
      setBookingSuccess(tourId);
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при записи на экскурсию');
    } finally {
      setBookingTourId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Загрузка...</p>
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Предприятие не найдено</p>
      </div>
    );
  }

  const enterpriseTours = tours.filter(t => t.enterpriseId === enterprise.id);

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <Link to="/enterprises" className="text-accent hover:underline">
            ← Каталог предприятий
          </Link>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {enterprise.name.substring(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{enterprise.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <FiMapPin size={16} />
                  {enterprise.city}, {enterprise.region}
                </span>
                <span>{enterprise.industry}</span>
              </div>
              <p className="text-gray-700">{enterprise.description}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'about'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-accent'
              }`}
            >
              О предприятии
            </button>
            <button
              onClick={() => setActiveTab('vacancies')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'vacancies'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-accent'
              }`}
            >
              Вакансии ({enterprise.Vacancies?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('tours')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'tours'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-accent'
              }`}
            >
              Экскурсии
            </button>
            <button
              onClick={() => setActiveTab('conditions')}
              className={`px-6 py-4 font-medium ${
                activeTab === 'conditions'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-accent'
              }`}
            >
              Условия труда
            </button>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Описание</h3>
                  <p className="text-gray-700">{enterprise.description}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Адрес</h3>
                  <p className="text-gray-700">{enterprise.address}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Контакт HR</h3>
                  <p className="text-gray-700">Свяжитесь с отделом кадров для получения информации</p>
                </div>
              </div>
            )}

            {/* Vacancies Tab */}
            {activeTab === 'vacancies' && (
              <div className="space-y-4">
                {enterprise.Vacancies?.length === 0 ? (
                  <p className="text-gray-600">Нет открытых вакансий</p>
                ) : (
                  enterprise.Vacancies.map((vacancy) => (
                    <div key={vacancy.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{vacancy.title}</h3>
                          <p className="text-gray-600 text-sm">{vacancy.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-accent">
                            {vacancy.salaryFrom?.toLocaleString('ru-RU')} — {vacancy.salaryTo?.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-sm text-gray-500">{vacancy.schedule}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                        {vacancy.responsibilities}
                      </p>
                      <div className="flex gap-2 mt-4">
                        <Link
                          to={`/vacancy/${vacancy.id}`}
                          className="btn-primary btn-sm"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tours Tab */}
            {activeTab === 'tours' && (
              <div className="space-y-4">
                {enterpriseTours.length === 0 ? (
                  <p className="text-gray-600">Нет доступных экскурсий</p>
                ) : (
                  enterpriseTours.map((tour) => (
                    <div key={tour.id} className="border rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{tour.title}</h3>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            tour.format === 'online'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {tour.format === 'online' ? 'Онлайн' : 'Офлайн'}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center gap-1 text-gray-600">
                            <FiCalendar size={14} />
                            {new Date(tour.startAt).toLocaleDateString('ru-RU')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(tour.startAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{tour.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          Осталось мест: {tour.capacity - (tour.TourBookings?.length || 0)}
                        </span>
                        {bookingSuccess === tour.id ? (
                          <span className="flex items-center gap-1 text-success">
                            <FiCheckCircle /> Записаны!
                          </span>
                        ) : (
                          <button
                            onClick={() => handleBookTour(tour.id)}
                            disabled={bookingTourId === tour.id}
                            className="btn-primary btn-sm"
                          >
                            {bookingTourId === tour.id ? 'Запись...' : 'Записаться'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Conditions Tab */}
            {activeTab === 'conditions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Условия труда</h3>
                  <p className="text-gray-700">{enterprise.laborConditions}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Охрана труда и СИЗ</h3>
                  <p className="text-gray-700">{enterprise.safetyInfo}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Порядок расчета зарплаты</h3>
                  <p className="text-gray-700">{enterprise.salaryCalcInfo}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Медосмотр</h3>
                  <p className="text-gray-700">{enterprise.medicalExamInfo}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6 sticky bottom-4">
          <h3 className="font-bold mb-4">Действия</h3>
          <div className="flex gap-4">
            <Link
              to={`/vacancy/${enterprise.Vacancies?.[0]?.id || ''}`}
              className="flex-1 btn-primary text-center"
            >
              Откликнуться на вакансию
            </Link>
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2">
              <FiMessageSquare />
              Задать вопрос HR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
