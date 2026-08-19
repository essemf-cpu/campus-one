import express from "express";

import {
    createAccount,
    checkActivationMatricule,
    getActivationUser
} from "../controllers/authController.js";


const router =
    express.Router();


// =====================================================
// CRÉATION DE COMPTE
// =====================================================

router.post(
    "/create-account",
    createAccount
);


// =====================================================
// VÉRIFICATION DU MATRICULE
// =====================================================

router.post(
    "/check-matricule",
    checkActivationMatricule
);


// =====================================================
// INFORMATIONS D'ACTIVATION
// =====================================================

router.post(
    "/activation-user",
    getActivationUser
);


export default router;