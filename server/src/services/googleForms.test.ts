import { createGoogleForm } from './googleForms';


jest.mock('googleapis', () => {
  const mockForms = {
    forms: {
      create: jest.fn().mockResolvedValue({
        data: { formId: 'test-form-id', responderUri: 'http://test-form' }
      }),
      batchUpdate: jest.fn().mockResolvedValue({})
    }
  };
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn()
      },
      forms: jest.fn().mockReturnValue(mockForms)
    }
  };
});

describe('Google Forms Service', () => {
  it('should create a form and return the URL', async () => {
    const quizJson = {
      title: 'Test Quiz',
      sections: [{
        questions: [{
          type: 'multiple_choice',
          question: 'Q1',
          options: ['A', 'B'],
          answer: 'A'
        }]
      }]
    };

    const url = await createGoogleForm(quizJson);
    expect(url).toBe('http://test-form');
  });
});
