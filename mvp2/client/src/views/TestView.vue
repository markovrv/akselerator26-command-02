<template>
  <div class="test-view">
    <div class="test-container">
      <!-- Intro -->
      <div v-if="!started" class="test-intro">
        <div class="intro-icon">🧠</div>
        <h1>Тест профориентации</h1>
        <p>Ответь на 5 вопросов, и ИИ подберёт наиболее подходящие вакансии из каталога предприятий. Результаты сохранятся в твоём цифровом паспорте.</p>
        <div class="intro-features">
          <div class="intro-feature">
            <span>🎯</span>
            <span>Подбор по интересам и зарплате</span>
          </div>
          <div class="intro-feature">
            <span>⏱️</span>
            <span>Занимает 3 минуты</span>
          </div>
          <div class="intro-feature">
            <span>📊</span>
            <span>Результат — в личном кабинете</span>
          </div>
        </div>
        <button @click="startTest" class="btn btn-primary btn-lg">Начать тест</button>
      </div>

      <!-- Test form -->
      <div v-else-if="questions.length > 0" class="test-form-wrapper">
        <!-- Progress -->
        <div class="test-progress">
          <div class="progress-info">
            <span>Вопрос {{ currentQuestion + 1 }} из {{ questions.length }}</span>
            <span class="progress-percent">{{ Math.round(((currentQuestion + 1) / questions.length) * 100) }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }"></div>
          </div>
        </div>

        <!-- Question -->
        <div class="question-card">
          <h2>{{ currentQuestionData?.text }}</h2>
          <p class="question-hint" v-if="currentQuestionData?.type === 'multiple_choice'">Можно выбрать несколько вариантов</p>

          <!-- Single choice -->
          <div v-if="currentQuestionData?.type === 'single_choice'" class="options-grid">
            <button
              v-for="(option, index) in currentQuestionData.options"
              :key="index"
              :class="['option-btn', { selected: answers[currentQuestionData.id] === option }]"
              @click="answers[currentQuestionData.id] = option"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <!-- Multiple choice -->
          <div v-else-if="currentQuestionData?.type === 'multiple_choice'" class="options-grid">
            <button
              v-for="(option, index) in currentQuestionData.options"
              :key="index"
              :class="['option-btn', { selected: (answers[currentQuestionData.id] || []).includes(option) }]"
              @click="toggleMultiple(option)"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <!-- Text input -->
          <div v-else-if="currentQuestionData?.type === 'text'" class="text-input-wrap">
            <textarea
              v-model="answers[currentQuestionData.id]"
              :placeholder="currentQuestionData.placeholder || 'Введите ваш ответ'"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Navigation -->
        <div class="test-nav">
          <button
            @click="prevQuestion"
            :disabled="currentQuestion === 0"
            class="btn btn-outline"
          >
            ← Назад
          </button>
          <button
            @click="nextQuestion"
            v-if="currentQuestion < questions.length - 1"
            class="btn btn-primary"
          >
            Далее →
          </button>
          <button
            @click="submitTest"
            v-else
            class="btn btn-primary"
          >
            Получить рекомендации ✓
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="test-loading">
        <div class="spinner"></div>
        <p>Загружаем вопросы...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const started = ref(false)
const questions = ref<any[]>([])
const currentQuestion = ref(0)
const answers = ref<Record<number, any>>({})

const currentQuestionData = computed(() => {
  return questions.value[currentQuestion.value]
})

function toggleMultiple(option: string) {
  const qId = currentQuestionData.value?.id
  if (!qId) return
  const arr = answers.value[qId] || []
  const idx = arr.indexOf(option)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(option)
  }
  answers.value[qId] = arr
}

async function loadQuestions() {
  try {
    const response = await api.get('/tests/questions')
    if (response.data.success) {
      questions.value = response.data.data.questions
    }
  } catch (error) {
    console.error('Failed to load questions:', error)
  }
}

function startTest() {
  started.value = true
  questions.value.forEach(q => {
    if (q.type === 'multiple_choice') {
      answers.value[q.id] = []
    } else {
      answers.value[q.id] = ''
    }
  })
}

function nextQuestion() {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
  }
}

function prevQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

async function submitTest() {
  try {
    const answersArray = Object.keys(answers.value)
      .filter(qid => {
        const val = answers.value[Number(qid)]
        if (Array.isArray(val)) return val.length > 0
        return val !== '' && val !== null && val !== undefined
      })
      .map(questionId => ({
        questionId: parseInt(questionId),
        answer: answers.value[Number(questionId)]
      }))

    const response = await api.post('/tests/submit', { answers: answersArray })

    if (response.data.success) {
      router.push('/profile')
    }
  } catch (error: any) {
    console.error('Failed to submit test:', error)
    alert(error?.response?.data?.error?.message || 'Ошибка отправки теста')
  }
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped lang="scss">
.test-view {
  min-height: calc(100vh - 64px);
  background: #f8fafc;
  padding: 48px 24px;
}

.test-container {
  max-width: 720px;
  margin: 0 auto;
}

.test-intro {
  text-align: center;
  padding: 60px 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;

  .intro-icon {
    font-size: 4rem;
    margin-bottom: 24px;
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 16px;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 1.063rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }
}

.intro-features {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.intro-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.938rem;
  font-weight: 500;
  color: #475569;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 0.938rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

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
      background: white;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &-lg {
    padding: 14px 40px;
    font-size: 1rem;
  }
}

.test-form-wrapper {
  // nothing extra
}

.test-progress {
  margin-bottom: 24px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.question-card {
  background: white;
  padding: 40px 32px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  margin-bottom: 24px;

  h2 {
    font-size: 1.375rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
    line-height: 1.4;
  }
}

.question-hint {
  font-size: 0.813rem;
  color: #94a3b8;
  margin-bottom: 24px;
  font-style: italic;
}

.options-grid {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  font-size: 0.938rem;

  &:hover {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.selected {
    border-color: #2563eb;
    background: #dbeafe;

    .option-letter {
      background: #2563eb;
      color: white;
    }
  }
}

.option-letter {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.813rem;
  flex-shrink: 0;
}

.option-text {
  font-weight: 500;
  color: #0f172a;
}

.text-input-wrap {
  margin-top: 24px;

  textarea {
    width: 100%;
    padding: 16px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 1rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.15s ease;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }
}

.test-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.test-loading {
  text-align: center;
  padding: 80px 24px;

  p {
    color: #94a3b8;
    margin-top: 16px;
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
