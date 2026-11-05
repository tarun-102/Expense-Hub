import { Router } from "express";

import { createBudgets, getAllBudgets,getSingleBudget,updateBudgets,deleteBudgets } from "../controllers/budget.controllers.js"; "../controllers/budget.controllers.js"
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyjwt)

router.use(verifyjwt);

router.route("/createbudget").post(createBudgets);
router.route("/getallbudgets").get(getAllBudgets);
router.route("/singlebudget/:id").get(getSingleBudget);
router.route("/updatebudget/:id").patch(updateBudgets);
router.route("/deletebudget/:id").delete(deleteBudgets);

export default router;