import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function EnterpriseToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTours = async () => {
    try {
      const { data } = await enterpriseAPI.getTours();
      setTours(data.tours || []);
    } catch (err) {
      toast.error('Ошибка загрузки экскурсий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Удалить экскурсию?')) return;
    try {
      await enterpriseAPI.deleteTour(id);
      toast.success('Экскурсия удалена');
      fetchTours();
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Экскурсии</h2>
        <Link to="/enterprise/tours/new" className="btn-primary flex items-center gap-2">
          <FiPlus /> Добавить
        </Link>
      </div>

      {tours.length === 0 ? (
        <p className="text-gray-500 text-center">Нет экскурсий</p>
      ) : (
        <div className="grid gap-4">
          {tours.map((tour) => (
            <div key={tour.id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{tour.title}</h3>
                <p className="text-sm text-gray-500">
                  {tour.format === 'online' ? 'Онлайн' : 'Офлайн'} • {new Date(tour.startAt).toLocaleString('ru-RU')}
                </p>
                <span className={`text-xs px-2 py-1 rounded ${
                  tour.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {tour.status}
                </span>
              </div>
              <div className="flex gap-2">
                <Link to={`/enterprise/tours/${tour.id}/bookings`} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Бронирования">
                  <FiUsers />
                </Link>
                <Link to={`/enterprise/tours/${tour.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <FiEdit2 />
                </Link>
                <button onClick={() => handleDelete(tour.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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