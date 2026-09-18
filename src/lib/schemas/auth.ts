import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "USER"]),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

// `sessionUserSchema` only picks the fields the client store actually
// needs (id/name/role); Zod's default "strip unknown keys" behavior
// drops any extra fields the backend response includes.
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: sessionUserSchema,
});
