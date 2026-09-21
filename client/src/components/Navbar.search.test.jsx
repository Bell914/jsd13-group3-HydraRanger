import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Navbar } from "./Navbar.jsx";
import AuthContext from "../context/Auth/AuthContext.jsx";
import { useCounterStore } from "../store/useStore.js";

const LocationView = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const authValue = {
  user: null,
  isAuthenticated: false,
  logout: vi.fn(),
};

function renderNavbar() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
        <LocationView />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("Navbar search flow", () => {
  beforeEach(() => {
    useCounterStore.setState({ searchQuery: "" });
  });

  it("clears the search input after a successful submit", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "ค้นหาสินค้า" }));
    const input = screen.getByRole("searchbox", { name: "คำค้นหาสินค้า" });
    await user.type(input, "shirt");
    expect(useCounterStore.getState().searchQuery).toBe("shirt");

    await user.click(screen.getByRole("button", { name: "ค้นหา" }));

    expect(useCounterStore.getState().searchQuery).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/products?search=shirt",
    );

    await user.click(screen.getByRole("button", { name: "ค้นหาสินค้า" }));
    expect(screen.getByRole("searchbox", { name: "คำค้นหาสินค้า" })).toHaveValue(
      "",
    );
  });

  it("submits the typed text when pressing Enter", async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole("button", { name: "ค้นหาสินค้า" }));
    const input = screen.getByRole("searchbox", { name: "คำค้นหาสินค้า" });
    await user.type(input, "jeans");

    await user.keyboard("{Enter}");

    expect(useCounterStore.getState().searchQuery).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/products?search=jeans",
    );
  });
});