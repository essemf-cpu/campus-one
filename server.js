import express from "express";
import cors from "cors";

import authRoutes from "./server/routes/authRoutes.js";
import {
    controlerDelaisBonsServeur,
    controlerDelaisDemandesEtudiants
} from "./server/services/bonsControleService.js";

const app = express();

// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// API
// =====================================================

app.use("/api/auth", authRoutes);

// =====================================================
// CONTRÔLE AUTOMATIQUE DES BONS
// =====================================================
//
// Le contrôle est exécuté côté serveur.
// Il ne dépend donc plus de l'ouverture de la page Atelier.
//
// =====================================================

async function executerControleDelais() {

    try {

const resultatBons =
    await controlerDelaisBonsServeur();

const resultatDemandes =
    await controlerDelaisDemandesEtudiants();

console.log(
    "⏱️ Contrôle automatique des bons :",
    resultatBons
);

console.log(
    "🎓 Contrôle automatique des demandes étudiantes :",
    resultatDemandes
);

    } catch (error) {

        console.error(
            "❌ Erreur contrôle automatique des bons :",
            error
        );

    }

}

// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "🚀 Campus One API opérationnelle"

    });

});

// =====================================================
// SERVEUR
// =====================================================
//
// Cloud Run fournit automatiquement PORT.
// En local, on utilise 3000.
//
// =====================================================

const PORT =
    process.env.PORT ||
    3000;

app.listen(

    PORT,

    "0.0.0.0",

    async () => {

        console.log(
            `✅ Campus One API démarrée sur le port ${PORT}`
        );

        // =================================================
        // PREMIER CONTRÔLE AU DÉMARRAGE
        // =================================================

        await executerControleDelais();

        // =================================================
        // CONTRÔLE PÉRIODIQUE
        // =================================================
        //
        // Toutes les heures.
        //
        // Le système vérifie automatiquement :
        //
        // J     → rien
        // J + 1 → rappel
        // J + 2 → négligé + archivage
        //
        // =================================================

        setInterval(

            executerControleDelais,

            60 * 60 * 1000

        );

        console.log(
            "🔄 Contrôle automatique des bons activé."
        );

    }

);