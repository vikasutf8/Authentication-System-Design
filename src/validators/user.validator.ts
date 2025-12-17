

import { z } from "zod";

export const registerUserSchema = z.object({
  // If you are validating the whole 'req' object, keep 'body'
  // If you are only validating 'req.body', remove the 'body' wrapper
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  }),
});


export const loginUserSchema = z.object({
  // If you are validating the whole 'req' object, keep 'body'
  // If you are only validating 'req.body', remove the 'body' wrapper
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});