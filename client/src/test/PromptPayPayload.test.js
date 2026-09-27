import { describe, expect, it } from "vitest";
import { buildPromptPayPayload } from "../components/checkout/PromptPaySection.jsx";

function readTags(payload) {
  const tags = {};
  let cursor = 0;

  while (cursor < payload.length && !payload.startsWith("6304", cursor)) {
    const id = payload.slice(cursor, cursor + 2);
    const length = Number(payload.slice(cursor + 2, cursor + 4));
    tags[id] = payload.slice(cursor + 4, cursor + 4 + length);
    cursor += 4 + length;
  }

  return { tags, body: payload.slice(0, cursor) };
}

function crc16(payload) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

describe("buildPromptPayPayload", () => {
  it("is an EMVCo payload, not a link a banking app would open", () => {
    const payload = buildPromptPayPayload(1234, "0812345678");

    expect(payload.startsWith("00020101")).toBe(true);
    expect(payload).not.toMatch(/^https?:/);
  });

  it("locks the amount, currency and merchant into the payload", () => {
    const { tags } = readTags(buildPromptPayPayload(1234.5, "0812345678"));

    expect(tags["01"]).toBe("11");
    expect(tags["52"]).toBe("5814");
    expect(tags["53"]).toBe("THB");
    expect(tags["54"]).toBe("1234.50");
    expect(tags["58"]).toBe("TH");
    expect(tags["59"]).toBe("OCCASION");
  });

  it("zero pads a phone number PromptPay id to the 15 character account field", () => {
    const { tags } = readTags(buildPromptPayPayload(100, "0812345678"));

    expect(tags["29"]).toBe("0015000000812345678100500000");
  });

  it("keeps a letter prefixed id as it is and always sends a branch field", () => {
    const { tags } = readTags(buildPromptPayPayload(100, "TMBTHMB001"));

    expect(tags["29"]).toBe("0010TMBTHMB001100500000");
  });

  it("falls back to a two decimal amount even when the total has no decimals", () => {
    const { tags } = readTags(buildPromptPayPayload(990, "0812345678"));

    expect(tags["54"]).toBe("990.00");
  });

  it("ends with a CRC16 that matches the payload", () => {
    const payload = buildPromptPayPayload(1, "0812345678");
    const { body } = readTags(payload);

    expect(payload.slice(body.length)).toBe(`6304${crc16(`${body}6304`)}`);
  });
});
