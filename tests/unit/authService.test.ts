import Database from "better-sqlite3";
import { AuthService } from "../../src/services/authService";
import { UserDAO } from "../../src/dao/userDAO";
import { RefreshTokenDAO } from "../../src/dao/refreshTokenDAO";
import { createTestDatabase } from "../../src/utils/database";

import bcrypt from "bcryptjs";

describe("AuthService", () => {
  let db: Database.Database;
  let userDAO: UserDAO;
  let tokenDAO: RefreshTokenDAO;
  let authService: AuthService;

  beforeEach(() => {
    db = createTestDatabase();
    userDAO = new UserDAO(db);
    tokenDAO = new RefreshTokenDAO(db);
    authService = new AuthService(userDAO, tokenDAO);

    const hashedPassword = bcrypt.hashSync("password123", 10);

    db.prepare(
      `
    INSERT INTO users (email, password, role, first_name, last_name)
    VALUES ('test@example.com', ?, 'user', 'John', 'Doe')
  `
    ).run(hashedPassword);

    db.prepare("DELETE FROM refresh_tokens").run();
  });

  afterEach(() => {
    db.close();
  });

  it("login should return access and refresh tokens", async () => {
    const tokens = await authService.login(
      "test@example.com",
      "password123",
      "iPhone 13"
    );

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
  });

  it("refreshToken should return new tokens", async () => {
    const { refreshToken } = await authService.login(
      "test@example.com",
      "password123",
      "iPhone 13"
    );
    const newTokens = await authService.refreshToken(refreshToken);
    expect(newTokens.accessToken).not.toBe(refreshToken);
    expect(newTokens.refreshToken).not.toBe(refreshToken);
  });

  it("logout should revoke token", async () => {
    const { refreshToken } = await authService.login(
      "test@example.com",
      "password123",
      "iPhone 13"
    );
    const result = await authService.logout(refreshToken);
    expect(result).toBe(true);
  });
});
