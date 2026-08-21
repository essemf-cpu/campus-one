import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";

// =====================================================
// CACHE
// =====================================================

const affectationsAnneeCache = new Map();
const affectationsActuellesCache = new Map();
const permissionsPostesCache = new Map();


// =====================================================
// RÉCUPÉRER L'AFFECTATION D'UNE ANNÉE
// =====================================================

export async function getAffectationPourAnnee(
    agentMatricule,
    anneeAcademique
) {

    if (
        !agentMatricule ||
        !anneeAcademique
    ) {

        return null;

    }


    const cacheKey =
        `${agentMatricule}_${anneeAcademique}`;


    if (
        affectationsAnneeCache.has(
            cacheKey
        )
    ) {

        return affectationsAnneeCache.get(
            cacheKey
        );

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

        affectationsAnneeCache.set(
            cacheKey,
            null
        );

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


            return dateB - dateA;

        }
    );


    const affectation =
        affectations[0] || null;


    affectationsAnneeCache.set(
        cacheKey,
        affectation
    );


    return affectation;

}


// =====================================================
// RÉCUPÉRER L'AFFECTATION ACTIVE
// =====================================================

export async function getAffectationActuelle(
    agentMatricule
) {

    if (
        !agentMatricule
    ) {

        return null;

    }


    if (
        affectationsActuellesCache.has(
            agentMatricule
        )
    ) {

        return affectationsActuellesCache.get(
            agentMatricule
        );

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
                    "statut",
                    "==",
                    "active"
                )

            )

        );


    if (
        snapshot.empty
    ) {

        affectationsActuellesCache.set(
            agentMatricule,
            null
        );

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


    const maintenant =
        new Date();


    const affectationsValides =
        affectations.filter(
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
                        dateFin < maintenant
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    affectationsValides.sort(
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


            return dateB - dateA;

        }
    );


    const affectation =
        affectationsValides[0] || null;


    affectationsActuellesCache.set(
        agentMatricule,
        affectation
    );


    return affectation;

}


// =====================================================
// RÉCUPÉRER LES PERMISSIONS DU POSTE
// =====================================================

export async function getPermissionsPoste(
    posteId
) {

    if (
        !posteId
    ) {

        return {};

    }


    if (
        permissionsPostesCache.has(
            posteId
        )
    ) {

        return permissionsPostesCache.get(
            posteId
        );

    }


    const snapshot =
        await getDocs(

            query(

                collection(
                    db,
                    "permissionsPostes"
                ),

                where(
                    "posteId",
                    "==",
                    posteId
                ),

                where(
                    "actif",
                    "==",
                    true
                )

            )

        );


    if (
        snapshot.empty
    ) {

        permissionsPostesCache.set(
            posteId,
            {}
        );

        return {};

    }


    const permission =
        snapshot.docs[0].data();


    const permissions =
        permission.permissions ||
        {};


    permissionsPostesCache.set(
        posteId,
        permissions
    );


    return permissions;

}


// =====================================================
// RÉSOUDRE LES DROITS DE L'AGENT
// =====================================================

export async function getAgentPermissions(
    agentMatricule,
    anneeAcademique
) {

    const affectation =
        await getAffectationPourAnnee(
            agentMatricule,
            anneeAcademique
        );


    if (
        !affectation
    ) {

        return {

            affectation:
                null,

            posteId:
                null,

            permissions:
                {},

            mode:
                "bloque",

            lectureSeule:
                false

        };

    }


    const affectationActuelle =
        await getAffectationActuelle(
            agentMatricule
        );


    const estAffectationActuelle =
        affectationActuelle &&
        affectationActuelle.id ===
            affectation.id;


    const posteId =
        affectation.posteId ||
        null;


    let permissions =
        await getPermissionsPoste(
            posteId
        );


    if (
        !estAffectationActuelle
    ) {

        permissions = {

            ...permissions,

            voirResidents:
                permissions.voirResidents === true,

            voirRecouvrement:
                permissions.voirRecouvrement === true,

            voirAnciensBons:
                permissions.voirAnciensBons === true,

            suivreBons:
                permissions.suivreBons === true,

            voirDonneesResidents:
                false,

            gererBons:
                false,

            gererReclamations:
                false

        };


        return {

            affectation,

            posteId,

            permissions,

            mode:
                "lecture",

            lectureSeule:
                true

        };

    }


    return {

        affectation,

        posteId,

        permissions,

        mode:
            "normal",

        lectureSeule:
            false

    };

}


// =====================================================
// VIDER LE CACHE
// =====================================================

export function clearPermissionsCache() {

    affectationsAnneeCache.clear();

    affectationsActuellesCache.clear();

    permissionsPostesCache.clear();

}