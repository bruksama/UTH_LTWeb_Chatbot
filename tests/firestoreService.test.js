jest.mock("firebase-admin", () => {
  const FieldValue = { serverTimestamp: jest.fn(() => "mockTimestamp") };
  const docMock = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ title: "Test", botStyle: "default" }),
    }),
    update: jest.fn().mockResolvedValue(),
    delete: jest.fn().mockResolvedValue(),
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue({ id: "mockSessionId" }),
    orderBy: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      docs: [],
      exists: true,
      data: () => ({ title: "Test", botStyle: "default" }),
    }),
  };
  return {
    firestore: jest.fn(() => docMock),
    credential: { cert: jest.fn() },
    apps: [],
    initializeApp: jest.fn(),
    auth: jest.fn(() => ({ verifyIdToken: jest.fn() })),
    FieldValue,
  };
});

const firestoreService = require("../src/backend/services/firestoreService");

describe("firestoreService", () => {
  it("should create a session", async () => {
    const result = await firestoreService.createSession(
      "uid",
      "Test",
      "default"
    );
    expect(result).toHaveProperty("sessionId", "mockSessionId");
  });

  it("should get a session", async () => {
    const result = await firestoreService.getSession("uid", "sessionId");
    expect(result).toHaveProperty("title", "Test");
  });

  it("should update botStyle", async () => {
    await expect(
      firestoreService.setSessionBotStyle("uid", "sessionId", "creative")
    ).resolves.toBeUndefined();
  });

  it("should set session pending reply", async () => {
    await expect(
      firestoreService.setSessionPendingReply("uid", "sessionId", true)
    ).resolves.toBeUndefined();
  });
});
