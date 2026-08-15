import { Html5Qrcode } from "html5-qrcode";

import { requireRole } from "../../../auth/authGuard.js";

import { db } from "../../../firebase/firebase.js";

import {
    collection,
    query,
    where,
    limit,
    getDocs,
    doc,
    getDoc,
    addDoc
} from "firebase/firestore";


requireRole("etudiant", async ({ profile }) => {

    const reader =
        document.getElementById("reader");

    const result =
        document.getElementById("scan-result");

    if (!reader || !result) return;


    const scanner =
        new Html5Qrcode("reader");

    let traitementEnCours = false;


    // ==========================
    // MESSAGE
    // ==========================

    function afficherMessage(
        message,
        type = ""
    ) {

        result.className =
            `scan-result ${type}`;

        result.textContent =
            message;

    }


    // ==========================
    // AFFICHER L'ÉTUDIANT
    // ==========================

    function afficherEtudiant(ami) {

        result.innerHTML = `

            <div class="student-result-card">

                ${
                    ami.avatar

                    ?

                    `
                    <img
                        src="${ami.avatar}"
                        class="student-result-avatar"
                        alt="Avatar">
                    `

                    :

                    `
                    <div
                        class="student-result-avatar-placeholder">

                        ${
                            ami.prenom?.[0] || ""
                        }${
                            ami.nom?.[0] || ""
                        }

                    </div>
                    `
                }

                <div class="student-result-info">

                    <h3>
                        ${ami.prenom} ${ami.nom}
                    </h3>

                    <p>
                        ${ami.matricule}
                    </p>

                </div>

                <button
                    id="add-friend-btn"
                    class="add-friend-btn">

                    <i class="fa-solid fa-user-plus"></i>

                    Ajouter comme ami

                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "add-friend-btn"
            );


        if (button) {

            button.addEventListener(
                "click",
                () => envoyerDemande(ami)
            );

        }

    }


// ==========================
// ENVOYER DEMANDE D'AMI
// ==========================

async function envoyerDemande(ami) {

    const button =
        document.getElementById(
            "add-friend-btn"
        );

    if (!button) return;


    // ==========================
    // IMPOSSIBLE DE S'AJOUTER SOI-MÊME
    // ==========================

    if (
        ami.matricule ===
        profile.matricule
    ) {

        afficherMessage(
            "Vous ne pouvez pas vous ajouter vous-même.",
            "error"
        );

        return;
    }


    button.disabled = true;

    button.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Envoi...
    `;


    try {

        // ==========================
        // VÉRIFIER UNE DEMANDE EXISTANTE
        // ==========================

        const demandesQuery =
            query(

                collection(
                    db,
                    "friendRequests"
                ),

                where(
                    "from",
                    "==",
                    profile.matricule
                ),

                where(
                    "to",
                    "==",
                    ami.matricule
                ),

                limit(1)

            );


        const existing =
            await getDocs(
                demandesQuery
            );


        if (!existing.empty) {

            const demande =
                existing.docs[0].data();


            if (
                demande.status ===
                "pending"
            ) {

                afficherMessage(
                    "Une demande est déjà en attente.",
                    "info"
                );

                return;
            }


            if (
                demande.status ===
                "accepted"
            ) {

                afficherMessage(
                    "Vous êtes déjà amis.",
                    "info"
                );

                return;
            }

        }


        // ==========================
        // CRÉER LA DEMANDE
        // ==========================

        await addDoc(
            collection(
                db,
                "friendRequests"
            ),
            {

                from:
                    profile.matricule,

                fromNom:
                    `${profile.prenom} ${profile.nom}`,

                fromAvatar:
                    profile.avatar ||
                    "assets/default-user.png",

                to:
                    ami.matricule,

                status:
                    "pending",

                seen:
                   false,

                date:
                    Date.now()

            }
        );


        // ==========================
        // CRÉER LA NOTIFICATION
        // ==========================

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {

                to:
                    ami.matricule,

                type:
                    "amis",

                title:
                    "Nouvelle demande d'ami",

                text:
                    `${profile.prenom} ${profile.nom} souhaite vous ajouter comme ami.`,

                from:
                    profile.matricule,

                fromNom:
                    `${profile.prenom} ${profile.nom}`,

                fromAvatar:
                    profile.avatar ||
                    "assets/default-user.png",

                date:
                    Date.now(),

                seen:
                    false

            }
        );


        // ==========================
        // SUCCÈS
        // ==========================

        result.innerHTML = `

            <div class="scan-success">

                <i class="fa-solid fa-check"></i>

                <h3>
                    Demande envoyée
                </h3>

                <p>

                    Votre demande a été envoyée à

                    <strong>
                        ${ami.prenom}
                        ${ami.nom}
                    </strong>.

                </p>

            </div>

        `;


    } catch (error) {

        console.error(
            "Erreur demande ami :",
            error
        );


        afficherMessage(
            "Impossible d'envoyer la demande.",
            "error"
        );


        button.disabled = false;

        button.innerHTML = `
            <i class="fa-solid fa-user-plus"></i>
            Ajouter comme ami
        `;

    }

}


    // ==========================
    // TRAITER LE QR
    // ==========================

    async function traiterQR(
        decodedText
    ) {

        if (traitementEnCours)
            return;


        traitementEnCours = true;


        try {

            await scanner.stop();

        } catch (error) {

            console.warn(
                "Arrêt scanner :",
                error
            );

        }


        afficherMessage(
            "QR détecté. Recherche de l'étudiant..."
        );


        let matricule =
            decodedText.trim();


        // ==========================
        // QR JSON
        // ==========================

        try {

            const data =
                JSON.parse(decodedText);


            if (
                data.type === "student" &&
                data.matricule
            ) {

                matricule =
                    data.matricule;

            }

        } catch {

            // Le QR peut aussi contenir
            // directement le matricule.

        }


        // ==========================
        // RECHERCHE DANS USERS
        // ==========================

        try {

            const usersQuery =
                query(

                    collection(
                        db,
                        "users"
                    ),

                    where(
                        "matricule",
                        "==",
                        matricule
                    ),

                    where(
                        "role",
                        "==",
                        "etudiant"
                    ),

                    limit(1)

                );


            const snapshot =
                await getDocs(
                    usersQuery
                );


            if (snapshot.empty) {

                afficherMessage(
                    "Étudiant introuvable.",
                    "error"
                );

                return;

            }


            const userData =
                snapshot.docs[0].data();


            // ==========================
            // RÉCUPÉRER LE PROFIL
            // ==========================

            const profileRef =
                userData.profile;


            if (!profileRef) {

                afficherMessage(
                    "Profil étudiant introuvable.",
                    "error"
                );

                return;

            }


            const parts =
                profileRef.split("/");


            const collectionName =
                parts[0];


            const documentId =
                parts[1];


            const profileDoc =
                await getDoc(

                    doc(
                        db,
                        collectionName,
                        documentId
                    )

                );


            if (!profileDoc.exists()) {

                afficherMessage(
                    "Profil étudiant introuvable.",
                    "error"
                );

                return;

            }


            const student =
                profileDoc.data();


            // ==========================
            // AFFICHER L'ÉTUDIANT
            // ==========================

            afficherEtudiant({

                matricule:
                    userData.matricule,

                prenom:
                    student.prenom || "",

                nom:
                    student.nom || "",

                avatar:
                    student.avatar || ""

            });


        } catch (error) {

            console.error(
                "Erreur recherche étudiant :",
                error
            );


            afficherMessage(
                "Impossible de rechercher cet étudiant.",
                "error"
            );

        }

    }


    // ==========================
    // DÉMARRAGE CAMÉRA
    // ==========================

    scanner.start(

        {
            facingMode:
                "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },

        traiterQR,

        () => {
            // QR non détecté :
            // le scanner continue.
        }

    ).catch(error => {

        console.error(
            "Erreur caméra :",
            error
        );


        afficherMessage(
            "Impossible d'accéder à la caméra.",
            "error"
        );

    });

});