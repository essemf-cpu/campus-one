import { createAgentAccount } from "../services/authService.js";

export async function createAccount(req, res) {
    try {

        const { matricule, password } = req.body;

        if (!matricule || !password) {
            return res.status(400).json({
                success: false,
                message: "Matricule et mot de passe obligatoires."
            });
        }

        const user = await createAgentAccount(
            matricule,
            password
        );

        res.json({
            success: true,
            message: "Compte créé avec succès.",
            user
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
}