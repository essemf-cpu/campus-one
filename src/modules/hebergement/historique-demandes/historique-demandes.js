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
// VARIABLES
// =====================================================

let demandesHistoriques = [];

let termeRecherche = "";

let modeTri = "recent";

let typeSelectionne = "tous";

let statutSelectionne = "tous";

let periodeSelectionnee = "toutes";

let anneeSelectionnee = "toutes";

let moisSelectionne = "tous";


// =====================================================
// OBTENIR DATE
// =====================================================

function obtenirDate(demande) {

    const valeur =
        demande?.createdAt ||
        demande?.date ||
        demande?.archivedAt;


    if (!valeur) {
        return new Date(0);
    }


    if (
        typeof valeur.toDate ===
        "function"
    ) {

        return valeur.toDate();

    }


    const date =
        new Date(valeur);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return new Date(0);

    }


    return date;
}


// =====================================================
// FORMATER DATE
// =====================================================

function formaterDate(date) {

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

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
    ).format(date);

}


// =====================================================
// NOM TYPE
// =====================================================

let typesTravauxMap =
    new Map();


function obtenirNomType(demande) {

    return (
        typesTravauxMap.get(
            demande.type
        ) ||
        demande.type ||
        "-"
    );

}


// =====================================================
// STATUT
// =====================================================

function obtenirStatut(demande) {

    switch (
        demande?.statut
    ) {

        case "termine":
            return "Terminé";

        case "non_termine":
            return "Non terminé";

        case "forclos":
            return "Forclos";

        case "en_cours":
            return "En cours";

        case "en_attente":
            return "En attente";

        default:
            return demande?.statut || "-";

    }

}


// =====================================================
// DATE DANS PÉRIODE
// =====================================================

function dateDansPeriode(date) {

    if (
        !date ||
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    if (
        periodeSelectionnee ===
        "toutes"
    ) {

        return true;

    }


    const maintenant =
        new Date();


    // =================================================
    // AUJOURD'HUI
    // =================================================

    if (
        periodeSelectionnee ===
        "aujourd_hui"
    ) {

        return (
            date.getFullYear() ===
                maintenant.getFullYear() &&

            date.getMonth() ===
                maintenant.getMonth() &&

            date.getDate() ===
                maintenant.getDate()
        );

    }


    // =================================================
    // CETTE SEMAINE
    // =================================================

    if (
        periodeSelectionnee ===
        "cette_semaine"
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

        debut.setHours(
            0,
            0,
            0,
            0
        );


        const fin =
            new Date(
                debut
            );

        fin.setDate(
            fin.getDate() + 7
        );


        return (
            date >= debut &&
            date < fin
        );

    }


    // =================================================
    // CE MOIS
    // =================================================

    if (
        periodeSelectionnee ===
        "ce_mois"
    ) {

        return (
            date.getFullYear() ===
                maintenant.getFullYear() &&

            date.getMonth() ===
                maintenant.getMonth()
        );

    }


    // =================================================
    // CETTE ANNÉE
    // =================================================

    if (
        periodeSelectionnee ===
        "cette_annee"
    ) {

        return (
            date.getFullYear() ===
            maintenant.getFullYear()
        );

    }


    // =================================================
    // MOIS CHOISI
    // =================================================

    if (
        periodeSelectionnee ===
        "choisir_mois"
    ) {

        if (
            moisSelectionne ===
            "tous" ||
            anneeSelectionnee ===
            "toutes"
        ) {

            return true;

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


    // =================================================
    // ANNÉE CHOISIE
    // =================================================

    if (
        periodeSelectionnee ===
        "choisir_annee"
    ) {

        if (
            anneeSelectionnee ===
            "toutes"
        ) {

            return true;

        }


        return (
            date.getFullYear() ===
            Number(
                anneeSelectionnee
            )
        );

    }


    return true;

}


// =====================================================
// REMPLIR ANNÉES
// =====================================================

function remplirAnnees() {

    const anneeSelect =
        document.getElementById(
            "annee"
        );


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

        <option value="toutes">
            Toutes les années
        </option>

    `;


    annees.forEach(
        annee => {

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

}


// =====================================================
// RÔLE
// =====================================================

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

        console.log(
            "🔐 MODE LECTURE SEULE =",
            lectureSeule
        );


        await loadSidebar(
            profile
        );


        // =====================================================
        // ÉLÉMENTS
        // =====================================================

        const tbody =
            document.getElementById(
                "historique-body"
            ) ||
            document.getElementById(
                "demandes-body"
            );


        const searchInput =
            document.getElementById(
                "search"
            ) ||
            document.getElementById(
                "recherche"
            );


        const sortSelect =
            document.getElementById(
                "sort"
            );


        const typeSelect =
            document.getElementById(
                "type-filter"
            ) ||
            document.getElementById(
                "type"
            );


        const statutSelect =
            document.getElementById(
                "statut-filter"
            ) ||
            document.getElementById(
                "statut"
            );


        const periodeSelect =
            document.getElementById(
                "periode"
            );


        const anneeSelect =
            document.getElementById(
                "annee"
            );


        const moisSelect =
            document.getElementById(
                "mois"
            );


        const moisContainer =
            document.getElementById(
                "mois-container"
            );


        const anneeContainer =
            document.getElementById(
                "annee-container"
            );


        if (!tbody) {

            console.error(
                "❌ Corps du tableau historique introuvable."
            );

            return;

        }


        // =====================================================
        // TYPES
        // =====================================================

        try {

            const types =
                await getTypesTravaux();


            typesTravauxMap =
                new Map(
                    types.map(
                        type => [
                            type.id,
                            type.nom
                        ]
                    )
                );


        } catch (error) {

            console.error(
                "❌ Erreur chargement types :",
                error
            );

        }


        // =====================================================
        // AFFICHAGE
        // =====================================================

        function afficherHistorique() {

            let resultats =
                [
                    ...demandesHistoriques
                ];


            // =================================================
            // RECHERCHE
            // =================================================

            const recherche =
                termeRecherche
                    .trim()
                    .toLowerCase();


            if (recherche) {

                resultats =
                    resultats.filter(
                        demande => {

                            const texte = [

                                demande.prenom,

                                demande.nom,

                                demande.matricule,

                                demande.chambre,

                                demande.localisation,

                                demande.niveau,

                                demande.cote,

                                demande.probleme,

                                demande.description,

                                demande.cause,

                                obtenirNomType(
                                    demande
                                ),

                                obtenirStatut(
                                    demande
                                )

                            ]
                                .filter(
                                    Boolean
                                )
                                .join(
                                    " "
                                )
                                .toLowerCase();


                            return texte.includes(
                                recherche
                            );

                        }
                    );

            }


            // =================================================
            // TYPE
            // =================================================

            if (
                typeSelectionne !==
                "tous"
            ) {

                resultats =
                    resultats.filter(
                        demande =>
                            demande.type ===
                            typeSelectionne
                    );

            }


            // =================================================
            // STATUT
            // =================================================

            if (
                statutSelectionne !==
                "tous"
            ) {

                resultats =
                    resultats.filter(
                        demande =>
                            demande.statut ===
                            statutSelectionne
                    );

            }


            // =================================================
            // PÉRIODE
            // =================================================

            resultats =
                resultats.filter(
                    demande =>
                        dateDansPeriode(
                            obtenirDate(
                                demande
                            )
                        )
                );


            // =================================================
            // TRI
            // =================================================

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


            // =================================================
            // AUCUN
            // =================================================

            if (
                resultats.length ===
                0
            ) {

                tbody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="12">

                            ${
                                recherche ||
                                typeSelectionne !== "tous" ||
                                statutSelectionne !== "tous" ||
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


            tbody.innerHTML =
                "";


            // =================================================
            // AFFICHAGE
            // =================================================

            resultats.forEach(
                demande => {

                    const date =
                        obtenirDate(
                            demande
                        );


                    const dateAffichee =
                        formaterDate(
                            date
                        );


                    const nomComplet =
                        `${demande.prenom || ""} ${demande.nom || ""}`
                            .trim();


                    const type =
                        obtenirNomType(
                            demande
                        );


                    const statut =
                        obtenirStatut(
                            demande
                        );


                    // =================================================
                    // ÉVALUATION
                    // =================================================

                    let evaluation =
                        "-";


                    if (
                        demande.statut ===
                        "termine"
                    ) {

                        evaluation =
                            "En attente";


                        if (
                            demande.evaluation ===
                            1
                        ) {

                            evaluation =
                                "⭐";

                        }

                        else if (
                            demande.evaluation ===
                            2
                        ) {

                            evaluation =
                                "⭐⭐";

                        }

                        else if (
                            demande.evaluation ===
                            3
                        ) {

                            evaluation =
                                "⭐⭐⭐";

                        }

                    }


                    // =================================================
                    // COMMENTAIRE
                    // =================================================

                    let commentaire =
                        "-";


                    if (
                        demande.commentaire ===
                        "insatisfait"
                    ) {

                        commentaire =
                            "Insatisfait";

                    }

                    else if (
                        demande.commentaire ===
                        "satisfait"
                    ) {

                        commentaire =
                            "Satisfait";

                    }

                    else if (
                        demande.commentaire ===
                        "tres_satisfait"
                    ) {

                        commentaire =
                            "Très satisfait";

                    }

                    else if (
                        demande.commentaire
                    ) {

                        commentaire =
                            demande.commentaire;

                    }


                    // =================================================
                    // LIGNE
                    // =================================================

                    tbody.innerHTML += `

                        <tr>

                            <td>
                                ${dateAffichee}
                            </td>

                            <td>
                                ${nomComplet || "-"}
                            </td>

                            <td>
                                ${type}
                            </td>

                            <td>
                                ${demande.localisation || "-"}
                            </td>

                            <td>
                                ${demande.niveau || "-"}
                            </td>

                            <td>
                                ${demande.cote || "-"}
                            </td>

                            <td>
                                ${demande.chambre || "-"}
                            </td>

                            <td>
                                ${
                                    demande.description ||
                                    demande.probleme ||
                                    "-"
                                }
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

        }


        // =====================================================
        // RECHERCHE
        // =====================================================

        if (
            searchInput
        ) {

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

        if (
            sortSelect
        ) {

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

        if (
            typeSelect
        ) {

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
        // STATUT
        // =====================================================

        if (
            statutSelect
        ) {

            statutSelect.addEventListener(
                "change",
                () => {

                    statutSelectionne =
                        statutSelect.value;

                    afficherHistorique();

                }
            );

        }


        // =====================================================
        // PÉRIODE
        // =====================================================

        if (
            periodeSelect
        ) {

            periodeSelect.addEventListener(
                "change",
                () => {

                    periodeSelectionnee =
                        periodeSelect.value;


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

        if (
            anneeSelect
        ) {

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

        if (
            moisSelect
        ) {

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
            "🏠 Affectation historique :",
            pavillonAgent
        );


        if (
            !siteAgent ||
            !pavillonAgent
        ) {

            tbody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="12">

                        Impossible de déterminer
                        le site ou l'affectation.

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

        const unsubscribe =
            onSnapshot(

                historiqueQuery,

                snapshot => {

                    console.log(
                        "📡 Historique mis à jour en temps réel :",
                        snapshot.size
                    );


                    demandesHistoriques =
                        [];


                    snapshot.forEach(
                        documentSnapshot => {

                            const demande =
                                documentSnapshot.data();


                            // =================================================
                            // HISTORIQUE UNIQUEMENT
                            // =================================================
                            //
                            // Une demande terminée / non terminée / forclose
                            // reste sur la page des demandes pendant sa durée.
                            //
                            // Elle n'entre dans l'historique que lorsque
                            // archive === true.
                            //
                            // =================================================

                            if (
                                demande.archive !==
                                true
                            ) {

                                return;

                            }


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
                                    documentSnapshot.id,

                                ...demande

                            });

                        }
                    );


                    console.log(
                        "📚 Demandes historiques :",
                        demandesHistoriques.length
                    );


                    remplirAnnees();


                    afficherHistorique();


                    document.body.classList.add(
                        "loaded"
                    );

                },


                error => {

                    console.error(
                        "❌ Erreur historique demandes :",
                        error
                    );


                    tbody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="12">

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


        // =====================================================
        // NETTOYAGE
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

        console.log(
            "✅ Historique des demandes : écoute temps réel activée."
        );

    }
);