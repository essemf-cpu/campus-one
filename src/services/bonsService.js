import {
    collection,
    addDoc,
    getDocs,
    getDoc,
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
// NOTIFICATION : NOUVEAU BON
// =================================================

await createNotificationAtelier({

    site,

    type:
        "nouveau_bon",

    titre:
        "Nouveau bon reçu",

    message:
        `Un nouveau bon de travail a été reçu pour le pavillon ${pavillon}.`,

    bonId:
        reference.id

});


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
// CRÉER UNE NOTIFICATION ATELIER
// =====================================================

export async function createNotificationAtelier({
    site,
    type,
    titre,
    message,
    bonId = null
}) {

    if (
        !site ||
        !type ||
        !titre ||
        !message
    ) {
        throw new Error(
            "DONNEES_NOTIFICATION_INCOMPLETES"
        );
    }

    const notification = {

        site,

        type,

        titre,

        message,

        bonId,

        lu: false,

        createdAt:
            serverTimestamp()

    };

    const reference =
        await addDoc(
            collection(
                db,
                "notificationsAtelier"
            ),
            notification
        );

    return {

        id:
            reference.id,

        ...notification

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


    // =================================================
    // RÉCUPÉRER LE BON
    // =================================================

    const reference =
        doc(
            db,
            "bons",
            bonId
        );

    const snapshot =
        await getDoc(
            reference
        );


    if (!snapshot.exists()) {
        throw new Error(
            "BON_NOT_FOUND"
        );
    }


    const bon =
        snapshot.data();


    // =================================================
    // MODIFICATION DU BON
    // =================================================

    await updateDoc(
        reference,
        {
            statut,
            cause
        }
    );


    // =================================================
    // NOTIFICATION : BON TERMINÉ
    // =================================================

    if (
        statut === "termine"
    ) {

        await createNotificationAtelier({

            site:
                bon.site,

            type:
                "bon_termine",

            titre:
                "Bon terminé",

            message:
                `Le bon de travail concernant le pavillon ${bon.pavillon} est terminé.`,

            bonId

        });

    }


    // =================================================
    // NOTIFICATION : BON NON TERMINÉ
    // =================================================

    if (
        statut === "non-termine"
    ) {

        await createNotificationAtelier({

            site:
                bon.site,

            type:
                "bon_non_termine",

            titre:
                "Bon non terminé",

            message:
                cause
                    ? `Le bon concernant le pavillon ${bon.pavillon} n'a pas été terminé : ${cause}.`
                    : `Le bon concernant le pavillon ${bon.pavillon} n'a pas été terminé.`,

            bonId

        });

    }

}

// =====================================================
// SUPPRIMER LOGIQUEMENT UN BON
// =====================================================

export async function deleteBon(bonId) {

    if (!bonId) {
        throw new Error(
            "BON_ID_MANQUANT"
        );
    }

    const reference =
        doc(
            db,
            "bons",
            bonId
        );

    const snapshot =
        await getDoc(
            reference
        );

    if (!snapshot.exists()) {
        throw new Error(
            "BON_NOT_FOUND"
        );
    }

    const bon =
        snapshot.data();

    // =================================================
    // UN BON NE PEUT ÊTRE SUPPRIMÉ QUE S'IL EST ENVOYÉ
    // =================================================

    if (
        bon.statut !== "envoye"
    ) {
        throw new Error(
            "BON_NON_SUPPRIMABLE"
        );
    }

    // =================================================
    // SUPPRESSION LOGIQUE
    // =================================================

    await updateDoc(
        reference,
        {
            supprime: true
        }
    );
}