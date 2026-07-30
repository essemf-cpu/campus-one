import { db } from "../server/config/firebaseAdmin.js";

async function migrateUsers() {
    const snapshot = await db.collection("agents").get();

    let migrated = 0;
    let skipped = 0;

    for (const doc of snapshot.docs) {

        const agent = doc.data();

        // On ignore les comptes non activés
        if (!agent.uid) {
            skipped++;
            continue;
        }

        const userRef = db.collection("users").doc(agent.uid);

        const userDoc = await userRef.get();

        // Déjà migré
        if (userDoc.exists) {
            skipped++;
            continue;
        }

        await userRef.set({
            uid: agent.uid,
            matricule: agent.matricule,
            role: "agent",
            email: agent.email,
            profile: `agents/${doc.id}`,
            estActif: true,
            createdAt: agent.dateActivation || new Date(),
        });

        migrated++;

        console.log(`✔ ${agent.matricule} migré`);
    }

    console.log("");
    console.log("Migration terminée.");
    console.log(`Migrés : ${migrated}`);
    console.log(`Ignorés : ${skipped}`);

    process.exit(0);
}

migrateUsers().catch((err) => {
    console.error(err);
    process.exit(1);
});