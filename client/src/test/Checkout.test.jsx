import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CheckoutPage from "../pages/CheckoutPage";
import { useCartStore } from "../store/cartStore";
import { createOrder, confirmPayment, cancelOrder } from "../services/orderService.js";
import { getAddresses } from "../services/userService.js";

vi.mock("../services/orderService.js", () => ({
  createOrder: vi.fn(),
  confirmPayment: vi.fn(),
  cancelOrder: vi.fn(),
}));
vi.mock("../services/userService.js", () => ({ getAddresses: vi.fn().mockResolvedValue({ data: [] }) }));

const fillShippingForm = () => {
  fireEvent.change(screen.getByLabelText("ชื่อ"), { target: { value: "Test" } });
  fireEvent.change(screen.getByLabelText("นามสกุล"), { target: { value: "User" } });
  fireEvent.change(screen.getByLabelText("เบอร์โทรศัพท์"), { target: { value: "0812345678" } });
  fireEvent.change(screen.getByLabelText("บ้านเลขที่ / ถนน / อาคาร"), { target: { value: "123 Street" } });
  fireEvent.change(screen.getByLabelText("อำเภอ / เขต"), { target: { value: "Bangkok" } });
  fireEvent.change(screen.getByLabelText("จังหวัด"), { target: { value: "กรุงเทพมหานคร" } });
  fireEvent.change(screen.getByLabelText("รหัสไปรษณีย์"), { target: { value: "10110" } });
};

const goToPaymentStep = (methodLabel = "PromptPay") => {
  fillShippingForm();
  fireEvent.click(screen.getAllByRole("button", { name: "ดำเนินการต่อ" })[0]);
  fireEvent.click(screen.getByRole("button", { name: methodLabel }));
};

const fillCardForm = () => {
  fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), {
    target: { value: "4242 4242 4242 4242" },
  });
  fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
  fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "12/30" } });
  fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
};

describe("Checkout order integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOrder.mockResolvedValue({
      data: {
        _id: "order-mongo-id",
        orderNumber: "OCC-123456",
        customerEmail: "test@example.com",
        shippingAddress: { firstName: "Test", lastName: "User", address: "123 Street" },
        items: [{ title: "Oversized T-Shirt", unitPrice: 590, quantity: 2 }],
        totalAmount: 1231.4,
        status: "pending",
      },
    });
    confirmPayment.mockResolvedValue({
      data: {
        _id: "order-mongo-id",
        orderNumber: "OCC-123456",
        shippingAddress: { firstName: "Test", lastName: "User", address: "123 Street" },
        items: [{ title: "Oversized T-Shirt", unitPrice: 590, quantity: 2 }],
        totalAmount: 1231.4,
        status: "paid",
      },
    });
    cancelOrder.mockResolvedValue({ data: { status: "cancelled" } });
    useCartStore.setState({
      cartItems: [{ cartItemId: "ci-test-1", productId: "p1", variantId: "v1", name: "Oversized T-Shirt", price: 590, quantity: 2, stockQuantity: 5 }],
    });
  });

  it("creates the order then confirms payment before showing the confirmation", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(confirmPayment).toHaveBeenCalledWith("order-mongo-id");
    // The order must exist before payment can be confirmed against it.
    expect(createOrder.mock.invocationCallOrder[0]).toBeLessThan(
      confirmPayment.mock.invocationCallOrder[0],
    );
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("jumps to the top of the confirmation instead of staying at the payment form", async () => {
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    scrollTo.mockRestore();
  });

  it("renders a scannable QR for the PromptPay total and never offers PayPal", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    const qr = await screen.findByRole("img", { name: /QR สำหรับสาธิต/ });
    expect(qr).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "PayPal" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Credit / Debit Card" })).toBeInTheDocument();
  });

  it("charges a demo card and clears the cart", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");
    fillCardForm();
    fireEvent.click(screen.getByRole("button", { name: "ชำระเงินและยืนยันคำสั่งซื้อ" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder.mock.calls.at(-1)?.[0]).toMatchObject({ paymentMethod: "credit-card" });
    expect(confirmPayment).toHaveBeenCalledWith("order-mongo-id");
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("retries the same order when only the payment confirmation fails", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("unavailable"), { status: 503, data: { message: "Demo payment is disabled" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("Demo payment is disabled")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);

    // The order already exists, so retrying must not reserve stock a second time.
    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(confirmPayment.mock.calls.map(([orderId]) => orderId)).toEqual([
      "order-mongo-id",
      "order-mongo-id",
    ]);
  });

  it("offers to cancel the pending order so its stock can be released", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" }));

    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith("order-mongo-id"));
    // After abandoning, the next attempt has to build a fresh order.
    expect(screen.queryByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
  });

  it("creates a new order when the pending one can no longer be confirmed", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("gone"), { status: 400, data: { message: "Order is not waiting for payment" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("Order is not waiting for payment")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(2);
  });

  it("releases the pending order when the customer steps back to the address", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ไปยังขั้นตอน ที่อยู่จัดส่ง" }));

    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith("order-mongo-id"));
  });

  it("rejects a real-looking card number and only accepts the published test number", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    // 5555 5555 5555 4444 is a valid Luhn number, so only the test-PAN rule can stop it.
    fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), { target: { value: "5555 5555 5555 4444" } });
    fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
    fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "12/30" } });
    fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "ชำระเงินและยืนยันคำสั่งซื้อ" }));

    expect(await screen.findByText(/กรุณาใช้เฉพาะหมายเลขบัตรทดสอบ/)).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("keeps real card autofill disabled on every card field", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    for (const label of ["หมายเลขบัตร", "ชื่อผู้ถือบัตร", "วันหมดอายุ (MM/YY)", "CVC"]) {
      const field = screen.getByLabelText(label);
      expect(field).toHaveAttribute("autocomplete", "off");
      expect(field).toHaveAttribute("data-1p-ignore");
      expect(field).toHaveAttribute("data-lpignore", "true");
    }
  });

  it("labels the QR as a demo code and never tells the customer to scan with a banking app", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    const qr = await screen.findByRole("img", { name: /QR สำหรับสาธิต/ });
    expect(qr).toBeInTheDocument();
    expect(screen.queryByText(/เปิดแอปธนาคาร/)).not.toBeInTheDocument();
    expect(screen.queryByText(/แอป PromptPay/)).not.toBeInTheDocument();
    expect(screen.getByText(/แอปธนาคารจะไม่สามารถใช้จ่ายเงินผ่าน QR นี้ได้/)).toBeInTheDocument();
  });

  it("rejects a card number that fails the Luhn check without calling the API", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), { target: { value: "1234 5678 9012 3456" } });
    fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
    fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "12/30" } });
    fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "ชำระเงินและยืนยันคำสั่งซื้อ" }));

    expect(await screen.findByText("หมายเลขบัตรไม่ถูกต้อง")).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(useCartStore.getState().cartItems).toHaveLength(1);
  });

  it("rejects an expired card", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), { target: { value: "4242 4242 4242 4242" } });
    fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
    fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "01/20" } });
    fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "ชำระเงินและยืนยันคำสั่งซื้อ" }));

    expect(await screen.findByText("บัตรหมดอายุแล้ว")).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("shows an API failure in the red alert and preserves the cart", async () => {
    createOrder.mockRejectedValueOnce(
      Object.assign(new Error("request failed"), { data: { message: "สินค้ามีไม่เพียงพอในสต็อก" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "จำลองการโอนเงินสำเร็จ" }));

    expect(await screen.findByText("สินค้ามีไม่เพียงพอในสต็อก")).toBeInTheDocument();
    expect(confirmPayment).not.toHaveBeenCalled();
    expect(useCartStore.getState().cartItems).toHaveLength(1);
  });

  it("does not allow increasing cart quantity beyond known stock", () => {
    const { updateQuantity } = useCartStore.getState();
    updateQuantity("ci-test-1", 99);
    expect(useCartStore.getState().cartItems[0].quantity).toBe(5);
  });

  it("does not add an item when its stock is zero", () => {
    useCartStore.setState({ cartItems: [] });
    useCartStore.getState().addToCart({
      product: { _id: "p2", name: "Out of stock" },
      variant: { _id: "v2", stockQuantity: 0, price: 10 },
      quantity: 1,
    });

    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("requires a last name when a saved address only has a one-word recipient name", async () => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-one-word-name",
        recipientName: "สมชาย",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "บางรัก",
        province: "กรุงเทพมหานคร",
        zipCode: "10500",
        isDefault: true,
      }],
    });

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText("นามสกุล")).toHaveValue(""));
    expect(screen.getByLabelText("ชื่อ")).toHaveValue("สมชาย");
    fireEvent.click(screen.getByRole("button", { name: "ดำเนินการต่อ" }));

    expect(await screen.findByText("กรุณากรอกนามสกุล")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "ช่องทางการชำระเงิน" })).not.toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("splits a saved address recipientName into first and last name", async () => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-full-name",
        recipientName: "สมชาย ใจดี",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "บางรัก",
        province: "กรุงเทพมหานคร",
        zipCode: "10500",
        isDefault: true,
      }],
    });

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText("นามสกุล")).toHaveValue("ใจดี"));

    expect(screen.getByLabelText("ชื่อ")).toHaveValue("สมชาย");
  });

  it("maps an English saved province to the matching Thai Checkout option", async () => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-bangkok-english",
        recipientName: "Somchai Jaidee",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "บางรัก",
        province: "  bAnGkOk City  ",
        zipCode: "10500",
        isDefault: true,
      }],
    });

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByLabelText("จังหวัด")).toHaveValue("กรุงเทพมหานคร"));
    fireEvent.click(screen.getByRole("button", { name: "ดำเนินการต่อ" }));

    expect(screen.getByRole("heading", { name: "ช่องทางการชำระเงิน" })).toBeInTheDocument();
  });

  it("keeps an unknown saved province visible as a temporary Checkout option", async () => {
    getAddresses.mockResolvedValueOnce({
      data: [{
        _id: "saved-address-custom-province",
        recipientName: "Somchai Jaidee",
        phone: "0812345678",
        addressDetail: "123 ถนนตัวอย่าง",
        district: "ตัวอย่าง",
        province: "Example Province",
        zipCode: "10500",
        isDefault: true,
      }],
    });

    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);

    const provinceSelect = await screen.findByLabelText("จังหวัด");
    await waitFor(() => expect(provinceSelect).toHaveValue("Example Province"));
    expect(screen.getByRole("option", { name: "Example Province" })).toBeInTheDocument();
  });
});
