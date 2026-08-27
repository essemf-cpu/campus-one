import departements from "./data/departements.js";
import rattachements from "./data/rattachements.js";
import services from "./data/services.js";
import postes from "./data/postes.js";
import permissionsPostes
    from "./data/seed/permissionsPostes.js";

// Hébergement
import sites from "./data/seed/sites.js";
import pavillons from "./data/seed/pavillons.js";
import ateliers from "./data/seed/ateliers.js";
import typesTravaux from "./data/seed/typesTravaux.js";

// Agents
import agents from "./data/seed/agents.js";
import affectationsAgents
    from "./data/seed/affectationsAgents.js";
import etudiants from "./data/seed/etudiants.js";
import hebergements from "./data/seed/hebergements.js";
import recouvrements
    from "./data/seed/recouvrements.js";

import anneesAcademiques from "./data/seed/anneesAcademiques.js";
import situationsAcademiques
    from "./data/seed/situationsAcademiques.js";

import { seedCollection } from "./utils/seedCollection.js";

async function seed() {

    try {

        console.log("🚀 Début du Seeder...\n");

        // Organisation
        await seedCollection("departements", departements);
        await seedCollection("services", services);
        await seedCollection("rattachements", rattachements);
        await seedCollection("postes", postes);
        await seedCollection("permissionsPostes", permissionsPostes);

        // Hébergement
        await seedCollection("sites", sites);
        await seedCollection("pavillons", pavillons);
        await seedCollection("ateliers", ateliers);
        await seedCollection("typesTravaux", typesTravaux);

        // Années académiques
await seedCollection(
    "anneesAcademiques",
    anneesAcademiques
);

        // Agents
        await seedCollection("agents", agents);
        await seedCollection(
    "affectationsAgents",
    affectationsAgents
);

       // Étudiants
await seedCollection("etudiants", etudiants);

await seedCollection(
    "situationsAcademiques",
    situationsAcademiques
);

await seedCollection(
    "hebergements",
    hebergements
);

await seedCollection(
    "recouvrements",
    recouvrements
);

        console.log("\n🎉 Seeder terminé avec succès !");
        process.exit(0);

    } catch (error) {

        console.error("\n❌ Erreur pendant le Seeder :", error);
        process.exit(1);

    }

}

seed();