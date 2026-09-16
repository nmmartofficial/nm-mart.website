import { describe, expect, it } from "vitest";
import { validateAuthForm } from "./Login";

describe("validateAuthForm", () => {
  it("requires email and password for sign in", () => {
    expect(validateAuthForm({ isSignUp: false, email: "", password: "", fullName: "" })).toBe("Please enter your email and password.");
  });

  it("requires a name for sign up", () => {
    expect(validateAuthForm({ isSignUp: true, email: "user@example.com", password: "secret123", fullName: "" })).toBe("Please enter your full name.");
  });

  it("requires a matching password confirmation when present", () => {
    expect(validateAuthForm({ isSignUp: true, email: "user@example.com", password: "secret123", confirmPassword: "secret124", fullName: "Test User" })).toBe("Passwords do not match.");
  });
});
