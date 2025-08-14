import { compact } from "lodash-es";

export class CookieManager {
  private static concatCookies(arg: [string, string][]) {
    return arg.map(([name, value]) => `${name}=${value}`).join("; ");
  }

  private cookies: Map<string, string>;

  constructor() {
    this.cookies = new Map([["consentCookie", "true"]]);
  }

  storeCookies(response: Response) {
    const cookiePairs =
      response.headers.get("set-cookie")?.split(/,\s(?=[^=]+=[^;]+)/) ?? [];
    for (const pair of cookiePairs) {
      const equalIndex = pair.indexOf("=");
      if (equalIndex > 0) {
        const name = pair.substring(0, equalIndex);
        const value = pair.substring(equalIndex + 1).split("; ")[0];
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
