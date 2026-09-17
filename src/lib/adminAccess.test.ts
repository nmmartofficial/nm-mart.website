import { describe, expect, it } from "vitest";
import { isAdminEmail } from "./adminAccess";

describe("admin access", () => {
  it("accepts the configured admin email case-insensitively", () => {
    expect(isAdminEmail(" NMMART07@GMAIL.COM ")).toBe(true);
  });

  it("rejects missing and non-admin emails", () => {
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("customer@example.com")).toBe(false);
  });
});