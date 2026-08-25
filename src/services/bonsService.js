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
// CONSTANTES
// =====================================================

export const STATUTS_BON = {
    ENVOYE: "envoye",
    RECU: "recu",
    EN_COURS: "en_cours",
    TERMINE: "termine",
    NON_TERMINE: "non_termine"
};

export const CAUSE_NEGLIGE = "Négligé";


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
    localisation = "",
    niveau = "",
    cote = "",
    demandeId = null,
    agentMatricule,
    agentNom,
    anneeAcademique
}) {

    if (
        !date ||
        !site ||
        !pavillon ||
        !type ||
        !description ||
        !agentMatricule ||
        !anneeAcademique
    ) {
        throw new Error(
            "DONNEES_BON_INCOMPLETES"
        );
    }


    // =================================================
    // CONTRÔLE DE LA DATE DU BON
    // =================================================
    //
    // Seules deux dates sont autorisées :
    //
    // aujourd'hui  → OK
    // demain       → OK
    //
    // hier         → INTERDIT
    // après-demain → INTERDIT
    //
    // =================================================

    const dateBon =
        obtenirDateDuBon({
            date
        });

    if (!dateBon) {

        throw new Error(
            "DATE_BON_INVALIDE"
        );
    }


    const maintenant =
        new Date();

    const aujourdHui =
        new Date(
            maintenant
        );

    aujourdHui.setHours(
        0,
        0,
        0,
        0
    );


    const demain =
        new Date(
            aujourdHui
        );

    demain.setDate(
        demain.getDate() + 1
    );


    if (
        dateBon.getTime() !== aujourdHui.getTime() &&
        dateBon.getTime() !== demain.getTime()
    ) {

        throw new Error(
            "DATE_BON_NON_AUTORISEE"
        );
    }


    // =================================================
    // DONNÉES DU BON
    // =================================================

    const bon = {

        date,
        anneeAcademique,
        site,
        pavillon,
        type,
        description,

        localisation,
        niveau,
        cote,

        chambre,

        // =================================================
        // STATUT INITIAL
        // =================================================

        statut:
            STATUTS_BON.ENVOYE,

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
        // LIEN DEMANDE ÉTUDIANT
        // =================================================

        demandeId:
            demandeId || null,

        // =================================================
        // SUPPRESSION LOGIQUE
        // =================================================

        supprime:
            false,

        // =================================================
        // ARCHIVAGE
        // =================================================

        archive:
            false,

        archivedAt:
            null,

        // =================================================
        // DATE DE CRÉATION
        // =================================================

        createdAt:
            serverTimestamp(),

        // =================================================
        // DATES DE TRAITEMENT ATELIER
        // =================================================

        atelierReceptionAt:
            null,

        atelierPriseEnChargeAt:
            null,

        atelierTermineAt:
            null,

        atelierNonTermineAt:
            null,

        // =================================================
        // RAPPEL / NÉGLIGÉ
        // =================================================

        rappelEnvoye:
            false,

        rappelAt:
            null,

        negligeAt:
            null
    };


    // =====================================================
    // ENREGISTREMENT FIRESTORE
    // =====================================================

    const reference =
        await addDoc(
            collection(
                db,
                "bons"
            ),
            bon
        );


    // =====================================================
    // NOTIFICATION : NOUVEAU BON
    // =====================================================

    await createNotificationAtelier({

        site,

        anneeAcademique,

        type:
            "nouveau_bon",

        titre:
            "Nouveau bon reçu",

        message:
            `Un nouveau bon de travail a été reçu pour le pavillon ${pavillon}.`,

        bonId:
            reference.id
    });


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
    anneeAcademique,
    type,
    titre,
    message,
    bonId = null
}) {

    if (
        !site ||
        !anneeAcademique ||
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

        anneeAcademique,

        type,

        titre,

        message,

        bonId,

        lu:
            false,

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

    if (anneeAcademique) {

    contraintes.push(
        where(
            "anneeAcademique",
            "==",
            anneeAcademique
        )
    );
}


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
// RÉCUPÉRER UN BON
// =====================================================

export async function getBon(
    bonId
) {

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


    return {

        id:
            snapshot.id,

        ...snapshot.data()
    };
}


// =====================================================
// MODIFIER LE STATUT D'UN BON
// =====================================================

export async function updateBonStatut(
    bonId,
    statut,
    cause = "",
    agent = {}
) {

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
    // VÉRIFICATION DU STATUT
    // =================================================

    const statutsAutorises =
        Object.values(
            STATUTS_BON
        );


    if (
        !statutsAutorises.includes(
            statut
        )
    ) {

        throw new Error(
            "STATUT_BON_INVALIDE"
        );
    }


    // =================================================
    // DONNÉES COMMUNES
    // =================================================

    const modification = {

        statut,

        cause:
            cause || "",

        atelierAgentMatricule:
            agent.matricule || "",

        atelierAgentNom:
            `${agent.prenom || ""} ${agent.nom || ""}`
                .trim()
    };


    // =================================================
    // RÉCEPTION
    // =================================================

    if (
        statut ===
        STATUTS_BON.RECU
    ) {

        modification.atelierReceptionAt =
            serverTimestamp();

        modification.rappelEnvoye =
            false;

        modification.rappelAt =
            null;
    }


    // =================================================
    // PRISE EN CHARGE
    // =================================================

    if (
        statut ===
        STATUTS_BON.EN_COURS
    ) {

        modification.atelierPriseEnChargeAt =
            serverTimestamp();

        modification.rappelEnvoye =
            false;

        modification.rappelAt =
            null;
    }


    // =================================================
    // TERMINÉ
    // =================================================

    if (
        statut ===
        STATUTS_BON.TERMINE
    ) {

        modification.atelierTermineAt =
            serverTimestamp();

        await updateDoc(
            reference,
            modification
        );


        await createNotificationAtelier({

            site:
                bon.site,

             anneeAcademique:
                bon.anneeAcademique,

            type:
                "bon_termine",

            titre:
                "Bon terminé",

            message:
                `Vous avez terminé le travail du bon de type ${bon.type} du pavillon ${bon.pavillon}.`,

            bonId
        });


        return;
    }


    // =================================================
    // NON TERMINÉ
    // =================================================

    if (
        statut ===
        STATUTS_BON.NON_TERMINE
    ) {

        if (!cause) {

            throw new Error(
                "CAUSE_NON_TERMINE_MANQUANTE"
            );
        }


        modification.atelierNonTermineAt =
            serverTimestamp();


        await updateDoc(
            reference,
            modification
        );


        await createNotificationAtelier({

            site:
                bon.site,

             anneeAcademique:
                bon.anneeAcademique,

            type:
                "bon_non_termine",

            titre:
                "Bon non terminé",

            message:
                `Vous avez indiqué que le travail du bon de type ${bon.type} du pavillon ${bon.pavillon} n'est pas terminé. Cause : ${cause}.`,

            bonId
        });


        return;
    }


    // =================================================
    // AUTRES STATUTS
    // =================================================

    await updateDoc(
        reference,
        modification
    );
}


// =====================================================
// ARCHIVER UN BON
// =====================================================

export async function archiverBon(
    bonId,
    cause = null
) {

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


    const modification = {

        archive:
            true,

        archivedAt:
            serverTimestamp()
    };


    // =================================================
    // CAS NÉGLIGÉ
    // =================================================

    if (
        cause ===
        CAUSE_NEGLIGE
    ) {

        modification.statut =
            STATUTS_BON.NON_TERMINE;

        modification.cause =
            CAUSE_NEGLIGE;

        modification.negligeAt =
            serverTimestamp();


        await updateDoc(
            reference,
            modification
        );


        await createNotificationAtelier({

            site:
                bon.site,

             anneeAcademique:
                bon.anneeAcademique,

            type:
                "bon_neglige",

            titre:
                "Bon négligé",

            message:
                `Le bon de type ${bon.type} du pavillon ${bon.pavillon} n'a pas été finalisé dans le délai prévu. Il a été classé comme négligé.`,

            bonId
        });


        return;
    }


    // =================================================
    // ARCHIVAGE NORMAL
    // =================================================

    await updateDoc(
        reference,
        modification
    );
}


// =====================================================
// SUPPRESSION LOGIQUE
// =====================================================

export async function deleteBon(
    bonId
) {

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
    // SEUL UN BON ENVOYÉ PEUT ÊTRE SUPPRIMÉ
    // =================================================

    if (
        bon.statut !==
        STATUTS_BON.ENVOYE
    ) {

        throw new Error(
            "BON_NON_SUPPRIMABLE"
        );
    }


    await updateDoc(

        reference,

        {
            supprime:
                true
        }
    );
}


// =====================================================
// RAPPEL D'UN BON EN ATTENTE
// =====================================================

export async function envoyerRappelBon(
    bonId
) {

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
    // FINALISÉ / ARCHIVÉ / SUPPRIMÉ
    // =================================================

    if (
        bon.statut ===
            STATUTS_BON.TERMINE ||
        bon.statut ===
            STATUTS_BON.NON_TERMINE ||
        bon.archive === true ||
        bon.supprime === true
    ) {

        return;
    }


    // =================================================
    // ÉVITER LES DOUBLES RAPPELS
    // =================================================

    if (
        bon.rappelEnvoye === true
    ) {

        return;
    }


    await createNotificationAtelier({

        site:
            bon.site,

         anneeAcademique:
            bon.anneeAcademique,

        type:
            "rappel_bon",

        titre:
            "Bon en attente de finalisation",

        message:
            `Le bon de type ${bon.type} du pavillon ${bon.pavillon} attend toujours d'être finalisé.`,

        bonId
    });


    await updateDoc(

        reference,

        {
            rappelEnvoye:
                true,

            rappelAt:
                serverTimestamp()
        }
    );
}


// =====================================================
// MARQUER UN BON COMME NÉGLIGÉ
// =====================================================

export async function marquerBonNeglige(
    bonId
) {

    if (!bonId) {

        throw new Error(
            "BON_ID_MANQUANT"
        );
    }


    const bon =
        await getBon(
            bonId
        );


    // =================================================
    // SI DÉJÀ FINALISÉ
    // =================================================

    if (
        bon.statut ===
            STATUTS_BON.TERMINE ||
        bon.statut ===
            STATUTS_BON.NON_TERMINE ||
        bon.archive === true ||
        bon.supprime === true
    ) {

        return;
    }


    await archiverBon(

        bonId,

        CAUSE_NEGLIGE
    );
}


// =====================================================
// CONTRÔLE QUOTIDIEN DES BONS
// =====================================================
//
// RÈGLE MÉTIER
//
// J = date du bon
//
// J + 0
// → le bon reste actif
//
// J + 1
// → si terminé / non terminé : archivage immédiat
// → si encore en cours : rappel
//
// J + 2
// → si toujours actif :
//      statut = non_termine
//      cause = Négligé
//      archivage automatique
//
// =====================================================

export async function controlerDelaisBons({
    site = null
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


    const snapshot =
        await getDocs(
            requete
        );


    const maintenant =
        new Date();


    const debutJour =
        new Date(
            maintenant
        );

    debutJour.setHours(
        0,
        0,
        0,
        0
    );


    const resultats = {

        rappels:
            0,

        archives:
            0,

        negliges:
            0
    };


    for (
        const documentSnapshot
        of snapshot.docs
    ) {

        const bon = {

            id:
                documentSnapshot.id,

            ...documentSnapshot.data()
        };


        // =================================================
        // IGNORER SUPPRIMÉS / DÉJÀ ARCHIVÉS
        // =================================================

        if (
            bon.archive === true ||
            bon.supprime === true
        ) {

            continue;
        }


        // =================================================
        // DATE DU BON
        // =================================================

        const dateBon =
            obtenirDateDuBon(
                bon
            );


        if (!dateBon) {

            continue;
        }


        dateBon.setHours(
            0,
            0,
            0,
            0
        );


        const differenceJours =
            Math.floor(
                (
                    debutJour.getTime() -
                    dateBon.getTime()
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        // =================================================
        // BON FINALISÉ
        // =================================================
        //
        // Exemple :
        // Bon du lundi terminé mardi.
        //
        // Mardi :
        // différence = 1
        //
        // → archivage immédiat.
        //
        // =================================================

        if (
            bon.statut ===
                STATUTS_BON.TERMINE ||
            bon.statut ===
                STATUTS_BON.NON_TERMINE
        ) {

            if (
                differenceJours >= 1
            ) {

                await archiverBon(
                    bon.id
                );

                resultats.archives++;
            }

            continue;
        }


        // =================================================
        // JOUR DU BON
        // =================================================

        if (
            differenceJours <= 0
        ) {

            continue;
        }


        // =================================================
        // PREMIER JOUR APRÈS LE BON
        // → RAPPEL
        // =================================================

        if (
            differenceJours === 1
        ) {

            await envoyerRappelBon(
                bon.id
            );

            resultats.rappels++;

            continue;
        }


        // =================================================
        // DEUXIÈME JOUR APRÈS LE BON
        // → NÉGLIGÉ
        // =================================================

        if (
            differenceJours >= 2
        ) {

            await marquerBonNeglige(
                bon.id
            );

            resultats.negliges++;
        }
    }


    return resultats;
}


// =====================================================
// OBTENIR LA DATE DU BON
// =====================================================
//
// La fonction accepte :
//
// obtenirDateDuBon(bon)
//
// ou
//
// obtenirDateDuBon({ date })
//
// =====================================================

function obtenirDateDuBon(
    bon
) {

    if (
        !bon?.date
    ) {

        return null;
    }


    // =================================================
    // DATE YYYY-MM-DD
    // =================================================

    if (
        typeof bon.date ===
        "string"
    ) {

        const correspondance =
            bon.date.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (
            correspondance
        ) {

            const date =
                new Date(
                    Number(
                        correspondance[1]
                    ),
                    Number(
                        correspondance[2]
                    ) - 1,
                    Number(
                        correspondance[3]
                    )
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                return date;
            }
        }
    }


    // =================================================
    // FIREBASE TIMESTAMP / AUTRE DATE
    // =================================================

    if (
        typeof bon.date.toDate ===
        "function"
    ) {

        const date =
            bon.date.toDate();


        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {

            date.setHours(
                0,
                0,
                0,
                0
            );

            return date;
        }
    }


    const date =
        new Date(
            bon.date
        );


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        date.setHours(
            0,
            0,
            0,
            0
        );

        return date;
    }


    return null;
}