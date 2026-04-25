import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function EnterpriseTourBookingsPage() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [tourRes, bookingsRes] = await Promise.all([
          enterpriseAPI.getTour(id),
          enterpriseAPI.getTourBookings(id),
        ]);
        setTour(tourRes.data);
        setBookings(bookingsRes.data.bookings || []);
      } catch (err) {
        toast.error('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (!tour) return <div className="text-center py-12">Экскурсия не найдена</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <Link to="/enterprise/tours" className="flex items-center gap-1 text-blue-600 mb-4 hover:underline">
        <FiArrowLeft /> Назад к списку экскурсий
      </Link>
      <h2 className="text-3xl font-bold mb-2">{tour.title}</h2>
      <p className="text-gray-500 mb-8">
        {new Date(tour.startAt).toLocaleString('ru-RU')} • {tour.format === 'online' ? 'Онлайн' : 'Офлайн'}
      </p>

      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center">Нет записей</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Соискатель</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Телефон</th>
                <th className="text-left p-4">Дата записи</th>
                <th className="text-left p-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{booking.User?.UserProfile?.fullName || '—'}</td>
                  <td className="p-4">{booking.User?.email || '—'}</td>
                  <td className="p-4">{booking.User?.UserProfile?.phone || '—'}</td>
                  <td className="p-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">{booking.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}