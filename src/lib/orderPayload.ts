import type { CartItem } from "./store-utils";

export type ServerOrderItem = {
  product_id: number;
  quantity: number;
};

export type ServerOrderPayload = {
  items: ServerOrderItem[];
};

function requirePositiveInteger(value: unknown, label: string, index: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${label} at cart item ${index + 1}. Expected a positive integer.`);
  }
  return value;
}

/** Builds the minimal future server/RPC order payload without trusting cart pricing or stock. */
export function buildServerOrderPayload(cart: readonly CartItem[]): ServerOrderPayload {
  return {
    items: cart.map((item, index) => ({
      product_id: requirePositiveInteger(item.product_id, "product_id", index),
      quantity: requirePositiveInteger(item.qty, "quantity", index),
    })),
  };
}
