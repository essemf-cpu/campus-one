import departements from "./data/departements.js";
import rattachements from "./data/rattachements.js";
import services from "./data/services.js";
import postes from "./data/postes.js";

// Hébergement
import sites from "./data/seed/sites.js";
import pavillons from "./data/seed/pavillons.js";
import ateliers from "./data/seed/ateliers.js";
import typesTravaux from "./data/seed/typesTravaux.js";

// Agents
import agents from "./data/seed/agents.js";

import { seedCollection } from "./utils/seedCollection.js";

async function seed() {

    try {

        console.log("🚀 Début du Seeder...\n");

        // Organisation
        await seedCollection("departements", departements);
        await seedCollection("services", services);
        await seedCollection("rattachements", rattachements);
        await seedCollection("postes", postes);

        // Hébergement
        await seedCollection("sites", sites);
        await seedCollection("pavillons", pavillons);
        await seedCollection("ateliers", ateliers);
        await seedCollection("typesTravaux", typesTravaux);

        // Agents
        await seedCollection("agents", agents);

        console.log("\n🎉 Seeder terminé avec succès !");
        process.exit(0);

    } catch (error) {

        console.error("\n❌ Erreur pendant le Seeder :", error);
        process.exit(1);

    }

}

seed();