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

    // Firestore Timestamp
    if (
        dateValue &&
        typeof dateValue.toDate === "function"
    ) {

        dateObjet = dateValue.toDate();

    }

    // Date JavaScript
    else if (
        dateValue instanceof Date
    ) {

        dateObjet = dateValue;

    }

    // Chaîne de caractères
    else {

        const valeur =
            String(dateValue).trim();

        /*
         * Format :
         * 2026-08-22
         * 2026-08-22T14:35
         * 2026-08-22T14:35:00
         * 2026-08-22T14:35:00.000Z
         */

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

            // Si aucune heure n'est enregistrée
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
                                        STATUTS_BON.EN_COURS
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

                            } else if (
                                bon.statut ===
                                STATUTS_BON.RECU
                            ) {

                                statutLabel =
                                    "Reçu";

                                statutClasse =
                                    "statut-recu";

                            } else if (
                                bon.statut ===
                                STATUTS_BON.EN_COURS
                            ) {

                                statutLabel =
                                    "En cours";

                                statutClasse =
                                    "statut-en-cours";
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
                            // LIGNE
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

                // =================================================
                // LECTURE SEULE
                // =================================================

                if (
                    lectureSeule
                ) {

                    console.warn(
                        "🔒 Action bloquée : lecture seule."
                    );

                    return;
                }


                // =================================================
                // BOUTON
                // =================================================

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

                        const modal =
                            document.getElementById(
                                "cause-modal"
                            );

                        const select =
                            document.getElementById(
                                "cause-select"
                            );

                        const autreContainer =
                            document.getElementById(
                                "autre-cause-container"
                            );

                        const autreInput =
                            document.getElementById(
                                "autre-cause"
                            );

                        const confirmButton =
                            document.getElementById(
                                "confirm-cause"
                            );

                        const cancelButton =
                            document.getElementById(
                                "cancel-cause"
                            );

                        const closeButton =
                            document.getElementById(
                                "close-cause-modal"
                            );


                        // =================================================
                        // VÉRIFICATION MODALE
                        // =================================================

                        if (
                            !modal ||
                            !select ||
                            !confirmButton
                        ) {

                            console.error(
                                "❌ Modale de cause introuvable."
                            );

                            button.disabled =
                                false;

                            return;
                        }


                        // =================================================
                        // RESET
                        // =================================================

                        select.value =
                            "";

                        if (autreInput) {

                            autreInput.value =
                                "";
                        }

                        if (autreContainer) {

                            autreContainer.hidden =
                                true;
                        }


                        // =================================================
                        // OUVERTURE
                        // =================================================

                        modal.hidden =
                            false;


                        // =================================================
                        // FERMETURE
                        // =================================================

                        const fermerModal =
                            () => {

                                modal.hidden =
                                    true;

                                button.disabled =
                                    false;

                                select.value =
                                    "";

                                if (autreInput) {

                                    autreInput.value =
                                        "";
                                }

                                if (autreContainer) {

                                    autreContainer.hidden =
                                        true;
                                }

                                select.removeEventListener(
                                    "change",
                                    gererAutre
                                );
                            };


                        // =================================================
                        // AUTRE
                        // =================================================

                        const gererAutre =
                            () => {

                                if (
                                    autreContainer
                                ) {

                                    autreContainer.hidden =
                                        select.value !==
                                        "Autre";
                                }


                                if (
                                    select.value ===
                                    "Autre"
                                ) {

                                    autreInput?.focus();
                                }
                            };


                        select.addEventListener(
                            "change",
                            gererAutre
                        );


                        // =================================================
                        // ANNULER
                        // =================================================

                        cancelButton?.addEventListener(
                            "click",
                            fermerModal,
                            {
                                once:
                                    true
                            }
                        );


                        closeButton?.addEventListener(
                            "click",
                            fermerModal,
                            {
                                once:
                                    true
                            }
                        );


                        // =================================================
                        // CONFIRMER
                        // =================================================

                        confirmButton.onclick =
                            async () => {

                                if (
                                    !select.value
                                ) {

                                    alert(
                                        "Veuillez sélectionner une cause."
                                    );

                                    return;
                                }


                                let cause =
                                    select.value;


                                // =================================================
                                // AUTRE
                                // =================================================

                                if (
                                    cause ===
                                    "Autre"
                                ) {

                                    cause =
                                        autreInput
                                            ?.value
                                            ?.trim() ||
                                        "";


                                    if (
                                        !cause
                                    ) {

                                        alert(
                                            "Veuillez préciser la cause."
                                        );

                                        autreInput?.focus();

                                        return;
                                    }
                                }


                                // =================================================
                                // DÉSACTIVER
                                // =================================================

                                confirmButton.disabled =
                                    true;


                                try {

                                    await updateBonStatut(

                                        bonId,

                                        STATUTS_BON.NON_TERMINE,

                                        cause,

                                        profile
                                    );


                                    modal.hidden =
                                        true;

                                    button.disabled =
                                        false;

                                } catch (
                                    error
                                ) {

                                    console.error(
                                        "❌ Erreur bon non terminé :",
                                        error
                                    );

                                    alert(
                                        "Impossible d'enregistrer la cause."
                                    );

                                    confirmButton.disabled =
                                        false;

                                    button.disabled =
                                        false;
                                }
                            };
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