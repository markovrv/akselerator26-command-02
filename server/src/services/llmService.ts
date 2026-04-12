import OpenAI from 'openai';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface LLMConfig {
  provider: 'openai-compatible' | 'openrouter';
  apiKey: string;
  apiUrl?: string;
  model: string;
}

class LLMService {
  private config: LLMConfig;
  private client: OpenAI | null = null;

  constructor() {
    this.config = {
      provider: (process.env.LLM_PROVIDER as 'openai-compatible' | 'openrouter') || 'openai-compatible',
      apiKey: '',
      apiUrl: process.env.LLM_API_URL,
      model: ''
    };

    if (this.config.provider === 'openrouter') {
      this.config.apiKey = process.env.OPENROUTER_API_KEY || '';
      this.config.model = process.env.OPENROUTER_MODEL || '';
    } else {
      this.config.apiKey = process.env.LLM_API_KEY || '';
      this.config.model = process.env.LLM_MODEL || '';
    }

    this.initClient();
  }

  private initClient() {
    if (!this.config.apiKey) {
      console.warn('⚠️  LLM API key is not configured');
      return;
    }

    const options: OpenAI.Config = {
      apiKey: this.config.apiKey
    };

    if (this.config.provider === 'openrouter') {
      options.baseURL = 'https://openrouter.ai/api/v1';
    } else if (this.config.apiUrl) {
      options.baseURL = this.config.apiUrl;
    }

    this.client = new OpenAI(options);
    console.log(`✅ LLM Service initialized with provider: ${this.config.provider}, model: ${this.config.model}`);
  }

  async chat(messages: LLMMessage[], temperature = 0.7): Promise<LLMResponse> {
    if (!this.client) {
      return {
        success: false,
        error: 'LLM client is not initialized. Check your API key configuration.'
      };
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: 'Empty response from LLM'
        };
      }

      return {
        success: true,
        content
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown LLM error';
      console.error('❌ LLM Error:', errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async parseJsonResponse(messages: LLMMessage[], temperature = 0.3): Promise<LLMResponse> {
    const response = await this.chat(messages, temperature);

    if (!response.success || !response.content) {
      return response;
    }

    try {
      // Try to extract JSON from response (might be wrapped in markdown code blocks)
      let jsonStr = response.content;

      // Remove markdown code blocks if present
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr);

      return {
        success: true,
        content: JSON.stringify(parsed)
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse JSON response: ${response.content}`
      };
    }
  }

  getConfig() {
    return { ...this.config };
  }

  isAvailable() {
    return this.client !== null;
  }
}

export const llmService = new LLMService();
