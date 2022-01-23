/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
const config = {
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.test.(j|t)sx?",
  ],
  setupFilesAfterEnv: ["<rootDir>/test/setupTest.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/test/",
    "<rootDir>/dist/",
  ],
  transformIgnorePatterns: ["/node_modules/"],
  transform: {
    ".+\\.(t|j)sx?$": ["@swc/jest"],
  },
};

module.exports = config;
