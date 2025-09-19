import { GoogleGenerativeAI } from '@google/generative-ai';
import { KeyPoint, Source, StoryDirection } from '@/types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface GeminiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class GeminiService {
  /**
   * Check if API key is configured
   */
  static isConfigured(): boolean {
    return !!(import.meta.env.VITE_GEMINI_API_KEY);
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): { configured: boolean; message: string } {
    const configured = this.isConfigured();
    return {
      configured,
      message: configured 
        ? 'Gemini API is configured and ready to use'
        : 'Gemini API key not found. Please set VITE_GEMINI_API_KEY environment variable'
    };
  }

  /**
   * Extract key points from interview transcript
   */
  static async extractKeyPoints(transcript: string, sources: Source[] = []): Promise<GeminiResponse<KeyPoint[]>> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
      }

      const sourcesText = sources.length > 0 
        ? `\n\nSupporting Sources:\n${sources.map(s => `${s.name}: ${s.content.substring(0, 200)}...`).join('\n')}`
        : '';

      const prompt = `
You are an expert content editor. Analyze the following interview transcript and extract 5-7 key points that would be most important for writing an article.

For each key point:
- Make it specific and factual
- Include relevant statistics or quotes when available
- Keep it concise (1-2 sentences)
- Indicate the source (Interview Transcript or Supporting Sources)

Transcript:
${transcript}
${sourcesText}

Return the key points as a JSON array with this exact structure:
[
  {
    "text": "Key point text here",
    "source": "Interview Transcript"
  }
]

Only return the JSON array, no other text or formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up the response to ensure it's valid JSON
      const jsonText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      // Parse the JSON response
      const keyPointsData = JSON.parse(jsonText);
      
      // Transform to our KeyPoint interface
      const keyPoints: KeyPoint[] = keyPointsData.map((kp: any, index: number) => ({
        id: Date.now().toString() + index,
        text: kp.text,
        order: index,
        source: kp.source || 'Interview Transcript'
      }));

      return {
        success: true,
        data: keyPoints
      };
    } catch (error) {
      console.error('Error extracting key points:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract key points'
      };
    }
  }

  /**
   * Generate article draft from key points and story direction
   */
  static async generateDraft(
    keyPoints: KeyPoint[],
    direction: StoryDirection,
    transcript: string,
    sources: Source[]
  ): Promise<GeminiResponse<string>> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY environment variable.');
      }

      const keyPointsText = keyPoints.map(kp => `- ${kp.text}`).join('\n');
      const sourcesText = sources.map(s => `${s.name}: ${s.content.substring(0, 300)}...`).join('\n');
      
      const lengthGuidance = {
        short: '300-500 words',
        medium: '500-800 words', 
        long: '800-1200 words'
      };

      const toneGuidance = {
        neutral: 'Write in a neutral, factual tone suitable for news articles',
        storytelling: 'Write in an engaging, narrative style that tells a story',
        'press-release': 'Write in a formal, professional tone suitable for press releases'
      };

      const prompt = `
You are an expert journalist and content writer. Write a compelling article based on the following information:

KEY POINTS:
${keyPointsText}

STORY DIRECTION:
- Tone: ${direction.tone} (${toneGuidance[direction.tone]})
- Length: ${direction.length} (${lengthGuidance[direction.length]})
- Custom Angle: ${direction.angle || 'No specific angle provided'}

ORIGINAL TRANSCRIPT:
${transcript.substring(0, 1500)}...

SUPPORTING SOURCES:
${sourcesText}

INSTRUCTIONS:
1. Create a compelling headline
2. Write an engaging article that incorporates the key points
3. Use direct quotes from the transcript when appropriate (mark with quotation marks)
4. Follow the specified tone and length requirements
5. Include proper article structure with headings
6. Make it engaging and well-written
7. Ensure all claims are supported by the provided sources
8. Use Markdown formatting with proper headings (# ## ###)

Return only the article content in Markdown format, no additional text or explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const articleText = response.text();

      return {
        success: true,
        data: articleText
      };
    } catch (error) {
      console.error('Error generating draft:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate draft'
      };
    }
  }
}

