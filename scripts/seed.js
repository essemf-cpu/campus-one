import departements from "./data/departements.js";
import rattachements from "./data/rattachements.js";
import services from "./data/services.js";
import postes from "./data/postes.js";

import { seedCollection } from "./utils/seedCollection.js";

async function seed() {
  try {
    console.log("🚀 Début du Seeder...\n");

    await seedCollection("departements", departements);
    await seedCollection("rattachements", rattachements);
    await seedCollection("services", services);
    await seedCollection("postes", postes);

    console.log("\n🎉 Seeder terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Erreur pendant le Seeder :", error);
    process.exit(1);
  }
}

seed();