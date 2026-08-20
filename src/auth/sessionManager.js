import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getCurrentUser } from "./authService.js";
import { getAgentPermissions } from "./permissionsService.js";

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

                console.log("🔥 UID AUTH =", firebaseUser.uid);

const currentUser =
    await getCurrentUser(
        firebaseUser.uid
    );

console.log("✅ CURRENT USER FIRESTORE =", currentUser);

                   // =========================================
// ANNÉE ACADÉMIQUE SÉLECTIONNÉE
// =========================================

const anneeAcademique =
    sessionStorage.getItem(
        "anneeAcademique"
    );


// =========================================
// DROITS DE L'UTILISATEUR
// =========================================

let droits = {

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


// =========================================
// DROITS SPÉCIFIQUES DE L'AGENT
// =========================================

console.log("👤 CURRENT USER =", currentUser);
console.log("🎭 ROLE =", currentUser.account?.role);
console.log("🪪 MATRICULE =", currentUser.profile?.matricule);
console.log("📅 ANNÉE =", anneeAcademique);

if (
    currentUser.account?.role ===
    "agent"
) {

    droits =
        await getAgentPermissions(
            currentUser.profile?.matricule,
            anneeAcademique
        );

}


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
        anneeAcademique || null,

    affectation:
    droits.affectation,

posteId:
    droits.posteId,

permissions:
    droits.permissions,

mode:
    droits.mode,

lectureSeule:
    droits.lectureSeule

};


console.log(
    "🔐 DROITS SESSION =",
    {

        anneeAcademique:
            session.anneeAcademique,

        affectation:
            session.affectation,

        posteId:
            session.posteId,

        mode:
            session.mode,

        lectureSeule:
            session.lectureSeule,

        permissions:
            session.permissions

    }
);

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