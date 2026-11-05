import { Router } from "express";

import {createCategory, getAllCategories,updateCategory,deleteCategory} from "../controllers/category.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js";
const router = Router();

router.use(verifyjwt);

router.route("/getallcategory").get(getAllCategories);

router.route("/createcategory").post(createCategory)
router.route("/updatecatory/:id").patch(updateCategory)

router.route("/deletecategory/:id").delete(deleteCategory)

export default router