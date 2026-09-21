import { describe, expect, it } from "vitest";
import { validateAuthForm, validateRecoveryEmail, validateResetPasswordForm } from "./Login";

describe("validateAuthForm", () => {
  it("requires email and password for sign in", () => {
    expect(validateAuthForm({ isSignUp: false, email: "", password: "", fullName: "" })).toBe("Please enter your email and password.");
  });

  it("requires a name for sign up", () => {
    expect(validateAuthForm({ isSignUp: true, email: "user@example.com", password: "secret123", fullName: "" })).toBe("Please enter your full name.");
  });

  it("requires at least 8 characters for sign-up passwords", () => {
    expect(validateAuthForm({ isSignUp: true, email: "user@example.com", password: "short", confirmPassword: "short", fullName: "Test User" })).toBe("Password must be at least 8 characters long.");
  });

  it("requires a matching password confirmation when present", () => {
    expect(validateAuthForm({ isSignUp: true, email: "user@example.com", password: "secret123", confirmPassword: "secret124", fullName: "Test User" })).toBe("Passwords do not match.");
  });
});

describe("password recovery validation", () => {
  it("rejects empty recovery emails", () => {
    expect(validateRecoveryEmail("")).toBe("Please enter your email address.");
  });

  it("rejects invalid recovery email formats", () => {
    expect(validateRecoveryEmail("not-an-email")).toBe("Please enter a valid email address.");
  });

  it("requires at least 8 characters for reset passwords", () => {
    expect(validateResetPasswordForm({ password: "short", confirmPassword: "short" })).toBe("Password must be at least 8 characters long.");
  });

  it("requires matching passwords for reset form", () => {
    expect(validateResetPasswordForm({ password: "secret123", confirmPassword: "secret124" })).toBe("Passwords do not match.");
  });
});
