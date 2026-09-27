import { describe, expect, it } from "vitest";
import { buildDemoQrPayload } from "../components/checkout/PromptPaySection.jsx";

describe("buildDemoQrPayload", () => {
  it("contains the demo amount without generating a transferable PromptPay payload", () => {
    const payload = buildDemoQrPayload(1234.5);

    expect(payload).toBe("OCCASION-DEMO|amount=1234.50|currency=THB");
    expect(payload).not.toMatch(/^000201/);
    expect(payload).not.toMatch(/^https?:/);
  });
});
