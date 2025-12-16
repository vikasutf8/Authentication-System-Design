import { NextFunction, Request, Response } from "express";

const tryCatch = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await fn(req, res, next);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export default tryCatch;