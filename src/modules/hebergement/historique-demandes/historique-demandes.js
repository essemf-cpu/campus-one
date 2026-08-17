import { requireRole } from "../../../auth/authGuard.js";

import { loadSidebar } from "../components/sidebar.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";


requireRole(
    "agent",
    async ({ profile }) => {

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
        // TABLEAU
        // =====================================================

        const tbody =
            document.getElementById(
                "historique-body"
            );


        if (!tbody) {

            console.error(
                "❌ historique-body introuvable"
            );

            return;

        }


        // =====================================================
        // FILTRES
        // =====================================================

        const searchInput =
            document.getElementById(
                "historique-search"
            );


        const sortSelect =
            document.getElementById(
                "historique-sort"
            );


        const typeSelect =
            document.getElementById(
                "historique-type"
            );

        const statutSelect =
    document.getElementById(
        "historique-statut"
    );


        const periodeSelect =
            document.getElementById(
                "historique-periode"
            );


        const anneeContainer =
            document.getElementById(
                "historique-annee-container"
            );


        const anneeSelect =
            document.getElementById(
                "historique-annee"
            );


        const moisContainer =
            document.getElementById(
                "historique-mois-container"
            );


        const moisSelect =
            document.getElementById(
                "historique-mois"
            );


        // =====================================================
        // ÉTAT LOCAL
        // =====================================================

        let demandesHistoriques = [];


        let termeRecherche = "";


        let modeTri =
            "recent";


        let typeSelectionne =
            "tous";

        let statutSelectionne =
    "tous";


        let periodeSelectionnee =
            "toutes";


        let anneeSelectionnee =
            "";


        let moisSelectionne =
            "";


        // =====================================================
        // RÉFÉRENTIEL DES TYPES
        // =====================================================

        let typesTravaux = [];


        try {

            typesTravaux =
                await getTypesTravaux();

        } catch (error) {

            console.error(
                "❌ Erreur récupération types de travaux :",
                error
            );

        }


        const typesTravauxMap =
            new Map();


        typesTravaux.forEach(
            (type) => {

                typesTravauxMap.set(
                    type.id,
                    type.nom
                );

            }
        );


        // =====================================================
        // REMPLIR LE FILTRE TYPE
        // =====================================================

        if (typeSelect) {

            typesTravaux.forEach(
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
        // DATE
        // =====================================================

        const obtenirDate =
            (demande) => {

                if (
                    demande.date?.toDate
                ) {

                    return demande.date.toDate();

                }


                if (
                    demande.date
                ) {

                    const date =
                        new Date(
                            demande.date
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        return date;

                    }

                }


                return new Date(0);

            };


        // =====================================================
        // NOM DU TYPE
        // =====================================================

        const obtenirNomType =
            (demande) => {

                return (
                    typesTravauxMap.get(
                        demande.type
                    ) ||
                    demande.type ||
                    "-"
                );

            };


        // =====================================================
        // STATUT
        // =====================================================

        const obtenirStatut =
            (demande) => {

                if (
                    demande.statut ===
                    "termine"
                ) {

                    return "Terminée";

                }


                if (
                    demande.statut ===
                    "forclos"
                ) {

                    return "Forclos";

                }


                if (
                    demande.statut ===
                    "non_termine"
                ) {

                    return "Non terminée";

                }


                if (
                    demande.statut ===
                    "en_cours"
                ) {

                    return "En cours";

                }


                return "En attente";

            };


        // =====================================================
        // NORMALISER DATE
        // =====================================================

        const debutJour =
            (date) => {

                const resultat =
                    new Date(date);

                resultat.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return resultat;

            };


        const finJour =
            (date) => {

                const resultat =
                    new Date(date);

                resultat.setHours(
                    23,
                    59,
                    59,
                    999
                );

                return resultat;

            };


        // =====================================================
        // FILTRE PÉRIODE
        // =====================================================

        const dateDansPeriode =
            (date) => {

                if (
                    periodeSelectionnee ===
                    "toutes"
                ) {

                    return true;

                }


                const maintenant =
                    new Date();


                // ---------------------------------------------
                // AUJOURD'HUI
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "aujourd_hui"
                ) {

                    return (
                        date >=
                            debutJour(
                                maintenant
                            ) &&

                        date <=
                            finJour(
                                maintenant
                            )
                    );

                }


                // ---------------------------------------------
                // HIER
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "hier"
                ) {

                    const hier =
                        new Date(
                            maintenant
                        );


                    hier.setDate(
                        hier.getDate() - 1
                    );


                    return (
                        date >=
                            debutJour(
                                hier
                            ) &&

                        date <=
                            finJour(
                                hier
                            )
                    );

                }


                // ---------------------------------------------
                // CETTE SEMAINE
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "semaine"
                ) {

                    const debut =
                        new Date(
                            maintenant
                        );


                    const jour =
                        debut.getDay();


                    const difference =
                        jour === 0
                            ? 6
                            : jour - 1;


                    debut.setDate(
                        debut.getDate() -
                        difference
                    );


                    const fin =
                        new Date(
                            debut
                        );


                    fin.setDate(
                        fin.getDate() + 6
                    );


                    return (
                        date >=
                            debutJour(
                                debut
                            ) &&

                        date <=
                            finJour(
                                fin
                            )
                    );

                }


                // ---------------------------------------------
                // CE MOIS
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "mois"
                ) {

                    return (
                        date.getMonth() ===
                            maintenant.getMonth() &&

                        date.getFullYear() ===
                            maintenant.getFullYear()
                    );

                }


                // ---------------------------------------------
                // MOIS CHOISI
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "choisir_mois"
                ) {

                    if (
                        anneeSelectionnee === "" ||
                        moisSelectionne === ""
                    ) {

                        return false;

                    }


                    return (
                        date.getFullYear() ===
                            Number(
                                anneeSelectionnee
                            ) &&

                        date.getMonth() ===
                            Number(
                                moisSelectionne
                            )
                    );

                }


                // ---------------------------------------------
                // CETTE ANNÉE
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "annee"
                ) {

                    return (
                        date.getFullYear() ===
                        maintenant.getFullYear()
                    );

                }


                // ---------------------------------------------
                // ANNÉE CHOISIE
                // ---------------------------------------------

                if (
                    periodeSelectionnee ===
                    "choisir_annee"
                ) {

                    if (
                        anneeSelectionnee === ""
                    ) {

                        return false;

                    }


                    return (
                        date.getFullYear() ===
                        Number(
                            anneeSelectionnee
                        )
                    );

                }


                return true;

            };


        // =====================================================
        // ANNÉES DISPONIBLES
        // =====================================================

        const remplirAnnees =
            () => {

                if (!anneeSelect) {
                    return;
                }


                const annees =
                    [
                        ...new Set(
                            demandesHistoriques
                                .map(
                                    demande =>
                                        obtenirDate(
                                            demande
                                        ).getFullYear()
                                )
                                .filter(
                                    annee =>
                                        annee > 1970
                                )
                        )
                    ]
                    .sort(
                        (a, b) =>
                            b - a
                    );


                const valeurActuelle =
                    anneeSelect.value;


                anneeSelect.innerHTML = `

                    <option value="">

                        Choisir une année

                    </option>

                `;


                annees.forEach(
                    (annee) => {

                        anneeSelect.innerHTML += `

                            <option value="${annee}">

                                ${annee}

                            </option>

                        `;

                    }
                );


                if (
                    annees.includes(
                        Number(
                            valeurActuelle
                        )
                    )
                ) {

                    anneeSelect.value =
                        valeurActuelle;

                }

            };


        // =====================================================
        // AFFICHAGE
        // =====================================================

        const afficherHistorique =
            () => {

                let resultats =
                    [...demandesHistoriques];


                // ---------------------------------------------
                // RECHERCHE
                // ---------------------------------------------

                const recherche =
                    termeRecherche
                        .trim()
                        .toLowerCase();


                if (recherche) {

                    resultats =
                        resultats.filter(
                            (demande) => {

                                const nom =
                                    `${demande.prenom || ""} ${demande.nom || ""}`;


                                const type =
                                    obtenirNomType(
                                        demande
                                    );


                                const statut =
                                    obtenirStatut(
                                        demande
                                    );


                                const contenu = [

                                    nom,

                                    demande.matricule,

                                    demande.chambre,

                                    type,

                                    demande.probleme,

                                    demande.localisation,

                                    statut,

                                    demande.cause,

                                    demande.commentaire

                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();


                                return contenu.includes(
                                    recherche
                                );

                            }
                        );

                }


                // ---------------------------------------------
                // TYPE
                // ---------------------------------------------

                if (
                    typeSelectionne !==
                    "tous"
                ) {

                    resultats =
                        resultats.filter(
                            (demande) => {

                                return (
                                    demande.type ===
                                    typeSelectionne
                                );

                            }
                        );

                }

                // ---------------------------------------------
// STATUT
// ---------------------------------------------

if (
    statutSelectionne !==
    "tous"
) {

    resultats =
        resultats.filter(
            (demande) => {

                return (
                    demande.statut ===
                    statutSelectionne
                );

            }
        );

}

// =====================================================
// STATUT
// =====================================================

if (statutSelect) {

    statutSelect.addEventListener(
        "change",
        () => {

            statutSelectionne =
                statutSelect.value;

            afficherHistorique();

        }
    );

}

                // ---------------------------------------------
                // PÉRIODE
                // ---------------------------------------------

                resultats =
                    resultats.filter(
                        (demande) => {

                            return dateDansPeriode(
                                obtenirDate(
                                    demande
                                )
                            );

                        }
                    );


                // ---------------------------------------------
                // TRI
                // ---------------------------------------------

                resultats.sort(
                    (a, b) => {

                        const dateA =
                            obtenirDate(a);


                        const dateB =
                            obtenirDate(b);


                        if (
                            modeTri ===
                            "ancien"
                        ) {

                            return (
                                dateA -
                                dateB
                            );

                        }


                        return (
                            dateB -
                            dateA
                        );

                    }
                );


                // ---------------------------------------------
                // AUCUN RÉSULTAT
                // ---------------------------------------------

                if (
                    resultats.length === 0
                ) {

                    tbody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="9">

                                ${
                                    recherche ||
                                    typeSelectionne !== "tous" ||
                                    periodeSelectionnee !== "toutes"

                                        ?

                                        "Aucune demande ne correspond aux critères sélectionnés."

                                        :

                                        "Aucun historique disponible."
                                }

                            </td>

                        </tr>

                    `;

                    return;

                }


                // ---------------------------------------------
                // AFFICHAGE
                // ---------------------------------------------

                tbody.innerHTML = "";


                resultats.forEach(
                    (demande) => {

                        const date =
                            obtenirDate(
                                demande
                            );


                        const dateAffichee =
                            date.getTime() === 0

                                ?

                                "-"

                                :

                                date.toLocaleDateString(
                                    "fr-FR"
                                );


                        const nomComplet =
                            `${demande.prenom || ""} ${demande.nom || ""}`
                                .trim();


                        const statut =
                            obtenirStatut(
                                demande
                            );


                        const type =
                            obtenirNomType(
                                demande
                            );


                        // -----------------------------------------
// ÉVALUATION
// -----------------------------------------

let evaluation =
    "-";


// -------------------------------------------------
// UNE ÉVALUATION N'EST POSSIBLE QUE POUR UNE
// DEMANDE TERMINÉE
// -------------------------------------------------

if (
    demande.statut ===
    "termine"
) {

    evaluation =
        "En attente";


    if (
        demande.evaluation === 1
    ) {

        evaluation =
            "⭐";

    }

    else if (
        demande.evaluation === 2
    ) {

        evaluation =
            "⭐⭐";

    }

    else if (
        demande.evaluation === 3
    ) {

        evaluation =
            "⭐⭐⭐";

    }

}


// -----------------------------------------
// COMMENTAIRE
// -----------------------------------------

let commentaire =
    "-";


if (
    demande.commentaire === "insatisfait"
) {

    commentaire =
        "Insatisfait";

}

else if (
    demande.commentaire === "satisfait"
) {

    commentaire =
        "Satisfait";

}

else if (
    demande.commentaire === "tres_satisfait"
) {

    commentaire =
        "Très satisfait";

}


                        // -----------------------------------------
                        // LIGNE
                        // -----------------------------------------

                        tbody.innerHTML += `

                            <tr>

                                <td>
                                    ${dateAffichee}
                                </td>


                                <td>
                                    ${nomComplet || "-"}
                                </td>


                                <td>
                                    ${demande.chambre || "-"}
                                </td>


                                <td>
                                    ${type}
                                </td>


                                <td>
                                    ${demande.probleme || "-"}
                                </td>


                                <td>
                                    ${statut}
                                </td>


                                <td>
                                    ${demande.cause || "-"}
                                </td>


                                <td>
                                    ${evaluation}
                                </td>


                                <td>
                                    ${commentaire}
                                </td>

                            </tr>

                        `;

                    }
                );

            };


        // =====================================================
        // RECHERCHE
        // =====================================================

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                () => {

                    termeRecherche =
                        searchInput.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // TRI
        // =====================================================

        if (sortSelect) {

            sortSelect.addEventListener(
                "change",
                () => {

                    modeTri =
                        sortSelect.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // TYPE
        // =====================================================

        if (typeSelect) {

            typeSelect.addEventListener(
                "change",
                () => {

                    typeSelectionne =
                        typeSelect.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // PÉRIODE
        // =====================================================

        if (periodeSelect) {

            periodeSelect.addEventListener(
                "change",
                () => {

                    periodeSelectionnee =
                        periodeSelect.value;


                    // -----------------------------------------
                    // MASQUER MOIS / ANNÉE
                    // -----------------------------------------

                    if (
                        moisContainer
                    ) {

                        moisContainer.hidden =
                            periodeSelectionnee !==
                            "choisir_mois";

                    }


                    if (
                        anneeContainer
                    ) {

                        anneeContainer.hidden =
                            periodeSelectionnee !==
                                "choisir_mois" &&

                            periodeSelectionnee !==
                                "choisir_annee";

                    }


                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // ANNÉE
        // =====================================================

        if (anneeSelect) {

            anneeSelect.addEventListener(
                "change",
                () => {

                    anneeSelectionnee =
                        anneeSelect.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // MOIS
        // =====================================================

        if (moisSelect) {

            moisSelect.addEventListener(
                "change",
                () => {

                    moisSelectionne =
                        moisSelect.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // IDENTIFICATION AGENT
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
            "🏢 Site historique :",
            siteAgent
        );


        console.log(
            "🏠 Pavillon historique :",
            pavillonAgent
        );


        if (
            !siteAgent ||
            !pavillonAgent
        ) {

            tbody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="9">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `;

            document.body.classList.add(
                "loaded"
            );

            return;

        }


        // =====================================================
        // REQUÊTE FIRESTORE
        // =====================================================

        const historiqueQuery =
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
        // ÉCOUTE TEMPS RÉEL
        // =====================================================

        onSnapshot(

            historiqueQuery,

            (snapshot) => {

                console.log(
                    "📚 Historique mis à jour :",
                    snapshot.size
                );


                demandesHistoriques =
                    [];


                snapshot.forEach(
                    (document) => {

                        const demande =
                            document.data();


                        // -----------------------------------------
                        // STATUTS HISTORIQUES UNIQUEMENT
                        // -----------------------------------------

                        if (
                            demande.statut !==
                                "termine" &&

                            demande.statut !==
                                "forclos" &&

                            demande.statut !==
                                "non_termine"
                        ) {

                            return;

                        }


                        demandesHistoriques.push({

                            id:
                                document.id,

                            ...demande

                        });

                    }
                );


                // -----------------------------------------
                // ANNÉES
                // -----------------------------------------

                remplirAnnees();


                // -----------------------------------------
                // AFFICHAGE
                // -----------------------------------------

                afficherHistorique();


                document.body.classList.add(
                    "loaded"
                );

            },


            (error) => {

                console.error(
                    "❌ Erreur historique demandes :",
                    error
                );


                tbody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            l'historique des demandes.

                        </td>

                    </tr>

                `;


                document.body.classList.add(
                    "loaded"
                );

            }

        );

    }
);