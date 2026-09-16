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

describe('Google Forms Service - failure surfacing', () => {
  const quizJson = {
    title: 'Test Quiz',
    sections: [{
      questions: [{ type: 'multiple_choice', question: 'Q1', options: ['A', 'B'], answer: 'A' }]
    }]
  };

  afterEach(() => {
    const { google } = require('googleapis');
    google.forms().forms.create.mockResolvedValue({
      data: { formId: 'test-form-id', responderUri: 'http://test-form' }
    });
  });

  it('throws instead of returning a mock URL when form creation fails', async () => {
    const { google } = require('googleapis');
    google.forms().forms.create.mockRejectedValueOnce(new Error('boom'));

    await expect(createGoogleForm(quizJson)).rejects.toThrow('boom');
  });

  it('throws a re-authorization message when the refresh token is invalid', async () => {
    const { google } = require('googleapis');
    const authError: Error & { response?: unknown } = new Error('invalid_grant');
    authError.response = { data: { error: 'invalid_grant' } };
    google.forms().forms.create.mockRejectedValueOnce(authError);

    await expect(createGoogleForm(quizJson)).rejects.toThrow(/\/api\/auth\/google/);
  });
});
