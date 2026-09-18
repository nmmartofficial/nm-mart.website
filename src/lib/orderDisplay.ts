type OrderLike = {
  status?: unknown;
  order_status?: unknown;
  total?: unknown;
  total_amount?: unknown;
  payment_method?: unknown;
  payment_mode?: unknown;
  shipping_address?: unknown;
  delivery_address?: unknown;
};

export function getOrderStatus(order: OrderLike): string | null {
  return toText(order.status) ?? toText(order.order_status);
}

export function getOrderTotal(order: OrderLike): number | null {
  const total = toNumber(order.total);
  return total ?? toNumber(order.total_amount);
}

export function getOrderPaymentMethod(order: OrderLike): string | null {
  return toText(order.payment_method) ?? toText(order.payment_mode);
}

export function getOrderAddress(order: OrderLike): string | null {
  return toText(order.shipping_address) ?? toText(order.delivery_address);
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
