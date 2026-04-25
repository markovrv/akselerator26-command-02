import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-section">
            <h4 className="footer-title">О платформе</h4>
            <ul className="footer-links">
              <li><Link to="#">О проекте</Link></li>
              <li><Link to="#">FAQ</Link></li>
              <li><Link to="#">Контакты</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Для соискателей</h4>
            <ul className="footer-links">
              <li><Link to="/enterprises">Предприятия</Link></li>
              <li><Link to="/dashboard/assessment">Пройти тест</Link></li>
              <li><Link to="/dashboard/applications">Мои отклики</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Для предприятий</h4>
            <ul className="footer-links">
              <li><Link to="#">Разместить вакансию</Link></li>
              <li><Link to="#">Кабинет HR</Link></li>
              <li><Link to="/tours">Экскурсии</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Правовые</h4>
            <ul className="footer-links">
              <li><Link to="#">Условия использования</Link></li>
              <li><Link to="#">Политика конфиденциальности</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Вперёд по маршрутам промышленности. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
