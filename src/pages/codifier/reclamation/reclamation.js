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


                    <!-- =========================================
                         TYPE DE PROBLÈME
                    ========================================== -->

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


                    <!-- =========================================
                         LOCALISATION
                    ========================================== -->

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


                    <!-- =========================================
                         NIVEAU / ÉTAGE
                    ========================================== -->

                    <div
                        class="form-group"
                        id="niveau-group"
                        style="display: none;"
                    >

                        <label for="niveau">
                            Niveau / étage
                        </label>

                        <select
                            id="niveau"
                        >

                            <option value="">
                                Sélectionner le niveau
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         CÔTÉ
                    ========================================== -->

                    <div
                        class="form-group"
                        id="cote-group"
                        style="display: none;"
                    >

                        <label for="cote">
                            Côté
                        </label>

                        <select
                            id="cote"
                        >

                            <option value="">
                                Sélectionner un côté
                            </option>

                            <option value="Gauche">
                                Gauche
                            </option>

                            <option value="Droite">
                                Droite
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         PROBLÈME
                    ========================================== -->

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


        const niveauGroup =
            document.getElementById(
                "niveau-group"
            );


        const niveau =
            document.getElementById(
                "niveau"
            );


        const coteGroup =
            document.getElementById(
                "cote-group"
            );


        const cote =
            document.getElementById(
                "cote"
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
        // NIVEAUX / ÉTAGES
        // =====================================================

        const niveaux = [
            "RDC",
            "1er",
            "2e",
            "3e",
            "4e"
        ];


        // =====================================================
        // LOCALISATIONS
        // =====================================================

        const localisations = {

            plomberie: [
                "Chambre",
                "Toilettes",
                "Couloir",
                "Escalier"
            ],

            electricite: [
                "Chambre",
                "Toilettes",
                "Couloir",
                "Escalier"
            ],

            menuiserie: [
                "Chambre",
                "Toilettes",
                "Couloir",
                "Escalier"
            ],

            peinture: [
                "Chambre",
                "Toilettes",
                "Couloir",
                "Escalier"
            ],

            mobilier: [
                "Chambre",
                "Couloir",
                "Escalier"
            ],

            maconnerie: [
                "Chambre",
                "Toilettes",
                "Couloir",
                "Escalier"
            ]

        };


        // =====================================================
        // PROBLÈMES
        // =====================================================

        const problemes = {

            // =================================================
            // PLOMBERIE
            // =================================================

            plomberie: {

                "Chambre": [
                    "Fuite au robinet",
                    "Fuite au lavabo",
                    "Lavabo bouché",
                    "Évacuation du lavabo bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau",
                    "Autre"
                ],

                "Toilettes": [
                    "Fuite au robinet",
                    "Chasse d'eau défectueuse",
                    "Fuite au niveau de la chasse d'eau",
                    "WC bouché",
                    "Lavabo bouché",
                    "Évacuation bouchée",
                    "Canalisation qui fuit",
                    "Absence d'eau",
                    "Autre"
                ],

                "Couloir": [
                    "Fuite d'eau",
                    "Canalisation qui fuit",
                    "Présence d'eau au sol",
                    "Infiltration d'eau",
                    "Absence d'eau",
                    "Autre"
                ],

                "Escalier": [
                    "Fuite d'eau",
                    "Canalisation qui fuit",
                    "Présence d'eau au sol",
                    "Infiltration d'eau",
                    "Autre"
                ]

            },


            // =================================================
            // ÉLECTRICITÉ
            // =================================================

            electricite: {

                "Chambre": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Prise électrique défectueuse",
                    "Prise électrique sans courant",
                    "Court-circuit",
                    "Coupure d'électricité",
                    "Autre"
                ],

                "Toilettes": [
                    "Ampoule défectueuse",
                    "Interrupteur défectueux",
                    "Prise électrique défectueuse",
                    "Coupure d'électricité",
                    "Autre"
                ],

                "Couloir": [
                    "Ampoule défectueuse",
                    "Éclairage du couloir défectueux",
                    "Interrupteur défectueux",
                    "Coupure d'électricité",
                    "Autre"
                ],

                "Escalier": [
                    "Ampoule défectueuse",
                    "Éclairage de l'escalier défectueux",
                    "Interrupteur défectueux",
                    "Coupure d'électricité",
                    "Autre"
                ]

            },


            // =================================================
            // MENUISERIE
            // =================================================

            menuiserie: {

                "Chambre": [
                    "Serrure à réparer",
                    "Serrure à remplacer",
                    "Loquet intérieur à réparer",
                    "Loquet intérieur à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte qui ne s'ouvre pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse",
                    "Lit endommagé",
                    "Armoire endommagée",
                    "Autre"
                ],

                "Toilettes": [
                    "Loquet intérieur à réparer",
                    "Loquet intérieur à remplacer",
                    "Loquet extérieur à réparer",
                    "Loquet extérieur à remplacer",
                    "Poignée à réparer",
                    "Poignée à remplacer",
                    "Porte qui ne ferme pas correctement",
                    "Porte endommagée",
                    "Charnière défectueuse",
                    "Autre"
                ],

                "Couloir": [
                    "Porte endommagée",
                    "Serrure défectueuse",
                    "Poignée défectueuse",
                    "Charnière défectueuse",
                    "Porte qui ne ferme pas correctement",
                    "Porte qui ne s'ouvre pas correctement",
                    "Autre"
                ],

                "Escalier": [
                    "Porte endommagée",
                    "Serrure défectueuse",
                    "Poignée défectueuse",
                    "Charnière défectueuse",
                    "Porte qui ne ferme pas correctement",
                    "Autre"
                ]

            },


            // =================================================
            // PEINTURE
            // =================================================

            peinture: {

                "Chambre": [
                    "Peinture écaillée",
                    "Mur taché",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture complètement détériorée",
                    "Autre"
                ],

                "Toilettes": [
                    "Peinture écaillée",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée",
                    "Autre"
                ],

                "Couloir": [
                    "Peinture écaillée",
                    "Mur taché",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée",
                    "Autre"
                ],

                "Escalier": [
                    "Peinture écaillée",
                    "Mur taché",
                    "Mur dégradé",
                    "Traces d'humidité",
                    "Peinture détériorée",
                    "Autre"
                ]

            },


            // =================================================
            // MOBILIER
            // =================================================

            mobilier: {

                "Chambre": [
                    "Structure du lit endommagée",
                    "Pied du lit cassé",
                    "Sommier endommagé",
                    "Lit instable",
                    "Lit inutilisable",
                    "Porte d'armoire endommagée",
                    "Charnière défectueuse",
                    "Serrure défectueuse",
                    "Poignée cassée",
                    "Armoire instable",
                    "Plateau de bureau endommagé",
                    "Bureau instable",
                    "Assise de chaise endommagée",
                    "Chaise instable",
                    "Autre"
                ],

                "Couloir": [
                    "Mobilier endommagé",
                    "Équipement endommagé",
                    "Mobilier instable",
                    "Autre"
                ],

                "Escalier": [
                    "Mobilier endommagé",
                    "Équipement endommagé",
                    "Autre"
                ]

            },


            // =================================================
            // MAÇONNERIE
            // =================================================

            maconnerie: {

                "Chambre": [
                    "Mur fissuré",
                    "Mur endommagé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Sol endommagé",
                    "Autre"
                ],

                "Toilettes": [
                    "Mur fissuré",
                    "Mur endommagé",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité",
                    "Autre"
                ],

                "Couloir": [
                    "Mur fissuré",
                    "Mur endommagé",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Sol endommagé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité",
                    "Autre"
                ],

                "Escalier": [
                    "Mur fissuré",
                    "Mur endommagé",
                    "Carrelage cassé",
                    "Carrelage décollé",
                    "Sol endommagé",
                    "Infiltration d'eau",
                    "Trace importante d'humidité",
                    "Autre"
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


                // -------------------------------------------------
                // RESET LOCALISATION
                // -------------------------------------------------

                localisation.innerHTML = `
                    <option value="">
                        Sélectionner une localisation
                    </option>
                `;


                // -------------------------------------------------
                // RESET NIVEAU
                // -------------------------------------------------

                niveau.innerHTML = `
                    <option value="">
                        Sélectionner le niveau
                    </option>
                `;


                // -------------------------------------------------
                // RESET CÔTÉ
                // -------------------------------------------------

                cote.value = "";


                // -------------------------------------------------
                // RESET PROBLÈME
                // -------------------------------------------------

                probleme.innerHTML = `
                    <option value="">
                        Sélectionner un problème
                    </option>
                `;


                localisationGroup.style.display =
                    "none";

                niveauGroup.style.display =
                    "none";

                coteGroup.style.display =
                    "none";

                problemeGroup.style.display =
                    "none";


                if (!type) {
                    return;
                }


                // -------------------------------------------------
                // AJOUT DES LOCALISATIONS
                // -------------------------------------------------

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
        // LOCALISATION → NIVEAU / CÔTÉ
        // =====================================================

        localisation.addEventListener(
            "change",
            () => {

                const type =
                    typeProbleme.value;

                const lieu =
                    localisation.value;


                // -------------------------------------------------
                // RESET
                // -------------------------------------------------

                niveau.innerHTML = `
                    <option value="">
                        Sélectionner le niveau
                    </option>
                `;

                cote.value = "";

                probleme.innerHTML = `
                    <option value="">
                        Sélectionner un problème
                    </option>
                `;


                niveauGroup.style.display =
                    "none";

                coteGroup.style.display =
                    "none";

                problemeGroup.style.display =
                    "none";


                if (
                    !type ||
                    !lieu
                ) {
                    return;
                }


                // =================================================
                // NIVEAU / ÉTAGE
                // =================================================
                //
                // Toilettes
                // Couloir
                // Escalier
                //
                // nécessitent un niveau.
                // =================================================

                if (
                    lieu === "Toilettes" ||
                    lieu === "Couloir" ||
                    lieu === "Escalier"
                ) {

                    niveaux.forEach(
                        (niveauItem) => {

                            niveau.innerHTML += `
                                <option value="${niveauItem}">
                                    ${niveauItem}
                                </option>
                            `;

                        }
                    );


                    niveauGroup.style.display =
                        "block";

                }


                // =================================================
                // CÔTÉ
                // =================================================
                //
                // Seules les toilettes nécessitent
                // actuellement une précision gauche / droite.
                // =================================================

                if (
                    lieu === "Toilettes"
                ) {

                    coteGroup.style.display =
                        "block";

                }


                // =================================================
                // CHAMBRE
                // =================================================
                //
                // La chambre est déjà connue via
                // l'hébergement de l'étudiant.
                // Aucun niveau / côté.
                // =================================================

                if (
                    lieu === "Chambre"
                ) {

                    afficherProblemes(
                        type,
                        lieu
                    );

                }

            }
        );


        // =====================================================
        // NIVEAU → PROBLÈME
        // =====================================================

        niveau.addEventListener(
            "change",
            () => {

                const type =
                    typeProbleme.value;

                const lieu =
                    localisation.value;


                if (
                    !type ||
                    !lieu ||
                    !niveau.value
                ) {

                    problemeGroup.style.display =
                        "none";

                    return;

                }


                // Pour les toilettes,
                // le côté est obligatoire avant le problème.

                if (
                    lieu === "Toilettes" &&
                    !cote.value
                ) {

                    problemeGroup.style.display =
                        "none";

                    return;

                }


                afficherProblemes(
                    type,
                    lieu
                );

            }
        );


        // =====================================================
        // CÔTÉ → PROBLÈME
        // =====================================================

        cote.addEventListener(
            "change",
            () => {

                const type =
                    typeProbleme.value;

                const lieu =
                    localisation.value;


                if (
                    !type ||
                    !lieu ||
                    !cote.value
                ) {

                    problemeGroup.style.display =
                        "none";

                    return;

                }


                if (
                    lieu === "Toilettes" &&
                    !niveau.value
                ) {

                    problemeGroup.style.display =
                        "none";

                    return;

                }


                afficherProblemes(
                    type,
                    lieu
                );

            }
        );


        // =====================================================
        // AFFICHER LES PROBLÈMES
        // =====================================================

        function afficherProblemes(
            type,
            lieu
        ) {

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
                // VALEURS
                // =============================================

                const type =
                    typeProbleme.value;


                const lieu =
                    localisation.value;


                const niveauSelectionne =
                    niveau.value;


                const coteSelectionne =
                    cote.value;


                const problemeSelectionne =
                    probleme.value;


                // =============================================
                // VÉRIFICATION TYPE
                // =============================================

                if (!type) {

                    alert(
                        "Veuillez sélectionner le type de problème."
                    );

                    return;

                }


                // =============================================
                // VÉRIFICATION LOCALISATION
                // =============================================

                if (!lieu) {

                    alert(
                        "Veuillez sélectionner la localisation du problème."
                    );

                    return;

                }


                // =============================================
                // VÉRIFICATION NIVEAU
                // =============================================

                if (
                    (
                        lieu === "Toilettes" ||
                        lieu === "Couloir" ||
                        lieu === "Escalier"
                    ) &&
                    !niveauSelectionne
                ) {

                    alert(
                        "Veuillez sélectionner le niveau / étage."
                    );

                    return;

                }


                // =============================================
                // VÉRIFICATION CÔTÉ
                // =============================================

                if (
                    lieu === "Toilettes" &&
                    !coteSelectionne
                ) {

                    alert(
                        "Veuillez sélectionner le côté."
                    );

                    return;

                }


                // =============================================
                // VÉRIFICATION PROBLÈME
                // =============================================

                if (
                    !problemeSelectionne
                ) {

                    alert(
                        "Veuillez sélectionner le problème."
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

                            niveau:
                                niveauSelectionne || "",

                            cote:
                                coteSelectionne || "",

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