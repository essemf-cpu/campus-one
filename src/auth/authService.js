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

export async function getCurrentUser(
    uid
) {

    if (
        currentUserCache
    ) {

        return currentUserCache;

    }


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


    console.time(
        "PROFILE"
    );


    /* =================================================
       ANNÉE CHOISIE À LA CONNEXION
    ================================================= */

    const anneeChoisie =
        sessionStorage.getItem(
            "anneeAcademique"
        );


    console.log(
        "📚 ANNÉE CHOISIE =",
        anneeChoisie
    );


    /* =================================================
       VARIABLES COMMUNES
    ================================================= */

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


    /* =================================================
       AGENT
    ================================================= */

    if (
        account.role ===
        "agent"
    ) {

        affectationActive =
            await getAffectationActive(
                profile.matricule
            );


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
            "📚 AFFECTATION POUR L'ANNÉE =",
            affectationPourAnnee
        );


        console.log(
            "📍 AFFECTATION ACTIVE =",
            affectationActive
        );


        /* ---------------------------------------------
           AUCUNE AFFECTATION POUR CETTE ANNÉE
        --------------------------------------------- */

        if (
            anneeChoisie &&
            !affectationPourAnnee
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        /* ---------------------------------------------
           ANNÉE HISTORIQUE AGENT
        --------------------------------------------- */

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


        /* ---------------------------------------------
           PERMISSIONS
        --------------------------------------------- */

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
                        .permissions ||
                    {};

            }

        }

    }


    /* =================================================
       ÉTUDIANT
    ================================================= */

    else if (
        account.role ===
        "etudiant"
    ) {

        console.log(
            "🎓 CONTRÔLE ANNÉE ÉTUDIANT"
        );


        /* ---------------------------------------------
           ANNÉE D'INSCRIPTION ACTUELLE
        --------------------------------------------- */

        const anneeAcademiqueEtudiant =
            profile.anneeAcademique ||
            null;


        console.log(
            "🎓 ANNÉE ÉTUDIANT =",
            anneeAcademiqueEtudiant
        );


        /* ---------------------------------------------
           ANNÉE COURANTE DU SYSTÈME
        --------------------------------------------- */

        const anneeCourante =
            await getAnneeAcademiqueCourante();


        console.log(
            "📅 ANNÉE COURANTE DU SYSTÈME =",
            anneeCourante
        );


        /* ---------------------------------------------
           HISTORIQUE ACADÉMIQUE
        --------------------------------------------- */

        const anneesEtudiant =
            await getAnneesAcademiquesEtudiant(
                profile.matricule
            );


        console.log(
            "🎓 ANNÉES ACADÉMIQUES DE L'ÉTUDIANT =",
            anneesEtudiant
        );


        /* ---------------------------------------------
           AJOUT DE L'ANNÉE ACTUELLE DU PROFIL
           
           Cela permet à un étudiant nouvellement
           créé avec seulement anneeAcademique de
           fonctionner immédiatement, même si le seed
           situationsAcademiques n'a pas encore été
           généré pour lui.
        --------------------------------------------- */

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


        /* ---------------------------------------------
           AUCUNE ANNÉE CHOISIE
        --------------------------------------------- */

        if (
            !anneeChoisie
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        /* ---------------------------------------------
           ANNÉE NON AUTORISÉE
        --------------------------------------------- */

        if (
            !anneesEtudiant.includes(
                anneeChoisie
            )
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        /* ---------------------------------------------
           ANNÉE HISTORIQUE
        --------------------------------------------- */

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

        }


        /* ---------------------------------------------
           ANNÉE ACTUELLE
        --------------------------------------------- */

        else {

            mode =
                "normal";

            lectureSeule =
                false;


            console.log(
                "🔓 ÉTUDIANT — ANNÉE ACTUELLE"
            );

        }

    }


    /* =================================================
       RÔLE INCONNU
    ================================================= */

    else {

        throw new Error(
            "UNKNOWN_ROLE"
        );

    }


    console.timeEnd(
        "PROFILE"
    );


    /* =================================================
       UTILISATEUR COURANT
    ================================================= */

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

export async function findUserByMatricule(
    matricule
) {

    let snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "agents"
                ),

                where(
                    "matricule",
                    "==",
                    matricule
                )

            )

        );


    if (
        !snapshot.empty
    ) {

        return snapshot.docs[0].data();

    }


    snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "etudiants"
                ),

                where(
                    "matricule",
                    "==",
                    matricule
                )

            )

        );


    if (
        !snapshot.empty
    ) {

        return snapshot.docs[0].data();

    }


    throw new Error(
        "USER_NOT_FOUND"
    );

}


/* =====================================================
   VÉRIFICATION MATRICULE
===================================================== */

export async function checkMatricule(
    matricule
) {

    console.log(
        "Recherche :",
        matricule
    );


    const collections = [
        "agents",
        "etudiants"
    ];


    for (
        const collectionName
        of collections
    ) {

        const snapshot =
            await getDocs(

                query(

                    collection(
                        db,
                        collectionName
                    ),

                    where(
                        "matricule",
                        "==",
                        matricule
                    )

                )

            );


        console.log(
            collectionName,
            snapshot.size
        );


        if (
            !snapshot.empty
        ) {

            return true;

        }

    }


    return false;

}


/* =====================================================
   ACTIVATION
===================================================== */

function maskEmail(
    email
) {

    const [nom, domaine] =
        email.split("@");


    return (
        nom.substring(0, 2) +
        "*".repeat(
            Math.max(
                1,
                nom.length - 2
            )
        ) +
        "@" +
        domaine
    );

}


function maskPhone(
    phone
) {

    const numero =
        phone.toString();


    return (
        numero.substring(0, 2) +
        " *** ** " +
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

export async function findUser(
    matricule
) {

    const collections = [
        "agents",
        "etudiants"
    ];


    for (
        const collectionName
        of collections
    ) {

        const snapshot =
            await getDocs(

                query(

                    collection(
                        db,
                        collectionName
                    ),

                    where(
                        "matricule",
                        "==",
                        matricule
                    )

                )

            );


        if (
            !snapshot.empty
        ) {

            return {

                ...snapshot.docs[0].data(),

                collection:
                    collectionName

            };

        }

    }


    throw new Error(
        "USER_NOT_FOUND"
    );

}