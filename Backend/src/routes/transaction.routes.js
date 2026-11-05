import { Router } from "express";
import {createTransaction,getAllTransaction,getSingleTransaction,updateTransactiopn,deleteTransaction} from "../controllers/transaction.controller.js";

const router = Router()
import { verifyjwt } from "../middleware/auth.middleware.js"

router.use(verifyjwt)

router.route("/createtransaction").post(createTransaction)

router.route("/getalltransaction").get(getAllTransaction)



router.route("/singletransaction/:id").get(getSingleTransaction);

router.route("/updatetransaction/:id").patch(updateTransactiopn)

router.route("/deletetransaction/:id").delete(deleteTransaction)

export default router