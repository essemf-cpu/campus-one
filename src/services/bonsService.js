// =====================================================
// services/bonsService.js
// =====================================================

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
        throw new Error("DONNEES_BON_INCOMPLETES");
    }

    const dateBon = obtenirDateDuBon({ date });

    if (!dateBon) {
        throw new Error("DATE_BON_INVALIDE");
    }

    const maintenant = new Date();

    const aujourdHui = new Date(maintenant);
    aujourdHui.setHours(0, 0, 0, 0);

    const demain = new Date(aujourdHui);
    demain.setDate(demain.getDate() + 1);

    if (
        dateBon.getTime() !== aujourdHui.getTime() &&
        dateBon.getTime() !== demain.getTime()
    ) {
        throw new Error("DATE_BON_NON_AUTORISEE");
    }

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

        statut: STATUTS_BON.ENVOYE,

        cause: "",

        par:
            agentNom ||
            agentMatricule,

        agentMatricule,

        demandeId:
            demandeId || null,

        supprime: false,

        archive: false,

        archivedAt: null,

        createdAt:
            serverTimestamp(),

        atelierReceptionAt: null,

        atelierPriseEnChargeAt: null,

        atelierTermineAt: null,

        atelierNonTermineAt: null,

        rappelEnvoye: false,

        rappelAt: null,

        negligeAt: null
    };

    const reference = await addDoc(
        collection(db, "bons"),
        bon
    );

    await createNotificationAtelier({

        site,

        anneeAcademique,

        type: "nouveau_bon",

        titre: "Nouveau bon reçu",

        message:
            `Un nouveau bon de travail a été reçu pour le pavillon ${pavillon}.`,

        bonId: reference.id
    });

    return {
        id: reference.id,
        ...bon
    };
}


// =====================================================
// NOTIFICATION ATELIER
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

        lu: false,

        createdAt:
            serverTimestamp()
    };

    const reference = await addDoc(
        collection(
            db,
            "notificationsAtelier"
        ),
        notification
    );

    return {
        id: reference.id,
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
            where("site", "==", site)
        );
    }

    if (pavillon) {
        contraintes.push(
            where("pavillon", "==", pavillon)
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

    const requete =
        contraintes.length > 0
            ? query(
                collection(db, "bons"),
                ...contraintes
            )
            : query(
                collection(db, "bons")
            );

    const snapshot =
        await getDocs(requete);

    const bons =
        snapshot.docs
            .map(document => ({
                id: document.id,
                ...document.data()
            }))
            .filter(
                bon =>
                    bon.supprime !== true
            );

    bons.sort(
        (a, b) =>
            String(b.date || "")
                .localeCompare(
                    String(a.date || "")
                )
    );

    return bons;
}


// =====================================================
// RÉCUPÉRER UN BON
// =====================================================

export async function getBon(bonId) {

    if (!bonId) {
        throw new Error("BON_ID_MANQUANT");
    }

    const reference =
        doc(db, "bons", bonId);

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        throw new Error("BON_NOT_FOUND");
    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}


// =====================================================
// MODIFIER LE STATUT
// =====================================================

export async function updateBonStatut(
    bonId,
    statut,
    cause = "",
    agent = {}
) {

    if (!bonId) {
        throw new Error("BON_ID_MANQUANT");
    }

    const reference =
        doc(db, "bons", bonId);

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        throw new Error("BON_NOT_FOUND");
    }

    const bon = snapshot.data();

    const statutsAutorises =
        Object.values(STATUTS_BON);

    if (!statutsAutorises.includes(statut)) {
        throw new Error("STATUT_BON_INVALIDE");
    }

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
    // REÇU
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
    // EN COURS
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
    //
    // IMPORTANT :
    // PAS D'ARCHIVAGE ICI.
    // Le bon reste visible 24 h.
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

        return;
    }


    // =================================================
    // NON TERMINÉ
    //
    // IMPORTANT :
    // PAS D'ARCHIVAGE ICI.
    // Le bon reste visible 24 h.
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
        throw new Error("BON_ID_MANQUANT");
    }

    const reference =
        doc(db, "bons", bonId);

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        throw new Error("BON_NOT_FOUND");
    }

    const bon = snapshot.data();

    const modification = {

        archive: true,

        archivedAt:
            serverTimestamp()
    };


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

            site: bon.site,

            anneeAcademique:
                bon.anneeAcademique,

            type: "bon_neglige",

            titre: "Bon négligé",

            message:
                `Le bon de type ${bon.type} du pavillon ${bon.pavillon} n'a pas été finalisé dans le délai prévu. Il a été classé comme négligé.`,

            bonId
        });

        return;
    }

    await updateDoc(
        reference,
        modification
    );
}


// =====================================================
// SUPPRESSION LOGIQUE
// =====================================================

export async function deleteBon(bonId) {

    if (!bonId) {
        throw new Error("BON_ID_MANQUANT");
    }

    const reference =
        doc(db, "bons", bonId);

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        throw new Error("BON_NOT_FOUND");
    }

    const bon = snapshot.data();

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
            supprime: true
        }
    );
}


// =====================================================
// RAPPEL
// =====================================================

export async function envoyerRappelBon(
    bonId
) {

    if (!bonId) {
        throw new Error("BON_ID_MANQUANT");
    }

    const reference =
        doc(db, "bons", bonId);

    const snapshot =
        await getDoc(reference);

    if (!snapshot.exists()) {
        throw new Error("BON_NOT_FOUND");
    }

    const bon = {
        id: snapshot.id,
        ...snapshot.data()
    };

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

    if (
        bon.rappelEnvoye === true
    ) {
        return false;
    }

    await createNotificationAtelier({

        site: bon.site,

        anneeAcademique:
            bon.anneeAcademique,

        type: "rappel_bon",

        titre:
            "Bon en attente de finalisation",

        message:
            `Le bon de type ${bon.type} du pavillon ${bon.pavillon} attend toujours d'être finalisé.`,

        bonId
    });

    await updateDoc(
        reference,
        {
            rappelEnvoye: true,

            rappelAt:
                serverTimestamp()
        }
    );

    return true;
}


// =====================================================
// MARQUER NÉGLIGÉ
// =====================================================

export async function marquerBonNeglige(
    bonId
) {

    if (!bonId) {
        throw new Error("BON_ID_MANQUANT");
    }

    const bon =
        await getBon(bonId);

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
// CONTRÔLE AUTOMATIQUE DES BONS
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

    const requete =
        contraintes.length > 0
            ? query(
                collection(db, "bons"),
                ...contraintes
            )
            : query(
                collection(db, "bons")
            );

    const snapshot =
        await getDocs(requete);

    const maintenant =
        new Date();

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


        if (
            bon.archive === true ||
            bon.supprime === true
        ) {
            continue;
        }


        // =================================================
        // TERMINÉ / NON TERMINÉ
        // → 24 H APRÈS LE CHANGEMENT DE STATUT
        // =================================================

        if (
            bon.statut ===
                STATUTS_BON.TERMINE ||
            bon.statut ===
                STATUTS_BON.NON_TERMINE
        ) {

            const dateFinalisation =
                bon.statut ===
                STATUTS_BON.TERMINE
                    ? bon.atelierTermineAt
                    : bon.atelierNonTermineAt;

            if (!dateFinalisation) {
                continue;
            }

            const dateFinalisationJS =
                convertirEnDate(
                    dateFinalisation
                );

            if (!dateFinalisationJS) {
                continue;
            }

            const age =
                maintenant.getTime() -
                dateFinalisationJS.getTime();

            if (
                age >=
                24 * 60 * 60 * 1000
            ) {

                await db
                    .collection("bons")
                    .doc(bon.id)
                    .update({

                        archive: true,

                        archivedAt:
                            FieldValue.serverTimestamp()

                    });

                resultats.archives++;
            }

            continue;
        }


        // =================================================
        // DATE DU BON
        // =================================================

        const dateBon =
            obtenirDateDuBon(bon);

        if (!dateBon) {
            continue;
        }

        dateBon.setHours(
            0, 0, 0, 0
        );

        const debutJour =
            new Date(maintenant);

        debutJour.setHours(
            0, 0, 0, 0
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


        if (
            differenceJours <= 0
        ) {
            continue;
        }


        // =================================================
        // J + 1
        // =================================================

        if (
            differenceJours === 1
        ) {

            const rappel =
                await envoyerRappelBon(
                    bon.id
                );

            if (rappel) {
                resultats.rappels++;
            }

            continue;
        }


        // =================================================
        // J + 2
        // =================================================

        if (
            differenceJours >= 2
        ) {

            const neglige =
                await marquerBonNeglige(
                    bon.id
                );

            if (neglige) {
                resultats.negliges++;
            }
        }
    }

    return resultats;
}


// =====================================================
// CONVERTIR DATE
// =====================================================

function convertirEnDate(value) {

    if (!value) {
        return null;
    }

    if (
        typeof value.toDate ===
        "function"
    ) {

        const date =
            value.toDate();

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;
    }

    if (
        value instanceof Date
    ) {
        return Number.isNaN(
            value.getTime()
        )
            ? null
            : value;
    }

    const date =
        new Date(value);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;
}


// =====================================================
// OBTENIR DATE DU BON
// =====================================================

function obtenirDateDuBon(bon) {

    if (!bon?.date) {
        return null;
    }

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

    return convertirEnDate(
        bon.date
    );
}