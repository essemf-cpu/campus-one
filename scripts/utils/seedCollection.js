import { db } from "../../server/config/firebaseAdmin.js";

export async function seedCollection(collectionName, data) {
  const collection = db.collection(collectionName);

  for (const document of data) {
    const { id, ...fields } = document;

    await collection.doc(id).set(fields);

    console.log(`✅ ${collectionName}/${id}`);
  }

  console.log(`🎉 Collection "${collectionName}" terminée.`);
}