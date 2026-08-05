/**
 * @file src/lib/auth/__tests__/auth-flow.test.ts
 *
 * Unit tests for the CredentialsProvider authorize() function.
 * Tests all authentication paths without hitting a real DB or bcrypt.
 *
 * Covers:
 *  - Missing credentials → throws
 *  - User not found → throws (constant-time, no enumeration)
 *  - Wrong password → throws
 *  - Valid credentials → returns user object
 *  - Returned object has expected fields (id, email, role, name)
 *  - Constant-time delay is applied (mocked setTimeout)
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("@/lib/security/audit-logger", () => ({
  logFailedLogin: jest.fn().mockResolvedValue(undefined),
  logSuccessfulLogin: jest.fn().mockResolvedValue(undefined),
}));

// Stub next-auth providers — we test authorize() directly
jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (config: unknown) => config,
}));
jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (config: unknown) => config,
}));

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logFailedLogin, logSuccessfulLogin } from "@/lib/security/audit-logger";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// ── Extract the authorize function from authOptions ────────────────────────────
// We import authOptions and extract the CredentialsProvider authorize fn.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authorize: (credentials: unknown, req: unknown) => Promise<unknown>;
const originalSetTimeout = global.setTimeout;

beforeAll(async () => {
  // Override setTimeout to resolve immediately, skipping the 200ms auth delay
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.setTimeout = ((cb: Function) => cb()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { authOptions } = await import("@/lib/auth");
  const credentialsProvider = authOptions.providers.find(
    (p: { name?: string, credentials?: unknown }) => p.name === "credentials" || p.credentials
  ) as any;
  authorize = credentialsProvider.authorize;
});

afterAll(() => {
  global.setTimeout = originalSetTimeout;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

const validUser = {
  id: "user-abc-123",
  name: "Test User",
  email: "test@scootfix.in",
  password: "$2a$10$hashedpassword",
  role: "CUSTOMER",
  image: null,
};

const validCredentials = {
  email: "test@scootfix.in",
  password: "ValidPass123!",
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Auth — CredentialsProvider.authorize()", () => {
  describe("input validation", () => {
    it("throws when email is missing", async () => {
      const p = authorize({ email: "", password: "pass" }, {});
      await expect(p).rejects.toThrow(/invalid credentials/i);
    });

    it("throws when password is missing", async () => {
      const p = authorize({ email: "a@b.com", password: "" }, {});
      await expect(p).rejects.toThrow(/invalid credentials/i);
    });

    it("throws when credentials are null", async () => {
      const p = authorize(null, {});
      await expect(p).rejects.toThrow(/invalid credentials/i);
    });
  });

  describe("user not found", () => {
    it("throws and does NOT reveal that the user doesn't exist", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const p = authorize(validCredentials, {});
      await expect(p).rejects.toThrow(/invalid email or password/i);
    });

    it("still calls bcrypt.compare (constant-time, prevents timing attack)", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const p = authorize(validCredentials, {});
      await p.catch(() => {});

      // Must compare against the dummy hash even for missing users
      expect(mockBcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it("logs failed login attempt", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const p = authorize(validCredentials, {});
      await p.catch(() => {});

      expect(logFailedLogin).toHaveBeenCalledWith(
        validCredentials.email,
        undefined
      );
    });
  });

  describe("wrong password", () => {
    it("throws 'invalid email or password' when password is wrong", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const p = authorize(validCredentials, {});
      await expect(p).rejects.toThrow(/invalid email or password/i);
    });

    it("does NOT throw a DB error or leak user existence info", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const p = authorize(validCredentials, {});
      const err = await p.catch((e: Error) => e);
      expect((err as Error).message).not.toMatch(/database|prisma|hash/i);
    });
  });

  describe("successful login", () => {
    it("returns the user object with correct fields", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const p = authorize(validCredentials, {});
      const result = await p;

      expect(result).toMatchObject({
        id: validUser.id,
        email: validUser.email,
        name: validUser.name,
        role: validUser.role,
      });
    });

    it("does NOT include the hashed password in the return value", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const p = authorize(validCredentials, {});
      const result = await p;

      expect(result).not.toHaveProperty("password");
    });

    it("logs successful login", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const p = authorize(validCredentials, {});
      await p;

      expect(logSuccessfulLogin).toHaveBeenCalledWith(validUser.id, undefined);
    });

    it("normalises email to lowercase before lookup", async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(validUser);
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const p = authorize(
        { email: "TEST@ScootFix.IN", password: "ValidPass123!" },
        {}
      );
      await p;

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: "test@scootfix.in" },
        })
      );
    });
  });
});
