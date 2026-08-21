import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
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

    // =================================================
    // PRÉCISIONS DE LOCALISATION
    // =================================================

    localisation = "",
    niveau = "",
    cote = "",

    // =================================================
    // LIEN ÉVENTUEL AVEC UNE DEMANDE ÉTUDIANT
    // =================================================

    demandeId = null,

    // =================================================
    // AGENT QUI CRÉE LE BON
    // =================================================

    agentMatricule,
    agentNom

}) {

    // =================================================
    // VÉRIFICATION DES DONNÉES OBLIGATOIRES
    // =================================================

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


    // =================================================
    // DOCUMENT BON
    // =================================================

    const bon = {

        date,

        site,

        pavillon,

        type,

        description,

        // =================================================
        // LOCALISATION
        // =================================================

        localisation,

        niveau,

        cote,

        // =================================================
        // INFORMATIONS HÉBERGEMENT
        // =================================================

        chambre,

        toilette,

        // =================================================
        // STATUT
        // =================================================

        statut:
            "envoye",

        cause:
            "",

        // =================================================
        // TRAÇABILITÉ
        // =================================================

        par:
            agentNom ||
            agentMatricule,

        agentMatricule,

        // =================================================
        // LIEN AVEC LA DEMANDE ÉTUDIANT
        // =================================================

        demandeId:
            demandeId || null,

        // =================================================
        // SUPPRESSION LOGIQUE
        // =================================================

        supprime:
            false,

        // =================================================
        // DATE DE CRÉATION
        // =================================================

        createdAt:
            serverTimestamp()

    };


    // =================================================
    // ENREGISTREMENT FIRESTORE
    // =================================================

    const reference =
        await addDoc(
            collection(
                db,
                "bons"
            ),
            bon
        );


    // =================================================
    // RETOUR
    // =================================================

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


    // =================================================
    // SITE
    // =================================================

    if (site) {

        contraintes.push(

            where(
                "site",
                "==",
                site
            )

        );

    }


    // =================================================
    // PAVILLON
    // =================================================

    if (pavillon) {

        contraintes.push(

            where(
                "pavillon",
                "==",
                pavillon
            )

        );

    }


    // =================================================
    // REQUÊTE
    // =================================================

    let requete;


    if (
        contraintes.length > 0
    ) {

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


    // =================================================
    // RÉCUPÉRATION
    // =================================================

    const snapshot =
        await getDocs(
            requete
        );


    // =================================================
    // TRANSFORMATION
    // =================================================

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


    // =================================================
    // TRI CÔTÉ CLIENT
    // =================================================

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