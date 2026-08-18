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

export async function login(email, password) {

    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function logout() {

    return signOut(auth);

}

export async function forgotPassword(email) {

    return sendPasswordResetEmail(
        auth,
        email
    );

}

// =====================================================
// AFFECTATION ACTIVE DE L'AGENT
// =====================================================

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

                    // -----------------------------------------
                    // L'affectation doit être active
                    // -----------------------------------------

                    if (
                        affectation.statut !==
                        "active"
                    ) {

                        return false;

                    }


                    // -----------------------------------------
                    // Date de début
                    // -----------------------------------------

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


                    // -----------------------------------------
                    // Date de fin
                    // -----------------------------------------

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


    // =====================================================
    // UNE SEULE AFFECTATION ACTIVE ATTENDUE
    // =====================================================

    if (
        affectationsActives.length === 0
    ) {

        return null;

    }


    // =====================================================
    // SI PLUSIEURS AFFECTATIONS SONT
    // ACTIVES PAR ERREUR
    // =====================================================

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

// =====================================================
// AFFECTATION D'UN AGENT POUR UNE ANNÉE ACADÉMIQUE
// =====================================================

async function getAffectationPourAnnee(
    agentMatricule,
    anneeAcademique
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
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            )

        );


    if (snapshot.empty) {

        return null;

    }


    // =================================================
    // ON RÉCUPÈRE LES AFFECTATIONS DE CETTE ANNÉE
    // =================================================

    const affectations =
        snapshot.docs.map(
            document => ({

                id:
                    document.id,

                ...document.data()

            })
        );


    // =================================================
    // ON PREND L'AFFECTATION LA PLUS RÉCENTE
    // =================================================

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


            return dateB - dateA;

        }
    );


    return affectations[0];

}

/* ===========================
   UTILISATEURS
=========================== */

export async function getCurrentUser(uid) {

    const accountRef =
        doc(
            db,
            "users",
            uid
        );

    const accountSnap =
        await getDoc(
            accountRef
        );


    if (
        !accountSnap.exists()
    ) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }


    const account =
        accountSnap.data();


    const profileRef =
        doc(
            db,
            account.profile
        );


    const profileSnap =
        await getDoc(
            profileRef
        );


    if (
        !profileSnap.exists()
    ) {

        throw new Error(
            "PROFILE_NOT_FOUND"
        );

    }


    const profile =
        profileSnap.data();


    console.time("PROFILE");


    // =====================================================
    // ANNÉE ACADÉMIQUE CHOISIE
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

    let affectationActive = null;

    let affectationPourAnnee = null;

    let mode = "normal";

    let lectureSeule = false;

    let permissions = {};



    // =====================================================
    // AGENT
    // =====================================================

    if (
        account.role ===
        "agent"
    ) {

        // -------------------------------------------------
        // AFFECTATION ACTUELLE
        // -------------------------------------------------

        affectationActive =
            await getAffectationActive(
                profile.matricule
            );


        // -------------------------------------------------
        // AFFECTATION DE L'ANNÉE CHOISIE
        // -------------------------------------------------

        if (
            anneeChoisie
        ) {

            affectationPourAnnee =
                await getAffectationPourAnnee(
                    profile.matricule,
                    anneeChoisie
                );

        }


        console.log(
            "📚 AFFECTATION POUR CETTE ANNÉE =",
            affectationPourAnnee
        );


        console.log(
            "📍 AFFECTATION ACTIVE =",
            affectationActive
        );


        // -------------------------------------------------
        // AUCUNE AFFECTATION
        // -------------------------------------------------

        if (
            anneeChoisie &&
            !affectationPourAnnee
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        // -------------------------------------------------
        // ANNÉE COURANTE DE L'AGENT
        // -------------------------------------------------

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
                "🔒 MODE LECTURE SEULE"
            );

        }


        // -------------------------------------------------
        // PERMISSIONS DU POSTE
        // -------------------------------------------------

        const posteId =
            affectationPourAnnee?.posteId ||
            affectationActive?.posteId ||
            null;


        if (
            posteId
        ) {

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


            if (
                permissionsSnap.exists()
            ) {

                permissions =
                    permissionsSnap
                        .data()
                        .permissions || {};

            }

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
            "🎓 CONTRÔLE ANNÉE ÉTUDIANT"
        );


        // -------------------------------------------------
        // RÉCUPÉRER L'HISTORIQUE D'HÉBERGEMENT
        // -------------------------------------------------

        const hebergementsQuery =
            query(

                collection(
                    db,
                    "hebergements"
                ),

                where(
                    "matricule",
                    "==",
                    profile.matricule
                )

            );


        const hebergementsSnapshot =
            await getDocs(
                hebergementsQuery
            );


        const hebergements =
            hebergementsSnapshot.docs.map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            );


        console.log(
            "🏠 HISTORIQUE HÉBERGEMENT =",
            hebergements
        );


        // -------------------------------------------------
        // ANNÉES DANS LESQUELLES L'ÉTUDIANT EXISTE
        // -------------------------------------------------

        const anneesEtudiant =
            [
                ...new Set(

                    hebergements

                        .map(
                            hebergement =>
                                hebergement.anneeAcademique
                        )

                        .filter(Boolean)

                )
            ];


        console.log(
            "🎓 ANNÉES AUTORISÉES ÉTUDIANT =",
            anneesEtudiant
        );


        // -------------------------------------------------
        // DÉTERMINER L'ANNÉE COURANTE
        // -------------------------------------------------

        const anneesSnapshot =
            await getDocs(
                collection(
                    db,
                    "anneesAcademiques"
                )
            );


        const anneesActives =
            anneesSnapshot.docs

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


        const anneeCourante =
            anneesActives[0]
                ?.libelle || null;


        console.log(
            "📅 ANNÉE COURANTE =",
            anneeCourante
        );


        // -------------------------------------------------
        // ANNÉE NON AUTORISÉE
        // -------------------------------------------------

        if (
            anneeChoisie &&
            anneeChoisie !==
                anneeCourante &&
            !anneesEtudiant.includes(
                anneeChoisie
            )
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        // -------------------------------------------------
        // ANNÉE HISTORIQUE
        // -------------------------------------------------

        if (
            anneeChoisie &&
            anneeChoisie !==
                anneeCourante
        ) {

            mode =
                "lecture";

            lectureSeule =
                true;


            console.log(
                "🔒 ÉTUDIANT EN MODE LECTURE SEULE"
            );

        }


        // -------------------------------------------------
        // ANNÉE COURANTE
        // -------------------------------------------------

        else {

            mode =
                "normal";

            lectureSeule =
                false;


            console.log(
                "🔓 ÉTUDIANT EN MODE NORMAL"
            );

        }

    }



    // =====================================================
    // UTILISATEUR INCONNU
    // =====================================================

    else {

        throw new Error(
            "UNKNOWN_ROLE"
        );

    }


    console.timeEnd("PROFILE");


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


    return currentUserCache;

}

export function clearCurrentUserCache() {

    currentUserCache = null;

    clearSession();

}

/**
 * Recherche un utilisateur par matricule
 */
export async function findUserByMatricule(matricule) {

    // Recherche chez les agents
    let snapshot = await getDocs(
        query(
            collection(db, "agents"),
            where("matricule", "==", matricule)
        )
    );

    if (!snapshot.empty) {

        return snapshot.docs[0].data();

    }

    // Recherche chez les étudiants
    snapshot = await getDocs(
        query(
            collection(db, "etudiants"),
            where("matricule", "==", matricule)
        )
    );

    if (!snapshot.empty) {

        return snapshot.docs[0].data();

    }

    throw new Error("USER_NOT_FOUND");

}

/**
 * Vérifie si un matricule existe
 * chez les agents ou les étudiants.
 */
export async function checkMatricule(matricule) {

    console.log("Recherche :", matricule);

    const collections = [
        "agents",
        "etudiants"
    ];

    for (const collectionName of collections) {

        const snapshot = await getDocs(

            


            query(

                collection(db, collectionName),

                where("matricule", "==", matricule)

            )

        );
        const all = await getDocs(collection(db, collectionName));
        all.forEach(doc => {

    console.log(doc.id, doc.data());

});

        console.log(collectionName, snapshot.size);

        if (!snapshot.empty) {

            return true;

        }

    }

    return false;

}

/* ===========================
   ACTIVATION
=========================== */

function maskEmail(email) {

    const [nom, domaine] = email.split("@");

    return (
        nom.substring(0, 2) +
        "*".repeat(Math.max(1, nom.length - 2)) +
        "@" +
        domaine
    );

}

function maskPhone(phone) {

    const numero = phone.toString();

    return (
        numero.substring(0, 2) +
        " *** ** " +
        numero.substring(numero.length - 2)
    );

}

export async function getActivationInfos(matricule) {

    const user = await findUserByMatricule(matricule);

    return {

        email: maskEmail(user.email),

        phone: maskPhone(user.telephone)

    };

}

export async function findUser(matricule) {

    const collections = [
        "agents",
        "etudiants"
    ];

    for (const collectionName of collections) {

        const snapshot = await getDocs(

            query(

                collection(db, collectionName),

                where("matricule", "==", matricule)

            )

        );

        if (!snapshot.empty) {

            return {

                ...snapshot.docs[0].data(),

                collection: collectionName

            };

        }

    }

    throw new Error("USER_NOT_FOUND");

}