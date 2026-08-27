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
                ),

                where(
                    "statut",
                    "==",
                    "active"
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

                    const dateDebut =
                        affectation.dateDebut?.toDate
                            ? affectation.dateDebut.toDate()
                            : affectation.dateDebut
                                ? new Date(
                                    affectation.dateDebut
                                )
                                : null;


                    if (
                        dateDebut &&
                        dateDebut > maintenant
                    ) {

                        return false;

                    }


                    if (
                        affectation.dateFin
                    ) {

                        const dateFin =
                            affectation.dateFin?.toDate
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
                a.dateDebut?.toDate
                    ? a.dateDebut.toDate()
                    : a.dateDebut
                        ? new Date(
                            a.dateDebut
                        )
                        : new Date(0);


            const dateB =
                b.dateDebut?.toDate
                    ? b.dateDebut.toDate()
                    : b.dateDebut
                        ? new Date(
                            b.dateDebut
                        )
                        : new Date(0);


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
                    : a.dateDebut
                        ? new Date(
                            a.dateDebut
                        )
                        : new Date(0);


            const dateB =
                b.dateDebut?.toDate
                    ? b.dateDebut.toDate()
                    : b.dateDebut
                        ? new Date(
                            b.dateDebut
                        )
                        : new Date(0);


            return (
                dateB -
                dateA
            );

        }
    );


    return affectations[0];

}


/* =====================================================
   ANNÉES ACADÉMIQUES DE L'ÉTUDIANT
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
   UTILISATEUR COURANT
===================================================== */

export async function getCurrentUser(
    uid
) {

    if (
        currentUserCache
    ) {

        return currentUserCache;

    }


    console.time(
        "PROFILE"
    );


    // =================================================
    // COMPTE
    // =================================================

    const accountSnap =
        await getDoc(
            doc(
                db,
                "users",
                uid
            )
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


    // =================================================
    // PROFIL
    // =================================================

    if (
        !account.profile
    ) {

        throw new Error(
            "PROFILE_NOT_FOUND"
        );

    }


    const profileSnap =
        await getDoc(
            doc(
                db,
                account.profile
            )
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


    // =================================================
    // ANNÉE CHOISIE
    // =================================================

    const anneeChoisie =
        sessionStorage.getItem(
            "anneeAcademique"
        );


    // =================================================
    // VARIABLES COMMUNES
    // =================================================

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


    // =================================================
    // AGENT
    // =================================================

    if (
        account.role ===
        "agent"
    ) {

        /*
         * Les deux lectures sont indépendantes.
         *
         * Avant :
         *
         * affectation active
         *        ↓
         * affectation année
         *        ↓
         * permissions
         *
         * Maintenant les deux affectations
         * sont demandées simultanément.
         */

        const [
            resultatAffectationActive,
            resultatAffectationAnnee
        ] =
            await Promise.all([

                getAffectationActive(
                    profile.matricule
                ),

                anneeChoisie
                    ? getAffectationPourAnnee(
                        profile.matricule,
                        anneeChoisie
                    )
                    : Promise.resolve(null)

            ]);


        affectationActive =
            resultatAffectationActive;


        affectationPourAnnee =
            resultatAffectationAnnee;


        // =================================================
        // AUCUNE AFFECTATION POUR L'ANNÉE
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

        }


        // =================================================
        // POSTE
        // =================================================

        const posteId =
            affectationPourAnnee?.posteId ||
            affectationActive?.posteId ||
            null;


        // =================================================
        // PERMISSIONS
        // =================================================

        if (
            posteId
        ) {

            const permissionsSnap =
                await getDoc(

                    doc(
                        db,
                        "permissionsPostes",
                        posteId
                    )

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


        // =================================================
        // PROFIL AGENT
        // =================================================

        currentUserCache = {

            account,

            profile: {

                ...profile,

                affectationActive,

                posteId,

                permissions

            },

            affectation:
                affectationPourAnnee,

            mode,

            lectureSeule,

            anneeAcademique:
                anneeChoisie

        };


        console.timeEnd(
            "PROFILE"
        );


        return currentUserCache;

    }


    // =================================================
    // ÉTUDIANT
    // =================================================

    if (
        account.role ===
        "etudiant"
    ) {

        const anneeAcademiqueEtudiant =
            profile.anneeAcademique ||
            null;


        /*
         * SUPPRIMÉ :
         *
         * getAnneeAcademiqueCourante()
         *
         * Cette lecture Firestore ne servait pas
         * à déterminer les droits de l'étudiant.
         */


        const anneesEtudiant =
            await getAnneesAcademiquesEtudiant(
                profile.matricule
            );


        // =================================================
        // AJOUT DE L'ANNÉE DU PROFIL
        // =================================================

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


        // =================================================
        // ANNÉE OBLIGATOIRE
        // =================================================

        if (
            !anneeChoisie
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        // =================================================
        // ANNÉE NON AUTORISÉE
        // =================================================

        if (
            !anneesEtudiant.includes(
                anneeChoisie
            )
        ) {

            throw new Error(
                "ANNEE_NON_AUTORISEE"
            );

        }


        // =================================================
        // ANNÉE HISTORIQUE
        // =================================================

        if (
            anneeChoisie !==
            anneeAcademiqueEtudiant
        ) {

            mode =
                "lecture";

            lectureSeule =
                true;

        }


        // =================================================
        // ANNÉE ACTUELLE
        // =================================================

        else {

            mode =
                "normal";

            lectureSeule =
                false;

        }


        // =================================================
        // PROFIL ÉTUDIANT
        // =================================================

        currentUserCache = {

            account,

            profile: {

                ...profile,

                affectationActive:
                    null,

                posteId:
                    null,

                permissions:
                    {}

            },

            affectation:
                null,

            mode,

            lectureSeule,

            anneeAcademique:
                anneeChoisie

        };


        console.timeEnd(
            "PROFILE"
        );


        return currentUserCache;

    }


    // =================================================
    // AUTRES RÔLES
    // =================================================

    /*
     * On ne bloque pas ici les futurs rôles.
     *
     * Ils peuvent être ajoutés progressivement.
     */

    currentUserCache = {

        account,

        profile: {

            ...profile,

            affectationActive:
                null,

            posteId:
                null,

            permissions:
                {}

        },

        affectation:
            null,

        mode:
            "normal",

        lectureSeule:
            false,

        anneeAcademique:
            anneeChoisie

    };


    console.timeEnd(
        "PROFILE"
    );


    return currentUserCache;

}


/* =====================================================
   CACHE
===================================================== */

export function clearCurrentUserCache() {

    currentUserCache =
        null;

}


/* =====================================================
   API ACTIVATION
===================================================== */

const API_URL =
    "http://192.168.1.6:3000/api/auth";

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
   RECHERCHE UTILISATEUR POUR ACTIVATION
===================================================== */

export async function findUser(matricule) {

    if (!matricule) {

        throw new Error(
            "USER_NOT_FOUND"
        );

    }

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


/* =====================================================
   VÉRIFICATION MATRICULE
===================================================== */

export async function checkMatricule(
    matricule
) {

    if (
        !matricule
    ) {

        return false;

    }


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
   MASQUAGE EMAIL
===================================================== */

function maskEmail(
    email
) {

    if (
        !email
    ) {

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


/* =====================================================
   MASQUAGE TÉLÉPHONE
===================================================== */

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


/* =====================================================
   INFORMATIONS ACTIVATION
===================================================== */

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