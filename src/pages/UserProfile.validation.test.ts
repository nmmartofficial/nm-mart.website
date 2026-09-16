import { describe, expect, it } from "vitest";
import { validateCustomerProfile } from "./UserProfile";

describe("validateCustomerProfile", () => {
  it("requires a name and delivery address", () => {
    expect(validateCustomerProfile({ name: "", phone: "9876543210", address: "" })).toBe("Please enter your full name.");
  });

  it("requires a 10-digit mobile number", () => {
    expect(validateCustomerProfile({ name: "Test User", phone: "12345", address: "House 10, Sector 4" })).toBe("Phone number must be 10 digits.");
  });

  it("accepts valid address details", () => {
    expect(validateCustomerProfile({ name: "Test User", phone: "9876543210", address: "House 10, Sector 4" })).toBe("");
  });
});
