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
    createIcons,
    icons
} from "lucide";


console.time("PAGE");


// =====================================================
// VARIABLES
// =====================================================

let chartStatut = null;
let chartType = null;


// =====================================================
// OUTILS
// =====================================================

function extrairePavillon(
    affectation
) {

    return String(
        affectation || ""
    )
        .replace(
            /^Pavillon\s+/i,
            ""
        )
        .trim();

}


// =====================================================
// DATE
// =====================================================

function obtenirDate(
    valeur
) {

    if (!valeur) {
        return null;
    }

    if (
        typeof valeur.toDate ===
        "function"
    ) {

        return valeur.toDate();

    }

    if (
        valeur instanceof Date
    ) {

        return valeur;

    }

    const date =
        new Date(valeur);

    return Number.isNaN(
        date.getTime()
    )
        ? null
        : date;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formaterDate(
    valeur
) {

    const date =
        obtenirDate(
            valeur
        );

    if (!date) {
        return "-";
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(date);

}


// =====================================================
// LABEL STATUT
// =====================================================

function obtenirLibelleStatut(statut) {

    switch (statut) {

        case "envoye":
            return "Envoyé";

        case "recu":
            return "Reçu";

        case "en_attente":
            return "En attente";

        case "en_cours":
            return "En cours";

        case "termine":
            return "Terminé";

        case "non_termine":
            return "Non terminé";

        case "forclos":
            return "Forclos";

        case "annule":
            return "Annulé";

        default:
            return statut
                ? String(statut)
                    .replaceAll("_", " ")
                    .replace(
                        /^./,
                        lettre =>
                            lettre.toUpperCase()
                    )
                : "-";
    }

}


// =====================================================
// CHARGER LES TYPES
// =====================================================

async function chargerTypes() {

    try {

        const types =
            await getTypesTravaux();

        return new Map(

            types.map(
                type => [
                    String(type.id),
                    type.nom
                ]
            )

        );

    } catch (error) {

        console.warn(
            "⚠️ Impossible de charger les types de travaux :",
            error
        );

        return new Map();

    }

}


// =====================================================
// AFFICHER LES STATISTIQUES
// =====================================================

function afficherStatistiques(
    bons
) {

    const total =
        bons.length;


    const attente =
        bons.filter(
            bon =>
                bon.statut === "envoye" ||
                bon.statut === "recu"
        ).length;


    const encours =
        bons.filter(
            bon =>
                bon.statut === "en_cours"
        ).length;


    const termines =
        bons.filter(
            bon =>
                bon.statut === "termine"
        ).length;


    const totalElement =
        document.getElementById(
            "total-bons"
        );

    const attenteElement =
        document.getElementById(
            "bons-attente"
        );

    const encoursElement =
        document.getElementById(
            "bons-encours"
        );

    const terminesElement =
        document.getElementById(
            "bons-termines"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (attenteElement) {

        attenteElement.textContent =
            attente;

    }


    if (encoursElement) {

        encoursElement.textContent =
            encours;

    }


    if (terminesElement) {

        terminesElement.textContent =
            termines;

    }

}


// =====================================================
// GRAPHIQUE STATUT
// =====================================================

function afficherGraphiqueStatut(
    bons
) {

    const canvas =
        document.getElementById(
            "chartStatut"
        );

    if (!canvas) {
        return;
    }


    const valeurs = {

        "En attente":
            bons.filter(
                bon =>
                    bon.statut === "envoye" ||
                    bon.statut === "recu"
            ).length,

        "En cours":
            bons.filter(
                bon =>
                    bon.statut === "en_cours"
            ).length,

        "Terminés":
            bons.filter(
                bon =>
                    bon.statut === "termine"
            ).length,

        "Non terminés":
            bons.filter(
                bon =>
                    bon.statut === "non_termine"
            ).length

    };


    if (chartStatut) {

        chartStatut.destroy();

    }


    chartStatut =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(
                            valeurs
                        ),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    valeurs
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// =====================================================
// GRAPHIQUE TYPES
// =====================================================

function afficherGraphiqueType(
    bons,
    typesMap
) {

    const canvas =
        document.getElementById(
            "chartType"
        );

    if (!canvas) {
        return;
    }


    const compte =
        new Map();


    bons.forEach(
        bon => {

            const cle =
                String(
                    bon.type ||
                    "inconnu"
                );


            const libelle =
                typesMap.get(cle) ||
                cle;


            compte.set(

                libelle,

                (
                    compte.get(
                        libelle
                    ) || 0
                ) + 1

            );

        }
    );


    if (chartType) {

        chartType.destroy();

    }


    chartType =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        Array.from(
                            compte.keys()
                        ),

                    datasets: [

                        {

                            label:
                                "Nombre de bons",

                            data:
                                Array.from(
                                    compte.values()
                                )

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            }

                        }

                    }

                }

            }
        );

}


// =====================================================
// DERNIERS BONS
// =====================================================

function afficherDerniersBons(
    bons,
    typesMap
) {

    const body =
        document.getElementById(
            "dashboard-body"
        );

    if (!body) {
        return;
    }

    body.innerHTML = "";


    const derniers =
        [...bons]

            .sort(
                (a, b) => {

                    const dateA =
                        obtenirDate(
                            a.createdAt ||
                            a.date
                        )?.getTime() || 0;

                    const dateB =
                        obtenirDate(
                            b.createdAt ||
                            b.date
                        )?.getTime() || 0;

                    return dateB - dateA;

                }
            )

            .slice(
                0,
                10
            );


    if (
        derniers.length ===
        0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    style="text-align:center"
                >
                    Aucun bon enregistré.
                </td>

            </tr>

        `;

        return;

    }


    derniers.forEach(
        bon => {

            const tr =
                document.createElement(
                    "tr"
                );


            const type =
                typesMap.get(
                    String(
                        bon.type || ""
                    )
                ) ||
                bon.type ||
                "-";


            const localisation =
                bon.localisation ||
                bon.lieu ||
                "-";


            const niveau =
                bon.niveau ||
                bon.etage ||
                "-";


            const cote =
                bon.cote ||
                bon.aile ||
                "-";


            const chambre =
                bon.chambre ||
                "-";


            const auteur =
                bon.par ||
                bon.nomAgent ||
                bon.agentNom ||
                bon.createdByNom ||
                bon.auteur ||
                "-";


            const cause =
                bon.cause ||
                bon.motif ||
                bon.raison ||
                "-";


            tr.innerHTML = `

                <td>
                    ${bon.id || "-"}
                </td>

                <td>
                    ${formaterDate(
                        bon.createdAt ||
                        bon.date
                    )}
                </td>

                <td>
                    ${type}
                </td>

                <td>
                    ${localisation}
                </td>

                <td>
                    ${niveau}
                </td>

                <td>
                    ${cote}
                </td>

                <td>
                    ${chambre}
                </td>

                <td>
                    ${bon.description || "-"}
                </td>

                <td>
                    ${auteur}
                </td>

                <td>
                    ${obtenirLibelleStatut(
                        bon.statut
                    )}
                </td>

                <td>
                    ${cause}
                </td>

            `;


            body.appendChild(
                tr
            );

        }
    );

}


// =====================================================
// CHARGER LES BONS
// =====================================================

function chargerBons(
    site,
    pavillon,
    anneeAcademique,
    typesMap
) {

    const bonsQuery =
        query(

            collection(
                db,
                "bons"
            ),

            where(
                "site",
                "==",
                site
            ),

            where(
                "pavillon",
                "==",
                pavillon
            ),

            where(
                "anneeAcademique",
                "==",
                anneeAcademique
            )

        );


    return onSnapshot(

        bonsQuery,

        snapshot => {

            const bons =
                snapshot.docs

                    .map(
                        documentSnapshot => ({

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        })
                    )

                    .filter(
                        bon =>
                            bon.supprime !== true
                    );


            console.log(
                "📊 Bons du tableau de bord :",
                bons.length
            );


            afficherStatistiques(
                bons
            );


            afficherGraphiqueStatut(
                bons
            );


            afficherGraphiqueType(
                bons,
                typesMap
            );


            afficherDerniersBons(
                bons,
                typesMap
            );

        },

        error => {

            console.error(
                "❌ Erreur chargement tableau de bord :",
                error
            );

        }

    );

}

// =====================================================
// BOUTON SITUATION EXTRA-COMPTABLE
// =====================================================

const boutonSituationExtra =
    document.getElementById(
        "btn-situation-extra"
    );

if (boutonSituationExtra) {

    boutonSituationExtra.addEventListener(
        "click",
        () => {

            window.location.href =
                new URL(
                    "./situation-extra-comptable/index.html",
                    import.meta.url
                ).href;

        }
    );

}


// =====================================================
// INITIALISATION
// =====================================================

requireRole(

    "agent",

    async ({
        profile,
        affectation,
        anneeAcademique
    }) => {

        try {

            console.timeLog(
                "PAGE",
                "Utilisateur authentifié"
            );


            await loadSidebar(
                profile
            );


            console.timeLog(
                "PAGE",
                "Sidebar chargée"
            );


            const site =
                affectation?.site ||
                profile?.site ||
                "";


            const pavillon =
                affectation?.pavillon ||
                extrairePavillon(
                    affectation?.affectation ||
                    profile?.affectation
                );


            if (
                !site ||
                !pavillon ||
                !anneeAcademique
            ) {

                console.error(
                    "❌ Affectation ou année académique introuvable.",
                    {
                        site,
                        pavillon,
                        anneeAcademique
                    }
                );

                document.body.classList.add(
                    "loaded"
                );

                return;

            }


            console.log(
                "🏢 Tableau de bord :",
                {
                    site,
                    pavillon,
                    anneeAcademique
                }
            );


            const typesMap =
                await chargerTypes();


            chargerBons(
                site,
                pavillon,
                anneeAcademique,
                typesMap
            );


            createIcons({
                icons
            });


            document.body.classList.add(
                "loaded"
            );


            console.timeLog(
                "PAGE",
                "Contenu prêt"
            );


            console.timeEnd(
                "PAGE"
            );

        } catch (error) {

            console.error(
                "❌ Erreur tableau de bord :",
                error
            );


            document.body.classList.add(
                "loaded"
            );


            console.timeEnd(
                "PAGE"
            );

        }

    },

    "voirTableauDeBord"

);