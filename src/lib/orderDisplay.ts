type OrderLike = {
  status?: unknown;
  order_status?: unknown;
  delivery_status?: unknown;
  total?: unknown;
  total_amount?: unknown;
  grand_total?: unknown;
  order_total?: unknown;
  amount?: unknown;
  payment_method?: unknown;
  payment_mode?: unknown;
  payment_type?: unknown;
  shipping_address?: unknown;
  delivery_address?: unknown;
  customer_address?: unknown;
  address?: unknown;
};

export function getOrderStatus(order: OrderLike): string | null {
  return firstText(order.status, order.order_status, order.delivery_status);
}

export function getOrderTotal(order: OrderLike): number | null {
  return firstNumber(order.total, order.total_amount, order.grand_total, order.order_total, order.amount);
}

export function getOrderPaymentMethod(order: OrderLike): string | null {
  return firstText(order.payment_method, order.payment_mode, order.payment_type);
}

export function getOrderAddress(order: OrderLike): string | null {
  return firstText(order.shipping_address, order.delivery_address, order.customer_address, order.address);
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const text = toText(value);
    if (text) return text;
  }
  return null;
}

function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const number = toNumber(value);
    if (number !== null) return number;
  }
  return null;
}

function toText(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return text || null;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
