import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';

export default function RegisterForm() {
  const [step, setStep] = useState(1); // 1: credentials, 2: role, 3: confirmation
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seeker',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Заполните все поля');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      setStep(3);
      setIsLoading(true);

      try {
        await register(
          formData.email,
          formData.password,
          formData.fullName,
          formData.role
        );
        navigate('/dashboard');
      } catch (err) {
        navigate('/dashboard');
        setError(err.response?.data?.error || 'Ошибка регистрации');
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Создайте аккаунт</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Step 1: Credentials */}
      {step >= 1 && (
        <form onSubmit={handleSubmit} className={step !== 1 ? 'opacity-50 pointer-events-none' : ''}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">ФИО</label>
            <div className="flex items-center bg-light rounded px-3">
              <FiUser className="text-gray-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Иван Иванов"
                className="flex-1 bg-light px-2 py-2 focus:outline-none"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="flex items-center bg-light rounded px-3">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="flex-1 bg-light px-2 py-2 focus:outline-none"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <div className="flex items-center bg-light rounded px-3">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••"
                className="flex-1 bg-light px-2 py-2 focus:outline-none"
                disabled={step > 1}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
            <div className="flex items-center bg-light rounded px-3">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••"
                className="flex-1 bg-light px-2 py-2 focus:outline-none"
                disabled={step > 1}
              />
            </div>
          </div>

          {step === 1 && (
            <button type="submit" className="w-full btn-primary">
              Продолжить
            </button>
          )}
        </form>
      )}

      {/* Step 2: Choose Role */}
      {step >= 2 && (
        <div className={step !== 2 ? 'opacity-50 pointer-events-none' : ''}>
          <p className="text-sm text-gray-600 mb-4">Кто вы?</p>
          <div className="space-y-3 mb-6">
            <label className="flex items-center p-3 border-2 border-gray-300 rounded cursor-pointer hover:border-accent transition"
              style={{ borderColor: formData.role === 'seeker' ? '#0066cc' : '#d0d0d0' }}
            >
              <input
                type="radio"
                name="role"
                value="seeker"
                checked={formData.role === 'seeker'}
                onChange={handleChange}
                className="mr-3"
              />
              <span>
                <strong>Соискатель</strong>
                <p className="text-xs text-gray-500">Ищу работу</p>
              </span>
            </label>

            <label className="flex items-center p-3 border-2 border-gray-300 rounded cursor-pointer hover:border-accent transition"
              style={{ borderColor: formData.role === 'student' ? '#0066cc' : '#d0d0d0' }}
            >
              <input
                type="radio"
                name="role"
                value="student"
                checked={formData.role === 'student'}
                onChange={handleChange}
                className="mr-3"
              />
              <span>
                <strong>Студент</strong>
                <p className="text-xs text-gray-500">Ищу практику/стажировку</p>
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 btn-secondary">
              Назад
            </button>
            <button onClick={handleSubmit} disabled={isLoading} className="flex-1 btn-primary">
              {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step >= 3 && (
        <div className={step !== 3 ? 'opacity-50 pointer-events-none' : ''}>
          <p className="text-center text-gray-600 mb-4">Загрузка...</p>
        </div>
      )}

      <p className="text-center text-gray-600 mt-6">
        Уже есть аккаунт?{' '}
        <Link to="/auth/login" className="text-accent font-medium hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
