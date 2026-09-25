import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddressSection } from "../components/profilepage/AddressSection.jsx";
import { useAddressStore } from "../store/addressStore.js";
import { getAddresses } from "../services/userService.js";

vi.mock("../services/userService.js", () => ({
  addAddress: vi.fn(),
  deleteAddress: vi.fn(),
  getAddresses: vi.fn(),
  setDefaultAddress: vi.fn(),
  updateAddress: vi.fn(),
}));

describe("Profile saved province options", () => {
  beforeEach(() => {
    useAddressStore.setState({ addresses: [] });
    getAddresses.mockReset();
  });

  it.each([
    ["  pHuKeT  ", "ภูเก็ต"],
    ["Archived province", "Archived province"],
  ])("shows saved province %s as a selectable edit value", async (savedProvince, expectedProvince) => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-profile-test",
        recipientName: "สมชาย ใจดี",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "ตัวอย่าง",
        province: savedProvince,
        zipCode: "10500",
      }],
    });

    render(<AddressSection />);
    fireEvent.click(await screen.findByRole("button", { name: "แก้ไข" }));

    const provinceSelect = screen.getByLabelText(/จังหวัด/);
    await waitFor(() => expect(provinceSelect).toHaveValue(expectedProvince));
    expect(screen.getByRole("option", { name: expectedProvince })).toBeInTheDocument();
  });
});
