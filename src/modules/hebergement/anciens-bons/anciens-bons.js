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


// =====================================================
// FORMATAGE DATE + HEURE
// =====================================================

function formaterDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    // Firebase Timestamp
    if (
        dateValue &&
        typeof dateValue.toDate === "function"
    ) {

        const dateObjet =
            dateValue.toDate();

        return new Intl.DateTimeFormat(
            "fr-FR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            }
        ).format(dateObjet);

    }


    const valeur =
        String(dateValue).trim();


    // =================================================
    // FORMAT ISO
    // =================================================

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
    // AUTRE FORMAT DE DATE
    // =================================================

    const dateObjet =
        new Date(dateValue);


    if (
        Number.isNaN(
            dateObjet.getTime()
        )
    ) {

        return valeur;

    }


    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }
    ).format(
        dateObjet
    );

}


// =====================================================
// OBTENIR DATE JAVASCRIPT
// =====================================================

function obtenirDate(dateValue) {

    if (!dateValue) {
        return null;
    }


    // Firebase Timestamp
    if (
        dateValue &&
        typeof dateValue.toDate === "function"
    ) {

        const date =
            dateValue.toDate();

        return Number.isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const valeur =
        String(dateValue).trim();


    // =================================================
    // FORMAT ISO
    // =================================================

    const correspondance =
        valeur.match(
            /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/
        );


    if (correspondance) {

        const annee =
            Number(
                correspondance[1]
            );

        const mois =
            Number(
                correspondance[2]
            ) - 1;

        const jour =
            Number(
                correspondance[3]
            );

        const heure =
            Number(
                correspondance[4] || 0
            );

        const minute =
            Number(
                correspondance[5] || 0
            );

        const seconde =
            Number(
                correspondance[6] || 0
            );


        return new Date(
            annee,
            mois,
            jour,
            heure,
            minute,
            seconde
        );

    }


    // =================================================
    // DATE JAVASCRIPT
    // =================================================

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
// OBTENIR DATE JMA POUR COMPARAISON
// =====================================================

function obtenirDateSimple(dateValue) {

    const date =
        obtenirDate(dateValue);


    if (!date) {
        return null;
    }


    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

}


// =====================================================
// RÔLE AGENT
// =====================================================

requireRole(
    "agent",
    async ({
        profile
    }) => {


        // =================================================
        // VÉRIFICATION SERVICE
        // =================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {

            console.warn(
                "⛔ Service incorrect :",
                profile.service
            );

            return;

        }


        // =================================================
        // SIDEBAR
        // =================================================

        await loadSidebar(
            profile
        );


        // =================================================
        // TITRE
        // =================================================

        const pageTitle =
            document.getElementById(
                "page-title"
            );


        if (pageTitle) {

            pageTitle.textContent =
                profile.affectation || "";

        }


        // =================================================
        // IDENTIFICATION SITE
        // =================================================

        const siteAgent =
            profile.site;


        // =================================================
        // IDENTIFICATION PAVILLON
        // =================================================

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


        // =================================================
        // VÉRIFICATION
        // =================================================

        if (
            !siteAgent ||
            !pavillonAgent
        ) {

            console.error(
                "❌ Impossible de déterminer le site ou le pavillon."
            );

            return;

        }


        // =================================================
        // TYPES DE TRAVAUX
        // =================================================

        const typeSelect =
            document.getElementById(
                "typeFiltre"
            );


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


        // =================================================
        // ANNÉES
        // =================================================

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


        // =================================================
        // ÉLÉMENTS
        // =================================================

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

            return;

        }


        // =================================================
        // BONS
        // =================================================

        let bons = [];


        // =================================================
        // AFFICHAGE
        // =================================================

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
            // DATE DU JOUR
            // =================================================

            const aujourdHui =
                new Date(
                    maintenant.getFullYear(),
                    maintenant.getMonth(),
                    maintenant.getDate()
                );


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
                            obtenirDate(
                                bon.date
                            );


                        if (!date) {

                            return false;

                        }


                        const dateSimple =
                            new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                date.getDate()
                            );


                        // =========================================
                        // EXCLURE LES BONS DU JOUR
                        // =========================================

                        if (
                            dateSimple.getTime() ===
                            aujourdHui.getTime()
                        ) {

                            return false;

                        }


                        // =========================================
                        // RECHERCHE
                        // =========================================

                        if (recherche) {


                            const contenuRecherche = [

                                bon.id,

                                bon.localisation,

                                bon.niveau,

                                bon.cote,

                                bon.chambre,

                                bon.description,

                                bon.par,

                                bon.agentNom,

                                bon.agentMatricule,

                                bon.statut,

                                bon.cause,

                                bon.type,

                                typesTravauxMap.get(
                                    bon.type
                                ),

                                formaterDate(
                                    bon.date
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


                        // =========================================
                        // TYPE
                        // =========================================

                        if (
                            typeFiltre &&
                            bon.type !==
                            typeFiltre
                        ) {

                            return false;

                        }


                        // =========================================
                        // ANNÉE
                        // =========================================

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


                        // =========================================
                        // MOIS
                        // =========================================

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


                        // =========================================
                        // PÉRIODE
                        // =========================================

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
                        obtenirDate(
                            a.date
                        );


                    const dateB =
                        obtenirDate(
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

            tbody.innerHTML =
                "";


            // =================================================
            // AUCUN BON
            // =================================================

            if (
                anciensBons.length ===
                0
            ) {

                tbody.innerHTML = `
                    <tr class="empty-row">

                        <td colspan="11">

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
                        formaterDate(
                            bon.date
                        );


                    const typeNom =
                        typesTravauxMap.get(
                            bon.type
                        ) ||
                        bon.type ||
                        "-";


                    tbody.innerHTML += `

                        <tr>

                            <!-- ID -->

                            <td>

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

                            <td>

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
        // REQUÊTE FIRESTORE TEMPS RÉEL
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
                ),

                where(
                    "pavillon",
                    "==",
                    pavillonAgent
                )

            );


        // =====================================================
        // ÉCOUTE TEMPS RÉEL
        // =====================================================

        const unsubscribe =
            onSnapshot(

                bonsQuery,

                snapshot => {

                    console.log(
                        "📡 Bons du pavillon mis à jour en temps réel :",
                        snapshot.size
                    );


                    // =================================================
                    // RÉCUPÉRATION
                    // =================================================

                    bons =
                        snapshot.docs.map(
                            documentSnapshot => ({

                                id:
                                    documentSnapshot.id,

                                ...documentSnapshot.data()

                            })
                        );


// =================================================
// EXCLURE UNIQUEMENT LES BONS SUPPRIMÉS
// =================================================

bons =
    bons.filter(
        bon => {

            if (
                bon.supprime === true
            ) {

                return false;

            }

            return true;

        }
    );


                    console.log(
                        "📚 Anciens bons du pavillon :",
                        bons.length
                    );


                    // =================================================
                    // AFFICHAGE IMMÉDIAT
                    // =================================================

                    afficherBons();

                },


                error => {

                    console.error(
                        "❌ Erreur écoute temps réel des bons :",
                        error
                    );


                    tbody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="11">

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
        // NETTOYAGE LISTENER
        // =====================================================

        window.addEventListener(
            "beforeunload",
            () => {

                if (
                    typeof unsubscribe ===
                    "function"
                ) {

                    unsubscribe();

                }

            }
        );


        // =====================================================
        // FIN
        // =====================================================

        document.body.classList.add(
            "loaded"
        );


        document
            .getElementById(
                "app-loader"
            )
            ?.classList.add(
                "hidden"
            );


        console.log(
            "✅ Anciens bons du pavillon : écoute temps réel activée."
        );

    }
);