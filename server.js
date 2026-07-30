import express from "express";
import cors from "cors";
import authRoutes from "./server/routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "🚀 Campus One API opérationnelle"
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ API démarrée sur http://localhost:${PORT}`);
});