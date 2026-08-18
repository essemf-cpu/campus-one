import { auth } from "../firebase/firebase.js";
import { getSession } from "./sessionManager.js";


export async function requireRole(
    expectedRole,
    callback,
    requiredPermission = null
) {

    try {

        const session =
            await getSession();


        // =================================================
        // UTILISATEUR NON CONNECTÉ
        // =================================================

        if (!session) {

            window.location.href =
                "/src/auth/login.html";

            return;

        }


        const {
            account,
            profile,
            permissions,
            mode,
            lectureSeule
        } = session;


        // =================================================
        // VÉRIFICATION DU RÔLE
        // =================================================

        if (
            account.role !==
            expectedRole
        ) {

            window.location.href =
                "/src/403.html";

            return;

        }


        // =================================================
        // VÉRIFICATION DE LA PERMISSION
        // =================================================

        if (
            requiredPermission &&
            permissions?.[requiredPermission] !== true
        ) {

            console.warn(
                "⛔ Permission refusée :",
                requiredPermission
            );


            window.location.href =
                "/src/403.html";

            return;

        }


        // =================================================
        // PROFIL AVEC PERMISSIONS
        // =================================================

        const profileAvecPermissions = {

            ...profile,

            permissions

        };


        // =================================================
        // UTILISATEUR AUTORISÉ
        // =================================================

        await callback({

    account,

    profile:
        profileAvecPermissions,

    permissions,

    affectation:
        session.affectation,

    posteId:
        session.posteId,

    anneeAcademique:
        session.anneeAcademique,

    lectureSeule:
        session.lectureSeule === true

});

    }

    catch (error) {

        console.error(
            "AUTHGUARD",
            error
        );

        throw error;

    }

}