import { z } from "zod";

export const loginAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const deactivateAccountSchema = z
  .object({
    userId: z.string().optional(),
    partnerId: z.string().optional(),
  })
  .refine((data) => data.userId || data.partnerId, {
    message: "Either userId or partnerId must be provided",
  });
