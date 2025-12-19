import UserModel, { IUser } from "../models/user.model";
import tryCatch from "../middlewares/tryCatch";
import { CacheService } from "./cache.service";

class UserService {
  static registerUser = async ({ name, email, password }: any) => {
    const user = await UserModel.create({ name, email, password });
    return user;
  };

  static getUserByEmail = (async (email: string) => {
    const user = await UserModel.findOne({ email });
    return user;
  });

  static getUserById = async (id: string) => {
    const user = await UserModel.findById(id).select("-password");
    return user;
  };
}

export default UserService;
