import type { CartItem } from "./store-utils";

export type ServerOrderItem = {
  product_id: number;
  quantity: number;
};

export type CheckoutMetadata = {
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  shipping_address?: string;
  landmark?: string;
  pincode?: string;
  payment_method?: string;
  idempotency_key?: string;
};

export type ServerOrderPayload = CheckoutMetadata & {
  items: ServerOrderItem[];
};

export type CheckoutFormValues = {
  fullName?: string;
  street?: string;
  phone?: string;
  pincode?: string;
  paymentMethod?: string;
  serviceablePincodes?: readonly string[];
};

export type CheckoutFieldErrors = Partial<
  Record<"fullName" | "street" | "phone" | "pincode" | "paymentMethod", string>
>;

export function isValidIndianPhone(value: string | undefined | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 && /^\d{10}$/.test(digits);
}

export function isValidPincode(value: string | undefined | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  return digits.length === 6 && /^\d{6}$/.test(digits);
}

export function isServiceablePincode(
  value: string | undefined | null,
  serviceablePincodes: readonly string[] = ["212207", "212201", "212216"]
): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  if (!isValidPincode(digits)) return false;
  return serviceablePincodes.some((code) => code.replace(/\D/g, "") === digits);
}

export function getCheckoutFieldErrors(form: CheckoutFormValues): CheckoutFieldErrors {
  const fullName = form.fullName?.trim() ?? "";
  const street = form.street?.trim() ?? "";
  const phone = form.phone ?? "";
  const pincode = form.pincode ?? "";
  const paymentMethod = form.paymentMethod ?? "";
  const serviceablePincodes = form.serviceablePincodes ?? ["212207", "212201", "212216"];
  const errors: CheckoutFieldErrors = {};

  if (!fullName || fullName.length < 2) {
    errors.fullName = "Please enter a valid full name.";
  }

  if (!street) {
    errors.street = "Please enter your street or area.";
  }

  if (!isValidIndianPhone(phone)) {
    errors.phone = "Please enter a valid 10-digit mobile number.";
  }

  if (!isValidPincode(pincode)) {
    errors.pincode = "Please enter a valid 6-digit delivery pincode.";
  } else if (!isServiceablePincode(pincode, serviceablePincodes)) {
    errors.pincode = "Delivery is not available for this pincode.";
  }

  const validPaymentMethods = new Set(["cod", "upi", "card_at_home"]);
  if (!validPaymentMethods.has(paymentMethod)) {
    errors.paymentMethod = "Please select a valid payment method.";
  }

  return errors;
}

export function validateCheckoutForm(form: CheckoutFormValues): { ok: true } | { ok: false; message: string } {
  const errors = getCheckoutFieldErrors(form);
  const firstError = errors.fullName || errors.street || errors.phone || errors.pincode || errors.paymentMethod;
  return firstError ? { ok: false, message: firstError } : { ok: true };
}

function requirePositiveInteger(value: unknown, label: string, index: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${label} at cart item ${index + 1}. Expected a positive integer.`);
  }
  return value;
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`Invalid ${label}. Expected a non-empty string.`);
  }
  const cleaned = value.trim();
  if (!cleaned) {
    throw new Error(`Invalid ${label}. Expected a non-empty string.`);
  }
  return cleaned;
}

/**
 * Builds the minimal authenticated checkout payload that the secure server-side RPC is
 * allowed to trust. The browser is never authoritative for pricing, totals, or stock.
 */
export function buildServerOrderPayload(
  cart: readonly CartItem[],
  metadata: CheckoutMetadata = {}
): ServerOrderPayload {
  const payload: ServerOrderPayload = {
    items: cart.map((item, index) => ({
      product_id: requirePositiveInteger(item.product_id, "product_id", index),
      quantity: requirePositiveInteger(item.qty, "quantity", index),
    })),
  };

  if (metadata.customer_id !== undefined) {
    payload.customer_id = requireText(metadata.customer_id, "customer_id");
  }
  if (metadata.customer_name !== undefined) {
    payload.customer_name = requireText(metadata.customer_name, "customer_name");
  }
  if (metadata.customer_phone !== undefined) {
    payload.customer_phone = requireText(metadata.customer_phone, "customer_phone");
  }
  if (metadata.shipping_address !== undefined) {
    payload.shipping_address = requireText(metadata.shipping_address, "shipping_address");
  }
  if (metadata.landmark !== undefined) {
    payload.landmark = metadata.landmark.trim();
  }
  if (metadata.pincode !== undefined) {
    payload.pincode = requireText(metadata.pincode, "pincode");
  }
  if (metadata.payment_method !== undefined) {
    payload.payment_method = requireText(metadata.payment_method, "payment_method");
  }
  if (metadata.idempotency_key !== undefined) {
    payload.idempotency_key = requireText(metadata.idempotency_key, "idempotency_key");
  }

  return payload;
}
