
import { Router } from "express";

import {
    register,
    login,
    logout,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
} from "../controllers/user.controllers.js";

import { verifyjwt } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(register);
router.route("/login").post(login);

// Protected routes
router.route("/logout").get(verifyjwt, logout);

router.route("/reset-token").patch(
    refreshAccessToken
);

router.route("/get-me").get(
    verifyjwt,
    getCurrentUser
);

router.route("/reset-password").patch(
    verifyjwt,
    changeCurrentPassword
);

export default router;