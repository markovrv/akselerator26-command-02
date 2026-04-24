import { useEffect, useState } from 'react';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiX } from 'react-icons/fi';

export default function EnterpriseAllTourBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await enterpriseAPI.getAllTourBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      toast.error('Ошибка загрузки бронирований');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;
      await enterpriseAPI.updateTourBookingStatus(booking.Tour.id, bookingId, newStatus);
      toast.success('Статус обновлён');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking?.id === bookingId) setSelectedBooking(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const openDetails = (booking) => setSelectedBooking(booking);
  const closeDetails = () => setSelectedBooking(null);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-8">Все записи на экскурсии</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center">Нет записей</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Соискатель</th>
                <th className="text-left p-4">Экскурсия</th>
                <th className="text-left p-4">Дата записи</th>
                <th className="text-left p-4">Статус</th>
                <th className="text-left p-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetails(booking)}
                >
                  <td className="p-4">{booking.User?.UserProfile?.fullName || booking.User?.email}</td>
                  <td className="p-4">{booking.Tour?.title}</td>
                  <td className="p-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100">{booking.status}</span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="visited">visited</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold">Детали записи</h3>
              <button onClick={closeDetails} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Соискатель</h4>
                <p><span className="font-medium">ФИО:</span> {selectedBooking.User?.UserProfile?.fullName || '—'}</p>
                <p><span className="font-medium">Email:</span> {selectedBooking.User?.email || '—'}</p>
                <p><span className="font-medium">Телефон:</span> {selectedBooking.User?.UserProfile?.phone || '—'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Экскурсия</h4>
                <p><span className="font-medium">Название:</span> {selectedBooking.Tour?.title}</p>
                <p><span className="font-medium">Дата:</span> {new Date(selectedBooking.Tour?.startAt).toLocaleString('ru-RU')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Статус</h4>
                <select
                  value={selectedBooking.status}
                  onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="new">new</option>
                  <option value="confirmed">confirmed</option>
                  <option value="cancelled">cancelled</option>
                  <option value="visited">visited</option>
                </select>
              </div>
              <div><span className="font-medium">Дата записи:</span> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button onClick={closeDetails} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}