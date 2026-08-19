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