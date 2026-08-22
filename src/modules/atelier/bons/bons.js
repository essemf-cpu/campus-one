import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";


// =====================================================
// CAUSES PRÉÉTABLIES — BON NON TERMINÉ
// =====================================================

const CAUSES_NON_TERMINE = [
    "Stock de matériels",
    "Personnel adéquat en descente",
    "Intervention nécessitant une pièce",
    "Intervention reportée",
    "Intervention nécessitant une intervention externe",
    "Autre"
];


// =====================================================
// FORMATAGE DATE FRANÇAIS
// =====================================================

function formaterDate(date) {

    if (!date) {
        return "-";
    }

    const valeur =
        String(date).trim();

    // Date YYYY-MM-DD
    const correspondance =
        valeur.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

    if (correspondance) {

        return `${correspondance[3]}/${correspondance[2]}/${correspondance[1]}`;
    }

    // Si la valeur est déjà dans un autre format
    const dateObjet =
        new Date(date);

    if (
        Number.isNaN(
            dateObjet.getTime()
        )
    ) {

        return valeur;
    }

    return new Intl.DateTimeFormat(
        "fr-FR"
    ).format(
        dateObjet
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


        // =================================================
        // VÉRIFICATION SERVICE
        // =================================================

        if (
            posteId !==
            "chef_atelier"
        ) {

            console.warn(
                "⛔ Accès refusé : poste incorrect."
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
        // CORPS DU TABLEAU
        // =================================================

        const bonsBody =
            document.getElementById(
                "bons-body"
            );

        if (!bonsBody) {

            console.error(
                "❌ bons-body introuvable."
            );

            return;
        }


        // =================================================
        // SITE DE L'ATELIER
        // =================================================

        const siteAtelier =
            profile?.site;

        if (!siteAtelier) {

            bonsBody.innerHTML = `
                <tr class="empty-row">

                    <td colspan="13">
                        Impossible de déterminer
                        le site de l'Atelier.
                    </td>

                </tr>
            `;

            return;
        }


        // =================================================
        // RÉFÉRENTIEL DES TYPES DE TRAVAUX
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
                "❌ Erreur chargement référentiel des types :",
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
        // ÉCOUTE TEMPS RÉEL
        // =================================================

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
                            bon =>
                                bon.supprime !== true &&
                                (
                                    bon.statut === "envoye" ||
                                    bon.statut === "recu" ||
                                    bon.statut === "en_cours"
                                )
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

                bonsBody.innerHTML = "";


                // =================================================
                // AUCUN BON
                // =================================================

                if (
                    bonsActifs.length === 0
                ) {

                    bonsBody.innerHTML = `
                        <tr class="empty-row">

                            <td colspan="13">
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
                    (bon) => {

                        // =================================================
                        // NOM DU TYPE
                        // =================================================

                        const typeNom =
                            typesTravauxMap.get(
                                bon.type
                            ) ||
                            bon.type ||
                            "-";


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
                            "envoye"
                        ) {

                            statutLabel =
                                "Reçu";

                            statutClasse =
                                "statut-envoye";

                        } else if (
                            bon.statut ===
                            "recu"
                        ) {

                            statutLabel =
                                "Reçu";

                            statutClasse =
                                "statut-recu";

                        } else if (
                            bon.statut ===
                            "en_cours"
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
                        // BON ENVOYÉ
                        // =================================================
                        //
                        // [ Reçu ]
                        //
                        // =================================================

                        else if (
                            bon.statut ===
                            "envoye"
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
                        // BON REÇU
                        // =================================================
                        //
                        // [ En cours ]
                        //
                        // =================================================

                        else if (
                            bon.statut ===
                            "recu"
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
                        // BON EN COURS
                        // =================================================
                        //
                        // [ Terminée ] [ Non terminée ]
                        //
                        // =================================================

                        else if (
                            bon.statut ===
                            "en_cours"
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
                        // LIGNE DU TABLEAU
                        // =================================================

                        bonsBody.innerHTML += `

                            <tr>

                                <!-- 1 — ID -->

                                <td>
                                    ${bon.id || "-"}
                                </td>


                                <!-- 2 — DATE -->

                                <td>
                                    ${dateFormatee}
                                </td>


                                <!-- 3 — TYPE -->

                                <td>
                                    ${typeNom}
                                </td>


                                <!-- 4 — PAVILLON -->

                                <td>
                                    ${bon.pavillon || "-"}
                                </td>


                                <!-- 5 — LOCALISATION -->

                                <td>
                                    ${bon.localisation || "-"}
                                </td>


                                <!-- 6 — NIVEAU -->

                                <td>
                                    ${bon.niveau || "-"}
                                </td>


                                <!-- 7 — CÔTÉ -->

                                <td>
                                    ${bon.cote || "-"}
                                </td>


                                <!-- 8 — CHAMBRE -->

                                <td>
                                    ${bon.chambre || "-"}
                                </td>


                                <!-- 9 — TOILETTE -->

                                <td>
                                    ${bon.toilette || "-"}
                                </td>


                                <!-- 10 — DESCRIPTION -->

                                <td>
                                    ${bon.description || "-"}
                                </td>


                                <!-- 11 — PAR -->

                                <td>
                                    ${
                                        bon.par ||
                                        bon.agentNom ||
                                        bon.agentMatricule ||
                                        "-"
                                    }
                                </td>


                                <!-- 12 — STATUT -->

                                <td>

                                    <span
                                        class="statut-badge ${statutClasse}"
                                    >
                                        ${statutLabel}
                                    </span>

                                </td>


                                <!-- 13 — ACTION -->

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

                        <td colspan="13">
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
                // RÉCUPÉRER LE BOUTON
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

                        await updateDoc(

                            doc(
                                db,
                                "bons",
                                bonId
                            ),

                            {
                                statut:
                                    "recu",

                                cause:
                                    "",

                                atelierAgentMatricule:
                                    profile.matricule ||
                                    "",

                                atelierAgentNom:
                                    `${profile.prenom || ""} ${profile.nom || ""}`
                                        .trim(),

                                atelierReceptionAt:
                                    serverTimestamp()
                            }
                        );
                    }


                    // =================================================
                    // EN COURS
                    // =================================================

                    else if (
                        action ===
                        "encours"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "bons",
                                bonId
                            ),

                            {
                                statut:
                                    "en_cours",

                                cause:
                                    "",

                                atelierAgentMatricule:
                                    profile.matricule ||
                                    "",

                                atelierAgentNom:
                                    `${profile.prenom || ""} ${profile.nom || ""}`
                                        .trim(),

                                atelierPriseEnChargeAt:
                                    serverTimestamp()
                            }
                        );
                    }


                    // =================================================
                    // TERMINÉE
                    // =================================================

                    else if (
                        action ===
                        "termine"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "bons",
                                bonId
                            ),

                            {
                                statut:
                                    "termine",

                                cause:
                                    "",

                                atelierAgentMatricule:
                                    profile.matricule ||
                                    "",

                                atelierAgentNom:
                                    `${profile.prenom || ""} ${profile.nom || ""}`
                                        .trim(),

                                atelierTermineAt:
                                    serverTimestamp()
                            }
                        );
                    }


                    // =================================================
                    // NON TERMINÉE
                    // =================================================

                    else if (
                        action ===
                        "nontermine"
                    ) {

                        const choix =
                            prompt(
                                "Sélectionnez la cause du bon non terminé :\n\n" +
                                CAUSES_NON_TERMINE
                                    .map(
                                        (
                                            cause,
                                            index
                                        ) =>
                                            `${index + 1}. ${cause}`
                                    )
                                    .join(
                                        "\n"
                                    )
                            );


                        if (
                            choix ===
                            null
                        ) {

                            button.disabled =
                                false;

                            return;
                        }


                        const index =
                            Number(
                                choix.trim()
                            ) - 1;


                        if (
                            !Number.isInteger(
                                index
                            ) ||
                            index < 0 ||
                            index >=
                                CAUSES_NON_TERMINE.length
                        ) {

                            alert(
                                "Choix invalide."
                            );

                            button.disabled =
                                false;

                            return;
                        }


                        const cause =
                            CAUSES_NON_TERMINE[
                                index
                            ];


                        await updateDoc(

                            doc(
                                db,
                                "bons",
                                bonId
                            ),

                            {
                                statut:
                                    "non_termine",

                                cause,

                                atelierAgentMatricule:
                                    profile.matricule ||
                                    "",

                                atelierAgentNom:
                                    `${profile.prenom || ""} ${profile.nom || ""}`
                                        .trim(),

                                atelierNonTermineAt:
                                    serverTimestamp()
                            }
                        );
                    }

                } catch (error) {

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