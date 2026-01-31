import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../config/secrets';
import { DEFAULT_SYSTEM_PROMPT } from '../config/defaultPrompt';
import { OUTPUT_SCHEMA } from '../config/outputFormat';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-preview-02-05',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: OUTPUT_SCHEMA,
  }
});

export const generateQuiz = async (content: string, customPrompt?: string) => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `
${customPrompt || DEFAULT_SYSTEM_PROMPT}

Content to generate quiz from:
${content}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini raw response:', text);

    // Clean the text before parsing
    const cleanedText = cleanJsonString(text);
    console.log('Gemini cleaned response:', cleanedText.substring(0, 200) + '...');

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed Text Content:', text);
      throw new Error('Received invalid JSON from Gemini');
    }

  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz with Gemini');
  }
};

function cleanJsonString(text: string): string {
  // Remove markdown code blocks
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  // Remove potentially harmful leading/trailing whitespace
  return cleaned.trim();
}
