import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getCurrentUser } from "./authService.js";

let session = null;
let initialized = false;
let waiting = [];


// =====================================================
// AUTHENTIFICATION FIREBASE
// =====================================================

onAuthStateChanged(
    auth,
    async (firebaseUser) => {

        try {

            // =============================================
            // AUCUN UTILISATEUR CONNECTÉ
            // =============================================

            if (!firebaseUser) {

                session = null;

            } else {

                // =========================================
                // RÉCUPÉRER L'UTILISATEUR
                // =========================================

                const currentUser =
                    await getCurrentUser(
                        firebaseUser.uid
                    );


                console.log(
                    "CURRENT USER =",
                    currentUser
                );


                // =========================================
                // ANNÉE ACADÉMIQUE SÉLECTIONNÉE
                // =========================================

                const anneeAcademique =
                    sessionStorage.getItem(
                        "anneeAcademique"
                    );


                // =========================================
                // CONSTRUIRE LA SESSION
                // =========================================

                session = {

                    firebaseUser,

                    account:
                        currentUser.account,

                    profile:
                        currentUser.profile,

                    anneeAcademique:
                        anneeAcademique || null

                };

            }

        } catch (error) {

            console.error(
                "ERREUR SESSION :",
                error
            );

            session = null;

        }


        // =============================================
        // SESSION INITIALISÉE
        // =============================================

        initialized = true;


        waiting.forEach(
            resolve =>
                resolve(session)
        );


        waiting = [];

    }
);


// =====================================================
// RÉCUPÉRER LA SESSION
// =====================================================

export async function getSession() {

    if (initialized) {

        return session;

    }


    return new Promise(
        resolve => {

            waiting.push(
                resolve
            );

        }
    );

}


// =====================================================
// RÉCUPÉRER L'ANNÉE ACADÉMIQUE COURANTE
// =====================================================

export async function getAnneeAcademique() {

    const currentSession =
        await getSession();


    if (!currentSession) {

        return null;

    }


    return (
        currentSession.anneeAcademique ||
        null
    );

}


// =====================================================
// DÉFINIR L'ANNÉE ACADÉMIQUE
// =====================================================

export function setAnneeAcademique(
    anneeAcademique
) {

    if (!anneeAcademique) {

        sessionStorage.removeItem(
            "anneeAcademique"
        );

        if (session) {

            session.anneeAcademique =
                null;

        }

        return;

    }


    sessionStorage.setItem(
        "anneeAcademique",
        anneeAcademique
    );


    if (session) {

        session.anneeAcademique =
            anneeAcademique;

    }

}


// =====================================================
// EFFACER LA SESSION
// =====================================================

export function clearSession() {

    session = null;

    initialized = false;

    waiting = [];

}