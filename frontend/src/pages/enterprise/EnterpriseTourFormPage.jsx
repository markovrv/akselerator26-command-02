import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const DEFAULT_TOUR = {
  title: '',
  format: 'offline',
  description: '',
  startAt: '',
  capacity: 20,
  status: 'planned',
};

export default function EnterpriseTourFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const [form, setForm] = useState(DEFAULT_TOUR);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      (async () => {
        try {
          const { data } = await enterpriseAPI.getTour(id);
          setForm({
            title: data.title || '',
            format: data.format || 'offline',
            description: data.description || '',
            startAt: data.startAt ? new Date(data.startAt).toISOString().slice(0, 16) : '',
            capacity: data.capacity ?? 20,
            status: data.status || 'planned',
          });
        } catch (err) {
          toast.error('Не удалось загрузить экскурсию');
        }
      })();
    }
  }, [isEditing, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, startAt: new Date(form.startAt).toISOString() };
      if (isEditing) {
        await enterpriseAPI.updateTour(id, payload);
        toast.success('Экскурсия обновлена');
      } else {
        await enterpriseAPI.createTour(payload);
        toast.success('Экскурсия создана');
      }
      navigate('/enterprise/tours');
    } catch (err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6">{isEditing ? 'Редактировать экскурсию' : 'Новая экскурсия'}</h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Формат</label>
          <select name="format" value={form.format} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white">
            <option value="offline">Офлайн</option>
            <option value="online">Онлайн</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Описание</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата и время начала</label>
          <input type="datetime-local" name="startAt" value={form.startAt} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Количество мест</label>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Статус</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2 bg-white">
            <option value="planned">Запланирована</option>
            <option value="open">Открыта</option>
            <option value="closed">Закрыта</option>
            <option value="cancelled">Отменена</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full btn-primary">
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </div>
  );
}