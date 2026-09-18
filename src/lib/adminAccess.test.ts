import { describe, expect, it } from "vitest";
import { isActiveAdminUser } from "./adminAccess";

describe("admin access", () => {
  it("accepts an active admin record keyed by the authenticated user id", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { is_active: true, status: "active", role: "super_admin" },
              error: null,
            }),
          }),
        }),
      }),
    } as any;

    await expect(isActiveAdminUser(mockSupabase, "auth-user-123")).resolves.toBe(true);
  });

  it("rejects missing, inactive, or non-admin records", async () => {
    const missing = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
    } as any;

    await expect(isActiveAdminUser(missing, "missing-user")).resolves.toBe(false);

    const inactive = {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { is_active: false, status: "inactive", role: "cashier" },
              error: null,
            }),
          }),
        }),
      }),
    } as any;

    await expect(isActiveAdminUser(inactive, "inactive-user")).resolves.toBe(false);
  });
});