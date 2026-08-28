import { db } from "../server/config/firebaseAdmin.js";

const monMatricule = process.argv[2];
const beneficiaireMatricule = process.argv[3];

if (!monMatricule || !beneficiaireMatricule) {
    console.error("Usage: node scripts/diagnosticAmi.js <monMatricule> <beneficiaireMatricule>");
    process.exit(1);
}

async function diagnostic() {
    console.log("=================================");
    console.log("1. DOCUMENTS \"friends\"");
    console.log("=================================");

    const friendsSnapshot = await db.collection("friends").get();

    friendsSnapshot.docs.forEach(document => {
        const data = document.data();
        console.log("---------------------------------");
        console.log("ID       :", document.id);
        console.log("data     :", JSON.stringify(data));
        const idAttendu = `${data.userCarte}_${data.friendCarte}_${data.anneeAcademique}`;
        console.log("ID attendu :", idAttendu);
        console.log(idAttendu === document.id ? "✅ cohérent" : "❌ INCOHÉRENT");
    });

    console.log();
    console.log("=================================");
    console.log(`2. RELATION ${monMatricule} → ${beneficiaireMatricule}`);
    console.log("=================================");

    const friendsDeMoi = friendsSnapshot.docs
        .map(document => ({ id: document.id, ...document.data() }))
        .filter(r => r.userCarte === monMatricule && r.friendCarte === beneficiaireMatricule);

    if (friendsDeMoi.length === 0) {
        console.log(`❌ Aucun document avec userCarte=="${monMatricule}" ET friendCarte=="${beneficiaireMatricule}".`);
    } else {
        friendsDeMoi.forEach(relation => {
            console.log("Trouvé :", JSON.stringify(relation));
            const idCalcule = `${monMatricule}_${beneficiaireMatricule}_${relation.anneeAcademique}`;
            console.log("ID que la règle va essayer :", idCalcule);
            console.log(idCalcule === relation.id ? "✅ ID existe" : "❌ NE CORRESPOND PAS");
        });
    }

    console.log();
    console.log("=================================");
    console.log(`3. PAIEMENTS DE ${beneficiaireMatricule}`);
    console.log("=================================");

    const paiementsSnapshot = await db.collection("paiementsLoyers")
        .where("beneficiaireMatricule", "==", beneficiaireMatricule)
        .get();

    if (paiementsSnapshot.empty) {
        console.log("Aucun paiement trouvé.");
    } else {
        paiementsSnapshot.docs.forEach(document => {
            console.log("---------------------------------");
            console.log("ID       :", document.id);
            console.log("data     :", JSON.stringify(document.data()));
        });
    }

    console.log();
    console.log("FIN DU DIAGNOSTIC");
}

diagnostic().then(() => process.exit(0)).catch(error => {
    console.error("❌ Erreur diagnostic :", error);
    process.exit(1);
});