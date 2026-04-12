<template>
  <div class="home-view">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <span class="hero-badge">Профориентация в промышленности</span>
          <h1>Найди свой путь<br>в мире промышленности</h1>
          <p>Пройди тест, получи рекомендации от ИИ и запишись на экскурсию на реальное предприятие</p>
          <div class="hero-actions">
            <router-link to="/test" class="btn btn-primary" v-if="authStore.isAuthenticated">
              Пройти тест
            </router-link>
            <router-link to="/register" class="btn btn-primary" v-else>
              Начать бесплатно
            </router-link>
            <router-link to="/enterprises" class="btn btn-outline">
              Предприятия
            </router-link>
          </div>
        </div>
        <div class="hero-image">
          <div class="hero-visual">
            <div class="visual-card card-1">
              <span class="card-icon">⚙️</span>
              <span class="card-label">Машиностроение</span>
            </div>
            <div class="visual-card card-2">
              <span class="card-icon">🔬</span>
              <span class="card-label">Химия</span>
            </div>
            <div class="visual-card card-3">
              <span class="card-icon">⚡</span>
              <span class="card-label">Энергетика</span>
            </div>
            <div class="visual-circle"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="section section-steps">
      <div class="section-container">
        <h2 class="section-title">Как это работает</h2>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Пройди тест</h3>
            <p>Ответь на вопросы об интересах, ожиданиях по зарплате и предпочтениях типа работы</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>Получи рекомендации</h3>
            <p>ИИ подберёт вакансии, которые подходят именно тебе, с процентом совпадения</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Запишись на экскурсию</h3>
            <p>Посети предприятие, увидь рабочее место изнутри и 3D-модель производства</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section section-features">
      <div class="section-container">
        <h2 class="section-title">Возможности платформы</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🧠</div>
            <h3>ИИ-тестирование</h3>
            <p>Умный подбор вакансий на основе анализа ответов с учётом сферы интересов, ЗП и города</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏭</div>
            <h3>Предприятия</h3>
            <p>Каталог промышленных предприятий с вакансиями, описанием и контактами</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚌</div>
            <h3>Экскурсии</h3>
            <p>Запись на онлайн и офлайн экскурсии по цехам и производственным площадкам</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Цифровой паспорт</h3>
            <p>Все результаты тестов и рекомендации в одном месте — твоём личном профиле</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Медкомиссия</h3>
            <p>Получи направление на медосмотр при записи на экскурсию с предприятия</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3>3D-модели</h3>
            <p>Рассмотри рабочее место в 3D — оцени условия до выхода на работу</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section section-cta">
      <div class="section-container">
        <div class="cta-block">
          <h2>Готов найти свою вакансию мечты?</h2>
          <p>Пройди тест за 3 минуты и получи персональные рекомендации</p>
          <router-link to="/test" class="btn btn-white" v-if="authStore.isAuthenticated">
            Пройти тест
          </router-link>
          <router-link to="/register" class="btn btn-white" v-else>
            Зарегистрироваться
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>

<style scoped lang="scss">
.home-view {
  background: #f8fafc;
}

.hero {
  padding: 80px 24px 60px;
  background: white;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 0.813rem;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

.hero h1 {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: #0f172a;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.125rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;

  &-primary {
    background: #2563eb;
    color: white;

    &:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  }

  &-outline {
    background: transparent;
    color: #475569;
    border: 1.5px solid #e2e8f0;

    &:hover {
      border-color: #cbd5e1;
      background: #f8fafc;
      color: #0f172a;
    }
  }

  &-white {
    background: white;
    color: #2563eb;

    &:hover {
      background: #f1f5f9;
      transform: translateY(-1px);
    }
  }
}

.hero-image {
  display: flex;
  justify-content: center;
}

.hero-visual {
  position: relative;
  width: 400px;
  height: 360px;
}

.visual-circle {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.visual-card {
  position: absolute;
  background: white;
  padding: 14px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;

  .card-icon {
    font-size: 1.25rem;
  }

  &.card-1 {
    top: 20px;
    left: 10px;
  }

  &.card-2 {
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }

  &.card-3 {
    bottom: 20px;
    left: 40px;
  }
}

.section {
  padding: 80px 24px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 48px;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.step-card {
  text-align: center;
  padding: 40px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 12px;
    color: #0f172a;
  }

  p {
    font-size: 0.938rem;
    color: #64748b;
    line-height: 1.6;
  }
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 auto 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  padding: 32px 24px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    transform: translateY(-2px);
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 1.063rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #0f172a;
  }

  p {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.6;
  }
}

.section-cta {
  padding: 0 24px 80px;
}

.cta-block {
  max-width: 1200px;
  margin: 0 auto;
  background: #2563eb;
  color: white;
  padding: 64px 48px;
  border-radius: 16px;
  text-align: center;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 12px;
  }

  p {
    font-size: 1.063rem;
    opacity: 0.85;
    margin-bottom: 32px;
  }
}

@media (max-width: 900px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .hero h1 {
    font-size: 2.25rem;
  }

  .hero-visual {
    width: 100%;
    max-width: 360px;
    height: 280px;
    margin: 0 auto;
  }

  .steps-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }

  .cta-block {
    padding: 40px 24px;

    h2 {
      font-size: 1.5rem;
    }
  }
}
</style>
