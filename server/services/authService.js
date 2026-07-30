import { auth, db } from "../config/firebaseAdmin.js";

export async function createAgentAccount(matricule, password) {
    // Rechercher l'agent
    const doc = await db.collection("agents").doc(matricule).get();

    if (!doc.exists) {
        throw new Error("Agent introuvable.");
    }

    const agent = doc.data();

    if (agent.uid) {
        throw new Error("Ce compte est déjà activé.");
    }

    // Création du compte Firebase Authentication
    const user = await auth.createUser({
        email: agent.email,
        password,
        displayName: `${agent.prenom} ${agent.nom}`,
    });

    // Création du compte dans la collection users
    await db.collection("users").doc(user.uid).set({
        uid: user.uid,
        matricule: agent.matricule,
        role: "agent",
        email: agent.email,
        profile: `agents/${matricule}`,
        estActif: true,
        createdAt: new Date(),
    });

    // Mise à jour du profil agent
    await doc.ref.update({
        uid: user.uid,
        estActive: true,
        dateActivation: new Date(),
    });

    return {
        uid: user.uid,
        nom: `${agent.prenom} ${agent.nom}`,
        email: agent.email,
    };
}