// import swaggerJsdoc from "swagger-jsdoc";

// export const swaggerSpec = swaggerJsdoc({
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "User Service API",
//       version: "1.0.0",
//       description: "API documentation for User Service",
//     },
//     servers: [
//       {
//         url: "http://localhost:6001",
//         description: "Local server",
//       },
//     ],
//   },
//   apis: ["./src/routes/**/*.ts"], // where you write swagger comments
// });
import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { registry } from "./openapi";

// import docs so they get registered
import "../docs/user.docs";

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "User Service API",
    version: "1.0.0",
    description: "Production-ready API docs powered by Zod",
  },
  servers: [
    {
      url: "http://localhost:6001",
    },
  ],
});
