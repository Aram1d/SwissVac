import { describe, test, expect, beforeEach } from "bun:test";
import { CookieManager } from "./cookiesStore";

// Helper function to create mock Response objects with set-cookie headers
function createMockResponse(setCookieHeader: string | null): Response {
  const headers = new Headers();
  setCookieHeader && headers.set("set-cookie", setCookieHeader);
  return new Response("", { headers });
}

describe("CookieManager", () => {
  let cookieManager: CookieManager;

  beforeEach(() => {
    cookieManager = new CookieManager();
  });

  describe("constructor", () => {
    test("should initialize with empty cookies map", () => {
      expect(cookieManager).toBeInstanceOf(CookieManager);
      // Test that getFilteredCookies returns empty string for any filter when no cookies stored
      expect(cookieManager.getFilteredCookies(["test"])).toBe("");
    });
  });

  describe("storeCookies", () => {
    test("should store single cookie from Response", () => {
      const response = createMockResponse("sessionId=abc123");
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["sessionId"])).toBe(
        "sessionId=abc123"
      );
    });

    test("should store multiple cookies from Response", () => {
      const response = createMockResponse(
        "sessionId=abc123; userId=user456; theme=dark"
      );
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["sessionId"])).toBe(
        "sessionId=abc123"
      );
      expect(cookieManager.getFilteredCookies(["userId"])).toBe(
        "userId=user456"
      );
      expect(cookieManager.getFilteredCookies(["theme"])).toBe("theme=dark");
    });

    test("should handle cookies with special characters in values", () => {
      const response = createMockResponse(
        "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      );
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["token"])).toBe(
        "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
      );
    });

    test("should handle cookies with equals signs in values", () => {
      const response = createMockResponse("data=key=value=test");
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["data"])).toBe(
        "data=key=value=test"
      );
    });

    test("should overwrite existing cookies with same name", () => {
      const response1 = createMockResponse("sessionId=old123");
      const response2 = createMockResponse("sessionId=new456");
      cookieManager.storeCookies(response1);
      cookieManager.storeCookies(response2);
      expect(cookieManager.getFilteredCookies(["sessionId"])).toBe(
        "sessionId=new456"
      );
    });

    test("should handle Response with no set-cookie header", () => {
      const response = createMockResponse(null);
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["test"])).toBe("");
    });

    test("should handle malformed cookies gracefully", () => {
      // Cookies without values should be ignored
      const response = createMockResponse(
        "validCookie=value; invalidCookie; anotherValid=test"
      );
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["validCookie"])).toBe(
        "validCookie=value"
      );
      expect(cookieManager.getFilteredCookies(["invalidCookie"])).toBe("");
      expect(cookieManager.getFilteredCookies(["anotherValid"])).toBe(
        "anotherValid=test"
      );
    });

    test("should handle cookies with empty values", () => {
      const response = createMockResponse("emptyCookie=; normalCookie=value");
      cookieManager.storeCookies(response);
      expect(cookieManager.getFilteredCookies(["emptyCookie"])).toBe(
        "emptyCookie="
      );
      expect(cookieManager.getFilteredCookies(["normalCookie"])).toBe(
        "normalCookie=value"
      );
    });
  });

  describe("getFilteredCookies", () => {
    beforeEach(() => {
      // Set up test cookies
      const response = createMockResponse(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR; COOKIE_SUPPORT=true; TS01c94574=013ad34e07"
      );
      cookieManager.storeCookies(response);
    });

    test("should return single filtered cookie", () => {
      expect(cookieManager.getFilteredCookies(["JSESSIONID"])).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6"
      );
    });

    test("should return multiple filtered cookies", () => {
      const result = cookieManager.getFilteredCookies([
        "JSESSIONID",
        "GUEST_LANGUAGE_ID"
      ]);
      expect(result).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR"
      );
    });

    test("should return subset of available cookies", () => {
      const result = cookieManager.getFilteredCookies([
        "JSESSIONID",
        "GUEST_LANGUAGE_ID",
        "TS01c94574"
      ]);
      expect(result).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR; TS01c94574=013ad34e07"
      );
    });

    test("should ignore non-existent cookies in filter", () => {
      const result = cookieManager.getFilteredCookies([
        "JSESSIONID",
        "NON_EXISTENT",
        "GUEST_LANGUAGE_ID"
      ]);
      expect(result).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR"
      );
    });

    test("should return empty string for non-existent cookies", () => {
      expect(cookieManager.getFilteredCookies(["NON_EXISTENT"])).toBe("");
    });

    test("should return empty string for empty filter array", () => {
      expect(cookieManager.getFilteredCookies([])).toBe("");
    });

    test("should maintain order of cookies as specified in filter", () => {
      const result1 = cookieManager.getFilteredCookies([
        "GUEST_LANGUAGE_ID",
        "JSESSIONID"
      ]);
      const result2 = cookieManager.getFilteredCookies([
        "JSESSIONID",
        "GUEST_LANGUAGE_ID"
      ]);

      expect(result1).toBe(
        "GUEST_LANGUAGE_ID=fr_FR; JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6"
      );
      expect(result2).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR"
      );
    });
  });

  describe("integration tests", () => {
    test("should handle realistic browser cookie scenario", () => {
      const browserCookies =
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR; COOKIE_SUPPORT=true; TS01c94574=013ad34e0746a3b8fd7d4e94cad3a2c016e160be1e";

      const response = createMockResponse(browserCookies);
      cookieManager.storeCookies(response);

      // Test filtering to keep only essential cookies
      const essentialCookies = cookieManager.getFilteredCookies([
        "JSESSIONID",
        "GUEST_LANGUAGE_ID",
        "TS01c94574"
      ]);
      expect(essentialCookies).toBe(
        "JSESSIONID=48C4DA460E6B318A5D5A028A826C90E6; GUEST_LANGUAGE_ID=fr_FR; TS01c94574=013ad34e0746a3b8fd7d4e94cad3a2c016e160be1e"
      );
    });

    test("should handle multiple store operations", () => {
      const response1 = createMockResponse("initial=value1");
      const response2 = createMockResponse(
        "additional=value2; initial=updated"
      );
      cookieManager.storeCookies(response1);
      cookieManager.storeCookies(response2);

      expect(cookieManager.getFilteredCookies(["initial", "additional"])).toBe(
        "initial=updated; additional=value2"
      );
    });

    test("should handle complex cookie values", () => {
      const complexCookies =
        "jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ; data-key=value&param";

      const response = createMockResponse(complexCookies);
      cookieManager.storeCookies(response);

      const filtered = cookieManager.getFilteredCookies(["jwt", "data-key"]);
      expect(filtered).toContain(
        "jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ"
      );
      expect(filtered).toContain("data-key=value&param");
    });
  });
});
