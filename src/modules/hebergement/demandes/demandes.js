import { requireRole } from "../../../auth/authGuard.js";

import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";


requireRole(
    "agent",
    async ({ profile }) => {

        console.log("1 - requireRole OK");


        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {

            return;

        }


        console.log("2 - service OK");


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar(profile);


        console.log("3 - sidebar chargée");


        // =====================================================
        // TITRE
        // =====================================================

        document
            .getElementById("page-title")
            .textContent =
                profile.affectation;


        // =====================================================
        // ANCIEN SYSTÈME : TYPES DE TRAVAUX
        // =====================================================

        const typeSelect =
            document.getElementById("type");


        if (typeSelect) {

            console.log(
                "4 - select trouvé"
            );


            const types =
                await getTypesTravaux();


            console.log(
                "5 - types récupérés",
                types
            );


            typeSelect.innerHTML = "";


            types.forEach(
                (type) => {

                    typeSelect.innerHTML += `

                        <option value="${type.id}">
                            ${type.nom}
                        </option>

                    `;

                }
            );

        }


        // =====================================================
        // DEMANDES DES ÉTUDIANTS
        // =====================================================

        const demandesBody =
            document.getElementById(
                "demandes-body"
            );


        if (!demandesBody) {

            console.error(
                "❌ demandes-body introuvable"
            );

            return;

        }


        // =====================================================
        // IDENTIFIER LE PAVILLON DE L'AGENT
        // =====================================================

        const siteAgent =
            profile.site;


        const pavillonAgent =
            profile.affectation
                ?.replace(
                    /^Pavillon\s+/i,
                    ""
                )
                .trim();


        console.log(
            "🏢 Site agent :",
            siteAgent
        );


        console.log(
            "🏠 Pavillon agent :",
            pavillonAgent
        );


        if (
            !siteAgent ||
            !pavillonAgent
        ) {

            demandesBody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="10">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `;

            return;

        }

        // =====================================================
// RÉFÉRENTIEL DES TYPES DE TRAVAUX
// =====================================================

const typesTravaux =
    await getTypesTravaux();

const typesTravauxMap =
    new Map(
        typesTravaux.map(
            type => [
                type.id,
                type.nom
            ]
        )
    );


        // =====================================================
        // REQUÊTE FIRESTORE
        // =====================================================

        const demandesQuery =
            query(

                collection(
                    db,
                    "demandes_etudiants"
                ),

                where(
                    "site",
                    "==",
                    siteAgent
                ),

                where(
                    "pavillon",
                    "==",
                    pavillonAgent
                )

            );


        // =====================================================
// ÉCOUTE TEMPS RÉEL DES DEMANDES
// =====================================================

onSnapshot(
    demandesQuery,

    (snapshot) => {

        console.log(
            "📋 Demandes mises à jour :",
            snapshot.size
        );


        // =================================================
        // AFFICHAGE
        // =================================================

        demandesBody.innerHTML = "";


        let demandesActives = 0;


        snapshot.forEach(
            (document) => {

                const demande =
                    document.data();


                // =================================================
                // UNIQUEMENT LES DEMANDES ACTIVES
                // =================================================

                if (
                    demande.statut &&
                    demande.statut !== "en_attente" &&
                    demande.statut !== "en_cours"
                ) {

                    return;

                }


                demandesActives++;


                const nomComplet =
                    `${demande.prenom || ""} ${demande.nom || ""}`
                        .trim();


                // =================================================
                // ACTIONS
                // =================================================

                let actions = "";


                // =============================================
                // EN ATTENTE
                // =============================================

                if (
                    (demande.statut || "en_attente") ===
                    "en_attente"
                ) {

                    actions = `

                        <div class="demande-actions">

                            <button
                                type="button"
                                class="demande-action-btn demande-action-encours"
                                data-id="${document.id}"
                                data-action="encours"
                            >
                                En cours
                            </button>

                            <button
                                type="button"
                                class="demande-action-btn demande-action-forclos"
                                data-id="${document.id}"
                                data-action="forclos"
                            >
                                Forclos
                            </button>

                        </div>

                    `;

                }


                // =============================================
                // EN COURS
                // =============================================

                else if (
                    demande.statut ===
                    "en_cours"
                ) {

                    actions = `

                        <div class="demande-actions">

                            <button
                                type="button"
                                class="demande-action-btn demande-action-termine"
                                data-id="${document.id}"
                                data-action="termine"
                            >
                                Terminée
                            </button>

                            <button
                                type="button"
                                class="demande-action-btn demande-action-nontermine"
                                data-id="${document.id}"
                                data-action="nontermine"
                            >
                                Non terminée
                            </button>

                        </div>

                    `;

                }


                // =================================================
                // LIGNE
                // =================================================

                demandesBody.innerHTML += `

                    <tr>

                        <!-- ÉTUDIANT -->

                        <td>

                            <strong>
                                ${nomComplet}
                            </strong>

                        </td>


                        <!-- CARTE -->

                        <td>
                            ${demande.matricule || "-"}
                        </td>


                        <!-- CHAMBRE -->

                        <td>
                            ${demande.chambre || "-"}
                        </td>


                        <!-- TYPE -->

                        <td>
                           ${
                             typesTravauxMap.get(
                                          demande.type
                                                  ) || "-"
                                                     }
                        </td>


                        <!-- LOCALISATION -->

                        <td>
                            ${demande.localisation || "-"}
                        </td>


                        <!-- PROBLÈME -->

                        <td>
                            ${demande.probleme || "-"}
                        </td>


                        <!-- ACTION -->

                        <td>
                            ${actions}
                        </td>

                    </tr>

                `;

            }
        );


        // =================================================
        // AUCUNE DEMANDE ACTIVE
        // =================================================

        if (
            demandesActives === 0
        ) {

            demandesBody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="7">

                        Aucune demande pour le moment

                    </td>

                </tr>

            `;

        }

    },

    // =====================================================
    // ERREUR ÉCOUTE TEMPS RÉEL
    // =====================================================

    (error) => {

        console.error(
            "❌ Erreur écoute demandes :",
            error
        );


        demandesBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="7">

                    Impossible de charger
                    les demandes.

                </td>

            </tr>

        `;

    }

);


// =====================================================
// ACTIONS DES DEMANDES ÉTUDIANTS
// =====================================================

demandesBody.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".demande-action-btn"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.id;


        const action =
            button.dataset.action;


        if (
            !id ||
            !action
        ) {

            return;

        }


        // Empêche les doubles clics

        if (
            button.disabled
        ) {

            return;

        }


        button.disabled = true;


        try {

            // =========================================
            // EN COURS
            // =========================================

            if (
                action === "encours"
            ) {

                await updateDoc(
                    doc(
                        db,
                        "demandes_etudiants",
                        id
                    ),
                    {
                        statut: "en_cours",
                        cause: "",
                        feedbackAutorise: false
                    }
                );

            }


            // =========================================
            // FORCLOS
            // =========================================

            else if (
                action === "forclos"
            ) {

                await updateDoc(
                    doc(
                        db,
                        "demandes_etudiants",
                        id
                    ),
                    {
                        statut: "forclos",

                        cause:
                            "Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.",

                        feedbackAutorise: false
                    }
                );

            }


            // =========================================
            // TERMINÉE
            // =========================================

            else if (
                action === "termine"
            ) {

                await updateDoc(
                    doc(
                        db,
                        "demandes_etudiants",
                        id
                    ),
                    {
                        statut: "termine",
                        cause: "",
                        feedbackAutorise: true
                    }
                );

            }


            // =========================================
            // NON TERMINÉE
            // =========================================

            else if (
                action === "nontermine"
            ) {

                await updateDoc(
                    doc(
                        db,
                        "demandes_etudiants",
                        id
                    ),
                    {
                        statut: "non_termine",

                        cause:
                            "Stock de matériel, merci de formuler votre demande dans les jours à venir.",

                        feedbackAutorise: false
                    }
                );

            }

        } catch (error) {

            console.error(
                "❌ Erreur action demande :",
                error
            );


            button.disabled = false;


            alert(
                "Impossible de modifier la demande."
            );

        }

    }
);

        console.log(
            "6 - page prête"
        );


        document.body.classList.add(
            "loaded"
        );

    }
);