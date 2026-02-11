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

}
export default AccountController;