import { Router } from "express";

import {
    createParty,
    getAllParty,
    getSingleParty,
    updateParty,
    deleteparty
} from "../controllers/partymaster.controller.js"

import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyjwt);

router.route("/createparty").post(createParty);

router.route("/getallparties").get(getAllParty);

router.route("/singleparty/:id").get(getSingleParty);

router.route("/updateparty/:id").patch(updateParty);

router.route("/deleteparty/:id").delete(deleteparty);
export default router;