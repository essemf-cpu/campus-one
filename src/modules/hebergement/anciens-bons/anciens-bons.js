import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";

import {
    getBons
} from "../../../services/bonsService.js";


requireRole(
    "agent",
    async ({
        profile
    }) => {

        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {
            return;
        }


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar(profile);


        // =====================================================
        // TITRE
        // =====================================================

        document
            .getElementById("page-title")
            .textContent =
                profile.affectation;


        // =====================================================
        // IDENTIFICATION DU SITE ET DU PAVILLON
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

            console.error(
                "❌ Impossible de déterminer le site ou le pavillon."
            );

            return;
        }


        // =====================================================
        // TYPES DE TRAVAUX
        // =====================================================

        const typeSelect =
            document.getElementById(
                "typeFiltre"
            );


        const types =
            await getTypesTravaux();


        const typesTravauxMap =
            new Map(
                types.map(
                    type => [
                        type.id,
                        type.nom
                    ]
                )
            );


        if (typeSelect) {

            typeSelect.innerHTML =
                `<option value="">
                    Tous les types
                </option>`;


            types.forEach(
                type => {

                    typeSelect.innerHTML += `
                        <option value="${type.id}">
                            ${type.nom}
                        </option>
                    `;

                }
            );

        }


        // =====================================================
        // ANNÉES
        // =====================================================

        const anneeSelect =
            document.getElementById(
                "anneeFiltre"
            );


        const anneeActuelle =
            new Date().getFullYear();


        if (anneeSelect) {

            for (
                let annee = anneeActuelle;
                annee >= 2023;
                annee--
            ) {

                anneeSelect.innerHTML += `
                    <option value="${annee}">
                        ${annee}
                    </option>
                `;

            }

        }


        // =====================================================
        // ÉLÉMENTS
        // =====================================================

        const tbody =
            document.getElementById(
                "anciens-body"
            );


        const rechercheInput =
            document.getElementById(
                "recherche"
            );


        const periodeSelect =
            document.getElementById(
                "periode"
            );


        const moisSelect =
            document.getElementById(
                "moisFiltre"
            );


        // =====================================================
        // CHARGEMENT DES BONS
        // =====================================================

        let bons = [];


        try {

            bons =
                await getBons({

                    site:
                        siteAgent,

                    pavillon:
                        pavillonAgent

                });


        } catch (error) {

            console.error(
                "❌ Chargement des anciens bons :",
                error
            );


            tbody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="12">

                        Impossible de charger
                        les anciens bons.

                    </td>

                </tr>

            `;

            return;

        }


        // =====================================================
        // AFFICHAGE
        // =====================================================

        function afficherBons() {

            const recherche =
                rechercheInput
                    ?.value
                    ?.trim()
                    .toLowerCase() || "";


            const typeFiltre =
                typeSelect
                    ?.value || "";


            const periode =
                periodeSelect
                    ?.value || "";


            const anneeFiltre =
                anneeSelect
                    ?.value || "";


            const moisFiltre =
                moisSelect
                    ?.value || "";


            const maintenant =
                new Date();


            const aujourdHui =
                maintenant
                    .toISOString()
                    .split("T")[0];


            // =================================================
            // FILTRAGE
            // =================================================

            const anciensBons =
                bons.filter(
                    bon => {

                        if (!bon.date) {
                            return false;
                        }


                        const dateBon =
                            String(
                                bon.date
                            ).split("T")[0];


                        // =====================================
                        // EXCLURE LES BONS DU JOUR
                        // =====================================

                        if (
                            dateBon ===
                            aujourdHui
                        ) {

                            return false;

                        }


                        const date =
                            new Date(
                                dateBon +
                                "T00:00:00"
                            );


                        // =====================================
                        // RECHERCHE PAR DATE
                        // =====================================

                        if (
                            recherche &&
                            !dateBon
                                .split("-")
                                .reverse()
                                .join("/")
                                .includes(
                                    recherche
                                )
                        ) {

                            return false;

                        }


                        // =====================================
                        // TYPE
                        // =====================================

                        if (
                            typeFiltre &&
                            bon.type !==
                            typeFiltre
                        ) {

                            return false;

                        }


                        // =====================================
                        // ANNÉE
                        // =====================================

                        if (
                            anneeFiltre &&
                            String(
                                date.getFullYear()
                            ) !==
                            String(
                                anneeFiltre
                            )
                        ) {

                            return false;

                        }


                        // =====================================
                        // MOIS
                        // =====================================

                        if (
                            moisFiltre &&
                            String(
                                date.getMonth() + 1
                            ).padStart(
                                2,
                                "0"
                            ) !==
                            moisFiltre
                        ) {

                            return false;

                        }


                        // =====================================
                        // PÉRIODE
                        // =====================================

                        if (periode) {

                            const debut =
                                new Date(
                                    maintenant
                                );


                            if (
                                periode ===
                                "semaine"
                            ) {

                                debut.setDate(
                                    maintenant.getDate() - 7
                                );

                            }


                            else if (
                                periode ===
                                "mois"
                            ) {

                                debut.setMonth(
                                    maintenant.getMonth() - 1
                                );

                            }


                            else if (
                                periode ===
                                "annee"
                            ) {

                                debut.setFullYear(
                                    maintenant.getFullYear() - 1
                                );

                            }


                            debut.setHours(
                                0,
                                0,
                                0,
                                0
                            );


                            if (
                                date <
                                debut
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );


            // =================================================
            // AUCUN BON
            // =================================================

            tbody.innerHTML = "";


            if (
                anciensBons.length ===
                0
            ) {

                tbody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="12">

                            Aucun ancien bon trouvé.

                        </td>

                    </tr>

                `;

                return;

            }


            // =================================================
            // AFFICHAGE DES LIGNES
            // =================================================

            anciensBons.forEach(
                bon => {

                    const dateAffichee =
                        bon.date
                            ? String(
                                bon.date
                            )
                                .split("T")[0]
                                .split("-")
                                .reverse()
                                .join("/")
                            : "-";


                    tbody.innerHTML += `

                        <tr>

                            <!-- ID -->

                            <td>
                                ${bon.id || "-"}
                            </td>


                            <!-- DATE -->

                            <td>
                                ${dateAffichee}
                            </td>


                            <!-- TYPE -->

                            <td>
                                ${
                                    typesTravauxMap.get(
                                        bon.type
                                    ) || "-"
                                }
                            </td>


                            <!-- LOCALISATION -->

                            <td>
                                ${bon.localisation || "-"}
                            </td>


                            <!-- NIVEAU -->

                            <td>
                                ${bon.niveau || "-"}
                            </td>


                            <!-- CÔTÉ -->

                            <td>
                                ${bon.cote || "-"}
                            </td>


                            <!-- CHAMBRE -->

                            <td>
                                ${bon.chambre || "-"}
                            </td>


                            <!-- TOILETTE -->

                            <td>
                                ${bon.toilette || "-"}
                            </td>


                            <!-- DESCRIPTION -->

                            <td>
                                ${bon.description || "-"}
                            </td>


                            <!-- PAR -->

                            <td>
                                ${bon.par || "-"}
                            </td>


                            <!-- STATUT -->

                            <td>
                                ${bon.statut || "-"}
                            </td>


                            <!-- CAUSE -->

                            <td>
                                ${bon.cause || "-"}
                            </td>

                        </tr>

                    `;

                }
            );

        }


        // =====================================================
        // FILTRES
        // =====================================================

        [
            rechercheInput,
            typeSelect,
            periodeSelect,
            anneeSelect,
            moisSelect

        ].forEach(
            element => {

                element?.addEventListener(
                    "input",
                    afficherBons
                );

                element?.addEventListener(
                    "change",
                    afficherBons
                );

            }
        );


        // =====================================================
        // PREMIER AFFICHAGE
        // =====================================================

        afficherBons();


        // =====================================================
        // FIN
        // =====================================================

        document.body.classList.add(
            "loaded"
        );

    }
);