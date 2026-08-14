import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync } from "fs";
import { join } from "path";

const serviceAccount = JSON.parse(
    readFileSync(
        join(
            process.cwd(),
            "server",
            "config",
            "serviceAccountKey.json"
        ),
        "utf8"
    )
);

console.log(
    "Firebase project :",
    serviceAccount.project_id
);

console.log(
    "Firebase client :",
    serviceAccount.client_email
);

console.log(
    "Private key présente :",
    !!serviceAccount.private_key
);

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

export { db, auth };