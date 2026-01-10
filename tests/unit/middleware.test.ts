// tests/unit/middlewares.test.ts
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../../src/middlewares/authenticateToken";
import { authorizeRole } from "../../src/middlewares/authorizeRole";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

describe("Middlewares", () => {
  describe("authenticateToken", () => {
    it("should return 401 if no token", () => {
      const req = { headers: {} } as AuthenticatedRequest;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if token invalid", () => {
      const req = {
        headers: { authorization: "Bearer invalid" },
      } as AuthenticatedRequest;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid or expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next and set req.user if token valid", () => {
      const payload = { userId: 1, role: "user" };
      const token = jwt.sign(payload, ACCESS_TOKEN_SECRET);
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as AuthenticatedRequest;
      const res = {} as any;
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(req.user).toEqual({ id: 1, role: "user" });

      expect(next).toHaveBeenCalled();
    });
  });

  describe("authorizeRole", () => {
    it("should return 403 if role is insufficient", () => {
      const req = { user: { id: 1, role: "user" } } as AuthenticatedRequest;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as any;
      const next = jest.fn();

      authorizeRole("admin")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next if role is sufficient", () => {
      const req = { user: { id: 1, role: "admin" } } as AuthenticatedRequest;
      const res = {} as any;
      const next = jest.fn();

      authorizeRole("admin")(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
