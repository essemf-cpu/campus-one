import {
    FieldValue
} from "firebase-admin/firestore";

import { db } from "../config/firebaseAdmin.js";


// =====================================================
// CONSTANTES
// =====================================================

const STATUTS_BON = {
    ENVOYE: "envoye",
    RECU: "recu",
    EN_COURS: "en_cours",
    TERMINE: "termine",
    NON_TERMINE: "non_termine"
};

const CAUSE_NEGLIGE = "Négligé";


// =====================================================
// CRÉER UNE NOTIFICATION ATELIER
// =====================================================

async function createNotificationAtelier({
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


    await db
        .collection("notificationsAtelier")
        .add({

            site,

            type,

            titre,

            message,

            bonId,

            lu: false,

            createdAt:
                FieldValue.serverTimestamp()

        });
}


// =====================================================
// OBTENIR DATE DU BON
// =====================================================

function obtenirDateDuBon(bon) {

    if (!bon?.date) {
        return null;
    }


    // =================================================
    // YYYY-MM-DD
    // =================================================

    if (
        typeof bon.date ===
        "string"
    ) {

        const correspondance =
            bon.date.match(
                /^(\d{4})-(\d{2})-(\d{2})$/
            );


        if (correspondance) {

            const date =
                new Date(
                    Number(correspondance[1]),
                    Number(correspondance[2]) - 1,
                    Number(correspondance[3])
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
    // FIREBASE TIMESTAMP
    // =================================================

    if (
        bon.date &&
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
            return date;
        }
    }


    // =================================================
    // AUTRE FORMAT
    // =================================================

    const date =
        new Date(
            bon.date
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return null;
    }


    return date;
}


// =====================================================
// ENVOYER RAPPEL
// =====================================================

async function envoyerRappelBon(
    bon
) {

    if (
        bon.statut ===
            STATUTS_BON.TERMINE ||
        bon.statut ===
            STATUTS_BON.NON_TERMINE ||
        bon.archive === true ||
        bon.supprime === true
    ) {
        return false;
    }


    // Éviter les doubles rappels

    if (
        bon.rappelEnvoye === true
    ) {
        return false;
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

        bonId:
            bon.id

    });


    await db
        .collection("bons")
        .doc(bon.id)
        .update({

            rappelEnvoye:
                true,

            rappelAt:
                FieldValue.serverTimestamp()

        });


    return true;
}


// =====================================================
// MARQUER BON NÉGLIGÉ
// =====================================================

async function marquerBonNeglige(
    bon
) {

    if (
        bon.statut ===
            STATUTS_BON.TERMINE ||
        bon.statut ===
            STATUTS_BON.NON_TERMINE ||
        bon.archive === true ||
        bon.supprime === true
    ) {
        return false;
    }


    const reference =
        db
            .collection("bons")
            .doc(bon.id);


    await reference.update({

        statut:
            STATUTS_BON.NON_TERMINE,

        cause:
            CAUSE_NEGLIGE,

        archive:
            true,

        archivedAt:
            FieldValue.serverTimestamp(),

        negligeAt:
            FieldValue.serverTimestamp()

    });


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

        bonId:
            bon.id

    });


    return true;
}


// =====================================================
// CONTRÔLE AUTOMATIQUE
// =====================================================

export async function controlerDelaisBonsServeur() {

    const snapshot =
        await db
            .collection("bons")
            .get();


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

        rappels: 0,

        archives: 0,

        negliges: 0

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
        // IGNORER SUPPRIMÉS / ARCHIVÉS
        // =================================================

        if (
            bon.archive === true ||
            bon.supprime === true
        ) {
            continue;
        }


        // =================================================
        // DATE
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
        // BON TERMINÉ / NON TERMINÉ
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

                await db
                    .collection("bons")
                    .doc(bon.id)
                    .update({

                        archive:
                            true,

                        archivedAt:
                            FieldValue.serverTimestamp()

                    });


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
        // J + 1
        // → RAPPEL
        // =================================================

        if (
            differenceJours === 1
        ) {

            const rappel =
                await envoyerRappelBon(
                    bon
                );


            if (rappel) {
                resultats.rappels++;
            }


            continue;
        }


        // =================================================
        // J + 2 OU PLUS
        // → NÉGLIGÉ
        // =================================================

        if (
            differenceJours >= 2
        ) {

            const neglige =
                await marquerBonNeglige(
                    bon
                );


            if (neglige) {
                resultats.negliges++;
            }
        }
    }


    return resultats;
}

// =====================================================
// CONTRÔLE AUTOMATIQUE DES DEMANDES ÉTUDIANTES
// =====================================================

export async function controlerDelaisDemandesEtudiants() {

    const snapshot =
        await db
            .collection("demandes_etudiants")
            .get();

    const maintenant =
        new Date();

    const limite =
        new Date(
            maintenant.getTime() -
            (48 * 60 * 60 * 1000)
        );

    let nonTraitees = 0;

    for (
        const documentSnapshot
        of snapshot.docs
    ) {

        const demande = {
            id:
                documentSnapshot.id,

            ...documentSnapshot.data()
        };


        // =================================================
        // SEULEMENT LES DEMANDES EN ATTENTE
        // =================================================

        if (
            demande.statut !==
            "en_attente"
        ) {
            continue;
        }


        // =================================================
        // DATE DE LA DEMANDE
        // =================================================

        if (
            !demande.date
        ) {
            continue;
        }


        let dateDemande;


        // Firebase Timestamp

        if (
            typeof demande.date.toDate ===
            "function"
        ) {

            dateDemande =
                demande.date.toDate();

        }


        // Date JS / autre format

        else {

            dateDemande =
                new Date(
                    demande.date
                );

        }


        if (
            Number.isNaN(
                dateDemande.getTime()
            )
        ) {
            continue;
        }


        // =================================================
        // PLUS DE 48 HEURES
        // =================================================

        if (
            dateDemande <=
            limite
        ) {

            await db
                .collection(
                    "demandes_etudiants"
                )
                .doc(
                    demande.id
                )
                .update({

                    statut:
                        "non_termine",

                    cause:
                        "Demande non traitée, merci de reformuler",

                    feedbackAutorise:
                        false,

                    nonTraiteeAutomatiquementAt:
                        FieldValue.serverTimestamp()

                });


            nonTraitees++;

        }

    }


    return {
        nonTraitees
    };

}