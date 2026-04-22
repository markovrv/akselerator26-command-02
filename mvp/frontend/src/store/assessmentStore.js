import { create } from 'zustand';
import { assessmentAPI, recommendationsAPI } from '../services/api';

export const useAssessmentStore = create((set, get) => ({
  sessionId: null,
  questions: [],
  answers: {},
  status: 'idle', // idle, in_progress, completed
  recommendations: [],
  isLoading: false,
  error: null,
  currentQuestionIndex: 0,

  fetchQuestions: async () => {
    set({ isLoading: true });
    try {
      const { data } = await assessmentAPI.getQuestions();
      set({ questions: data.questions, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  startAssessment: async (roleContext) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await assessmentAPI.startAssessment(roleContext);
      set({
        sessionId: data.sessionId,
        status: 'in_progress',
        answers: {},
        currentQuestionIndex: 0,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  answerQuestion: async (questionCode, answer) => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true });
    try {
      await assessmentAPI.answerQuestion(sessionId, questionCode, answer);
      set((state) => ({
        answers: { ...state.answers, [questionCode]: answer },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  nextQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1
      ),
    }));
  },

  prevQuestion: () => {
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    }));
  },

  completeAssessment: async () => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true });
    try {
      await assessmentAPI.completeAssessment(sessionId);
      set({ status: 'completed', isLoading: false });

      // Generate recommendations
      const { data } = await recommendationsAPI.generateRecommendations(sessionId);
      set({ recommendations: data.recommendations });

      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getRecommendations: async () => {
    const { sessionId } = get();
    if (!sessionId) {
      set({ error: 'No active session' });
      return;
    }

    set({ isLoading: true });
    try {
      const { data } = await recommendationsAPI.getRecommendations(sessionId);
      set({ recommendations: data.recommendations, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  reset: () => {
    set({
      sessionId: null,
      answers: {},
      status: 'idle',
      recommendations: [],
      currentQuestionIndex: 0,
      error: null,
    });
  },
}));
