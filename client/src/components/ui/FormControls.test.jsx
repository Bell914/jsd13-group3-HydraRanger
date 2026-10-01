import React from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Checkbox, FormInput, Radio, Select, Textarea } from "./index.js";

describe("form controls", () => {
  it("connects labels, help text and errors to their controls", () => {
    render(
      <>
        <FormInput id="email" label="Email" error="Invalid email" />
        <Textarea id="note" label="Note" helpText="Maximum 300 characters" />
      </>,
    );

    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Invalid email");
    expect(screen.getByLabelText("Note")).toHaveAccessibleDescription("Maximum 300 characters");
  });

  it("has no detectable accessibility violations in a representative form", async () => {
    const { container } = render(
      <form aria-label="Preferences">
        <FormInput id="name" label="Name" required />
        <Textarea id="bio" label="Bio" />
        <Select id="category" label="Category" options={[{ value: "tops", label: "Tops" }]} />
        <Checkbox id="news" label="Receive news" />
        <fieldset>
          <legend>Size</legend>
          <Radio id="small" name="size" value="small" label="Small" />
        </fieldset>
      </form>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
