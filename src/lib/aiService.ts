import Groq from 'groq';

export type AIModelProvider = 'groq' | 'ollama' | 'gemini';

export interface AIConfig {
  provider: AIModelProvider;
  model: string;
  systemPrompt: string;
}

export const AI_PROVIDERS = {
  groq: {
    name: 'Groq (Qwen)',
    models: ['qwen/qwen3-8b', 'qwen/qwen3-32b', 'llama-3.3-70b-versatile', 'llama-3.1-70b-versatile'],
    defaultModel: 'qwen/qwen3-8b'
  },
  ollama: {
    name: 'Ollama (Local)',
    models: ['qwen2.5:0.5b', 'llama3.2:3b-instruct-q4_K_M', 'mi-modelo-3b:latest', 'conta-nav:latest', 'conta-cfo:latest'],
    defaultModel: 'qwen2.5:0.5b'
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    defaultModel: 'gemini-2.0-flash'
  }
} as const;

class AIService {
  private groqClient: Groq | null = null;
  private currentProvider: AIModelProvider = 'groq';
  private currentModel: string = AI_PROVIDERS.groq.defaultModel;

  constructor() {
    this.initGroq();
  }

  private initGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groqClient = new Groq({ apiKey });
    }
  }

  setProvider(provider: AIModelProvider, model?: string) {
    this.currentProvider = provider;
    this.currentModel = model || AI_PROVIDERS[provider].defaultModel;
  }

  async chat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], systemPrompt?: string): Promise<string> {
    const allMessages = [
      { role: 'system' as const, content: systemPrompt || 'You are a helpful assistant.' },
      ...messages
    ];

    try {
      switch (this.currentProvider) {
        case 'groq':
          return await this.chatWithGroq(allMessages);
        case 'ollama':
          return await this.chatWithOllama(allMessages);
        case 'gemini':
          return await this.chatWithGemini(allMessages);
        default:
          return await this.chatWithGroq(allMessages);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return await this.fallbackChat(messages, systemPrompt);
    }
  }

  private async chatWithGroq(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
    if (!this.groqClient) {
      throw new Error('Groq client not initialized');
    }

    const response = await this.groqClient.chat.completions.create({
      model: this.currentModel,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0]?.message?.content || 'No response from AI';
  }

  private async chatWithOllama(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.currentModel,
        messages: messages,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || 'No response from AI';
  }

  private async chatWithGemini(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]): Promise<string> {
    const { GoogleGenAI } = await import('@google/genai');
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const formattedMessages = messages.map(m => ({
      role: m.role === 'system' ? 'user' as const : m.role,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: this.currentModel,
      contents: formattedMessages
    });

    return response.text || 'No response from AI';
  }

  private async fallbackChat(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], systemPrompt?: string): Promise<string> {
    console.log('[AI] Primary provider failed, trying fallback...');
    
    if (this.currentProvider !== 'ollama') {
      try {
        this.setProvider('ollama', 'qwen2.5:0.5b');
        return await this.chat(messages, systemPrompt);
      } catch (e) {
        console.error('[AI] Ollama fallback failed:', e);
      }
    }

    if (this.currentProvider !== 'gemini') {
      try {
        this.setProvider('gemini', 'gemini-2.0-flash');
        return await this.chat(messages, systemPrompt);
      } catch (e) {
        console.error('[AI] Gemini fallback failed:', e);
      }
    }

    return 'Lo siento, todos los servicios de IA están temporalmente indisponibles. Por favor, intenta más tarde.';
  }

  getStatus() {
    return {
      provider: this.currentProvider,
      model: this.currentModel,
      providerName: AI_PROVIDERS[this.currentProvider].name,
      available: !!this.groqClient || this.currentProvider === 'ollama'
    };
  }
}

export const aiService = new AIService();