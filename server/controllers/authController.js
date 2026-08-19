import {
    createUserAccount,
    findActivationUser
} from "../services/authService.js";


// =====================================================
// CRÉATION DE COMPTE
// =====================================================

export async function createAccount(
    req,
    res
) {

    try {

        const {
            matricule,
            password
        } = req.body;


        if (
            !matricule ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Matricule et mot de passe obligatoires."

            });

        }


        const user =
            await createUserAccount(
                matricule,
                password
            );


        return res.json({

            success: true,

            message:
                "Compte créé avec succès.",

            user

        });


    } catch (error) {

        console.error(
            "❌ Création compte :",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

}


// =====================================================
// VÉRIFIER UN MATRICULE POUR L'ACTIVATION
// =====================================================

export async function checkActivationMatricule(
    req,
    res
) {

    try {

        const matricule =
            String(
                req.body?.matricule || ""
            )
                .trim();


        if (!matricule) {

            return res.status(400).json({

                success: false,

                exists: false,

                message:
                    "Matricule obligatoire."

            });

        }


        const user =
            await findActivationUser(
                matricule
            );


        return res.json({

            success: true,

            exists:
                !!user

        });


    } catch (error) {

        console.error(
            "❌ Vérification matricule :",
            error
        );


        return res.status(500).json({

            success: false,

            exists: false,

            message:
                "Impossible de vérifier le matricule."

        });

    }

}


// =====================================================
// RÉCUPÉRER LES INFORMATIONS D'ACTIVATION
// =====================================================

export async function getActivationUser(
    req,
    res
) {

    try {

        const matricule =
            String(
                req.body?.matricule || ""
            )
                .trim();


        if (!matricule) {

            return res.status(400).json({

                success: false,

                message:
                    "Matricule obligatoire."

            });

        }


        const user =
            await findActivationUser(
                matricule
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "Utilisateur introuvable."

            });

        }


        return res.json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "❌ Informations activation :",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Impossible de récupérer les informations."

        });

    }

}