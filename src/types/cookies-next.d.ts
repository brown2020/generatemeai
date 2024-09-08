declare module "cookies-next" {
  interface CookieOptions {
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }

  export function setCookie(
    key: string,
    value: string,
    options?: CookieOptions
  ): void;

  export function deleteCookie(key: string): void;

  export function getCookie(key: string): string | undefined;

  export function hasCookie(key: string): boolean;
}
