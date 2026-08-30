import { requireRole } from "../../../auth/authGuard.js";
import { loadSidebar } from "../components/sidebar.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc
} from "firebase/firestore";

import { db } from "../../../firebase/firebase.js";

import {
    createBon,
    deleteBon
} from "../../../services/bonsService.js";

import {
    createNotificationHebergement
} from "../../../services/hebergementnotificationsservice.js";

import {
    getTypesTravaux
} from "../../../services/referentielService.js";


// =====================================================
// OUTILS DATE
// =====================================================

function obtenirDateLocaleISO(
    date = new Date()
) {

    const annee =
        date.getFullYear();

    const mois =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const jour =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${annee}-${mois}-${jour}`;
}


function obtenirDateDemainISO() {

    const demain =
        new Date();

    demain.setDate(
        demain.getDate() + 1
    );

    return obtenirDateLocaleISO(
        demain
    );
}


function dateBonAutorisee(
    date
) {

    if (!date) {
        return false;
    }

    const aujourdHui =
        obtenirDateLocaleISO();

    const demain =
        obtenirDateDemainISO();

    return (
        date === aujourdHui ||
        date === demain
    );
}


// =====================================================
// FORMATAGE DATE
// =====================================================

function formaterDate(
    timestamp
) {

    if (!timestamp) {
        return "-";
    }

    let date;

    if (
        typeof timestamp.toDate ===
        "function"
    ) {

        date =
            timestamp.toDate();

    }

    else if (
        timestamp instanceof Date
    ) {

        date =
            timestamp;

    }

    else {

        date =
            new Date(
                timestamp
            );

    }

    if (
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
    ).format(
        date
    );
}


// =====================================================
// RÔLE HÉBERGEMENT
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
            "1 - requireRole OK"
        );


        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {

            return;

        }

        console.log(
            "2 - service OK"
        );


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar(
            profile
        );

        console.log(
            "3 - sidebar chargée"
        );


        // =====================================================
        // TITRE
        // =====================================================

        const pageTitle =
            document.getElementById(
                "page-title"
            );

        if (pageTitle) {

            pageTitle.textContent =
                profile.affectation ||
                "";

        }


        // =====================================================
        // TYPES DE TRAVAUX
        // =====================================================

        const typeSelect =
            document.getElementById(
                "type"
            );

        let typesTravaux = [];

        if (typeSelect) {

            console.log(
                "4 - select trouvé"
            );

            typesTravaux =
                await getTypesTravaux();

            console.log(
                "5 - types récupérés",
                typesTravaux
            );

            typeSelect.innerHTML =
                "";

            typesTravaux.forEach(
                type => {

                    typeSelect.innerHTML += `
                        <option value="${type.id}">
                            ${type.nom}
                        </option>
                    `;
                }
            );
        }

        else {

            typesTravaux =
                await getTypesTravaux();

        }


        const typesTravauxMap =
            new Map(
                typesTravaux.map(
                    type => [
                        type.id,
                        type.nom
                    ]
                )
            );


        // =====================================================
        // DEMANDES
        // =====================================================

        const demandesBody =
            document.getElementById(
                "demandes-body"
            );


        if (!demandesBody) {

            console.error(
                "❌ demandes-body introuvable"
            );

            return;

        }


        // =====================================================
        // IDENTIFICATION PAVILLON
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

            demandesBody.innerHTML = `

                <tr class="empty-row">

                    <td colspan="9">

                        Impossible de déterminer
                        le site ou le pavillon.

                    </td>

                </tr>

            `;

            return;

        }


        // =====================================================
        // REQUÊTE FIRESTORE
        // =====================================================

        const demandesQuery =
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
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            );


        // =====================================================
        // CACHE
        // =====================================================

        const demandesCache =
            new Map();


        // =====================================================
        // ÉCOUTE TEMPS RÉEL
        // =====================================================

        onSnapshot(

            demandesQuery,

            snapshot => {

                console.log(
                    "📋 Demandes mises à jour :",
                    snapshot.size
                );


                demandesBody.innerHTML =
                    "";


                let demandesActives =
                    0;


                snapshot.forEach(
                    documentSnapshot => {

                        const demande = {

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        };


                        demandesCache.set(
                            demande.id,
                            demande
                        );


                        // =================================================
                        // NE PAS AFFICHER LES DEMANDES ARCHIVÉES
                        // =================================================

                        if (
                            demande.archive === true
                        ) {

                            return;

                        }


                        // =================================================
                        // STATUTS AFFICHÉS SUR LA PAGE
                        // =================================================
                        //
                        // en_attente
                        // en_cours
                        // termine
                        // non_termine
                        // forclos
                        //
                        // Les trois derniers restent donc
                        // visibles jusqu'à leur archivage
                        // automatique par le serveur.
                        //
                        // =================================================

                        const statutsVisibles = [

                            "en_attente",
                            "en_cours",
                            "termine",
                            "non_termine",
                            "forclos"

                        ];


                        if (
                            !statutsVisibles.includes(
                                demande.statut ||
                                "en_attente"
                            )
                        ) {

                            return;

                        }


                        demandesActives++;


                        const nomComplet =
                            `${demande.prenom || ""} ${demande.nom || ""}`
                                .trim();


                        let actions =
                            "";


                        // =================================================
                        // EN ATTENTE
                        // =================================================

                        if (
                            !lectureSeule &&
                            (
                                demande.statut ||
                                "en_attente"
                            ) ===
                            "en_attente"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-encours"
                                        data-id="${demande.id}"
                                        data-action="encours"
                                    >
                                        En cours
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-forclos"
                                        data-id="${demande.id}"
                                        data-action="forclos"
                                    >
                                        Forclos
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demande.id}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;

                        }


                        // =================================================
                        // EN COURS
                        // =================================================

                        else if (
                            !lectureSeule &&
                            demande.statut ===
                            "en_cours"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-termine"
                                        data-id="${demande.id}"
                                        data-action="termine"
                                    >
                                        Terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-nontermine"
                                        data-id="${demande.id}"
                                        data-action="nontermine"
                                    >
                                        Non terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demande.id}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;

                        }


                        // =================================================
                        // DEMANDE TERMINÉE
                        // =================================================

                        else if (
                            demande.statut ===
                            "termine"
                        ) {

                            actions = `

                                <span class="demande-statut-info">
                                    Terminée
                                </span>

                            `;

                        }


                        // =================================================
                        // DEMANDE NON TERMINÉE
                        // =================================================

                        else if (
                            demande.statut ===
                            "non_termine"
                        ) {

                            actions = `

                                <span class="demande-statut-info">
                                    Non terminée
                                </span>

                            `;

                        }


                        // =================================================
                        // DEMANDE FORCLOSE
                        // =================================================

                        else if (
                            demande.statut ===
                            "forclos"
                        ) {

                            actions = `

                                <span class="demande-statut-info">
                                    Forclos
                                </span>

                            `;

                        }


                        // =================================================
                        // LIGNE
                        // =================================================

                        demandesBody.innerHTML += `

                            <tr>

                                <td>
                                    <strong>
                                        ${nomComplet}
                                    </strong>
                                </td>

                                <td>
                                    ${demande.matricule || "-"}
                                </td>

                                <td>
                                    ${demande.chambre || "-"}
                                </td>

                                <td>
                                    ${
                                        typesTravauxMap.get(
                                            demande.type
                                        ) || "-"
                                    }
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
                                    ${demande.probleme || "-"}
                                </td>

                                <td>
                                    ${actions}
                                </td>

                            </tr>

                        `;
                    }
                );


                // =====================================================
                // AUCUNE DEMANDE
                // =====================================================

                if (
                    demandesActives === 0
                ) {

                    demandesBody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="9">

                                Aucune demande pour le moment

                            </td>

                        </tr>

                    `;

                }

            },


            error => {

                console.error(
                    "❌ Erreur écoute demandes :",
                    error
                );


                demandesBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="9">

                            Impossible de charger
                            les demandes.

                        </td>

                    </tr>

                `;

            }

        );


        // =====================================================
        // FORMULAIRE NOUVEAU BON
        // =====================================================

        const bonForm =
            document.getElementById(
                "bonForm"
            );


        // =====================================================
        // INITIALISATION DATE
        // =====================================================

        const dateInputInitial =
            document.getElementById(
                "date"
            );


        if (
            dateInputInitial
        ) {

            dateInputInitial.value =
                obtenirDateLocaleISO();

            dateInputInitial.min =
                obtenirDateLocaleISO();

            dateInputInitial.max =
                obtenirDateDemainISO();

        }


        // =====================================================
        // SOUMISSION BON
        // =====================================================

        bonForm?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (
                    lectureSeule
                ) {

                    return;

                }


                try {

                    const date =
                        document
                            .getElementById(
                                "date"
                            )
                            ?.value;


                    if (
                        !dateBonAutorisee(
                            date
                        )
                    ) {

                        alert(
                            "La date du bon doit être aujourd'hui ou demain."
                        );

                        return;

                    }


                    const type =
                        document
                            .getElementById(
                                "type"
                            )
                            ?.value;


                    const description =
                        document
                            .getElementById(
                                "description"
                            )
                            ?.value
                            .trim();


                    const chambre =
                        document
                            .getElementById(
                                "chambre"
                            )
                            ?.value
                            .trim();


                    const localisation =
                        document
                            .getElementById(
                                "localisation"
                            )
                            ?.value
                            .trim();


                    const niveau =
                        document
                            .getElementById(
                                "niveau"
                            )
                            ?.value
                            .trim();


                    const cote =
                        document
                            .getElementById(
                                "cote"
                            )
                            ?.value
                            .trim();


                    await createBon({

                        date,

                        heureEnvoi:
                            new Date()
                                .toLocaleTimeString(
                                    "fr-FR",
                                    {
                                        hour:
                                            "2-digit",
                                        minute:
                                            "2-digit"
                                    }
                                ),

                        site:
                            profile.site,

                        pavillon:
                            profile.affectation
                                ?.replace(
                                    /^Pavillon\s+/i,
                                    ""
                                )
                                .trim(),

                        type,

                        description,

                        chambre,

                        localisation,

                        niveau,

                        cote,

                        demandeId:
                            bonForm.dataset.demandeId ||
                            null,

                        agentMatricule:
                            profile.matricule,

                        agentNom:
                            `${profile.prenom || ""} ${profile.nom || ""}`
                                .trim(),

                        anneeAcademique

                    });


                    // =================================================
                    // SI LE BON EST LIÉ À UNE DEMANDE
                    // =================================================
                    //
                    // La demande ne doit pas disparaître
                    // immédiatement.
                    //
                    // Elle passe simplement en cours.
                    // Son archivage est géré automatiquement
                    // par le serveur.
                    //
                    // =================================================

                    const demandeId =
                        bonForm.dataset.demandeId;


                    if (
                        demandeId
                    ) {

                        try {

                            await updateDoc(

                                doc(
                                    db,
                                    "demandes_etudiants",
                                    demandeId
                                ),

                                {

                                    statut:
                                        "en_cours",

                                    cause:
                                        "",

                                    feedbackAutorise:
                                        false,

                                    notificationVue:
                                        true

                                }

                            );

                        } catch (
                            erreurDemande
                        ) {

                            console.error(
                                "❌ Erreur mise à jour demande après création du bon :",
                                erreurDemande
                            );

                        }

                    }


                    alert(
                        "Bon envoyé avec succès."
                    );


                    bonForm.reset();

                    delete bonForm.dataset.demandeId;


                    // =================================================
                    // DATE APRÈS RESET
                    // =================================================

                    const dateInput =
                        document.getElementById(
                            "date"
                        );


                    if (
                        dateInput
                    ) {

                        dateInput.value =
                            obtenirDateLocaleISO();

                        dateInput.min =
                            obtenirDateLocaleISO();

                        dateInput.max =
                            obtenirDateDemainISO();

                    }


                    // =================================================
                    // NETTOYAGE
                    // =================================================

                    const localisationInput =
                        document.getElementById(
                            "localisation"
                        );

                    const niveauInput =
                        document.getElementById(
                            "niveau"
                        );

                    const coteInput =
                        document.getElementById(
                            "cote"
                        );


                    if (
                        localisationInput
                    ) {

                        localisationInput.value =
                            "";

                    }


                    if (
                        niveauInput
                    ) {

                        niveauInput.value =
                            "";

                    }


                    if (
                        coteInput
                    ) {

                        coteInput.value =
                            "";

                    }

                } catch (
                    error
                ) {

                    console.error(
                        "❌ Création du bon :",
                        error
                    );


                    alert(
                        "Impossible de créer le bon."
                    );

                }

            }
        );


        // =====================================================
        // ACTIONS DEMANDES
        // =====================================================

        demandesBody.addEventListener(
            "click",
            async event => {

                if (
                    lectureSeule
                ) {

                    console.warn(
                        "🔒 Action bloquée : session en lecture seule."
                    );

                    return;

                }


                const button =
                    event.target.closest(
                        ".demande-action-btn"
                    );


                if (!button) {

                    return;

                }


                const id =
                    button.dataset.id;

                const action =
                    button.dataset.action;


                // =================================================
                // RÉDIGER UN BON
                // =================================================

                if (
                    action ===
                    "bon"
                ) {

                    const demande =
                        demandesCache.get(
                            id
                        );


                    if (!demande) {

                        alert(
                            "Impossible de retrouver la demande."
                        );

                        return;

                    }


                    // =================================================
                    // DATE
                    // =================================================

                    const dateInput =
                        document.getElementById(
                            "date"
                        );


                    if (
                        dateInput
                    ) {

                        dateInput.value =
                            obtenirDateLocaleISO();

                        dateInput.min =
                            obtenirDateLocaleISO();

                        dateInput.max =
                            obtenirDateDemainISO();

                    }


                    // =================================================
                    // TYPE
                    // =================================================

                    const typeInput =
                        document.getElementById(
                            "type"
                        );


                    if (
                        typeInput
                    ) {

                        typeInput.value =
                            demande.type ||
                            "";

                    }


                    // =================================================
                    // DESCRIPTION
                    // =================================================

                    const descriptionInput =
                        document.getElementById(
                            "description"
                        );


                    if (
                        descriptionInput
                    ) {

                        descriptionInput.value =
                            demande.probleme ||
                            "";

                    }


                    // =================================================
                    // CHAMBRE
                    // =================================================

                    const chambreInput =
                        document.getElementById(
                            "chambre"
                        );


                    if (
                        chambreInput
                    ) {

                        const localisation =
                            String(
                                demande.localisation ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        const concerneChambre =
                            localisation ===
                            "chambre";


                        chambreInput.value =
                            concerneChambre
                                ? (
                                    demande.chambre ||
                                    ""
                                )
                                : "";

                    }


                    // =================================================
                    // LOCALISATION
                    // =================================================

                    const localisationInput =
                        document.getElementById(
                            "localisation"
                        );


                    if (
                        localisationInput
                    ) {

                        localisationInput.value =
                            demande.localisation ||
                            "";

                    }


                    // =================================================
                    // NIVEAU
                    // =================================================

                    const niveauInput =
                        document.getElementById(
                            "niveau"
                        );


                    if (
                        niveauInput
                    ) {

                        niveauInput.value =
                            demande.niveau ||
                            demande.etage ||
                            "";

                    }


                    // =================================================
                    // CÔTÉ
                    // =================================================

                    const coteInput =
                        document.getElementById(
                            "cote"
                        );


                    if (
                        coteInput
                    ) {

                        coteInput.value =
                            demande.cote ||
                            "";

                    }


                    // =================================================
                    // LIEN DEMANDE
                    // =================================================

                    if (
                        bonForm
                    ) {

                        bonForm.dataset.demandeId =
                            id;

                    }


                    // =================================================
                    // SCROLL
                    // =================================================

                    document
                        .querySelector(
                            ".nouveau-card"
                        )
                        ?.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });


                    return;

                }


                // =================================================
                // VALIDATION
                // =================================================

                if (
                    !id ||
                    !action
                ) {

                    return;

                }


                if (
                    button.disabled
                ) {

                    return;

                }


                button.disabled =
                    true;


                try {

                    const demandePourNotification =
                        demandesCache.get(
                            id
                        );


                    function messagePourNotification(
                        cause
                    ) {

                        const details =
                            [

                                `${demandePourNotification?.prenom || ""} ${demandePourNotification?.nom || ""}`
                                    .trim(),

                                demandePourNotification?.localisation,

                                demandePourNotification?.chambre
                                    ? `Chambre ${demandePourNotification.chambre}`
                                    : ""

                            ].filter(
                                Boolean
                            );


                        const base =
                            `${demandePourNotification?.probleme || "Demande d'intervention"} — ${details.join(" · ")}`;


                        return cause
                            ? `${base} (${cause})`
                            : base;

                    }


                    // =================================================
                    // EN COURS
                    // =================================================

                    if (
                        action ===
                        "encours"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {

                                statut:
                                    "en_cours",

                                cause:
                                    "",

                                feedbackAutorise:
                                    false,

                                notificationVue:
                                    true

                            }

                        );

                    }


                    // =================================================
                    // FORCLOS
                    // =================================================

                    else if (
                        action ===
                        "forclos"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {

                                statut:
                                    "forclos",

                                cause:
                                    "Votre demande a déjà été formulée par un(e) de vos camarades / colocataires.",

                                feedbackAutorise:
                                    false,

                                notificationVue:
                                    true

                            }

                        );


                        try {

                            await createNotificationHebergement({

                                site:
                                    demandePourNotification?.site,

                                pavillon:
                                    demandePourNotification?.pavillon,

                                anneeAcademique:
                                    demandePourNotification?.anneeAcademique,

                                type:
                                    "demande_forclose",

                                titre:
                                    "Demande forclose",

                                message:
                                    messagePourNotification(
                                        "déjà formulée par un(e) colocataire"
                                    ),

                                demandeId:
                                    id

                            });

                        } catch (
                            error
                        ) {

                            console.error(
                                "❌ Erreur création notification hébergement :",
                                error
                            );

                        }

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
                                "demandes_etudiants",
                                id
                            ),

                            {

                                statut:
                                    "termine",

                                cause:
                                    "",

                                feedbackAutorise:
                                    true

                            }

                        );


                        try {

                            await createNotificationHebergement({

                                site:
                                    demandePourNotification?.site,

                                pavillon:
                                    demandePourNotification?.pavillon,

                                anneeAcademique:
                                    demandePourNotification?.anneeAcademique,

                                type:
                                    "demande_terminee",

                                titre:
                                    "Demande terminée",

                                message:
                                    messagePourNotification(),

                                demandeId:
                                    id

                            });

                        } catch (
                            error
                        ) {

                            console.error(
                                "❌ Erreur création notification hébergement :",
                                error
                            );

                        }

                    }


                    // =================================================
                    // NON TERMINÉE
                    // =================================================

                    else if (
                        action ===
                        "nontermine"
                    ) {

                        await updateDoc(

                            doc(
                                db,
                                "demandes_etudiants",
                                id
                            ),

                            {

                                statut:
                                    "non_termine",

                                cause:
                                    "Stock de matériel, merci de formuler votre demande dans les jours à venir.",

                                feedbackAutorise:
                                    false

                            }

                        );


                        try {

                            await createNotificationHebergement({

                                site:
                                    demandePourNotification?.site,

                                pavillon:
                                    demandePourNotification?.pavillon,

                                anneeAcademique:
                                    demandePourNotification?.anneeAcademique,

                                type:
                                    "demande_non_terminee",

                                titre:
                                    "Demande non terminée",

                                message:
                                    messagePourNotification(
                                        "stock de matériel"
                                    ),

                                demandeId:
                                    id

                            });

                        } catch (
                            error
                        ) {

                            console.error(
                                "❌ Erreur création notification hébergement :",
                                error
                            );

                        }

                    }

                } catch (
                    error
                ) {

                    console.error(
                        "❌ Erreur action demande :",
                        error
                    );


                    button.disabled =
                        false;


                    alert(
                        "Impossible de modifier la demande."
                    );

                }

            }
        );


        // =====================================================
        // SUIVI DES BONS
        // =====================================================

        const bonsBody =
            document.getElementById(
                "bons-body"
            );


        if (
            !bonsBody
        ) {

            console.error(
                "❌ bons-body introuvable"
            );

            return;

        }


        // =====================================================
        // REQUÊTE BONS
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
                ),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )

            );


        // =====================================================
        // ÉCOUTE BONS
        // =====================================================

        onSnapshot(

            bonsQuery,

            snapshot => {

                console.log(
                    "🔄 Bons mis à jour en temps réel :",
                    snapshot.size
                );


                let bons =
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
                                bon.supprime !== true &&
                                bon.archive !== true
                        );


                // =================================================
                // AFFICHER LES BONS DU JOUR
                // =================================================
                //
                // On conserve le fonctionnement :
                // cette page affiche les bons du jour.
                //
                // =================================================

                const aujourdHui =
                    obtenirDateLocaleISO();


                const bonsDuJour =
                    bons.filter(
                        bon =>
                            bon.date ===
                            aujourdHui
                    );


                bonsDuJour.sort(
                    (a, b) =>
                        String(
                            b.createdAt || ""
                        ).localeCompare(
                            String(
                                a.createdAt || ""
                            )
                        )
                );


                bonsBody.innerHTML =
                    "";


                if (
                    bonsDuJour.length ===
                    0
                ) {

                    bonsBody.innerHTML = `

                        <tr class="empty-row">

                            <td colspan="12">

                                Aucun bon aujourd'hui

                            </td>

                        </tr>

                    `;

                    return;

                }


                function obtenirLibelleStatut(
                    statut
                ) {

                    switch (
                        statut
                    ) {

                        case "envoye":
                            return "Envoyé";

                        case "recu":
                            return "Reçu";

                        case "en_cours":
                            return "En cours";

                        case "termine":
                            return "Terminé";

                        case "non_termine":
                            return "Non terminé";

                        case "forclos":
                            return "Forclos";

                        default:
                            return statut ||
                                "-";

                    }

                }


                // =================================================
                // AFFICHAGE
                // =================================================

                bonsDuJour.forEach(
                    bon => {

                        const boutonSuppression =
                            !lectureSeule &&
                            bon.statut ===
                            "envoye"

                                ? `

                                    <button
                                        type="button"
                                        class="bon-delete-btn"
                                        data-bon-id="${bon.id}"
                                    >
                                        Supprimer
                                    </button>

                                `

                                : "";


                        bonsBody.innerHTML += `

                            <tr>

                                <td>
                                    ${bon.id || "-"}
                                </td>

                                <td>
                                    ${formaterDate(
                                        bon.createdAt
                                    )}
                                </td>

                                <td>
                                    ${
                                        typesTravauxMap.get(
                                            bon.type
                                        ) || "-"
                                    }
                                </td>

                                <td>
                                    ${bon.localisation || "-"}
                                </td>

                                <td>
                                    ${bon.niveau || "-"}
                                </td>

                                <td>
                                    ${bon.cote || "-"}
                                </td>

                                <td>
                                    ${bon.chambre || "-"}
                                </td>

                                <td>
                                    ${bon.description || "-"}
                                </td>

                                <td>
                                    ${bon.par || "-"}
                                </td>

                                <td>
                                    ${boutonSuppression}
                                </td>

                                <td>
                                    ${obtenirLibelleStatut(
                                        bon.statut
                                    )}
                                </td>

                                <td>
                                    ${bon.cause || "-"}
                                </td>

                            </tr>

                        `;

                    }
                );


                // =================================================
                // ACTION SUPPRESSION
                // =================================================

                if (
                    !lectureSeule
                ) {

                    bonsBody
                        .querySelectorAll(
                            ".bon-delete-btn"
                        )
                        .forEach(
                            button => {

                                button.addEventListener(
                                    "click",
                                    async () => {

                                        const bonId =
                                            button.dataset.bonId;


                                        if (
                                            !bonId
                                        ) {

                                            return;

                                        }


                                        if (
                                            button.disabled
                                        ) {

                                            return;

                                        }


                                        const confirmation =
                                            confirm(
                                                "Voulez-vous vraiment supprimer ce bon ?"
                                            );


                                        if (
                                            !confirmation
                                        ) {

                                            return;

                                        }


                                        button.disabled =
                                            true;


                                        try {

                                            await deleteBon(
                                                bonId
                                            );

                                        } catch (
                                            error
                                        ) {

                                            console.error(
                                                "❌ Suppression du bon :",
                                                error
                                            );


                                            button.disabled =
                                                false;


                                            alert(
                                                "Impossible de supprimer le bon."
                                            );

                                        }

                                    }
                                );

                            }
                        );

                }

            },


            error => {

                console.error(
                    "❌ Erreur écoute temps réel des bons :",
                    error
                );


                bonsBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="12">

                            Impossible de charger
                            les bons.

                        </td>

                    </tr>

                `;

            }

        );


        // =====================================================
        // FIN
        // =====================================================

        console.log(
            "6 - page prête"
        );


        document.body.classList.add(
            "loaded"
        );

    }
);