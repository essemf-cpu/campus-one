import { auth, db } from "../config/firebaseAdmin.js";

export async function createUserAccount(matricule, password) {

    // Recherche de l'utilisateur
    let doc = await db.collection("agents").doc(matricule).get();

    let collectionName = "agents";
    let role = "agent";

    if (!doc.exists) {

        doc = await db.collection("etudiants").doc(matricule).get();

        collectionName = "etudiants";
        role = "etudiant";

    }

    if (!doc.exists) {

        throw new Error("Utilisateur introuvable.");

    }

    const userData = doc.data();

    if (userData.uid) {

        throw new Error("Ce compte est déjà activé.");

    }

    // Création du compte Firebase Authentication
    const user = await auth.createUser({

        email: userData.email,

        password,

        displayName: `${userData.prenom} ${userData.nom}`,

    });

    // Création du document users
    await db.collection("users").doc(user.uid).set({

        uid: user.uid,

        matricule: userData.matricule,

        role,

        email: userData.email,

        profile: `${collectionName}/${matricule}`,

        estActif: true,

        createdAt: new Date(),

    });

    // Mise à jour du profil (agent ou étudiant)
    await doc.ref.update({

        uid: user.uid,

        estActive: true,

        dateActivation: new Date(),

    });

    return {

        uid: user.uid,

        nom: `${userData.prenom} ${userData.nom}`,

        email: userData.email,

    };

}