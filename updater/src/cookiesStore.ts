import { compact } from "lodash-es";

export class CookieManager {
  // Reserved Set-Cookie attribute names that must never be stored as cookies.
  private static readonly COOKIE_ATTRIBUTES = new Set([
    "expires",
    "max-age",
    "domain",
    "path",
    "secure",
    "httponly",
    "samesite",
    "priority",
    "partitioned",
    "comment",
    "version"
  ]);

  private static concatCookies(arg: [string, string][]) {
    return arg.map(([name, value]) => `${name}=${value}`).join("; ");
  }

  private cookies: Map<string, string>;

  constructor() {
    this.cookies = new Map([["consentCookie", "true"]]);
  }

  storeCookies(response: Response) {
    // Prefer getSetCookie() which returns each Set-Cookie header separately,
    // avoiding the classic bug of splitting on the comma inside Expires dates.
    const headers =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : compact([response.headers.get("set-cookie")]);

    for (const header of headers) {
      for (const segment of header.split(";")) {
        const equalIndex = segment.indexOf("=");
        if (equalIndex <= 0) continue;
        const name = segment.substring(0, equalIndex).trim();
        const value = segment.substring(equalIndex + 1).trim();
        if (CookieManager.COOKIE_ATTRIBUTES.has(name.toLowerCase())) continue;
        this.cookies.set(name, value);
      }
    }
  }

  getFilteredCookies(filter: string[]) {
    return CookieManager.concatCookies(
      compact(
        filter.map(name => {
          const value = this.cookies.get(name);
          return typeof value === "string" ? [name, value] : null;
        })
      )
    );
  }

  getAllCookies() {
    return CookieManager.concatCookies(Array.from(this.cookies.entries()));
  }

  logCookies() {
    this.cookies.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });
  }
}

export default CookieManager;
