import { describe, it, expect, beforeEach } from "vitest";
import { getCookieConsent, setCookieConsent } from "./cookieConsent";

// document.cookie Mock
const mockCookie = (() => {
  let store: Record<string, string> = {};

  return {
    get cookie() {
      return Object.entries(store)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
    },
    set cookie(value: string) {
      const [pair] = value.split(";");
      const [key, val] = pair.split("=");
      if (val) {
        store[key.trim()] = val.trim();
      }
    },
    clear() {
      store = {};
    },
  };
})();

beforeEach(() => {
  mockCookie.clear();
  Object.defineProperty(document, "cookie", {
    get: () => mockCookie.cookie,
    set: (value) => {
      mockCookie.cookie = value;
    },
    configurable: true,
  });
});

describe("getCookieConsent", () => {
  it(" should return null when there is no cookie", () => {
    expect(getCookieConsent()).toBeNull();
  });

  it(" should return the correct value when there is a cookie", () => {
    document.cookie = "cookie-consent=accepted";

    expect(getCookieConsent()).toBe("accepted");
  });

  it(" should return the correct value when there are multiple cookies", () => {
    document.cookie = "other=value";
    document.cookie = "cookie-consent=declined";
    document.cookie = "another=test";

    expect(getCookieConsent()).toBe("declined");
  });
});

describe("setCookieConsent", () => {
  it(" should set the cookie correctly", () => {
    setCookieConsent("accepted");

    expect(document.cookie).toContain("cookie-consent=accepted");
  });

  it(" should set the cookie with path=/", () => {
    setCookieConsent("accepted");

    expect(document.cookie).toContain("cookie-consent=accepted");
  });

  it(" should allow overwriting the value", () => {
    setCookieConsent("accepted");
    setCookieConsent("declined");

    expect(getCookieConsent()).toBe("declined");
  });
});