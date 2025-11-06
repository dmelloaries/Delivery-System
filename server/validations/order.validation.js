import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number(),
        title: z.string(),
        price: z.number(),
        quantity: z.number().int().positive(),
        image: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .min(1, "Order must contain at least one item"),
  totalAmount: z.number().positive(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "Pending",
    "Accepted",
    "On The Way",
    "Delivered",
    "Cancelled",
  ]),
});
