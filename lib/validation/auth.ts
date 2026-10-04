import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(256),
  remember: z.boolean().optional().default(false),
});

export const passwordResetRequestSchema = z.object({
  email: z.email().max(254).transform((value) => value.trim().toLowerCase()),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(12).max(256),
});
