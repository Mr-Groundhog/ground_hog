
import Cookies from "js-cookie";

const COOKIE_NAME = "admin-token";

export interface CookieConfig {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

export const cookieUtils = {
  /**
   * Set token to cookie
   * @param token The token string
   * @param config Optional configuration
   */
  setToken: (token: string, config?: CookieConfig) => {
    Cookies.set(COOKIE_NAME, token, {
      expires: 7, // Default 7 days
      path: "/", // Default root path
      ...config,
    });
  },

  /**
   * Get token from cookie
   * @returns The token string or undefined
   */
  getToken: () => {
    return Cookies.get(COOKIE_NAME);
  },

  /**
   * Remove token from cookie
   * @param config Optional configuration (path, domain must match set options)
   */
  removeToken: (config?: CookieConfig) => {
    Cookies.remove(COOKIE_NAME, {
      path: "/",
      ...config,
    });
  },
  
  /**
   * Get the configured cookie name
   */
  getName: () => COOKIE_NAME
};
