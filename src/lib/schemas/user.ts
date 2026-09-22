import { z } from "zod";

/**
 * A user as returned by `GET /users` (admin-only). The backend's
 * `PUBLIC_USER_SELECT` excludes `password` at the query level, so it
 * never reaches this shape at all — nothing to strip here.
 */
export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["ADMIN", "USER"]),
  createdAt: z.string(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

export const publicUserListSchema = z.array(publicUserSchema);
