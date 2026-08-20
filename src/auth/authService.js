import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "firebase/auth";

import { auth, db } from "../firebase/firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore";

import { clearSession } from "./sessionManager.js";


/* ===========================
   AUTHENTIFICATION
=========================== */

let currentUserCache = null;


export async function login(
    email,
    password
) {

    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}


export async function logout() {

    currentUserCache = null;

    return signOut(auth);

}


export async function forgotPassword(
    email
) {

    return sendPasswordResetEmail(
        auth,
        email
    );

}


/* =====================================================
   AFFECTATION ACTIVE DE L'AGENT
===================================================== */

async function getAffectationActive(
    agentMatricule
) {

    const snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "affectationsAgents"
                ),

                where(
                    "agentMatricule",
                    "==",
                    agentMatricule
                )

            )

        );


    const maintenant =
        new Date();


    const affectationsActives =
        snapshot.docs

            .map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            )

            .filter(
                affectation => {

                    if (
                        affectation.statut !==
                        "active"
                    ) {

                        return false;

                    }


                    const dateDebut =
                        affectation.dateDebut
                            ?.toDate
                            ? affectation.dateDebut.toDate()
                            : new Date(
                                affectation.dateDebut
                            );


                    if (
                        dateDebut >
                        maintenant
                    ) {

                        return false;

                    }


                    if (
                        affectation.dateFin
                    ) {

                        const dateFin =
                            affectation.dateFin
                                ?.toDate
                                ? affectation.dateFin.toDate()
                                : new Date(
                                    affectation.dateFin
                                );


                        if (
                            dateFin <
                            maintenant
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


    if (
        affectationsActives.length === 0
    ) {

        return null;

    }


    affectationsActives.sort(
        (a, b) => {

            const dateA =
                a.dateDebut
                    ?.toDate
                    ? a.dateDebut.toDate()
                    : new Date(
                        a.dateDebut
                    );


            const dateB =
                b.dateDebut
                    ?.toDate
                    ? b.dateDebut.toDate()
                    : new Date(
                        b.dateDebut
                    );


            return (
                dateB -
                dateA
            );

        }
    );


    return affectationsActives[0];

}


/* =====================================================
   AFFECTATION AGENT POUR UNE ANNÉE
===================================================== */

async function getAffectationPourAnnee(
    agentMatricule,
    anneeAcademique
) {

    if (
        !agentMatricule ||
        !anneeAcademique
    ) {

        return null;

    }


    const snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "affectationsAgents"
                ),

                where(
                    "agentMatricule",
                    "==",
                    agentMatricule
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            )

        );


    if (
        snapshot.empty
    ) {

        return null;

    }


    const affectations =
        snapshot.docs.map(
            document => ({

                id:
                    document.id,

                ...document.data()

            })
        );


    affectations.sort(
        (a, b) => {

            const dateA =
                a.dateDebut?.toDate
                    ? a.dateDebut.toDate()
                    : new Date(
                        a.dateDebut
                    );


            const dateB =
                b.dateDebut?.toDate
                    ? b.dateDebut.toDate()
                    : new Date(
                        b.dateDebut
                    );


            return (
                dateB -
                dateA
            );

        }
    );


    return affectations[0];

}


/* =====================================================
   ANNÉE ACADÉMIQUE ACTUELLE DU SYSTÈME
===================================================== */

async function getAnneeAcademiqueCourante() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "anneesAcademiques"
            )
        );


    const anneesActives =
        snapshot.docs

            .map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            )

            .filter(
                annee =>
                    annee.active === true
            )

            .sort(
                (a, b) =>
                    (b.ordre || 0) -
                    (a.ordre || 0)
            );


    return (
        anneesActives[0]?.libelle ||
        null
    );

}


/* =====================================================
   ANNÉES ACADÉMIQUES DE L'ÉTUDIANT
=====================================================

   IMPORTANT :

   L'accès historique d'un étudiant ne dépend PAS
   de la collection "hebergements".

   Une année appartient à l'étudiant si elle existe
   dans "situationsAcademiques".

===================================================== */

async function getAnneesAcademiquesEtudiant(
    matricule
) {

    if (
        !matricule
    ) {

        return [];

    }


    const snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "situationsAcademiques"
                ),

                where(
                    "matricule",
                    "==",
                    matricule
                )

            )

        );


    const annees =
        snapshot.docs

            .map(
                document =>
                    document.data()
                        ?.anneeAcademique
            )

            .filter(Boolean);


    return [
        ...new Set(
            annees
        )
    ];

}


/* =====================================================
   UTILISATEURS
===================================================== */

export async function getCurrentUser(uid) {

    if (currentUserCache) {
        return currentUserCache;
    }

    console.log("🔎 GET CURRENT USER — UID =", uid);

    // =====================================================
    // COMPTE USERS
    // =====================================================

    const accountRef =
        doc(
            db,
            "users",
            uid
        );

    console.log(
        "🔎 Lecture users/" + uid
    );

    const accountSnap =
        await getDoc(
            accountRef
        );

    console.log(
        "✅ USERS OK"
    );

    if (!accountSnap.exists()) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }

    const account =
        accountSnap.data();

    console.log(
        "👤 ACCOUNT =",
        account
    );


    // =====================================================
    // PROFIL AGENT / ÉTUDIANT
    // =====================================================

    const profileRef =
        doc(
            db,
            account.profile
        );

    console.log(
        "🔎 Lecture profil =",
        account.profile
    );

    const profileSnap =
        await getDoc(
            profileRef
        );

    console.log(
        "✅ PROFILE OK"
    );

    if (!profileSnap.exists()) {

        throw new Error(
            "PROFILE_NOT_FOUND"
        );

    }

    const profile =
        profileSnap.data();

    console.log(
        "👤 PROFILE =",
        profile
    );


    console.time(
        "PROFILE"
    );


    // =====================================================
    // ANNÉE CHOISIE
    // =====================================================

    const anneeChoisie =
        sessionStorage.getItem(
            "anneeAcademique"
        );

    console.log(
        "📚 ANNÉE CHOISIE =",
        anneeChoisie
    );


    // =====================================================
    // VARIABLES COMMUNES
    // =====================================================

    let affectationActive =
        null;

    let affectationPourAnnee =
        null;

    let mode =
        "normal";

    let lectureSeule =
        false;

    let permissions =
        {};


    // =====================================================
    // AGENT
    // =====================================================

    if (
        account.role ===
        "agent"
    ) {

        console.log(
            "👔 UTILISATEUR = AGENT"
        );


        // =================================================
        // AFFECTATION ACTIVE
        // =================================================

        console.log(
            "🔎 Lecture affectation active..."
        );

        affectationActive =
            await getAffectationActive(
                profile.matricule
            );

        console.log(
            "✅ AFFECTATION ACTIVE OK",
            affectationActive
        );


        // =================================================
        // AFFECTATION POUR L'ANNÉE
        // =================================================

        if (
            anneeChoisie
        ) {

            console.log(
                "🔎 Lecture affectation année..."
            );

            affectationPourAnnee =
                await getAffectationPourAnnee(
                    profile.matricule,
                    anneeChoisie
                );

            console.log(
                "✅ AFFECTATION ANNÉE OK",
                affectationPourAnnee
            );

        }


        console.log(
            "📚 AFFECTATION POUR L'ANNÉE =",
            affectationPourAnnee
        );

        console.log(
            "📍 AFFECTATION ACTIVE =",
            affectationActive
        );


        // =================================================
        // AUCUNE AFFECTATION POUR CETTE ANNÉE
        // =================================================

        if (
            anneeChoisie &&
            !affectationPourAnnee
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        // =================================================
        // ANNÉE HISTORIQUE
        // =================================================

        if (
            affectationPourAnnee &&
            affectationPourAnnee.statut !==
                "active"
        ) {

            mode =
                "lecture";

            lectureSeule =
                true;

            console.log(
                "🔒 AGENT — MODE LECTURE SEULE"
            );

        }


        // =================================================
        // POSTE / PERMISSIONS
        // =================================================

        const posteId =
            affectationPourAnnee?.posteId ||
            affectationActive?.posteId ||
            null;


        console.log(
            "🪪 POSTE ID =",
            posteId
        );


        if (
            posteId
        ) {

            console.log(
                "🔎 Lecture permissionsPostes/" +
                posteId
            );

            const permissionsRef =
                doc(
                    db,
                    "permissionsPostes",
                    posteId
                );

            const permissionsSnap =
                await getDoc(
                    permissionsRef
                );

            console.log(
                "✅ PERMISSIONS POSTE OK"
            );

            if (
                permissionsSnap.exists()
            ) {

                permissions =
                    permissionsSnap
                        .data()
                        .permissions ||
                    {};

            }

            console.log(
                "🔐 PERMISSIONS =",
                permissions
            );

        }

    }


    // =====================================================
    // ÉTUDIANT
    // =====================================================

    else if (
        account.role ===
        "etudiant"
    ) {

        console.log(
            "🎓 UTILISATEUR = ÉTUDIANT"
        );

        const anneeAcademiqueEtudiant =
            profile.anneeAcademique ||
            null;

        console.log(
            "🎓 ANNÉE ÉTUDIANT =",
            anneeAcademiqueEtudiant
        );


        const anneeCourante =
            await getAnneeAcademiqueCourante();

        console.log(
            "📅 ANNÉE COURANTE DU SYSTÈME =",
            anneeCourante
        );


        const anneesEtudiant =
            await getAnneesAcademiquesEtudiant(
                profile.matricule
            );

        console.log(
            "🎓 ANNÉES ACADÉMIQUES DE L'ÉTUDIANT =",
            anneesEtudiant
        );


        if (
            anneeAcademiqueEtudiant &&
            !anneesEtudiant.includes(
                anneeAcademiqueEtudiant
            )
        ) {

            anneesEtudiant.push(
                anneeAcademiqueEtudiant
            );

        }


        if (
            !anneeChoisie
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        if (
            !anneesEtudiant.includes(
                anneeChoisie
            )
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        if (
            anneeChoisie !==
            anneeAcademiqueEtudiant
        ) {

            mode =
                "lecture";

            lectureSeule =
                true;

            console.log(
                "🔒 ÉTUDIANT — ANNÉE HISTORIQUE"
            );

        } else {

            mode =
                "normal";

            lectureSeule =
                false;

            console.log(
                "🔓 ÉTUDIANT — ANNÉE ACTUELLE"
            );

        }

    }


    // =====================================================
    // RÔLE INCONNU
    // =====================================================

    else {

        throw new Error(
            "UNKNOWN_ROLE"
        );

    }


    console.timeEnd(
        "PROFILE"
    );


    // =====================================================
    // UTILISATEUR COURANT
    // =====================================================

    currentUserCache = {

        account,

        profile: {

            ...profile,

            affectationActive,

            posteId:
                affectationPourAnnee?.posteId ||
                affectationActive?.posteId ||
                null,

            permissions

        },

        affectation:
            affectationPourAnnee,

        mode,

        lectureSeule,

        anneeAcademique:
            anneeChoisie

    };


    console.log(
        "✅ CURRENT USER FINAL =",
        currentUserCache
    );


    return currentUserCache;

}


/* =====================================================
   CACHE
===================================================== */

export function clearCurrentUserCache() {

    currentUserCache =
        null;

    clearSession();

}


/* =====================================================
   RECHERCHE UTILISATEUR
===================================================== */

/**
 * Recherche un utilisateur par matricule.
 */

/* =====================================================
   API ACTIVATION
===================================================== */

const API_URL =
    "http://192.168.1.6:3000/api/auth";


/* =====================================================
   RECHERCHE UTILISATEUR POUR ACTIVATION
===================================================== */

export async function findUserByMatricule(
    matricule
) {

    if (!matricule) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }


    const response =
        await fetch(
            `${API_URL}/activation-user`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        matricule

                    })

            }
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success ||
        !result.user
    ) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }


    return result.user;

}


/* =====================================================
   VÉRIFICATION MATRICULE
===================================================== */

export async function checkMatricule(
    matricule
) {

    if (!matricule) {

        return false;

    }


    console.log(
        "Recherche activation :",
        matricule
    );


    try {

        const response =
            await fetch(
                `${API_URL}/check-matricule`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            matricule

                        })

                }
            );


        const result =
            await response.json();


        console.log(
            "Résultat activation :",
            result
        );


        if (
            !response.ok
        ) {

            return false;

        }


        return (
            result.exists === true
        );


    } catch (error) {

        console.error(
            "❌ Erreur vérification matricule :",
            error
        );


        return false;

    }

}


/* =====================================================
   ACTIVATION
===================================================== */

function maskEmail(
    email
) {

    if (!email) {

        return "";

    }


    const parts =
        email.split("@");


    if (
        parts.length !== 2
    ) {

        return email;

    }


    const nom =
        parts[0];

    const domaine =
        parts[1];


    return (

        nom.substring(
            0,
            2
        )

        +

        "*".repeat(
            Math.max(
                1,
                nom.length - 2
            )
        )

        +

        "@"

        +

        domaine

    );

}


function maskPhone(
    phone
) {

    if (
        phone === undefined ||
        phone === null ||
        phone === ""
    ) {

        return "";

    }


    const numero =
        String(phone);


    if (
        numero.length < 4
    ) {

        return numero;

    }


    return (

        numero.substring(
            0,
            2
        )

        +

        " *** ** "

        +

        numero.substring(
            numero.length - 2
        )

    );

}


export async function getActivationInfos(
    matricule
) {

    const user =
        await findUserByMatricule(
            matricule
        );


    return {

        email:
            maskEmail(
                user.email
            ),

        phone:
            maskPhone(
                user.telephone
            )

    };

}

/* =====================================================
   RECHERCHE UTILISATEUR POUR LOGIN
===================================================== */

export async function findUser(matricule) {

    if (!matricule) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }

    const response =
        await fetch(
            `${API_URL}/login-user`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify({

                        matricule

                    })

            }
        );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.user
    ) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }

    return result.user;
}