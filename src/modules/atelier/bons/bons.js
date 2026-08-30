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
    updateBonStatut,
    STATUTS_BON
} from "../../../services/bonsService.js";


// =====================================================
// FORMATAGE DATE + HEURE FRANÇAISE
// =====================================================

function formaterDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    let dateObjet;

    if (
        dateValue &&
        typeof dateValue.toDate === "function"
    ) {

        dateObjet = dateValue.toDate();

    }

    else if (
        dateValue instanceof Date
    ) {

        dateObjet = dateValue;

    }

    else {

        const valeur =
            String(dateValue).trim();

        const correspondance =
            valeur.match(
                /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/
            );

        if (correspondance) {

            const jour =
                correspondance[3];

            const mois =
                correspondance[2];

            const annee =
                correspondance[1];

            if (
                correspondance[4] === undefined ||
                correspondance[5] === undefined
            ) {

                return `${jour}/${mois}/${annee}`;

            }

            return (
                `${jour}/${mois}/${annee}` +
                ` à ${correspondance[4]}:${correspondance[5]}`
            );

        }

        dateObjet =
            new Date(dateValue);

    }

    if (
        !dateObjet ||
        Number.isNaN(
            dateObjet.getTime()
        )
    ) {

        return String(dateValue);

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
// NOM DU TYPE
// =====================================================

function obtenirNomType(
    bon,
    typesTravauxMap
) {

    return (
        typesTravauxMap.get(
            bon.type
        ) ||
        bon.type ||
        "-"
    );

}


// =====================================================
// RÔLE ATELIER
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

        console.log(
            "🏭 Module Atelier chargé"
        );

        console.log(
            "👤 profile =",
            profile
        );

        console.log(
            "🏭 posteId =",
            posteId
        );


        // =================================================
        // VÉRIFICATION POSTE
        // =================================================

        if (
            posteId !==
            "chef_atelier"
        ) {

            console.warn(
                "⛔ Accès refusé : poste incorrect."
            );

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

            return;

        }


        // =================================================
        // SIDEBAR
        // =================================================

        await loadSidebar(
            {
                ...profile,
                permissions,
                affectation:
                    affectation?.affectation ||
                    profile?.affectation ||
                    "",
                posteId,
                anneeAcademique,
                lectureSeule
            }
        );


        // =================================================
        // TITRE
        // =================================================

        const pageSite =
            document.getElementById(
                "page-site"
            );

        if (pageSite) {

            pageSite.textContent =
                profile?.site
                    ? ` ${profile.site}`
                    : "";

        }


        // =================================================
        // CORPS TABLEAU
        // =================================================

        const bonsBody =
            document.getElementById(
                "bons-body"
            );

        if (!bonsBody) {

            console.error(
                "❌ bons-body introuvable."
            );

            document.body.classList.add(
                "loaded"
            );

            return;

        }


        // =================================================
        // SITE ATELIER
        // =================================================

        const siteAtelier =
            profile?.site;

        if (!siteAtelier) {

            bonsBody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="12">

                        Impossible de déterminer
                        le site de l'Atelier.

                    </td>

                </tr>

            `;

            document.body.classList.add(
                "loaded"
            );

            return;

        }


        // =================================================
        // RÉFÉRENTIEL TYPES
        // =================================================

        let typesTravauxMap =
            new Map();

        try {

            const typesTravaux =
                await getTypesTravaux();

            typesTravauxMap =
                new Map(
                    typesTravaux.map(
                        type => [
                            type.id,
                            type.nom
                        ]
                    )
                );

            console.log(
                "📚 Types de travaux chargés :",
                typesTravaux
            );

        } catch (error) {

            console.error(
                "❌ Erreur chargement référentiel :",
                error
            );

        }


        // =================================================
        // REQUÊTE FIRESTORE
        // =================================================

        const bonsQuery =
            query(
                collection(
                    db,
                    "bons"
                ),
                where(
                    "site",
                    "==",
                    siteAtelier
                )
            );


        // =================================================
        // LISTENER TEMPS RÉEL
        // =================================================

        const unsubscribe =
            onSnapshot(

                bonsQuery,

                (snapshot) => {

                    console.log(
                        "📋 Bons du site :",
                        snapshot.size
                    );


                    // =================================================
                    // RÉCUPÉRATION
                    // =================================================

                    const bons =
                        snapshot.docs
                            .map(
                                documentSnapshot => ({

                                    id:
                                        documentSnapshot.id,

                                    ...documentSnapshot.data()

                                })
                            );


                    // =================================================
                    // UNIQUEMENT LES BONS ACTIFS
                    //
                    // IMPORTANT :
                    //
                    // Un bon terminé ou non terminé
                    // N'est PAS retiré ici.
                    //
                    // Il reste donc affiché pendant
                    // la période où archive === false.
                    //
                    // Le serveur se charge ensuite
                    // de l'archiver automatiquement.
                    // =================================================

                    const bonsActifs =
                        bons.filter(
                            bon => {

                                if (
                                    bon.supprime === true
                                ) {

                                    return false;

                                }

                                if (
                                    bon.archive === true
                                ) {

                                    return false;

                                }

                                return (

                                    bon.statut ===
                                        STATUTS_BON.ENVOYE ||

                                    bon.statut ===
                                        STATUTS_BON.RECU ||

                                    bon.statut ===
                                        STATUTS_BON.EN_COURS ||

                                    bon.statut ===
                                        STATUTS_BON.TERMINE ||

                                    bon.statut ===
                                        STATUTS_BON.NON_TERMINE

                                );

                            }
                        );


                    // =================================================
                    // TRI
                    // =================================================

                    bonsActifs.sort(
                        (a, b) => {

                            const dateA =
                                String(
                                    a.date || ""
                                );

                            const dateB =
                                String(
                                    b.date || ""
                                );

                            return dateB.localeCompare(
                                dateA
                            );

                        }
                    );


                    // =================================================
                    // NETTOYAGE
                    // =================================================

                    bonsBody.innerHTML =
                        "";


                    // =================================================
                    // AUCUN BON
                    // =================================================

                    if (
                        bonsActifs.length ===
                        0
                    ) {

                        bonsBody.innerHTML = `

                            <tr class="empty-row">

                                <td colspan="12">

                                    Aucun bon de travail reçu.

                                </td>

                            </tr>

                        `;

                        return;

                    }


                    // =================================================
                    // AFFICHAGE
                    // =================================================

                    bonsActifs.forEach(
                        bon => {

                            // =================================================
                            // TYPE
                            // =================================================

                            const typeNom =
                                obtenirNomType(
                                    bon,
                                    typesTravauxMap
                                );


                            // =================================================
                            // DATE
                            // =================================================

                            const dateFormatee =
                                formaterDate(
                                    bon.date
                                );


                            // =================================================
                            // STATUT
                            // =================================================

                            let statutLabel =
                                "-";

                            let statutClasse =
                                "";


                            if (
                                bon.statut ===
                                STATUTS_BON.ENVOYE
                            ) {

                                statutLabel =
                                    "Reçu";

                                statutClasse =
                                    "statut-envoye";

                            }

                            else if (
                                bon.statut ===
                                STATUTS_BON.RECU
                            ) {

                                statutLabel =
                                    "Reçu";

                                statutClasse =
                                    "statut-recu";

                            }

                            else if (
                                bon.statut ===
                                STATUTS_BON.EN_COURS
                            ) {

                                statutLabel =
                                    "En cours";

                                statutClasse =
                                    "statut-en-cours";

                            }

                            else if (
                                bon.statut ===
                                STATUTS_BON.TERMINE
                            ) {

                                statutLabel =
                                    "Terminé";

                                statutClasse =
                                    "statut-termine";

                            }

                            else if (
                                bon.statut ===
                                STATUTS_BON.NON_TERMINE
                            ) {

                                statutLabel =
                                    "Non terminé";

                                statutClasse =
                                    "statut-non-termine";

                            }


                            // =================================================
                            // ACTIONS
                            // =================================================

                            let actions =
                                "";


                            if (
                                lectureSeule
                            ) {

                                actions = `

                                    <span class="lecture-seule">

                                        Lecture seule

                                    </span>

                                `;

                            }


                            // =================================================
                            // ENVOYÉ → REÇU
                            // =================================================

                            else if (
                                bon.statut ===
                                STATUTS_BON.ENVOYE
                            ) {

                                actions = `

                                    <div class="bon-actions">

                                        <button
                                            type="button"
                                            class="bon-action-btn bon-action-recu"
                                            data-id="${bon.id}"
                                            data-action="recu"
                                        >

                                            Reçu

                                        </button>

                                    </div>

                                `;

                            }


                            // =================================================
                            // REÇU → EN COURS
                            // =================================================

                            else if (
                                bon.statut ===
                                STATUTS_BON.RECU
                            ) {

                                actions = `

                                    <div class="bon-actions">

                                        <button
                                            type="button"
                                            class="bon-action-btn bon-action-encours"
                                            data-id="${bon.id}"
                                            data-action="encours"
                                        >

                                            En cours

                                        </button>

                                    </div>

                                `;

                            }


                            // =================================================
                            // EN COURS → TERMINÉ / NON TERMINÉ
                            // =================================================

                            else if (
                                bon.statut ===
                                STATUTS_BON.EN_COURS
                            ) {

                                actions = `

                                    <div class="bon-actions">

                                        <button
                                            type="button"
                                            class="bon-action-btn bon-action-termine"
                                            data-id="${bon.id}"
                                            data-action="termine"
                                        >

                                            Terminée

                                        </button>

                                        <button
                                            type="button"
                                            class="bon-action-btn bon-action-nontermine"
                                            data-id="${bon.id}"
                                            data-action="nontermine"
                                        >

                                            Non terminée

                                        </button>

                                    </div>

                                `;

                            }


                            // =================================================
                            // TERMINÉ / NON TERMINÉ
                            //
                            // Aucun bouton d'action.
                            //
                            // Le bon reste affiché tant que
                            // archive === false.
                            // =================================================


                            bonsBody.innerHTML += `

                                <tr>

                                    <!-- ID -->

                                    <td>
                                        ${bon.id || "-"}
                                    </td>


                                    <!-- DATE -->

                                    <td>
                                        ${dateFormatee}
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

                                        <span
                                            class="statut-badge ${statutClasse}"
                                        >

                                            ${statutLabel}

                                        </span>

                                    </td>


                                    <!-- ACTION -->

                                    <td>

                                        ${actions}

                                    </td>

                                </tr>

                            `;

                        }
                    );

                },


                // =================================================
                // ERREUR
                // =================================================

                (error) => {

                    console.error(
                        "❌ Erreur chargement des bons :",
                        error
                    );

                    bonsBody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="12">

                                Impossible de charger
                                les bons de travail.

                            </td>

                        </tr>

                    `;

                }

            );


        // =====================================================
        // ACTIONS DES BONS
        // =====================================================

        bonsBody.addEventListener(
            "click",
            async (event) => {

                if (
                    lectureSeule
                ) {

                    console.warn(
                        "🔒 Action bloquée : lecture seule."
                    );

                    return;

                }


                const button =
                    event.target.closest(
                        ".bon-action-btn"
                    );


                if (!button) {

                    return;

                }


                const bonId =
                    button.dataset.id;

                const action =
                    button.dataset.action;


                if (
                    !bonId ||
                    !action
                ) {

                    return;

                }


                // =================================================
                // EMPÊCHER DOUBLE CLIC
                // =================================================

                if (
                    button.disabled
                ) {

                    return;

                }

                button.disabled =
                    true;


                try {

                    // =================================================
                    // REÇU
                    // =================================================

                    if (
                        action ===
                        "recu"
                    ) {

                        await updateBonStatut(

                            bonId,

                            STATUTS_BON.RECU,

                            "",

                            profile

                        );

                    }


                    // =================================================
                    // EN COURS
                    // =================================================

                    else if (
                        action ===
                        "encours"
                    ) {

                        await updateBonStatut(

                            bonId,

                            STATUTS_BON.EN_COURS,

                            "",

                            profile

                        );

                    }


                    // =================================================
                    // TERMINÉE
                    // =================================================

                    else if (
                        action ===
                        "termine"
                    ) {

                        await updateBonStatut(

                            bonId,

                            STATUTS_BON.TERMINE,

                            "",

                            profile

                        );

                    }


                    // =================================================
                    // NON TERMINÉE
                    // =================================================

                    else if (
                        action ===
                        "nontermine"
                    ) {

                        const cause =
                            prompt(
                                "Indiquez la cause du travail non terminé :"
                            );


                        if (
                            cause ===
                            null
                        ) {

                            button.disabled =
                                false;

                            return;

                        }


                        const causeFinale =
                            cause.trim();


                        if (
                            !causeFinale
                        ) {

                            alert(
                                "Veuillez préciser la cause."
                            );

                            button.disabled =
                                false;

                            return;

                        }


                        await updateBonStatut(

                            bonId,

                            STATUTS_BON.NON_TERMINE,

                            causeFinale,

                            profile

                        );

                    }


                } catch (
                    error
                ) {

                    console.error(
                        "❌ Erreur traitement du bon :",
                        error
                    );

                    button.disabled =
                        false;

                    alert(
                        "Impossible de modifier le bon."
                    );

                }

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

        console.log(
            "🏭 Module Atelier prêt."
        );


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

    }
);