jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(),
  })),
}));

const admin = require("firebase-admin");
const authService = require("../src/backend/services/authService");

describe("authService", () => {
  beforeEach(() => {
    admin.auth().verifyIdToken.mockReset();
  });

  it.skip("should verify a valid token", async () => {
    admin.auth().verifyIdToken.mockResolvedValue({
      uid: "user1",
      email: "test@example.com",
      name: "Test User",
    });
    const result = await authService.verifyIdToken("validToken");
    expect(result).toEqual({
      userId: "user1",
      email: "test@example.com",
      name: "Test User",
    });
  });

  it("should throw error for invalid token", async () => {
    admin.auth().verifyIdToken.mockRejectedValue(new Error("Invalid token"));
    await expect(authService.verifyIdToken("badToken")).rejects.toThrow(
      "Invalid token"
    );
  });
});
