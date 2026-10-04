import { describe, expect, it } from "vitest";
import { loginSchema, passwordResetConfirmSchema } from "@/lib/validation/auth";

describe("auth validation", () => {
  it("normalizes login email", () => expect(loginSchema.parse({ email: "Admin@Example.COM", password: "x" }).email).toBe("admin@example.com"));
  it("requires a strong-length reset password", () => expect(passwordResetConfirmSchema.safeParse({ token: "a".repeat(32), password: "short" }).success).toBe(false));
});
