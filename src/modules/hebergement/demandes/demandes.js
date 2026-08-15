import { requireRole } from "../../../auth/authGuard.js";

import { loadSidebar } from "../components/sidebar.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";

import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


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


        try {

            const snapshot =
                await getDocs(
                    demandesQuery
                );


            console.log(
                "📋 Demandes trouvées :",
                snapshot.size
            );


            // =================================================
            // AUCUNE DEMANDE
            // =================================================

            if (
                snapshot.empty
            ) {

                demandesBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="10">

                            Aucune demande pour le moment

                        </td>

                    </tr>

                `;

                return;

            }


            // =================================================
            // AFFICHAGE
            // =================================================

            demandesBody.innerHTML = "";


            snapshot.forEach(
                (document) => {

                    const demande =
                        document.data();


                    const nomComplet =
                        `${demande.prenom || ""} ${demande.nom || ""}`
                            .trim();


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


                            <!-- LIT -->

                            <td>
                                ${demande.lit || "-"}
                            </td>


                            <!-- TYPE -->

                            <td>
                                ${demande.type || "-"}
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

                                <button
                                    type="button"
                                    class="primary-btn"
                                    data-id="${document.id}"
                                >
                                    Voir
                                </button>

                            </td>

                        </tr>

                    `;

                }
            );


        } catch (error) {

            console.error(
                "❌ Erreur récupération demandes :",
                error
            );


            demandesBody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="10">

                        Impossible de charger
                        les demandes.

                    </td>

                </tr>

            `;

        }


        console.log(
            "6 - page prête"
        );


        document.body.classList.add(
            "loaded"
        );

    }
);