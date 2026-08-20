import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";


// =====================================================
// CRÉER UN BON
// =====================================================

export async function createBon({

    date,
    site,
    pavillon,
    type,
    description,
    chambre = "",
    toilette = "",

    // Lien éventuel avec une demande étudiant
    demandeId = null,

    // Agent qui crée le bon
    agentMatricule,
    agentNom

}) {

    if (
        !date ||
        !site ||
        !pavillon ||
        !type ||
        !description ||
        !agentMatricule
    ) {

        throw new Error(
            "DONNEES_BON_INCOMPLETES"
        );

    }


    const bon = {

        date,

        site,

        pavillon,

        type,

        description,

        chambre,

        toilette,

        statut:
            "envoye",

        cause:
            "",

        // =============================================
        // TRAÇABILITÉ
        // =============================================

        par:
            agentNom ||
            agentMatricule,

        agentMatricule,

        // =============================================
        // LIEN AVEC LA DEMANDE
        // =============================================

        demandeId:
            demandeId || null,

        // =============================================
        // SUPPRESSION LOGIQUE
        // =============================================

        supprime:
            false,

        createdAt:
            serverTimestamp()

    };


    const reference =
        await addDoc(
            collection(
                db,
                "bons"
            ),
            bon
        );


    return {

        id:
            reference.id,

        ...bon

    };

}


// =====================================================
// RÉCUPÉRER LES BONS
// =====================================================

export async function getBons({

    site = null,
    pavillon = null,
    anneeAcademique = null

} = {}) {


    const contraintes = [];


    if (site) {

        contraintes.push(
            where(
                "site",
                "==",
                site
            )
        );

    }


    if (pavillon) {

        contraintes.push(
            where(
                "pavillon",
                "==",
                pavillon
            )
        );

    }


    let requete;


    if (contraintes.length > 0) {

        requete =
            query(
                collection(
                    db,
                    "bons"
                ),
                ...contraintes
            );

    } else {

        requete =
            query(
                collection(
                    db,
                    "bons"
                )
            );

    }


    const snapshot =
        await getDocs(
            requete
        );


    let bons =
        snapshot.docs
            .map(
                document => ({

                    id:
                        document.id,

                    ...document.data()

                })
            )
            .filter(
                bon =>
                    bon.supprime !== true
            );


    // =============================================
    // TRI CÔTÉ CLIENT
    // =============================================

    bons.sort(
        (a, b) =>
            String(
                b.date || ""
            ).localeCompare(
                String(
                    a.date || ""
                )
            )
    );


    return bons;

}


// =====================================================
// MODIFIER LE STATUT D'UN BON
// =====================================================

export async function updateBonStatut(
    bonId,
    statut,
    cause = ""
) {

    if (!bonId) {

        throw new Error(
            "BON_ID_MANQUANT"
        );

    }


    await updateDoc(

        doc(
            db,
            "bons",
            bonId
        ),

        {

            statut,

            cause

        }

    );

}


// =====================================================
// SUPPRIMER UN BON
// =====================================================

export async function deleteBon(
    bonId
) {

    if (!bonId) {

        throw new Error(
            "BON_ID_MANQUANT"
        );

    }


    await updateDoc(

        doc(
            db,
            "bons",
            bonId
        ),

        {

            supprime:
                true

        }

    );

}