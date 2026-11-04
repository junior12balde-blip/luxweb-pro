import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/lib/validations/auth";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "host@example.com",
      password: "supersecret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "supersecret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = loginSchema.safeParse({
      email: "host@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupSchema", () => {
  it("requires a full name", () => {
    const result = signupSchema.safeParse({
      fullName: "",
      email: "host@example.com",
      password: "supersecret123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid signup data", () => {
    const result = signupSchema.safeParse({
      fullName: "Ana Host",
      email: "host@example.com",
      password: "supersecret123",
    });
    expect(result.success).toBe(true);
  });
});
