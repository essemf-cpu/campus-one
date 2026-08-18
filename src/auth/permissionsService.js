import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";


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


    return {

        id:
            snapshot.docs[0].id,

        ...snapshot.docs[0].data()

    };

}


// =====================================================
// RÉCUPÉRER L'AFFECTATION ACTIVE
// =====================================================

export async function getAffectationActuelle(
    agentMatricule
) {

    if (!agentMatricule) {

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
                    "statut",
                    "==",
                    "active"
                )

            )

        );


    if (
        snapshot.empty
    ) {

        return null;

    }


    return {

        id:
            snapshot.docs[0].id,

        ...snapshot.docs[0].data()

    };

}


// =====================================================
// RÉCUPÉRER LES PERMISSIONS DU POSTE
// =====================================================

export async function getPermissionsPoste(
    posteId
) {

    if (!posteId) {

        return {};

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

        return {};

    }


    const permission =
        snapshot.docs[0].data();


    return (
        permission.permissions ||
        {}
    );

}


// =====================================================
// RÉSOUDRE LES DROITS DE L'AGENT
// POUR UNE ANNÉE DONNÉE
// =====================================================

export async function getAgentPermissions(
    agentMatricule,
    anneeAcademique
) {

    // =================================================
    // AFFECTATION POUR L'ANNÉE CHOISIE
    // =================================================

    const affectation =
        await getAffectationPourAnnee(
            agentMatricule,
            anneeAcademique
        );


    console.log(
        "📅 ANNÉE CHOISIE =",
        anneeAcademique
    );


    console.log(
        "📌 AFFECTATION POUR CETTE ANNÉE =",
        affectation
    );


    // =================================================
    // AUCUNE AFFECTATION
    // =================================================

    if (!affectation) {

        return {

            affectation: null,

            posteId: null,

            permissions: {},

            mode: "bloque",

            lectureSeule: false

        };

    }


    // =================================================
    // AFFECTATION ACTIVE
    // =================================================

    const affectationActuelle =
        await getAffectationActuelle(
            agentMatricule
        );


    const estAffectationActuelle =
        affectationActuelle &&
        affectationActuelle.id ===
            affectation.id;


    // =================================================
    // POSTE
    // =================================================

    const posteId =
        affectation.posteId || null;


    let permissions =
        await getPermissionsPoste(
            posteId
        );


    // =================================================
    // ANCIENNE AFFECTATION
    // =================================================
    //
    // Une ancienne affectation peut être consultée,
    // mais jamais utilisée pour effectuer des actions.
    //
    // =================================================

    if (
        !estAffectationActuelle
    ) {

        permissions = {

            ...permissions,

            // Consultation autorisée
            voirResidents:
                permissions.voirResidents === true,

            voirRecouvrement:
                permissions.voirRecouvrement === true,

            voirAnciensBons:
                permissions.voirAnciensBons === true,

            suivreBons:
                permissions.suivreBons === true,

            // Données sensibles masquées
            voirDonneesResidents:
                false,

            // Toutes les actions sont interdites
            gererBons:
                false,

            gererReclamations:
                false

        };


        console.log(
            "🔒 MODE LECTURE SEULE"
        );


        return {

            affectation,

            posteId,

            permissions,

            mode: "lecture",

            lectureSeule: true

        };

    }


    // =================================================
    // AFFECTATION ACTUELLE
    // =================================================

    console.log(
        "🔓 MODE NORMAL"
    );


    return {

        affectation,

        posteId,

        permissions,

        mode: "normal",

        lectureSeule: false

    };

}