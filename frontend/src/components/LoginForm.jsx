import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiMail, FiLock } from 'react-icons/fi';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Вход</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <div className="flex items-center bg-light rounded px-3">
            <FiMail className="text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-light px-2 py-2 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Пароль</label>
          <div className="flex items-center bg-light rounded px-3">
            <FiLock className="text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="flex-1 bg-light px-2 py-2 focus:outline-none"
              required
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full btn-primary">
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/auth/forgot-password" className="text-accent text-sm hover:underline">
          Забыли пароль?
        </Link>
      </div>

      <p className="text-center text-gray-600 mt-6">
        Нет аккаунта?{' '}
        <Link to="/auth/register" className="text-accent font-medium hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
