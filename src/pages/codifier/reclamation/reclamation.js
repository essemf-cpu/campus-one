import { requireRole } from "../../../auth/authGuard.js";

import {
    getSession
} from "../../../auth/sessionManager.js";

import {
    collection,
    query,
    where,
    getDocs,
    addDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


requireRole(
    "etudiant",
    async ({ profile }) => {

        const content =
            document.getElementById(
                "reclamation-content"
            );


        // =====================================================
        // SESSION
        // =====================================================

        const session =
            await getSession();


        // =====================================================
        // ANNÉE ACADÉMIQUE
        // =====================================================

        const anneeAcademique =
            session?.anneeAcademique ||
            sessionStorage.getItem(
                "anneeAcademique"
            );


        console.log(
            "📅 Année académique réclamation =",
            anneeAcademique
        );


        console.log(
            "🔐 Mode session =",
            session?.mode
        );


        console.log(
            "🔒 Lecture seule =",
            session?.lectureSeule
        );


        // =====================================================
        // ANNÉE HISTORIQUE
        // =====================================================

        if (
            session?.lectureSeule === true
        ) {

            content.innerHTML = `

                <div
                    class="reclamation-unavailable"
                >

                    <div
                        class="
                            reclamation-unavailable-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-lock
                            "
                        ></i>

                    </div>


                    <h1>
                        Année académique clôturée
                    </h1>


                    <p>
                        Cette année académique est désormais
                        accessible uniquement en consultation.
                    </p>


                    <p>
                        Vous pouvez consulter l'historique
                        de vos demandes, mais vous ne pouvez
                        plus effectuer de nouvelle réclamation.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================================
        // MATRICULE
        // =====================================================

        const matricule =
            profile.matricule;


        if (!matricule) {

            content.innerHTML = `

                <div
                    class="reclamation-unavailable"
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Service momentanément indisponible.
                    </p>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================================
        // RECHERCHE DE L'HÉBERGEMENT
        // =====================================================

        const hebergementQuery =
            query(

                collection(
                    db,
                    "hebergements"
                ),

                where(
                    "matricule",
                    "==",
                    matricule
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            );


        let hebergementSnapshot;


        try {

            hebergementSnapshot =
                await getDocs(
                    hebergementQuery
                );

        } catch (error) {

            console.error(
                "❌ Erreur récupération hébergement :",
                error
            );


            content.innerHTML = `

                <div
                    class="
                        reclamation-unavailable
                    "
                >

                    <h1>
                        Service momentanément indisponible
                    </h1>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================================
        // AUCUN HÉBERGEMENT POUR CETTE ANNÉE
        // =====================================================

        if (
            hebergementSnapshot.empty
        ) {

            content.innerHTML = `

                <div
                    class="
                        reclamation-unavailable
                    "
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Service momentanément indisponible.
                    </p>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;

            return;

        }


        // =====================================================
        // HÉBERGEMENT
        // =====================================================

        const hebergement =
            hebergementSnapshot
                .docs[0]
                .data();


        // =====================================================
        // INTERFACE
        // =====================================================

        content.innerHTML = `

            <div class="reclamation-header">

                <h1>
                    Faire une demande de réclamation
                </h1>

                <p>
                    Signalez un problème dans votre hébergement.
                </p>

            </div>


            <div class="reclamation-card">

                <div class="reclamation-section">

                    <h2>
                        Problème rencontré
                    </h2>


                    <div class="form-group">

                        <label for="type-probleme">
                            Type de problème
                        </label>

                        <select
                            id="type-probleme"
                        >

                            <option value="">
                                Sélectionner un type
                            </option>

                            <option value="plomberie">
                                Plomberie
                            </option>

                            <option value="electricite">
                                Électricité
                            </option>

                            <option value="menuiserie">
                                Menuiserie
                            </option>

                            <option value="peinture">
                                Peinture
                            </option>

                            <option value="mobilier">
                                Mobilier / équipement
                            </option>

                            <option value="maconnerie">
                                Maçonnerie
                            </option>

                        </select>

                    </div>


                    <div
                        class="form-group"
                        id="localisation-group"
                        style="display: none;"
                    >

                        <label for="localisation">
                            Localisation du problème
                        </label>

                        <select
                            id="localisation"
                        >

                            <option value="">
                                Sélectionner une localisation
                            </option>

                        </select>

                    </div>


                    <div
                        class="form-group"
                        id="probleme-group"
                        style="display: none;"
                    >

                        <label for="probleme">
                            Problème
                        </label>

                        <select
                            id="probleme"
                        >

                            <option value="">
                                Sélectionner un problème
                            </option>

                        </select>

                    </div>

                </div>


                <button
                    id="envoyer-demande-btn"
                    class="
                        reclamation-button
                        reclamation-button-primary
                    "
                    type="button"
                >

                    <i
                        class="
                            fa-solid
                            fa-paper-plane
                        "
                    ></i>

                    Envoyer la demande

                </button>

            </div>

        `;


        // =====================================================
        // ÉLÉMENTS DU FORMULAIRE
        // =====================================================

        const typeProbleme =
            document.getElementById(
                "type-probleme"
            );


        const localisationGroup =
            document.getElementById(
                "localisation-group"
            );


        const localisation =
            document.getElementById(
                "localisation"
            );


        const problemeGroup =
            document.getElementById(
                "probleme-group"
            );


        const probleme =
            document.getElementById(
                "probleme"
            );


        // =====================================================
        // LOCALISATIONS
        // =====================================================

        const localisations = {

            plomberie: [
                "Chambre",
                "Toilettes gauche",
                "Toilettes droite",
                "Douche gauche",
                "Douche droite"
            ],

            electricite: [
                "Chambre",
                "Toilettes gauche",
                "Toilettes droite",
                "Douche gauche",
                "Douche droite"
            ],

            menuiserie: [
                "Porte de la chambre",
                "Porte des toilettes gauche",
                "Porte des toilettes droite",
                "Porte de la douche gauche",
                "Porte de la douche droite",
                "Lit",
                "Armoire"
            ],

            peinture: [
                "Mur de la chambre",
                "Plafond",
                "Toilettes gauche",
                "Toilettes droite",
                "Douche gauche",
                "Douche droite"
            ],

            mobilier: [
                "Lit",
                "Armoire",
                "Bureau",
                "Chaise"
            ],

            maconnerie: [
                "Mur de la chambre",
                "Plafond",
                "Sol",
                "Toilettes gauche",
                "Toilettes droite",
                "Douche gauche",
                "Douche droite"
            ]

        };


        // =====================================================
        // PROBLÈMES
        // =====================================================

        const problemes = {

            plomberie: {

                "Chambre": [
                    "Fuite au robinet",
                    "Fuite au lavabo",
                    "Lavabo bouché",
                    "Évacuation du lavabo bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau"
                ],

                "Toilettes gauche": [
                    "Fuite au robinet",
                    "Chasse d'eau défectueuse",
                    "Fuite au niveau de la chasse d'eau",
                    "WC bouché",
                    "Lavabo bouché",
                    "Évacuation bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau"
                ],

                "Toilettes droite": [
                    "Fuite au robinet",
                    "Chasse d'eau défectueuse",
                    "Fuite au niveau de la chasse d'eau",
                    "WC bouché",
                    "Lavabo bouché",
                    "Évacuation bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau"
                ],

                "Douche gauche": [
                    "Robinet défectueux",
                    "Douchette défectueuse",
                    "Fuite au robinet",
                    "Évacuation bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau"
                ],

                "Douche droite": [
                    "Robinet défectueux",
                    "Douchette défectueuse",
                    "Fuite au robinet",
                    "Évacuation bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau"
                ]

            },


            electricite: {

                "Chambre": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Prise électrique défectueuse",
                    "Prise électrique sans courant",
                    "Court-circuit",
                    "Coupure d'électricité"
                ],

                "Toilettes gauche": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Prise électrique défectueuse",
                    "Coupure d'électricité"
                ],

                "Toilettes droite": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Prise électrique défectueuse",
                    "Coupure d'électricité"
                ],

                "Douche gauche": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Coupure d'électricité"
                ],

                "Douche droite": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Coupure d'électricité"
                ]

            },


            menuiserie: {

                "Porte de la chambre": [
                    "Serrure à réparer",
                    "Serrure à remplacer",
                    "Loquet intérieur à réparer",
                    "Loquet intérieur à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte qui ne s'ouvre pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse"
                ],

                "Porte des toilettes gauche": [
                    "Loquet intérieur à réparer",
                    "Loquet intérieur à remplacer",
                    "Loquet extérieur à réparer",
                    "Loquet extérieur à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse"
                ],

                "Porte des toilettes droite": [
                    "Loquet intérieur à réparer",
                    "Loquet intérieur à remplacer",
                    "Loquet extérieur à réparer",
                    "Loquet extérieur à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse"
                ],

                "Porte de la douche gauche": [
                    "Loquet à réparer",
                    "Loquet à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse"
                ],

                "Porte de la douche droite": [
                    "Loquet à réparer",
                    "Loquet à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse"
                ],

                "Lit": [
                    "Structure du lit endommagée",
                    "Pied du lit endommagé",
                    "Sommier endommagé",
                    "Lit instable",
                    "Lit inutilisable"
                ],

                "Armoire": [
                    "Porte d'armoire endommagée",
                    "Charnière défectueuse",
                    "Serrure défectueuse",
                    "Poignée cassée",
                    "Armoire instable"
                ]

            },


            peinture: {

                "Mur de la chambre": [
                    "Peinture écaillée",
                    "Mur taché",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture complètement détériorée"
                ],

                "Plafond": [
                    "Peinture écaillée",
                    "Traces d'humidité",
                    "Plafond taché",
                    "Peinture détériorée"
                ],

                "Toilettes gauche": [
                    "Peinture écaillée",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée"
                ],

                "Toilettes droite": [
                    "Peinture écaillée",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée"
                ],

                "Douche gauche": [
                    "Peinture écaillée",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée"
                ],

                "Douche droite": [
                    "Peinture écaillée",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée"
                ]

            },


            mobilier: {

                "Lit": [
                    "Structure du lit endommagée",
                    "Pied du lit cassé",
                    "Sommier endommagé",
                    "Lit instable",
                    "Lit inutilisable"
                ],

                "Armoire": [
                    "Porte d'armoire endommagée",
                    "Charnière défectueuse",
                    "Serrure défectueuse",
                    "Poignée cassée",
                    "Armoire instable"
                ],

                "Bureau": [
                    "Plateau endommagé",
                    "Pied cassé",
                    "Bureau instable"
                ],

                "Chaise": [
                    "Assise endommagée",
                    "Pied cassé",
                    "Chaise instable"
                ]

            },


            maconnerie: {

                "Mur de la chambre": [
                    "Mur fissuré",
                    "Mur endommagé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité"
                ],

                "Plafond": [
                    "Plafond fissuré",
                    "Plafond endommagé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité"
                ],

                "Sol": [
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Sol endommagé"
                ],

                "Toilettes gauche": [
                    "Mur fissuré",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Infiltration d'eau"
                ],

                "Toilettes droite": [
                    "Mur fissuré",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Infiltration d'eau"
                ],

                "Douche gauche": [
                    "Mur fissuré",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Infiltration d'eau"
                ],

                "Douche droite": [
                    "Mur fissuré",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Infiltration d'eau"
                ]

            }

        };


        // =====================================================
        // TYPE → LOCALISATION
        // =====================================================

        typeProbleme.addEventListener(
            "change",
            () => {

                const type =
                    typeProbleme.value;


                localisation.innerHTML = `
                    <option value="">
                        Sélectionner une localisation
                    </option>
                `;


                probleme.innerHTML = `
                    <option value="">
                        Sélectionner un problème
                    </option>
                `;


                problemeGroup.style.display =
                    "none";


                if (!type) {

                    localisationGroup.style.display =
                        "none";

                    return;

                }


                localisations[type].forEach(
                    (lieu) => {

                        localisation.innerHTML += `
                            <option value="${lieu}">
                                ${lieu}
                            </option>
                        `;

                    }
                );


                localisationGroup.style.display =
                    "block";

            }
        );


        // =====================================================
        // LOCALISATION → PROBLÈME
        // =====================================================

        localisation.addEventListener(
            "change",
            () => {

                const type =
                    typeProbleme.value;

                const lieu =
                    localisation.value;


                probleme.innerHTML = `
                    <option value="">
                        Sélectionner un problème
                    </option>
                `;


                if (
                    !type ||
                    !lieu ||
                    !problemes[type] ||
                    !problemes[type][lieu]
                ) {

                    problemeGroup.style.display =
                        "none";

                    return;

                }


                problemes[type][lieu].forEach(
                    (problemeItem) => {

                        probleme.innerHTML += `
                            <option value="${problemeItem}">
                                ${problemeItem}
                            </option>
                        `;

                    }
                );


                problemeGroup.style.display =
                    "block";

            }
        );


        // =====================================================
        // ENVOI
        // =====================================================

        const envoyerDemandeButton =
            document.getElementById(
                "envoyer-demande-btn"
            );


        envoyerDemandeButton.addEventListener(
            "click",
            async () => {

                // =============================================
                // VERROU DE SÉCURITÉ
                // =============================================

                const sessionActuelle =
                    await getSession();


                if (
                    sessionActuelle?.lectureSeule === true
                ) {

                    alert(
                        "Cette année académique est clôturée. Vous ne pouvez plus effectuer de nouvelle réclamation."
                    );

                    return;

                }


                // =============================================
                // VÉRIFICATION DES CHAMPS
                // =============================================

                const type =
                    typeProbleme.value;


                const lieu =
                    localisation.value;


                const problemeSelectionne =
                    probleme.value;


                if (
                    !type ||
                    !lieu ||
                    !problemeSelectionne
                ) {

                    alert(
                        "Veuillez sélectionner le type, la localisation et le problème."
                    );

                    return;

                }


                try {

                    envoyerDemandeButton.disabled =
                        true;


                    envoyerDemandeButton.innerHTML = `
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Envoi en cours...
                    `;


                    // =========================================
                    // ENREGISTREMENT
                    // =========================================

                    await addDoc(
                        collection(
                            db,
                            "demandes_etudiants"
                        ),
                        {

                            matricule:
                                profile.matricule,

                            numeroEtudiant:
                                profile.numeroEtudiant ||
                                profile.matricule,

                            prenom:
                                profile.prenom,

                            nom:
                                profile.nom,

                            anneeAcademique:
                                anneeAcademique,

                            site:
                                hebergement.site,

                            pavillon:
                                hebergement.pavillon,

                            chambre:
                                hebergement.chambre,

                            lit:
                                hebergement.lit,

                            type:
                                type,

                            localisation:
                                lieu,

                            probleme:
                                problemeSelectionne,

                            date:
                                new Date(),

                            statut:
                                "en_attente",

                            notificationVue:
                                false

                        }
                    );


                    alert(
                        "Votre demande a été envoyée avec succès."
                    );


                } catch (error) {

                    console.error(
                        "❌ Erreur envoi demande :",
                        error
                    );


                    alert(
                        "Impossible d'envoyer la demande. Veuillez réessayer."
                    );


                } finally {

                    envoyerDemandeButton.disabled =
                        false;


                    envoyerDemandeButton.innerHTML = `
                        <i class="fa-solid fa-paper-plane"></i>
                        Envoyer la demande
                    `;

                }

            }
        );

    }
);