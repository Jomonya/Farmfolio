import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().trim().max(80).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  description: z.string().trim().min(2, "Description is required").max(300),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  location: z.string().trim().min(2, "Location is required").max(80),
  category: z.string().trim().default("Other"),
});

export const checkoutSchema = z.object({
  phone: z.string().trim().min(1, "Enter your M-Pesa phone number"),
  buyerName: z.string().trim().max(80).optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Your cart is empty"),
});

export const bookingSchema = z.object({
  veterinarianId: z.coerce.number().int().positive(),
  date: z.string().trim().min(1, "Pick a date"),
  timeSlot: z.string().trim().min(1, "Pick a time"),
  notes: z.string().trim().max(500).optional(),
});
