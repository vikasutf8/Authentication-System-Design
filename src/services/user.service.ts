import UserModel, { IUser } from "../models/user.model";
import tryCatch from "../middlewares/tryCatch";

class UserService {
  static registerUser = tryCatch(async ({ name, email, password }: IUser) => {
    const user = await UserModel.create({ name, email, password });
    return user;
  });
}

export default UserService;
