import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { FiArrowRight, FiTarget, FiUsers, FiBarChart } from 'react-icons/fi';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Вперёд по маршрутам промышленности
          </h1>
          <p className="hero-subtitle">
            Найдите предприятие, которое подходит именно вам: по профессии, условиям труда,
            оплате, карьерным возможностям и формату знакомства с производством.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard/assessment')} className="btn btn-primary btn-lg">
                Пройти подбор <FiArrowRight />
              </button>
            ) : (
              <Link to="/auth/register" className="btn btn-primary btn-lg">
                Пройти подбор <FiArrowRight />
              </Link>
            )}
            <Link to="/enterprises" className="btn btn-outline">
              Смотреть предприятия
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Как это работает</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Заполните анкету</h3>
              <p className="step-desc">
                Расскажите о себе, своих интересах и требованиях к работе
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Получите рекомендации</h3>
              <p className="step-desc">
                ИИ подберет предприятия и вакансии, которые вам подходят
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Примите решение</h3>
              <p className="step-desc">
                Посетите экскурсию и подайте заявку на собеседование
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Почему выбирают нас</h2>
          <div className="features-grid">
            <div className="card feature-card">
              <div className="feature-icon">
                <FiTarget />
              </div>
              <h3 className="feature-title">Точный подбор</h3>
              <p className="feature-desc">
                Используем ИИ для подбора вакансий, которые действительно вам подходят
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiUsers />
              </div>
              <h3 className="feature-title">Погружение в жизнь предприятия</h3>
              <p className="feature-desc">
                Смотрите 3D-модели рабочих мест, участвуйте в онлайн и офлайн экскурсиях
              </p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <FiBarChart />
              </div>
              <h3 className="feature-title">Осознанный выбор</h3>
              <p className="feature-desc">
                Полная информация о условиях труда, оплате, карьерных перспективах
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container text-center">
          <h2 className="section-title">Готовы найти свою работу?</h2>
          <p className="section-desc">
            Начните прямо сейчас и получите персональные рекомендации
          </p>
          <Link to="/auth/register" className="btn btn-primary btn-lg">
            Зарегистрироваться <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* For Enterprises */}
      <section className="section section-alt">
        <div className="container">
          <div className="enterprise-grid">
            <div>
              <h2 className="section-title" style={{textAlign: 'left'}}>Для предприятий</h2>
              <p className="section-desc">
                Платформа помогает промышленным предприятиям показывать реальные условия
                работы, проводить экскурсии и получать отклики от кандидатов, которым
                действительно подходит ваше производство.
              </p>
              <ul className="benefits-list">
                <li>Меньше случайных откликов</li>
                <li>Сильнее бренд работодателя</li>
                <li>Быстрее закрытие вакансий</li>
                <li>Ниже текучесть новых сотрудников</li>
              </ul>
              <Link to="/auth/register" className="btn btn-primary">
                Подключить предприятие
              </Link>
            </div>
            <div className="enterprise-visual"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
