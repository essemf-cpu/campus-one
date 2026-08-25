import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";

import {
    getBons
} from "../../../services/bonsService.js";


requireRole(
    "agent",
    async ({
        profile,
        permissions,
        affectation,
        posteId,
        anneeAcademique,
        lectureSeule
    }) => {

        console.log("1 - requireRole OK");
        console.log("👤 profile :", profile);


        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Entretien et de la Maintenance"
        ) {

            console.warn(
                "⛔ Service incorrect :",
                profile.service
            );

            document.body.classList.add("loaded");

            document
                .getElementById("app-loader")
                ?.classList.add("hidden");

            return;
        }

        console.log("2 - service OK");


        // =====================================================
        // VÉRIFICATION POSTE
        // =====================================================

        if (
            profile.posteId !==
            "chef_atelier"
        ) {

            console.warn(
                "⛔ Poste incorrect :",
                profile.posteId
            );

            document.body.classList.add("loaded");

            document
                .getElementById("app-loader")
                ?.classList.add("hidden");

            return;
        }

        console.log("3 - poste OK");


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar({
            ...profile,
            permissions,
            affectation:
                affectation?.affectation ||
                profile?.affectation ||
                "",
            posteId,
            anneeAcademique,
            lectureSeule
        });


        // =====================================================
        // TITRE
        // =====================================================

        const pageTitle =
            document.getElementById(
                "page-title"
            );

        if (pageTitle) {

            pageTitle.textContent =
                `Atelier ${profile.site || ""}`.trim();

        }


        // =====================================================
        // SITE ATELIER
        // =====================================================

        const siteAgent =
            profile.site;


        if (!siteAgent) {

            console.error(
                "❌ Impossible de déterminer le site de l'Atelier."
            );

            document.body.classList.add("loaded");

            document
                .getElementById("app-loader")
                ?.classList.add("hidden");

            return;
        }


        console.log(
            "🏭 Site Atelier :",
            siteAgent
        );


        // =====================================================
        // TYPES DE TRAVAUX
        // =====================================================

        let types = [];

        try {

            types =
                await getTypesTravaux();

        } catch (error) {

            console.error(
                "❌ Erreur chargement types de travaux :",
                error
            );

        }


        const typesTravauxMap =
            new Map(
                types.map(
                    type => [
                        type.id,
                        type.nom
                    ]
                )
            );


        const typeSelect =
            document.getElementById(
                "typeFiltre"
            );


        if (typeSelect) {

            typeSelect.innerHTML = `
                <option value="">
                    Tous les types
                </option>
            `;

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

            anneeSelect.innerHTML = `
                <option value="">
                    Toutes les années
                </option>
            `;

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


        if (!tbody) {

            console.error(
                "❌ anciens-body introuvable."
            );

            document.body.classList.add("loaded");

            document
                .getElementById("app-loader")
                ?.classList.add("hidden");

            return;
        }


        // =====================================================
        // BONS
        // =====================================================

        let bons = [];


        // =====================================================
        // FORMAT DATE + HEURE
        // =====================================================

        function formaterDate(dateValue) {

            if (!dateValue) {
                return "-";
            }


            const valeur =
                String(dateValue).trim();


            /*
             * Format attendu :
             *
             * 2026-08-22
             * 2026-08-22T14:35:00
             * 2026-08-22T14:35:00.000Z
             */


            const correspondance =
                valeur.match(
                    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/
                );


            if (correspondance) {

                const jour =
                    correspondance[3];

                const mois =
                    correspondance[2];

                const annee =
                    correspondance[1];


                let resultat =
                    `${jour}/${mois}/${annee}`;


                if (
                    correspondance[4] !== undefined &&
                    correspondance[5] !== undefined
                ) {

                    resultat +=
                        ` à ${correspondance[4]}:${correspondance[5]}`;

                }


                return resultat;

            }


            // =================================================
            // FIREBASE TIMESTAMP / DATE JAVASCRIPT
            // =================================================

            let dateObjet;


            if (
                dateValue &&
                typeof dateValue.toDate === "function"
            ) {

                dateObjet =
                    dateValue.toDate();

            }

            else {

                dateObjet =
                    new Date(dateValue);

            }


            if (
                Number.isNaN(
                    dateObjet.getTime()
                )
            ) {

                return valeur;

            }


            const dateFormatee =
                new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }
                ).format(
                    dateObjet
                );


            const heureFormatee =
                new Intl.DateTimeFormat(
                    "fr-FR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    }
                ).format(
                    dateObjet
                );


            return `${dateFormatee} à ${heureFormatee}`;

        }


        // =====================================================
        // DATE UTILISÉE POUR LES FILTRES
        // =====================================================

        function obtenirDatePourFiltre(
            dateValue
        ) {

            if (!dateValue) {
                return null;
            }


            if (
                dateValue &&
                typeof dateValue.toDate === "function"
            ) {

                return dateValue.toDate();

            }


            const valeur =
                String(dateValue).trim();


            const correspondance =
                valeur.match(
                    /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/
                );


            if (correspondance) {

                const annee =
                    Number(correspondance[1]);

                const mois =
                    Number(correspondance[2]) - 1;

                const jour =
                    Number(correspondance[3]);

                const heure =
                    Number(
                        correspondance[4] || 0
                    );

                const minute =
                    Number(
                        correspondance[5] || 0
                    );


                return new Date(
                    annee,
                    mois,
                    jour,
                    heure,
                    minute
                );

            }


            const dateObjet =
                new Date(dateValue);


            if (
                Number.isNaN(
                    dateObjet.getTime()
                )
            ) {

                return null;

            }


            return dateObjet;

        }


        // =====================================================
        // LIBELLÉ DU STATUT
        // =====================================================

        function formaterStatut(statut) {

            switch (statut) {

                case "envoye":
                    return "Envoyé";

                case "recu":
                    return "Reçu";

                case "en_cours":
                    return "En cours";

                case "termine":
                    return "Terminée";

                case "non_termine":
                    return "Non terminée";

                default:
                    return statut || "-";

            }

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


            // =================================================
            // FILTRAGE
            // =================================================

            const anciensBons =
                bons.filter(
                    bon => {

                        if (!bon.date) {
                            return false;
                        }


                        const date =
                            obtenirDatePourFiltre(
                                bon.date
                            );


                        if (!date) {
                            return false;
                        }


                        // =====================================
                        // RECHERCHE
                        // =====================================

                        if (recherche) {

                            const contenuRecherche = [

                                bon.id,

                                bon.pavillon,

                                bon.localisation,

                                bon.niveau,

                                bon.cote,

                                bon.chambre,

                                bon.description,

                                bon.par,

                                bon.agentNom,

                                bon.agentMatricule,

                                bon.cause,

                                bon.type,

                                typesTravauxMap.get(
                                    bon.type
                                )

                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();


                            if (
                                !contenuRecherche.includes(
                                    recherche
                                )
                            ) {

                                return false;

                            }

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
            // TRI
            // =================================================

            anciensBons.sort(
                (a, b) => {

                    const dateA =
                        obtenirDatePourFiltre(
                            a.date
                        );

                    const dateB =
                        obtenirDatePourFiltre(
                            b.date
                        );


                    if (!dateA && !dateB) {
                        return 0;
                    }

                    if (!dateA) {
                        return 1;
                    }

                    if (!dateB) {
                        return -1;
                    }


                    return (
                        dateB.getTime() -
                        dateA.getTime()
                    );

                }
            );


            // =================================================
            // RESET TABLEAU
            // =================================================

            tbody.innerHTML = "";


            // =================================================
            // AUCUN BON
            // =================================================

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
            // AFFICHAGE
            // =================================================

            anciensBons.forEach(
                bon => {

                    const dateAffichee =
                        formaterDate(
                            bon.date
                        );


                    const typeNom =
                        typesTravauxMap.get(
                            bon.type
                        ) ||
                        bon.type ||
                        "-";


                    const statut =
                        bon.statut ||
                        "-";


                    tbody.innerHTML += `

                        <tr>

                            <!-- ID -->

                            <td class="bon-id">
                                ${bon.id || "-"}
                            </td>


                            <!-- DATE + HEURE -->

                            <td>
                                ${dateAffichee}
                            </td>


                            <!-- TYPE -->

                            <td>
                                ${typeNom}
                            </td>


                            <!-- PAVILLON -->

                            <td>
                                ${bon.pavillon || "-"}
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


                            <!-- DESCRIPTION -->

                            <td class="description-cell">
                                ${bon.description || "-"}
                            </td>


                            <!-- PAR -->

                            <td>
                                ${
                                    bon.par ||
                                    bon.agentNom ||
                                    bon.agentMatricule ||
                                    "-"
                                }
                            </td>


                            <!-- STATUT -->

                            <td>

                                <span
                                    class="statut statut-${statut}"
                                >
                                    ${formaterStatut(statut)}
                                </span>

                            </td>


                            <!-- CAUSE -->

                            <td class="cause-cell">

                                ${
                                    bon.cause ||
                                    "-"
                                }

                            </td>

                        </tr>

                    `;

                }
            );

        }


        // =====================================================
        // ÉCOUTE TEMPS RÉEL FIRESTORE
        // =====================================================

        const bonsQuery =
            query(

                collection(
                    db,
                    "bons"
                ),

                where(
                    "site",
                    "==",
                    siteAgent
                )

            );


        const unsubscribeBons =
            onSnapshot(

                bonsQuery,

                snapshot => {

                    console.log(
                        "📡 Bons mis à jour en temps réel :",
                        snapshot.size
                    );


                    bons =
                        snapshot.docs.map(
                            documentSnapshot => ({

                                id:
                                    documentSnapshot.id,

                                ...documentSnapshot.data()

                            })
                        );


                    // =================================================
                    // UNIQUEMENT LES BONS ANCIENS
                    // =================================================

                    bons =
                        bons.filter(
                            bon => {

                                if (
                                    bon.supprime === true
                                ) {

                                    return false;

                                }


                                if (
                                    bon.archive !== true
                                ) {

                                    return false;

                                }


                                return true;

                            }
                        );


                    console.log(
                        "📚 Anciens bons archivés :",
                        bons.length
                    );


                    afficherBons();

                },


                error => {

                    console.error(
                        "❌ Écoute temps réel des anciens bons :",
                        error
                    );


                    // =================================================
                    // FALLBACK
                    // =================================================

                    tbody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="12">

                                Impossible de charger
                                les anciens bons.

                            </td>

                        </tr>

                    `;

                }

            );


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

        /*
         * L'écouteur Firestore s'occupe maintenant
         * du premier chargement.
         */


        // =====================================================
        // FIN
        // =====================================================

        document.body.classList.add(
            "loaded"
        );

        document
            .getElementById("app-loader")
            ?.classList.add("hidden");


        console.log(
            "✅ Anciens bons : écoute temps réel activée."
        );

    }
);