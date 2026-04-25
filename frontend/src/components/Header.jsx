import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiLogOut, FiUser, FiMenu, FiX, FiBriefcase } from 'react-icons/fi';
import { authAPI } from '../services/api';

export default function Header() {
  const { isAuthenticated, user, logout, setUser, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user profile on mount if authenticated
  useEffect(() => {
    if (accessToken && !user) {
      (async () => {
        try {
          const { data } = await authAPI.getProfile();
          setUser(data.user);
        } catch (e) {
          logout();
        }
      })();
    }
  }, [accessToken, user, setUser, logout]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          Вперёд по маршрутам
        </Link>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
          <div className="nav-links">
            <Link to="/enterprises" className="nav-link" onClick={() => setMenuOpen(false)}>
              Предприятия
            </Link>
            <Link to="/vacancies" className="nav-link" onClick={() => setMenuOpen(false)}>
              Вакансии
            </Link>
            <Link to="/tours" className="nav-link" onClick={() => setMenuOpen(false)}>
              Экскурсии
            </Link>
            <Link to="/how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>
              Как это работает
            </Link>
          </div>

          <div className="nav-auth">
            {isAuthenticated ? (
              <div className="auth-section">
                {user?.role === 'enterprise_user' && (
                  <Link to="/enterprise/dashboard" className="mr-4 flex items-center text-sm text-blue-600 hover:underline">
                    <FiBriefcase size={14} className="mr-1" /> HR-панель
                  </Link>
                )}
                <Link to="/dashboard" className="user-badge" onClick={() => setMenuOpen(false)}>
                  <FiUser size={16} />
                  <span className="user-email">{user?.email}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <FiLogOut size={16} />
                  Выход
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/auth/login" className="btn btn-secondary btn-sm">
                  Войти
                </Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
