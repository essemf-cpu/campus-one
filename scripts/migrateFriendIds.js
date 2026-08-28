import { db } from "../server/config/firebaseAdmin.js";

// =====================================================
// MIGRATION DES IDs DE LA COLLECTION "friends"
// =====================================================
//
// Avant le fix : ID aléatoire (db.collection("friends").doc()).
// Après le fix : ID déterministe "userCarte_friendCarte_anneeAcademique",
// nécessaire pour que firestore.rules puisse faire un exists()/get()
// direct (sans query) lors de la consultation de la situation de
// loyer d'un ami.
//
// Ce script :
// 1. Parcourt tous les documents existants de "friends"
// 2. Calcule le nouvel ID déterministe pour chacun
// 3. Si l'ID actuel est déjà le bon => ne touche à rien
// 4. Sinon => crée le document sous le nouvel ID (mêmes données)
//    puis supprime l'ancien document
//
// Le script est idempotent : on peut le relancer plusieurs fois
// sans risque, il ignore les documents déjà migrés.
//
// =====================================================

function creerIdAmitie(userCarte, friendCarte, anneeAcademique) {

    return `${userCarte}_${friendCarte}_${anneeAcademique}`;

}

async function migrateFriendIds() {

    console.log("=================================");
    console.log("MIGRATION DES IDs \"friends\"");
    console.log("=================================");

    const snapshot =
        await db
            .collection("friends")
            .get();

    console.log(
        `📄 ${snapshot.size} document(s) trouvé(s) dans "friends".`
    );

    let migres = 0;
    let dejaBons = 0;
    let ignores = 0;
    let enErreur = 0;

    for (const document of snapshot.docs) {

        const data = document.data();

        const {
            userCarte,
            friendCarte,
            anneeAcademique
        } = data;

        // -------------------------------------------------
        // DONNÉES INCOMPLÈTES : ON NE MIGRE PAS À L'AVEUGLE
        // -------------------------------------------------

        if (!userCarte || !friendCarte) {

            console.warn(
                `⚠️  Document ${document.id} ignoré (userCarte ou friendCarte manquant).`
            );

            ignores++;
            continue;

        }

        const anneeFinale =
            anneeAcademique || null;

        const nouvelId =
            creerIdAmitie(
                userCarte,
                friendCarte,
                anneeFinale
            );

        // -------------------------------------------------
        // DÉJÀ AU BON FORMAT
        // -------------------------------------------------

        if (document.id === nouvelId) {

            dejaBons++;
            continue;

        }

        // -------------------------------------------------
        // MIGRATION
        // -------------------------------------------------

        try {

            const nouvelleReference =
                db
                    .collection("friends")
                    .doc(nouvelId);

            const nouvelleSnapshot =
                await nouvelleReference.get();

            if (nouvelleSnapshot.exists) {

                console.warn(
                    `⚠️  Le nouvel ID ${nouvelId} existe déjà (doublon probable). ` +
                    `Ancien document ${document.id} supprimé sans écraser le nouveau.`
                );

            } else {

                await nouvelleReference.set(data);

                console.log(
                    `✅ ${document.id}  →  ${nouvelId}`
                );

            }

            await document.ref.delete();

            migres++;

        } catch (error) {

            console.error(
                `❌ Erreur sur le document ${document.id} :`,
                error
            );

            enErreur++;

        }

    }

    console.log("=================================");
    console.log("RÉSUMÉ");
    console.log("=================================");
    console.log(`✅ Migrés       : ${migres}`);
    console.log(`➖ Déjà bons     : ${dejaBons}`);
    console.log(`⚠️  Ignorés      : ${ignores}`);
    console.log(`❌ En erreur     : ${enErreur}`);
    console.log("=================================");

}

migrateFriendIds()
    .then(() => {

        console.log("🎉 Migration terminée.");
        process.exit(0);

    })
    .catch(error => {

        console.error("❌ Migration interrompue :", error);
        process.exit(1);

    });