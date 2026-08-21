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

            if (!firebaseUser) {

                session = null;

            } else {

                const currentUser =
                    await getCurrentUser(
                        firebaseUser.uid
                    );

                // getCurrentUser() a déjà résolu
                // l'affectation et les permissions.
                session = {

                    firebaseUser,

                    account:
                        currentUser.account,

                    profile:
                        currentUser.profile,

                    anneeAcademique:
                        currentUser.anneeAcademique || null,

                    affectation:
                        currentUser.affectation || null,

                    posteId:
                        currentUser.profile?.posteId || null,

                    permissions:
                        currentUser.profile?.permissions || {},

                    mode:
                        currentUser.mode || "normal",

                    lectureSeule:
                        currentUser.lectureSeule === true
                };
            }

        } catch (error) {

            console.error(
                "ERREUR SESSION :",
                error
            );

            session = null;
        }

        initialized = true;

        waiting.forEach(
            resolve => resolve(session)
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
            waiting.push(resolve);
        }
    );
}

// =====================================================
// RÉCUPÉRER L'ANNÉE ACADÉMIQUE
// =====================================================

export async function getAnneeAcademique() {

    const currentSession =
        await getSession();

    if (!currentSession) {
        return null;
    }

    return currentSession.anneeAcademique || null;
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
            session.anneeAcademique = null;
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