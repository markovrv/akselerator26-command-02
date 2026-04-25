// src/pages/enterprise/EnterpriseProfilePage.jsx
import { useEffect, useState } from 'react';
import { enterpriseAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

// Поля, которые можно редактировать (enterpriseId исключён – он readonly)
const EDITABLE_FIELDS = [
  'name',
  'description',
  'laborConditions',
  'safetyInfo',
  'address',
  'city',
  'region',
  'phone',
  'email',
];

const INITIAL_PROFILE = {
  name: '',
  description: '',
  laborConditions: '',
  safetyInfo: '',
  address: '',
  city: '',
  region: '',
  phone: '',
  email: '',
};

export default function EnterpriseProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [enterpriseId, setEnterpriseId] = useState(''); // только для отображения
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await enterpriseAPI.getProfile();
        // Оставляем только разрешённые поля
        const editable = {};
        EDITABLE_FIELDS.forEach((key) => {
          editable[key] = data[key] ?? '';
        });
        setProfile(editable);
        // Сохраняем enterpriseId для readonly поля
        setEnterpriseId(data.enterpriseId || data.id || '');
      } catch (err) {
        console.error(err);
        toast.error('Не удалось загрузить профиль');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Отправляем только редактируемые поля (без enterpriseId)
      await enterpriseAPI.updateProfile(profile);
      toast.success('Профиль обновлён');
    } catch (err) {
      toast.error('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Загрузка профиля...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6">Редактирование профиля предприятия</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        {/* Поле enterpriseId – только чтение */}
        <div>
          <label className="block text-sm font-medium mb-1">ID предприятия</label>
          <input
            type="text"
            value={enterpriseId}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-600 focus:outline-none"
          />
        </div>

        {/* Редактируемые поля */}
        {EDITABLE_FIELDS.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">
              {field === 'laborConditions' ? 'Условия труда' :
               field === 'safetyInfo' ? 'Информация о безопасности' :
               field === 'address' ? 'Адрес' :
               field === 'city' ? 'Город' :
               field === 'region' ? 'Регион' :
               field === 'phone' ? 'Телефон' :
               field === 'email' ? 'Email' :
               field}
            </label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              name={field}
              value={profile[field] || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
}