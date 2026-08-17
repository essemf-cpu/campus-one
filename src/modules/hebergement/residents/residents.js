import { requireRole } from "../../../auth/authGuard.js";

import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import { loadSidebar } from "../components/sidebar.js";


requireRole(
    "agent",
    async ({
        profile,
        anneeAcademique
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

        await loadSidebar(
            profile
        );


        // =====================================================
        // ÉLÉMENTS DOM
        // =====================================================

        const body =
            document.getElementById(
                "residents-body"
            );

        const total =
            document.getElementById(
                "total-residents"
            );

        const searchInput =
            document.getElementById(
                "search-resident"
            );

        const niveauFilter =
            document.getElementById(
                "niveau-filter"
            );

        const voirSuppleantsBtn =
            document.getElementById(
                "voir-suppleants-btn"
            );

            const pageTitle =
    document.getElementById(
        "residents-page-title"
    );

const pageSubtitle =
    document.getElementById(
        "residents-page-subtitle"
    );

const tableTitle =
    document.getElementById(
        "table-title"
    );

    const tableTitleContainer =
    document.getElementById(
        "table-title-container"
    );

const totalLabel =
    document.getElementById(
        "total-label"
    );

const occupantColumnTitle =
    document.getElementById(
        "occupant-column-title"
    );

        const anneeAcademiqueElement =
            document.getElementById(
                "annee-academique"
            );

        const pavillonElement =
            document.getElementById(
                "pavillon-concerne"
            );


        if (!body) {

            document.body.classList.add(
                "loaded"
            );

            return;

        }


        // =====================================================
        // AFFECTATION
        // =====================================================

        const site =
            profile.site ||
            "";

        const affectation =
            profile.affectation ||
            "";

        const pavillon =
            extrairePavillon(
                affectation
            );


        // =====================================================
        // ANNÉE ACADÉMIQUE
        // =====================================================
        //

        if (anneeAcademiqueElement) {

            anneeAcademiqueElement.textContent =
                anneeAcademique;

        }


        if (pavillonElement) {

            pavillonElement.textContent =
                pavillon;

        }


        console.log(
            "🏠 Résidents - affectation :",
            {
                site,
                pavillon,
                anneeAcademique
            }
        );


        if (
            !site ||
            !pavillon
        ) {

            body.innerHTML = `

                <tr class="empty-row">

                    <td colspan="7">

                        Votre affectation
                        n'est pas correctement définie.

                    </td>

                </tr>

            `;

            document.body.classList.add(
                "loaded"
            );

            return;

        }


        // =====================================================
        // DONNÉES
        // =====================================================

        let residents = [];

        let suppleants = [];

        let afficherLesSuppleants =
    localStorage.getItem(
        "residents-mode"
    ) === "suppleants";


        // =====================================================
        // CHARGEMENT
        // =====================================================

        try {

            // =================================================
            // HÉBERGEMENTS
            // =================================================
            //
            // On filtre d'abord par SITE.
            //
            // Le pavillon, le statut et l'année sont filtrés
            // localement.
            //
            // =================================================

            const hebergementsSnapshot =
                await getDocs(

                    query(

                        collection(
                            db,
                            "hebergements"
                        ),

                        where(
                            "site",
                            "==",
                            site
                        )

                    )

                );


            // =================================================
            // ÉTUDIANTS
            // =================================================

            const etudiantsSnapshot =
                await getDocs(

                    collection(
                        db,
                        "etudiants"
                    )

                );


            const etudiants =
                new Map();


            etudiantsSnapshot.docs.forEach(
                (document) => {

                    const etudiant =
                        document.data();


                    etudiants.set(
                        etudiant.matricule,
                        {
                            ...etudiant,

                            id:
                                document.id

                        }
                    );

                }
            );


            // =================================================
            // CONSTRUCTION DES LISTES
            // =================================================

            residents = [];

            suppleants = [];


            hebergementsSnapshot.docs.forEach(
                (document) => {

                    const hebergement =
                        document.data();


                    // -----------------------------------------
                    // PAVILLON DE L'AGENT
                    // -----------------------------------------

                    if (
                        hebergement.pavillon !==
                        pavillon
                    ) {

                        return;

                    }


                    // -----------------------------------------
                    // OCCUPATION ACTIVE UNIQUEMENT
                    // -----------------------------------------

                    if (
                        hebergement.statutOccupation !==
                        "actif"
                    ) {

                        return;

                    }


                    // -----------------------------------------
                    // ANNÉE ACADÉMIQUE
                    // -----------------------------------------
                    //
                    // Si une année est sélectionnée dans la
                    // session, on ne prend que cette année.
                    //
                    // Si profile.anneeAcademique n'existe pas
                    // encore, aucun filtre d'année n'est imposé.
                    //
                    // -----------------------------------------

                    if (
                        anneeAcademique &&
                        hebergement.anneeAcademique &&
                        hebergement.anneeAcademique !==
                            anneeAcademique
                    ) {

                        return;

                    }


                    // -----------------------------------------
                    // ÉTUDIANT
                    // -----------------------------------------

                    const etudiant =
                        etudiants.get(
                            hebergement.matricule
                        );


                    if (!etudiant) {

                        console.warn(
                            "⚠️ Étudiant introuvable :",
                            hebergement.matricule
                        );

                        return;

                    }


                    // -----------------------------------------
                    // OCCUPANT
                    // -----------------------------------------

                    const occupant = {

                        ...etudiant,

                        hebergement,

                        chambre:
                            hebergement.chambre ||
                            "-"

                    };


                    // -----------------------------------------
                    // SUPPLÉANT
                    // -----------------------------------------

                    if (
                        hebergement.typeOccupation ===
                        "suppleant"
                    ) {

                        suppleants.push(
                            occupant
                        );

                        return;

                    }


                    // -----------------------------------------
                    // RÉSIDENT TITULAIRE
                    // -----------------------------------------

                    residents.push(
                        occupant
                    );

                }
            );


            // =================================================
            // TRI
            // =================================================

            trierResidents(
                residents
            );

            trierResidents(
                suppleants
            );


            // =================================================
            // COMPTEUR INITIAL
            // =================================================

            total.textContent =
                residents.length;


            // =================================================
            // NIVEAUX
            // =================================================

            trierResidents(
    residents
);

trierResidents(
    suppleants
);


mettreAJourNiveaux(

    afficherLesSuppleants
        ?
        suppleants
        :
        residents

);


mettreAJourInterface();


afficherResidents();


        } catch (error) {

            console.error(
                "❌ Erreur chargement résidents :",
                error
            );


            body.innerHTML = `

                <tr class="empty-row">

                    <td colspan="7">

                        Impossible de charger
                        les résidents.

                    </td>

                </tr>

            `;

        } finally {

            // =================================================
            // LE LOADER DOIT TOUJOURS DISPARAÎTRE
            // =================================================

            document.body.classList.add(
                "loaded"
            );

        }


        // =====================================================
        // AFFICHER LES RÉSIDENTS
        // =====================================================

        function afficherResidents() {

            const listeActive =
                afficherLesSuppleants
                    ?
                    suppleants
                    :
                    residents;


            const recherche =
                searchInput
                    ?
                    searchInput.value
                        .toLowerCase()
                        .trim()
                    :
                    "";


            const niveau =
                niveauFilter
                    ?
                    niveauFilter.value
                    :
                    "";


            const resultat =
                listeActive.filter(
                    (resident) => {

                        const texte =
                            [

                                resident.nom,

                                resident.prenom,

                                resident.matricule,

                                resident.numeroEtudiant,

                                resident.telephone,

                                resident.filiere,

                                resident.etablissement,

                                resident.faculte

                            ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                        const rechercheOK =
                            !recherche ||
                            texte.includes(
                                recherche
                            );


                        const niveauOK =
                            !niveau ||
                            resident.niveau ===
                                niveau;


                        return (
                            rechercheOK &&
                            niveauOK
                        );

                    }
                );


            body.innerHTML = "";


            // =================================================
            // AUCUN RÉSULTAT
            // =================================================

            if (
                resultat.length === 0
            ) {

                body.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="7">

                            ${
                                afficherLesSuppleants
                                    ?
                                    "Aucun suppléant trouvé."
                                    :
                                    "Aucun résident trouvé."
                            }

                        </td>

                    </tr>

                `;

                return;

            }


            // =================================================
            // AFFICHAGE
            // =================================================

            resultat.forEach(
                (resident, index) => {

                    const tr =
                        document.createElement(
                            "tr"
                        );


                    // =========================================
                    // SÉPARATION ENTRE LES CHAMBRES
                    // =========================================

                    if (
                        index > 0 &&
                        resultat[index - 1].chambre !==
                            resident.chambre
                    ) {

                        tr.classList.add(
                            "room-separator"
                        );

                    }


                    // =========================================
                    // LIGNE
                    // =========================================

                    tr.innerHTML = `

                        <td>

                            <strong>

                                ${escapeHtml(
                                    resident.chambre ||
                                    "-"
                                )}

                            </strong>

                        </td>


                        <td>

                            <strong>

                                ${escapeHtml(
                                    resident.prenom ||
                                    ""
                                )}

                                ${escapeHtml(
                                    resident.nom ||
                                    ""
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapeHtml(
                                resident.matricule ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                resident.telephone ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                resident.etablissement ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                resident.filiere ||
                                "-"
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                resident.niveau ||
                                "-"
                            )}

                        </td>

                    `;


                    body.appendChild(
                        tr
                    );

                }
            );

        }


        // =====================================================
        // TRI PAR CHAMBRE
        // =====================================================

        function trierResidents(
            liste
        ) {

            liste.sort(
                (a, b) => {

                    const chambreA =
                        String(
                            a.chambre ||
                            ""
                        );


                    const chambreB =
                        String(
                            b.chambre ||
                            ""
                        );


                    const comparaison =
                        chambreA.localeCompare(
                            chambreB,
                            "fr",
                            {
                                numeric: true
                            }
                        );


                    if (
                        comparaison !== 0
                    ) {

                        return comparaison;

                    }


                    // -----------------------------------------
                    // MÊME CHAMBRE :
                    // PRÉNOM PUIS NOM
                    // -----------------------------------------

                    const nomA =
                        `${a.prenom || ""} ${a.nom || ""}`
                            .toLowerCase();


                    const nomB =
                        `${b.prenom || ""} ${b.nom || ""}`
                            .toLowerCase();


                    return nomA.localeCompare(
                        nomB,
                        "fr"
                    );

                }
            );

        }


        // =====================================================
        // NIVEAUX
        // =====================================================

        function mettreAJourNiveaux(
            liste
        ) {

            if (!niveauFilter) {
                return;
            }


            niveauFilter.innerHTML = `

                <option value="">
                    Tous les niveaux
                </option>

            `;


            const niveaux =
                [
                    ...new Set(
                        liste
                            .map(
                                (resident) =>
                                    resident.niveau
                            )
                            .filter(Boolean)
                    )
                ]
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "fr"
                        )
                );


            niveaux.forEach(
                (niveau) => {

                    niveauFilter.innerHTML += `

                        <option
                            value="${escapeAttribute(
                                niveau
                            )}"
                        >

                            ${escapeHtml(
                                niveau
                            )}

                        </option>

                    `;

                }
            );

        }


        // =====================================================
        // RECHERCHE
        // =====================================================

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                afficherResidents
            );

        }


        // =====================================================
        // FILTRE NIVEAU
        // =====================================================

        if (niveauFilter) {

            niveauFilter.addEventListener(
                "change",
                afficherResidents
            );

        }

        function mettreAJourInterface() {

    if (
        afficherLesSuppleants
    ) {

        if (tableTitleContainer) {

    tableTitleContainer.classList.add(
        "suppleants-table-title"
    );

}

        // =================================================
        // MODE SUPPLÉANTS
        // =================================================

        if (pageTitle) {

            pageTitle.textContent =
                "Suppléants";

        }


        if (pageSubtitle) {

            pageSubtitle.innerHTML = `

                Suppléants de l’année académique
                <span>
                    ${escapeHtml(
                        anneeAcademique
                    )}
                </span>
                du pavillon
                <span>
                    ${escapeHtml(
                        pavillon
                    )}
                </span>

            `;

        }


        if (tableTitle) {

            tableTitle.textContent =
                "Liste des suppléants";

        }


        if (totalLabel) {

            totalLabel.textContent =
                "Nombre total de suppléants :";

        }


        if (voirSuppleantsBtn) {

            voirSuppleantsBtn.textContent =
                "Voir résidents";

        }


        if (occupantColumnTitle) {

            occupantColumnTitle.textContent =
                "Suppléant";

        }


        document
            .querySelector(
                ".residents-page"
            )
            ?.classList.add(
                "suppleants-mode"
            );


    } else {

        if (tableTitleContainer) {

    tableTitleContainer.classList.remove(
        "suppleants-table-title"
    );

}

        // =================================================
        // MODE RÉSIDENTS
        // =================================================

        if (pageTitle) {

            pageTitle.textContent =
                "Résidents";

        }


        if (pageSubtitle) {

            pageSubtitle.innerHTML = `

                Résidents de l’année académique
                <span>
                    ${escapeHtml(
                        anneeAcademique
                    )}
                </span>
                du pavillon
                <span>
                    ${escapeHtml(
                        pavillon
                    )}
                </span>

            `;

        }


        if (tableTitle) {

            tableTitle.textContent =
                "Liste des résidents";

        }


        if (totalLabel) {

            totalLabel.textContent =
                "Nombre total de résidents :";

        }


        if (voirSuppleantsBtn) {

            voirSuppleantsBtn.textContent =
                "Voir suppléants";

        }


        if (occupantColumnTitle) {

            occupantColumnTitle.textContent =
                "Résident";

        }


        document
            .querySelector(
                ".residents-page"
            )
            ?.classList.remove(
                "suppleants-mode"
            );

    }


    total.textContent =
        afficherLesSuppleants
            ?
            suppleants.length
            :
            residents.length;

}


        // =====================================================
        // VOIR / MASQUER LES SUPPLÉANTS
        // =====================================================

        if (voirSuppleantsBtn) {

    voirSuppleantsBtn.addEventListener(
        "click",
        () => {

            afficherLesSuppleants =
                !afficherLesSuppleants;


            // =============================================
            // MÉMORISER LE MODE
            // =============================================

            localStorage.setItem(
                "residents-mode",

                afficherLesSuppleants
                    ?
                    "suppleants"
                    :
                    "residents"
            );


            // =============================================
            // FILTRE NIVEAU
            // =============================================

            mettreAJourNiveaux(

                afficherLesSuppleants
                    ?
                    suppleants
                    :
                    residents

            );


            // =============================================
            // INTERFACE
            // =============================================

            mettreAJourInterface();


            // =============================================
            // TABLEAU
            // =============================================

            afficherResidents();

        }
    );

}

    }

);


// =====================================================
// EXTRAIRE LE PAVILLON
// =====================================================

function extrairePavillon(
    affectation
) {

    const texte =
        String(
            affectation
        )
        .trim();


    const match =
        texte.match(
            /Pavillon\s+(.+)/i
        );


    return match
        ?
        match[1].trim()
        :
        "";

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(
    value = ""
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ESCAPE ATTRIBUT
// =====================================================

function escapeAttribute(
    value = ""
) {

    return escapeHtml(
        value
    );

}