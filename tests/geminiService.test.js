const geminiService = require("../src/backend/services/geminiService");

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      chats: {
        create: jest.fn(() => ({
          sendMessage: jest.fn(async () => ({ text: "mocked response" })),
        })),
      },
    })),
  };
});

describe("geminiService", () => {
  it("should return a response from Gemini", async () => {
    const result = await geminiService.sendMessageToGemini({
      msg: "Hello",
      apiKey: "fake",
      context: [],
      debugMode: false,
      botStyle: "default",
    });
    expect(result).toBe("mocked response");
  });

  it("should generate suggestions as array", async () => {
    geminiService.generateSuggestions = jest
      .fn()
      .mockResolvedValue(["a", "b", "c"]);
    const result = await geminiService.generateSuggestions({
      context: [],
      msg: "Hi",
      apiKey: "fake",
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });

  it("should generate session name", async () => {
    geminiService.generateSessionName = jest
      .fn()
      .mockResolvedValue("Tên hội thoại");
    const result = await geminiService.generateSessionName({
      msg: "Xin chào",
      apiKey: "fake",
    });
    expect(typeof result).toBe("string");
    expect(result).toBe("Tên hội thoại");
  });

  it("should fallback to single suggestion if not array", async () => {
    geminiService.generateSuggestions = jest
      .fn()
      .mockResolvedValue(["mocked response"]);
    const result = await geminiService.generateSuggestions({
      context: [],
      msg: "Hi",
      apiKey: "fake",
    });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});
