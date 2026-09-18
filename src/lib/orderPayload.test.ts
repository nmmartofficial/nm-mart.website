import { describe, expect, it } from "vitest";
import type { CartItem } from "./store-utils";
import { buildServerOrderPayload } from "./orderPayload";

const makeCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  id: 123,
  product_id: 123,
  name: "Test Product",
  mrp: 150,
  price: 100,
  saleRate: 100,
  category: "GENERAL",
  brand: "Test Brand",
  subCategory: "",
  barcode: "8900000000000",
  imageUrl: "https://example.test/product.webp",
  discount: 10,
  save: 50,
  stock: 8,
  qty: 2,
  ...overrides,
});

describe("buildServerOrderPayload", () => {
  it("returns only numeric product IDs and positive quantities", () => {
    expect(buildServerOrderPayload([makeCartItem()])).toEqual({
      items: [{ product_id: 123, quantity: 2 }],
    });
  });

  it("returns an empty item list for an empty cart", () => {
    expect(buildServerOrderPayload([])).toEqual({ items: [] });
  });

  it("preserves the active cart entries without changing duplicate semantics", () => {
    expect(buildServerOrderPayload([
      makeCartItem({ product_id: 123, id: 123, qty: 1 }),
      makeCartItem({ product_id: 456, id: 456, qty: 3 }),
    ])).toEqual({
      items: [
        { product_id: 123, quantity: 1 },
        { product_id: 456, quantity: 3 },
      ],
    });
  });

  it.each([
    ["missing product_id", { product_id: undefined }],
    ["non-numeric product_id", { product_id: "123" as unknown as number }],
    ["zero product_id", { product_id: 0 }],
    ["missing quantity", { qty: undefined }],
    ["zero quantity", { qty: 0 }],
    ["negative quantity", { qty: -1 }],
    ["decimal quantity", { qty: 1.5 }],
  ])("rejects %s", (_label, overrides) => {
    expect(() => buildServerOrderPayload([makeCartItem(overrides)])).toThrow();
  });

  it("does not include client price, discount, stock, totals, or barcode", () => {
    const payload = buildServerOrderPayload([makeCartItem()]);
    expect(payload).toEqual({ items: [{ product_id: 123, quantity: 2 }] });
    expect(JSON.stringify(payload)).not.toContain("barcode");
    expect(JSON.stringify(payload)).not.toContain("saleRate");
    expect(JSON.stringify(payload)).not.toContain("stock");
    expect(JSON.stringify(payload)).not.toContain("total");
  });

  it("adds only the minimal authenticated checkout metadata required by the server", () => {
    const payload = buildServerOrderPayload([makeCartItem()], {
      customer_id: "auth-user-123",
      customer_name: "Test User",
      customer_phone: "9999988888",
      shipping_address: "12 Test Lane, Manjhanpur",
      landmark: "Near School",
      pincode: "212207",
      payment_method: "cod",
      idempotency_key: "checkout-abc-123",
    });

    expect(payload).toMatchObject({
      customer_id: "auth-user-123",
      customer_name: "Test User",
      customer_phone: "9999988888",
      shipping_address: "12 Test Lane, Manjhanpur",
      landmark: "Near School",
      pincode: "212207",
      payment_method: "cod",
      idempotency_key: "checkout-abc-123",
      items: [{ product_id: 123, quantity: 2 }],
    });

    expect(JSON.stringify(payload)).not.toContain("saleRate");
    expect(JSON.stringify(payload)).not.toContain("total");
    expect(JSON.stringify(payload)).not.toContain("stock");
  });
});
