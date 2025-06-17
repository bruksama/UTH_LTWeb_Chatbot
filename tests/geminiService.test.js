const geminiService = require('../src/backend/services/geminiService');

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      chats: {
        create: jest.fn(() => ({
          sendMessage: jest.fn(async () => ({ text: 'mocked response' })),
        })),
      },
    })),
  };
});

describe('geminiService', () => {
  it('should return a response from Gemini', async () => {
    const result = await geminiService.sendMessageToGemini({
      msg: 'Hello',
      apiKey: 'fake',
      context: [],
      debugMode: false,
      botStyle: 'default',
    });
    expect(result).toBe('mocked response');
  });
});
