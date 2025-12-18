

// import { z } from "zod";

// export const registerUserSchema = z.object({
//   // If you are validating the whole 'req' object, keep 'body'
//   // If you are only validating 'req.body', remove the 'body' wrapper
//   body: z.object({
//     email: z.string().email("Invalid email format"),
//     password: z.string().min(8, "Password must be at least 8 characters long"),
//     name: z.string().min(1, "Name is required").max(50, "Name is too long"),
//   }),
// });


// export const loginUserSchema = z.object({
//   // If you are validating the whole 'req' object, keep 'body'
//   // If you are only validating 'req.body', remove the 'body' wrapper
//   body: z.object({
//     email: z.string().email("Invalid email format"),
//     password: z.string().min(8, "Password must be at least 8 characters long"),
//   }),
// });


import { z } from "../config/zod.config";
import { registry } from "../config/openapi";

export const registerUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Register schemas for Swagger
registry.register("RegisterUser", registerUserSchema);
registry.register("LoginUser", loginUserSchema);
