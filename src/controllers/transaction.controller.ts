import mongoose from "mongoose";
import transactionModel from "../models/transaction.model";
import AccountController from "./account.controller";
import ledgerModel from "../models/ledger.model";

class TransactionController {
  private static async validateIdempotencyKey(idempotencyKey: string) {
    return await transactionModel.findOne({ idempotencyKey });
  }

  /**
   * Create a new transaction
   * 1. validate request
   * 2.validate idempotency key
   * 3. check account status
   * 4 deriver sender balance from ledger
   * create transaction (pending)
   * create debit ledger entry
   * create credit ledger entry
   * mark transaction as complete
   * commit transaction
   * Send email to user
   */
  static createTransaction = async (req: any, res: any, next: any) => {
    //1.
    const { userId, email } = req.user;

    const idempotencyKey = req.body.idempotencyKey;
    const fromAccount = req.body.fromAccount;
    const toAccount = req.body.toAccount;
    const amount = req.body.amount;

    if (fromAccount !== userId) {
      return res
        .status(400)
        .json({ message: "Unauthorized: From account not yours" });
    }

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({ message: "Illegal request" });
    }

    const fromAccountData = await AccountController.findAccountById(
      fromAccount
    );
    const toAccountData = await AccountController.findAccountById(toAccount);

    if (!fromAccountData || !toAccountData) {
      return res.status(400).json({ message: "Account not found" });
    }
    // 2. validate idempotency key
    const transaction = await this.validateIdempotencyKey(idempotencyKey);
    console.log(transaction, "transaction");

    if (transaction) {
      const messages: Record<string, string> = {
        complete: "Transaction already completed",
        failed: "Transaction already failed",
        revert: "Transaction already reverted",
        pending: "Transaction already pending",
      };
      const msg = messages[String(transaction.status).toLowerCase()];
      if (msg) {
        return res.status(400).json({ message: msg });
      }
    }

    //3. check account status
    if(fromAccountData.status !== "active" || toAccountData.status !== "active"){
      return res.status(400).json({ message: "Account not active" });
    }

    // 4. deriver sender balance from ledger --aggregate pipeline
    const balance = await fromAccount.getBalance();
    if(balance < amount){
      return res.status(400).json({ message: "Insufficient balance" });
    }
    

    // session create mongodb transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //5 create transaction (pending)
      const transaction = await transactionModel.create([{
        idempotencyKey,
        fromAccount,
        toAccount,
        amount,
        status: "pending",
      }], { session });
      

      //6 create debit ledger entry
      await ledgerModel.create([{
        account: fromAccount,
        amount,
        transaction: transaction[0]._id,
        type: "debit",
      }, {
        account: toAccount,
        amount,
        transaction: transaction[0]._id,
        type: "credit",
      }], { session });
      
      //7 mark transaction as complete
      await transactionModel.updateOne(
        { _id: transaction[0]._id },
        { status: "complete" },
        { session }
      );
      //8 commit transaction
      session.commitTransaction();
      console.log("transaction committed successfully");
      session.endSession();

      return res.status(200).json({
        message: "Transaction created successfully",
        transaction: transaction[0],
        balance: await fromAccount.getBalance(),
      });



    } catch (error) {
      session.abortTransaction();
      throw error;
    }
    //9 send email to user
    // await AccountController.sendEmail(
    //   email,
    //   "Transaction Status",
    //   `Your transaction ${transaction[0]._id} is ${transaction[0].status}`
    // );
   
   
    



  };
}
export default TransactionController;
