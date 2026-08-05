import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest auto-configures Next.js transforms, so we don't need manual ts-jest setup
const createJestConfig = nextJest({ dir: "./" });

const customConfig: Config = {
  // Use Node environment for API / server tests
  // Tests can override per-file with: @jest-environment jsdom
  testEnvironment: "node",

  // Path aliases — mirror tsconfig.json compilerOptions.paths
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(jpg|jpeg|png|svg|gif|webp|avif|ico)$": "<rootDir>/__mocks__/fileMock.js",
  },

  // Where to find tests
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.ts",
    "<rootDir>/src/**/__tests__/**/*.test.tsx",
  ],

  // Coverage collection
  collectCoverageFrom: [
    "src/lib/security/**/*.ts",
    "src/app/api/**/*.ts",
    "src/lib/auth.ts",
    "src/lib/seo.ts",
    "!src/**/*.d.ts",
  ],

  coverageReporters: ["text", "lcov", "html"],
  coverageDirectory: "coverage",

  verbose: true,
};

export default createJestConfig(customConfig);
