import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, beforeEach } from "vitest";
import { CookieConsent, COOKIE_PREFS_EVENT } from "./CookieConsent.jsx";

const createMockStorage = () => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

describe("CookieConsent", () => {
  beforeEach(() => {
    const mock = createMockStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: mock,
      configurable: true,
    });
    Object.defineProperty(window, "localStorage", {
      value: mock,
      configurable: true,
    });
    mock.clear();
  });

  it("shown when no decision is stored", () => {
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    expect(screen.getByText("เราใช้คุกกี้")).toBeTruthy();
    expect(screen.getByRole("button", { name: "ยอมรับทั้งหมด" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "ปฏิเสธ" })).toBeTruthy();
  });

  it("hidden when a decision was already stored", () => {
    window.localStorage.setItem("occasion_cookie_consent", "accepted");
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    expect(screen.queryByText("เราใช้คุกกี้")).toBeNull();
  });

  it("accept stores consent and hides the banner", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "ยอมรับทั้งหมด" }));
    expect(window.localStorage.getItem("occasion_cookie_consent")).toBe(
      "accepted",
    );
    expect(screen.queryByText("เราใช้คุกกี้")).toBeNull();
  });

  it("reject stores consent and hides the banner", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "ปฏิเสธ" }));
    expect(window.localStorage.getItem("occasion_cookie_consent")).toBe(
      "rejected",
    );
    expect(screen.queryByText("เราใช้คุกกี้")).toBeNull();
  });

  it("reopens when the cookie-preferences event is dispatched", () => {
    window.localStorage.setItem("occasion_cookie_consent", "accepted");
    render(
      <MemoryRouter>
        <CookieConsent />
      </MemoryRouter>,
    );
    fireEvent(window, new Event(COOKIE_PREFS_EVENT));
    expect(screen.getByText("เราใช้คุกกี้")).toBeTruthy();
  });
});