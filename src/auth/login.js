import {
    collection,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";
import {
    setAnneeAcademique
} from "./sessionManager.js";
import { findUser, login } from "./authService.js";
import t from "../i18n/index.js";


// =====================================================
// ÉLÉMENTS
// =====================================================

const form =
    document.getElementById("loginForm");

const identifiant =
    document.getElementById("identifiant");

const password =
    document.getElementById("password");

const button =
    document.getElementById("btnLogin");

const message =
    document.getElementById("message");

const toggle =
    document.getElementById("togglePassword");

const anneeGroup =
    document.getElementById("annee-group");

const anneeAcademique =
    document.getElementById("anneeAcademique");


// =====================================================
// CHARGEMENT DES ANNÉES ACADÉMIQUES
// =====================================================

async function chargerAnneesAcademiques() {

    if (!anneeAcademique) {

        console.error(
            "❌ Élément #anneeAcademique introuvable."
        );

        return;

    }


    // État initial

    anneeAcademique.innerHTML = `

        <option value="">
            Chargement...
        </option>

    `;


    try {

        console.log(
            "📚 Chargement des années académiques..."
        );


        // -------------------------------------------------
        // RÉCUPÉRATION DE LA COLLECTION
        // -------------------------------------------------

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "anneesAcademiques"
                )
            );


        console.log(
            "📚 Nombre de documents trouvés :",
            snapshot.size
        );


        // -------------------------------------------------
        // LECTURE DES DOCUMENTS
        // -------------------------------------------------

        snapshot.forEach((doc) => {

            console.log(
                "📅 Année :",
                doc.id,
                doc.data()
            );

        });


        // -------------------------------------------------
        // ON GARDE UNIQUEMENT LES ANNÉES ACTIVES
        // -------------------------------------------------

        const annees =
            snapshot.docs

                .map(
                    (doc) => ({
                        id: doc.id,
                        ...doc.data()
                    })
                )

                .filter(
                    (annee) =>
                        annee.active === true
                )

                .sort(
                    (a, b) =>
                        (b.ordre || 0) -
                        (a.ordre || 0)
                );


        console.log(
            "📅 Années académiques actives :",
            annees
        );


        // -------------------------------------------------
        // RÉINITIALISATION DU SELECT
        // -------------------------------------------------

        anneeAcademique.innerHTML = `

            <option value="">
                Choisir l'année académique
            </option>

        `;


        // -------------------------------------------------
        // AJOUT DES ANNÉES
        // -------------------------------------------------

        annees.forEach(
            (annee) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    annee.libelle;


                option.textContent =
                    annee.libelle;


                anneeAcademique.appendChild(
                    option
                );

            }
        );


        // -------------------------------------------------
        // AUCUNE ANNÉE DISPONIBLE
        // -------------------------------------------------

        if (
            annees.length === 0
        ) {

            anneeAcademique.innerHTML = `

                <option value="">
                    Aucune année disponible
                </option>

            `;

            console.warn(
                "⚠️ Aucune année académique active."
            );

        }

    } catch (error) {

        console.error(
            "❌ Erreur chargement années académiques :",
            error
        );


        anneeAcademique.innerHTML = `

            <option value="">
                Impossible de charger les années
            </option>

        `;

    }

}


// =====================================================
// CONNEXION
// =====================================================

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        message.textContent = "";

        message.style.color =
            "red";


        const matricule =
            identifiant.value
                .trim();


        const mdp =
            password.value
                .trim();


        const anneeChoisie =
            anneeAcademique.value
                .trim();


        // -------------------------------------------------
        // VÉRIFICATION ANNÉE
        // -------------------------------------------------

        if (!anneeChoisie) {

            message.textContent =
                "Veuillez choisir une année académique.";

            return;

        }


        // -------------------------------------------------
        // VÉRIFICATION IDENTIFIANTS
        // -------------------------------------------------

        if (
            !matricule ||
            !mdp
        ) {

            message.textContent =
                t.ERRORS.EMPTY_FIELDS;

            return;

        }


        button.disabled = true;

        button.textContent =
            "Connexion...";


        try {

            // ---------------------------------------------
            // RECHERCHE UTILISATEUR
            // ---------------------------------------------

            const user =
                await findUser(
                    matricule
                );


            // ---------------------------------------------
            // CONNEXION FIREBASE
            // ---------------------------------------------

            await login(
                user.email,
                mdp
            );


            // ---------------------------------------------
            // ANNÉE ACADÉMIQUE CHOISIE
            // ---------------------------------------------

            setAnneeAcademique(
                anneeChoisie
            );


            // ---------------------------------------------
            // UTILISATEUR
            // ---------------------------------------------

            sessionStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            console.log(
                "✅ Connexion réussie"
            );


            console.log(
                "📅 Année académique sélectionnée :",
                anneeChoisie
            );


            message.style.color =
                "green";


            message.textContent =
                t.SUCCESS.LOGIN;


            // ---------------------------------------------
            // REDIRECTION
            // ---------------------------------------------

            switch (
                user.collection
            ) {

                case "agents":

                    window.location.href =
                        "../dashboards/agent/dashboard.html";

                    break;


                case "etudiants":

                    window.location.href =
                        "../dashboards/etudiant/dashboard.html";

                    break;


                default:

                    throw new Error(
                        "UNKNOWN_ROLE"
                    );

            }

        } catch (error) {

            console.error(
                "❌ ERREUR CONNEXION :",
                error
            );


            message.style.color =
                "red";


            switch (
                error.message
            ) {

                case "USER_NOT_FOUND":

                    message.textContent =
                        t.ERRORS.USER_NOT_FOUND;

                    break;


                case "UNKNOWN_ROLE":

                    message.textContent =
                        "Rôle inconnu.";

                    break;


                default:

                    switch (
                        error.code
                    ) {

                        case "auth/invalid-credential":

                            message.textContent =
                                t.ERRORS.INVALID_CREDENTIALS;

                            break;


                        case "auth/network-request-failed":

                            message.textContent =
                                t.ERRORS.NETWORK;

                            break;


                        default:

                            message.textContent =
                                t.ERRORS.UNKNOWN;

                    }

            }

        } finally {

            button.disabled =
                false;


            button.textContent =
                "Se connecter";

        }

    }
);


// =====================================================
// AFFICHER / MASQUER MOT DE PASSE
// =====================================================

toggle.addEventListener(
    "click",
    () => {

        if (
            password.type ===
            "password"
        ) {

            password.type =
                "text";


            toggle.classList.replace(
                "fa-eye",
                "fa-eye-slash"
            );

        } else {

            password.type =
                "password";


            toggle.classList.replace(
                "fa-eye-slash",
                "fa-eye"
            );

        }

    }
);


// =====================================================
// INITIALISATION
// =====================================================

chargerAnneesAcademiques();