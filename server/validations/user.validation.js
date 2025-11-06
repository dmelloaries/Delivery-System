import { z } from "zod";

export const registerUserSchema = z.object({
  fullname: z.object({
    firstname: z
      .string()
      .min(3, "First name must be at least 3 characters long"),
    lastname: z
      .string()
      .min(3, "Last name must be at least 3 characters long")
      .optional(),
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
