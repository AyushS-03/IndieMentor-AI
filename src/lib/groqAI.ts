const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: GroqMessage;
    logprobs: null;
    finish_reason: string;
  }[];
  usage: {
    queue_time: number;
    prompt_tokens: number;
    prompt_time: number;
    completion_tokens: number;
    completion_time: number;
    total_tokens: number;
    total_time: number;
  };
}

export class GroqAI {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = GROQ_API_KEY;
    this.apiUrl = GROQ_API_URL;
  }

  async chat(messages: GroqMessage[], model: string = 'llama3-8b-8192'): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GroqChatResponse = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw error;
    }
  }

  async chatWithMentor(
    mentorName: string,
    mentorExpertise: string[],
    mentorDescription: string,
    userMessage: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const systemPrompt = `You are ${mentorName}, an AI mentor specializing in ${mentorExpertise.join(', ')}. 

Your background: ${mentorDescription}

Your personality and communication style:
- Professional yet approachable
- Encouraging and supportive
- Provide actionable advice
- Ask clarifying questions when needed
- Share relevant examples from your expertise
- Keep responses concise but comprehensive
- Always maintain a mentoring tone

Guidelines:
- Stay in character as ${mentorName}
- Focus on your areas of expertise: ${mentorExpertise.join(', ')}
- Provide practical, actionable advice
- Be encouraging and motivational
- If asked about topics outside your expertise, acknowledge limitations but offer related insights where possible
- Remember previous conversation context
`;

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.chat(messages);
  }

  async generateMentorResponse(
    mentorName: string,
    mentorTitle: string,
    mentorExpertise: string[],
    mentorDescription: string,
    userQuestion: string
  ): Promise<string> {
    const systemPrompt = `You are ${mentorName}, a ${mentorTitle}. You are an expert in ${mentorExpertise.join(', ')}.

About you: ${mentorDescription}

Respond as this mentor would, providing helpful, actionable advice. Keep your response professional, encouraging, and focused on your areas of expertise. Limit your response to 2-3 paragraphs.`;

    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion }
    ];

    return await this.chat(messages);
  }
}

export const groqAI = new GroqAI();
