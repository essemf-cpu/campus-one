import { auth, db } from "../config/firebaseAdmin.js";

export async function createUserAccount(matricule, password) {

    console.log("=================================");
    console.log("ACTIVATION :", matricule);
    console.log("=================================");

    // 1. Recherche agent
    console.log("1️⃣ Recherche dans agents...");

    let doc = await db.collection("agents").doc(matricule).get();

    let collectionName = "agents";
    let role = "agent";

    // 2. Recherche étudiant
    if (!doc.exists) {

        console.log("➡️ Pas trouvé dans agents.");
        console.log("2️⃣ Recherche dans etudiants...");

        doc = await db.collection("etudiants").doc(matricule).get();

        collectionName = "etudiants";
        role = "etudiant";
    }

    if (!doc.exists) {

        console.log("❌ Utilisateur introuvable.");

        throw new Error("Utilisateur introuvable.");
    }

    console.log("✅ Utilisateur trouvé :", collectionName);

    const userData = doc.data();

    console.log("EMAIL :", userData.email);
    console.log("NOM :", userData.prenom, userData.nom);
    console.log("UID actuel :", userData.uid);

    if (userData.uid) {

        throw new Error("Ce compte est déjà activé.");
    }

    // 3. Firebase Authentication
    console.log("3️⃣ Création Firebase Authentication...");

    let user;

    try {

        user = await auth.createUser({

            email: userData.email,

            password,

            displayName:
                `${userData.prenom} ${userData.nom}`,

        });

        console.log("✅ Firebase Authentication créé :", user.uid);

    } catch (error) {

        console.error(
            "❌ ERREUR Firebase Authentication :",
            error
        );

        throw error;
    }

    // 4. Document users
    console.log("4️⃣ Création du document users...");

    try {

        await db.collection("users").doc(user.uid).set({

            uid: user.uid,

            matricule: userData.matricule,

            role,

            email: userData.email,

            profile:
                `${collectionName}/${matricule}`,

            estActif: true,

            createdAt: new Date(),

        });

        console.log("✅ Document users créé.");

    } catch (error) {

        console.error(
            "❌ ERREUR création users :",
            error
        );

        throw error;
    }

    // 5. Mise à jour étudiant/agent
    console.log("5️⃣ Mise à jour du profil...");

    try {

        await doc.ref.update({

            uid: user.uid,

            estActive: true,

            dateActivation: new Date(),

        });

        console.log("✅ Profil mis à jour.");

    } catch (error) {

        console.error(
            "❌ ERREUR mise à jour profil :",
            error
        );

        throw error;
    }

    console.log("🎉 ACTIVATION TERMINÉE");

    return {

        uid: user.uid,

        nom:
            `${userData.prenom} ${userData.nom}`,

        email:
            userData.email,

    };
}

// =====================================================
// UTILISATEUR POUR ACTIVATION
// =====================================================

export async function findActivationUser(
    matricule
) {

    if (!matricule) {

        return null;

    }


    // =================================================
    // AGENTS
    // =================================================

    let document =
        await db
            .collection("agents")
            .doc(matricule)
            .get();


    let collectionName =
        "agents";

    let role =
        "agent";


    // =================================================
    // ÉTUDIANTS
    // =================================================

    if (
        !document.exists
    ) {

        document =
            await db
                .collection("etudiants")
                .doc(matricule)
                .get();


        collectionName =
            "etudiants";

        role =
            "etudiant";

    }


    // =================================================
    // INTROUVABLE
    // =================================================

    if (
        !document.exists
    ) {

        return null;

    }


    const data =
        document.data();


    // =================================================
    // RETOUR
    // =================================================

    return {

        matricule:
            data.matricule ||
            matricule,

        prenom:
            data.prenom ||
            "",

        nom:
            data.nom ||
            "",

        email:
            data.email ||
            "",

        telephone:
            data.telephone ||
            "",

        uid:
            data.uid ||
            null,

        role,

        collection:
            collectionName

    };

}

// =====================================================
// UTILISATEUR POUR CONNEXION
// =====================================================

export async function findLoginUser(matricule) {

    if (!matricule) {
        return null;
    }


    // =================================================
    // AGENTS
    // =================================================

    let document =
        await db
            .collection("agents")
            .doc(matricule)
            .get();


    let collectionName =
        "agents";

    let role =
        "agent";


    // =================================================
    // ÉTUDIANTS
    // =================================================

    if (!document.exists) {

        document =
            await db
                .collection("etudiants")
                .doc(matricule)
                .get();


        collectionName =
            "etudiants";

        role =
            "etudiant";

    }


    // =================================================
    // INTROUVABLE
    // =================================================

    if (!document.exists) {

        return null;

    }


    const data =
        document.data();


    // =================================================
    // COMPTE NON ACTIVÉ
    // =================================================

    if (!data.email) {

        return null;

    }


    // =================================================
    // RETOUR
    // =================================================

    return {

        matricule:
            data.matricule ||
            matricule,

        prenom:
            data.prenom ||
            "",

        nom:
            data.nom ||
            "",

        email:
            data.email,

        telephone:
            data.telephone ||
            "",

        uid:
            data.uid ||
            null,

        role,

        collection:
            collectionName

    };

}

// =====================================================
// ACCEPTER UNE DEMANDE D'AMI
// =====================================================

export async function acceptFriendRequestService(
    requestId,
    matricule
) {

    const requestRef =
        db
            .collection("friendRequests")
            .doc(requestId);


    const requestSnapshot =
        await requestRef.get();


    if (
        !requestSnapshot.exists
    ) {

        throw new Error(
            "Demande introuvable."
        );

    }


    const requestData =
        requestSnapshot.data();


    // =================================================
    // LA DEMANDE DOIT ÊTRE DESTINÉE À L'UTILISATEUR
    // =================================================

    if (
        requestData.to !==
        matricule
    ) {

        throw new Error(
            "Accès refusé."
        );

    }


    // =================================================
    // LA DEMANDE DOIT ÊTRE EN ATTENTE
    // =================================================

    if (
        requestData.status !==
        "pending"
    ) {

        throw new Error(
            "Cette demande n'est plus en attente."
        );

    }


    // =================================================
    // RÉCUPÉRER LES DEUX PROFILS
    // =================================================

    const receiverSnapshot =
        await db
            .collection("etudiants")
            .where(
                "matricule",
                "==",
                matricule
            )
            .limit(1)
            .get();


    if (
        receiverSnapshot.empty
    ) {

        throw new Error(
            "Utilisateur destinataire introuvable."
        );

    }


    const senderSnapshot =
        await db
            .collection("etudiants")
            .where(
                "matricule",
                "==",
                requestData.from
            )
            .limit(1)
            .get();


    if (
        senderSnapshot.empty
    ) {

        throw new Error(
            "Utilisateur demandeur introuvable."
        );

    }


    const receiver =
        receiverSnapshot
            .docs[0]
            .data();


    const sender =
        senderSnapshot
            .docs[0]
            .data();


    // =================================================
    // VÉRIFIER SI L'AMITIÉ EXISTE DÉJÀ
    // =================================================

    const existingFriend =
        await db
            .collection("friends")
            .where(
                "userCarte",
                "==",
                matricule
            )
            .where(
                "friendCarte",
                "==",
                requestData.from
            )
            .limit(1)
            .get();


    const batch =
        db.batch();


    // =================================================
    // CRÉER LES DEUX CÔTÉS
    // =================================================

    if (
        existingFriend.empty
    ) {

        const friendA =
            db
                .collection("friends")
                .doc();


        batch.set(
            friendA,
            {

                userCarte:
                    matricule,

                userNom:
                    `${receiver.prenom || ""} ${receiver.nom || ""}`
                        .trim(),

                friendCarte:
                    requestData.from,

                friendNom:
                    `${sender.prenom || ""} ${sender.nom || ""}`
                        .trim(),

                friendAvatar:
                    sender.avatar ||
                    "",

                anneeAcademique:
                    requestData.anneeAcademique ||
                    null

            }
        );


        const friendB =
            db
                .collection("friends")
                .doc();


        batch.set(
            friendB,
            {

                userCarte:
                    requestData.from,

                userNom:
                    `${sender.prenom || ""} ${sender.nom || ""}`
                        .trim(),

                friendCarte:
                    matricule,

                friendNom:
                    `${receiver.prenom || ""} ${receiver.nom || ""}`
                        .trim(),

                friendAvatar:
                    receiver.avatar ||
                    "",

                anneeAcademique:
                    requestData.anneeAcademique ||
                    null

            }
        );

    }


    // =================================================
    // ACCEPTER LA DEMANDE
    // =================================================

    batch.update(
        requestRef,
        {

            status:
                "accepted",

            seen:
                true,

            date:
                Date.now(),

            anneeAcademique:
                requestData.anneeAcademique ||
                null

        }
    );


    // =================================================
    // NOTIFICATION POUR LE DEMANDEUR
    // =================================================

    const notificationRef =
        db
            .collection("notifications")
            .doc();


    batch.set(
        notificationRef,
        {

            to:
                requestData.from,

            type:
                "amis",

            title:
                "Demande acceptée",

            text:
                `${receiver.prenom || ""} ${receiver.nom || ""}`.trim()
                +
                " a accepté votre demande d'ami.",

            from:
                matricule,

            fromNom:
                `${receiver.prenom || ""} ${receiver.nom || ""}`
                    .trim(),

            fromAvatar:
                receiver.avatar ||
                "",

            date:
                Date.now(),

            seen:
                false,

            anneeAcademique:
                requestData.anneeAcademique ||
                null

        }
    );


    await batch.commit();


    return {

        message:
            "Demande acceptée."

    };

}


// =====================================================
// REFUSER UNE DEMANDE D'AMI
// =====================================================

export async function rejectFriendRequestService(
    requestId,
    matricule
) {

    const requestRef =
        db
            .collection("friendRequests")
            .doc(requestId);


    const requestSnapshot =
        await requestRef.get();


    if (
        !requestSnapshot.exists
    ) {

        throw new Error(
            "Demande introuvable."
        );

    }


    const requestData =
        requestSnapshot.data();


    // =================================================
    // VÉRIFIER LE DESTINATAIRE
    // =================================================

    if (
        requestData.to !==
        matricule
    ) {

        throw new Error(
            "Accès refusé."
        );

    }


    if (
        requestData.status !==
        "pending"
    ) {

        throw new Error(
            "Cette demande n'est plus en attente."
        );

    }


    await requestRef.update({

        status:
            "rejected",

        seen:
            true,

        date:
            Date.now()

    });


    return {

        message:
            "Demande refusée."

    };

}