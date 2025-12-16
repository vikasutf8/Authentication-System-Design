import { Request, Response, NextFunction } from "express";
import UserService  from "../services/user.service";
import tryCatch from "../middlewares/tryCatch";
import sanitize from "mongo-sanitize";
import { registerUserSchema } from "../validators/user.validator";


class UserController {
  
   static registerUser =tryCatch(async (req: Request, res: Response, next: NextFunction) => {
    // const {name,email,password} = sanitize(req.body);

    const sanitizedBody = sanitize(req.body);
    const {name,email,password} = sanitizedBody;
    // const user = await UserService.registerUser({name,email,password});
    
    res.status(201).json({name,email});

  });
}

export default UserController;
