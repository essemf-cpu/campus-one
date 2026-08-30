import {
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";


// =====================================================
// CRÉER UNE NOTIFICATION HÉBERGEMENT
// =====================================================
//
// Même principe que createNotificationAtelier
// (src/services/bonsService.js) : un document dédié
// dans une collection "notificationsHebergement",
// au lieu de dériver les notifications en lisant
// "demandes_etudiants" à la volée.
//
// =====================================================

export async function createNotificationHebergement({
    site,
    pavillon,
    anneeAcademique,
    type,
    titre,
    message,
    demandeId = null
}) {

    if (
        !site ||
        !pavillon ||
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

        pavillon,

        anneeAcademique,

        type,

        titre,

        message,

        demandeId,

        lu:
            false,

        createdAt:
            serverTimestamp()
    };


    const reference =
        await addDoc(
            collection(
                db,
                "notificationsHebergement"
            ),
            notification
        );


    return {

        id:
            reference.id,

        ...notification
    };

}