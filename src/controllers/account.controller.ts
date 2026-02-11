import accountModel from "../models/account.model";


class AccountController {


    static createAccount = async (req: any, res: any, next: any) => {
// req.user = {
//       userId: decoded.userId,
//       email: decoded.email,
// }
        const { userId,email } = req.user;
        const account = await accountModel.create({
            user: userId,
        });
        return res.status(200).json({
            account,
            message: "Account created successfully" });
    }

    static getAccountById = async (req: any, res: any, next: any) => {
        const { userId,email } = req.user;
        const account = await accountModel.findOne({ user: userId });
        if(!account){
            return res.status(400).json({ message: "Account not found" });
        }
        return res.status(200).json({
            account,
            message: "Account fetched successfully" });
    }

  static async findAccountById(accountId: string) {
  return await accountModel.findById(accountId);
}



}
export default AccountController;