import { z } from "../config/zod.config";
import { registry } from "../config/openapi";

registry.registerPath({
  method: "post",
  path: "/api/v1/users/register",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/RegisterUser" },
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
    },
    400: {
      description: "Validation error",
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/users/login",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/LoginUser" },
        },
      },
    },
  },
  responses: {
    200: { description: "Login successful" },
    401: { description: "Invalid credentials" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/users/verify/{token}",
  tags: ["Users"],
  request: {
    params: z.object({
      token: z.string(),
    }),
  },
  responses: {
    200: { description: "Account verified" },
    400: { description: "Invalid or expired token" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/v1/users/verifyOTP",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/VerifyOTP" },
        },
      },
      required: true,
    },
  },
  responses: {
    200: { description: "OTP verified" },
    400: { description: "Invalid OTP" },
  },
});
