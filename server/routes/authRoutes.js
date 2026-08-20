import express from "express";

import {
    createAccount,
    checkActivationMatricule,
    getActivationUser,
    getLoginUser,
    acceptFriendRequest,
    rejectFriendRequest
} from "../controllers/authController.js";


const router =
    express.Router();


// =====================================================
// AUTHENTIFICATION / ACTIVATION
// =====================================================

router.post(
    "/create-account",
    createAccount
);

router.post(
    "/check-matricule",
    checkActivationMatricule
);

router.post(
    "/activation-user",
    getActivationUser
);

router.post(
    "/login-user",
    getLoginUser
);

// =====================================================
// AMIS
// =====================================================

router.post(
    "/friend-request/accept",
    acceptFriendRequest
);

router.post(
    "/friend-request/reject",
    rejectFriendRequest
);


export default router;