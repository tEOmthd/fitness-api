// tests/unit/jwt.test.ts
import {
  generateAccessToken,
  verifyAccessToken,
  JwtPayload,
} from "../../src/utils/jwt";
import jwt from "jsonwebtoken";

describe("JWT Utilities", () => {
  const payload: JwtPayload = { userId: 1, role: "user" };

  describe("generateAccessToken", () => {
    it("should return a JWT string", () => {
      const token = generateAccessToken(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });
  });

  describe("verifyAccessToken", () => {
    it("should return the payload if token is valid", () => {
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded).toMatchObject(payload);
    });

    it("should return null if token is invalid", () => {
      const decoded = verifyAccessToken("invalid.token.here");
      expect(decoded).toBeNull();
    });

    it("should return null if token is expired", () => {
      const expiredToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET || "supersecretkey",
        {
          expiresIn: "-1s",
        }
      );
      const decoded = verifyAccessToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });
});
