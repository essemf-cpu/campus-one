import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join } from "path";

const serviceAccount = JSON.parse(
  readFileSync(
    join(process.cwd(), "scripts", "config", "campus-one-2af72-firebase-adminsdk-fbsvc-e64de834a7.json"),
    "utf8"
  )
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export { db };