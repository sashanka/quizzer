import { generateQuiz } from './gemini';
// Mock the secrets config
jest.mock('../config/secrets', () => ({
  GEMINI_API_KEY: 'test-key',
  DEFAULT_SYSTEM_PROMPT: 'test prompt'
}));

// Mock the GoogleGenerativeAI class
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest.fn().mockReturnValue('{"title": "Mock Quiz"}')
          }
        })
      }))
    })),
    SchemaType: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY',
      BOOLEAN: 'BOOLEAN'
    }
  };
});

describe('Gemini Service', () => {
  it('should generate a quiz JSON', async () => {
    const result = await generateQuiz('test content');
    expect(result).toEqual({ title: 'Mock Quiz' });
  });
});
