import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
//     console.log(req.body);
//     {
//   name: 'temp',
//   email: 'vikasarya1889@gmail.com',
//   password: '1234567890'
// }
    try {
      console.log(schema.parse( req.body),"req.body");
      schema.parse(
        req.body,
        // query: req.query,
        // params: req.params,
      );
      console.log("schema.parse");
      next();
    } catch (error:any) {
        console.log(error,"zod error");
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map(err => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
          })),
        });
      }
      next(error);
    }
  };
