import { db } from "./config/firebaseAdmin.js";

async function test() {
  try {
    const collections = await db.listCollections();

    console.log("✅ Connexion réussie !");
    console.log(
      "Collections :",
      collections.map((c) => c.id)
    );
  } catch (error) {
    console.error("❌ Erreur :", error);
  }
}

test();