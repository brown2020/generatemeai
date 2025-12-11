/**
 * LocalStorage key constants.
 * Centralized to prevent typos and enable easy refactoring.
 */

export const STORAGE_KEYS = {
  /** User's email for auth flow */
  EMAIL: "generateEmail",
  /** User's display name for auth flow */
  NAME: "generateName",
  /** Last token refresh timestamp prefix */
  LAST_TOKEN_REFRESH: "lastTokenRefresh_",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
