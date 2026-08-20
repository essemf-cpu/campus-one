import express from "express";
import cors from "cors";
import authRoutes from "./server/routes/authRoutes.js";

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
// TEST
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "🚀 Campus One API opérationnelle"
    });

});

// =====================================================
// SERVEUR
// =====================================================

// Cloud Run fournit automatiquement PORT.
// En local, on utilise 3000.

const PORT =
    process.env.PORT ||
    3000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `✅ Campus One API démarrée sur le port ${PORT}`
        );

    }
);