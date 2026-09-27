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
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${methodLabel}`) }));
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

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

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

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    scrollTo.mockRestore();
  });

  it("renders a scannable QR for the PromptPay total and never offers PayPal", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    const qr = await screen.findByRole("img", { name: /QR ชำระเงิน/ });
    expect(qr).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "PayPal" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Credit \/ Debit Card/ })).toBeInTheDocument();
  });

  it("charges a card and clears the cart", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");
    fillCardForm();
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder.mock.calls.at(-1)?.[0]).toMatchObject({ paymentMethod: "credit-card" });
    expect(confirmPayment).toHaveBeenCalledWith("order-mongo-id");
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("retries the same order when only the payment confirmation fails", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("unavailable"), { status: 503, data: { message: "ชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("ชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);

    // The order already exists, so retrying must not reserve stock a second time.
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

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

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" }));

    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith("order-mongo-id"));
    // The order id is only dropped once the cancel lands, then the next attempt builds a fresh order.
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" })).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
  });

  it("keeps payment blocked until the pending order is cancelled", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    let finishCancel;
    cancelOrder.mockImplementationOnce(
      () => new Promise((resolve) => { finishCancel = resolve; }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" }));

    // The old order still holds stock while the cancel is in flight, so paying has to wait.
    const cancellingButton = await screen.findByRole("button", { name: "กำลังยกเลิกออเดอร์เดิม..." });
    expect(cancellingButton).toBeDisabled();
    fireEvent.click(cancellingButton);
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(confirmPayment).toHaveBeenCalledTimes(1);

    finishCancel({ data: { status: "cancelled" } });

    const payButton = await screen.findByRole("button", { name: "ยืนยันการชำระเงิน" });
    await waitFor(() => expect(payButton).toBeEnabled());
    fireEvent.click(payButton);

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    // Only the released order may be replaced by a new one.
    expect(cancelOrder).toHaveBeenCalledTimes(1);
    expect(createOrder).toHaveBeenCalledTimes(2);
  });

  it("defers a payment method change until the pending order is cancelled", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    let finishCancel;
    cancelOrder.mockImplementationOnce(
      () => new Promise((resolve) => { finishCancel = resolve; }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Credit \/ Debit Card/ }));

    // Switching channels cannot skip the cancel, so the card form stays closed.
    expect(await screen.findByRole("button", { name: "กำลังยกเลิกออเดอร์เดิม..." })).toBeDisabled();
    expect(screen.queryByLabelText("หมายเลขบัตร")).not.toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);

    finishCancel({ data: { status: "cancelled" } });

    const payButton = await screen.findByRole("button", { name: "ยืนยันการชำระเงิน" });
    await waitFor(() => expect(payButton).toBeEnabled());
    fillCardForm();
    fireEvent.click(payButton);

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(cancelOrder).toHaveBeenCalledTimes(1);
    expect(createOrder).toHaveBeenCalledTimes(2);
  });

  it("keeps the payment method when the pending order could not be cancelled", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    cancelOrder.mockRejectedValueOnce(new Error("service unavailable"));
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Credit \/ Debit Card/ }));

    expect(
      await screen.findByText("ยกเลิกออเดอร์ไม่สำเร็จ กรุณากดยกเลิกออเดอร์อีกครั้ง"),
    ).toBeInTheDocument();
    // The old order is still live, so the screen must keep showing the channel it was created with.
    expect(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" })).toBeInTheDocument();
    expect(screen.queryByLabelText("หมายเลขบัตร")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(createOrder.mock.calls[0][0].paymentMethod).toBe("promptpay");
  });

  it("stays on the payment step when the pending order could not be cancelled", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    cancelOrder.mockRejectedValueOnce(new Error("service unavailable"));
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ไปยังขั้นตอน ที่อยู่จัดส่ง" }));

    expect(
      await screen.findByText("ยกเลิกออเดอร์ไม่สำเร็จ กรุณากดยกเลิกออเดอร์อีกครั้ง"),
    ).toBeInTheDocument();
    // Walking away would edit a checkout whose live order can no longer be replaced.
    expect(screen.getByText("สแกน QR Code ผ่านแอปพลิเคชันธนาคารเพื่อชำระเงิน")).toBeInTheDocument();
    expect(screen.queryByLabelText("จังหวัด")).not.toBeInTheDocument();
  });

  it("confirms the pending order instead of creating a new one when the cancel fails", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    cancelOrder.mockRejectedValueOnce(new Error("service unavailable"));
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" }));

    expect(
      await screen.findByText("ยกเลิกออเดอร์ไม่สำเร็จ กรุณากดยกเลิกออเดอร์อีกครั้ง"),
    ).toBeInTheDocument();
    // The cancel never landed, so the order keeps its stock and can be retried.
    expect(screen.getByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(1);
    expect(confirmPayment.mock.calls.map(([orderId]) => orderId)).toEqual([
      "order-mongo-id",
      "order-mongo-id",
    ]);
  });

  it("creates a new order when the pending one can no longer be confirmed", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("gone"), { status: 400, data: { message: "Order is not waiting for payment" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("Order is not waiting for payment")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ยกเลิกออเดอร์นี้และเริ่มใหม่" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder).toHaveBeenCalledTimes(2);
  });

  it("releases the pending order when the customer steps back to the address", async () => {
    confirmPayment.mockRejectedValueOnce(
      Object.assign(new Error("network down"), { status: 503, data: { message: "เชื่อมต่อไม่ได้" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));
    expect(await screen.findByText("เชื่อมต่อไม่ได้")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ไปยังขั้นตอน ที่อยู่จัดส่ง" }));

    await waitFor(() => expect(cancelOrder).toHaveBeenCalledWith("order-mongo-id"));
  });

  it("rejects a real-looking card number and only accepts the published card number", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    // 5555 5555 5555 4444 is a valid Luhn number, so only the published number rule can stop it.
    fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), { target: { value: "5555 5555 5555 4444" } });
    fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
    fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "12/30" } });
    fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("กรุณากรอกหมายเลขบัตร 4242 4242 4242 4242")).toBeInTheDocument();
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

  it("tells the customer to scan the QR with a banking app and shows no demo wording", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    expect(await screen.findByRole("img", { name: /QR ชำระเงิน/ })).toBeInTheDocument();
    expect(screen.getByText("สแกน QR Code ผ่านแอปพลิเคชันธนาคารเพื่อชำระเงิน")).toBeInTheDocument();
    for (const wording of [/สำหรับงานสาธิต/, /จำลอง/, /ระบบทดลอง/, /ไม่เชื่อมต่อธนาคาร/]) {
      expect(screen.queryByText(wording)).not.toBeInTheDocument();
    }
  });

  it("shows no demo wording in the card form either", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    expect(screen.getByText("กรอกข้อมูลบัตรเครดิต / เดบิต อย่างปลอดภัย")).toBeInTheDocument();
    for (const wording of [/สำหรับงานสาธิต/, /จำลอง/, /ระบบทดลอง/]) {
      expect(screen.queryByText(wording)).not.toBeInTheDocument();
    }
  });

  it("keeps both channels, the expanded body and one pay button inside a single payment card", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    const promptPayOption = screen.getByRole("button", { name: /^PromptPay/ });
    const cardOption = screen.getByRole("button", { name: /^Credit \/ Debit Card/ });
    const qr = await screen.findByRole("img", { name: /QR ชำระเงิน/ });

    // One card holds the channel list, the expanded channel and the pay button.
    const paymentCard = promptPayOption.closest("section");
    expect(paymentCard).toBe(cardOption.closest("section"));
    expect(qr.closest("section")).toBe(paymentCard);
    expect(screen.getByRole("heading", { name: "ช่องทางการชำระเงิน" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "ยืนยันการชำระเงิน" })).toHaveLength(1);
    expect(promptPayOption).toHaveAttribute("aria-expanded", "true");
    expect(cardOption).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(cardOption);

    // The card form opens inside the same card, and the QR is swapped out.
    const cardForm = screen.getByLabelText("หมายเลขบัตร");
    expect(cardForm.closest("section")).toBe(paymentCard);
    expect(screen.queryByRole("img", { name: /QR ชำระเงิน/ })).not.toBeInTheDocument();
    expect(cardOption).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("button", { name: "ยืนยันการชำระเงิน" })).toHaveLength(1);
  });

  it("pays with the card entered in the expanded body of the same card", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    fillCardForm();
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder.mock.calls.at(-1)?.[0]).toMatchObject({ paymentMethod: "credit-card" });
    expect(useCartStore.getState().cartItems).toEqual([]);
  });

  it("pays when Enter is pressed in a card field", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    fillCardForm();
    fireEvent.keyDown(screen.getByLabelText("CVC"), { key: "Enter" });

    expect(await screen.findByText("คำสั่งซื้อ OCCASION ของคุณได้รับการยืนยันแล้ว!")).toBeInTheDocument();
    expect(createOrder.mock.calls.at(-1)?.[0]).toMatchObject({ paymentMethod: "credit-card" });
  });

  it("rejects a card number that fails the Luhn check without calling the API", async () => {
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("Credit / Debit Card");

    fireEvent.change(screen.getByLabelText("หมายเลขบัตร"), { target: { value: "1234 5678 9012 3456" } });
    fireEvent.change(screen.getByLabelText("ชื่อผู้ถือบัตร"), { target: { value: "TEST USER" } });
    fireEvent.change(screen.getByLabelText("วันหมดอายุ (MM/YY)"), { target: { value: "12/30" } });
    fireEvent.change(screen.getByLabelText("CVC"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

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
    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

    expect(await screen.findByText("บัตรหมดอายุแล้ว")).toBeInTheDocument();
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("shows an API failure in the red alert and preserves the cart", async () => {
    createOrder.mockRejectedValueOnce(
      Object.assign(new Error("request failed"), { data: { message: "สินค้ามีไม่เพียงพอในสต็อก" } }),
    );
    render(<MemoryRouter><CheckoutPage /></MemoryRouter>);
    goToPaymentStep("PromptPay");

    fireEvent.click(screen.getByRole("button", { name: "ยืนยันการชำระเงิน" }));

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
