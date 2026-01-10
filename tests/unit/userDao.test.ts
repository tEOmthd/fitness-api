import { UserDAO } from "../../src/dao/userDAO";
import { createTestDatabase } from "../../src/utils/database";
import Database from "better-sqlite3";

describe("UserDAO", () => {
  let db: Database.Database;
  let userDAO: UserDAO;

  beforeEach(() => {
    db = createTestDatabase();
    userDAO = new UserDAO(db);
  });

  afterEach(() => {
    db.close();
  });

  describe("create", () => {
    it("creates a new user", () => {
      const user = userDAO.create({
        email: "mailtest@example.com",
        password: "hashedpassword",
        first_name: "Alice",
        last_name: "Smith",
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe("mailtest@example.com");
      expect(user.first_name).toBe("Alice");
      expect(user.last_name).toBe("Smith");
      expect(user.role).toBe("user");
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
    });

    it("throws if email already exists", () => {
      const data = {
        email: "duplicate@example.com",
        password: "hashedpassword",
        first_name: "Alice",
        last_name: "Smith",
      };

      userDAO.create(data);

      expect(() => userDAO.create(data)).toThrow();
    });
  });

  describe("findById", () => {
    it("returns user if it exists", () => {
      const created = userDAO.create({
        email: "test@example.com",
        password: "hashedpassword",
        first_name: "John",
        last_name: "Doe",
      });

      const found = userDAO.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.email).toBe("test@example.com");
      expect(found?.first_name).toBe("John");
    });

    it("returns null if user does not exist", () => {
      const found = userDAO.findById(999);
      expect(found).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("returns user if email exists", () => {
      userDAO.create({
        email: "test@example.com",
        password: "hashedpassword",
        first_name: "John",
        last_name: "Doe",
      });

      const found = userDAO.findByEmail("test@example.com");

      expect(found).not.toBeNull();
      expect(found?.email).toBe("test@example.com");
    });

    it("returns null if email does not exist", () => {
      const found = userDAO.findByEmail("absent@example.com");
      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns all users", () => {
      userDAO.create({
        email: "user1@example.com",
        password: "hashedpassword",
        first_name: "John",
        last_name: "Doe",
      });

      userDAO.create({
        email: "user2@example.com",
        password: "hashedpassword",
        first_name: "Jane",
        last_name: "Smith",
      });

      const users = userDAO.findAll();

      expect(users.length).toBe(2);
      const emails = users.map((u) => u.email);
      expect(emails).toContain("user1@example.com");
      expect(emails).toContain("user2@example.com");
    });

    it("returns empty array if no users", () => {
      const users = userDAO.findAll();
      expect(users).toEqual([]);
    });
  });

  describe("update", () => {
    it("updates provided fields only", () => {
      const created = userDAO.create({
        email: "test@example.com",
        password: "hashedpassword",
        first_name: "John",
        last_name: "Doe",
      });

      const updated = userDAO.update(created.id, {
        first_name: "Jane",
      });

      expect(updated).not.toBeNull();
      expect(updated?.first_name).toBe("Jane");
      expect(updated?.last_name).toBe("Doe");
    });

    it("returns null if user does not exist", () => {
      const updated = userDAO.update(999, {
        first_name: "Jane",
      });

      expect(updated).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes user and returns true", () => {
      const created = userDAO.create({
        email: "test@example.com",
        password: "hashedpassword",
        first_name: "John",
        last_name: "Doe",
      });

      const deleted = userDAO.delete(created.id);

      expect(deleted).toBe(true);
      expect(userDAO.findById(created.id)).toBeNull();
    });

    it("returns false if user does not exist", () => {
      const deleted = userDAO.delete(999);
      expect(deleted).toBe(false);
    });
  });
});
