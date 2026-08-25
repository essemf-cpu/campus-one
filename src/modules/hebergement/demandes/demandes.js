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
    getTypesTravaux
} from "../../../services/referentielService.js";


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

        console.log("1 - requireRole OK");


        // =====================================================
        // VÉRIFICATION SERVICE
        // =====================================================

        if (
            profile.service !==
            "Service de l'Hébergement"
        ) {
            return;
        }

        console.log("2 - service OK");


        // =====================================================
        // SIDEBAR
        // =====================================================

        await loadSidebar(profile);

        console.log("3 - sidebar chargée");


        // =====================================================
        // TITRE
        // =====================================================

        document
            .getElementById("page-title")
            .textContent =
                profile.affectation;


        // =====================================================
        // TYPES DE TRAVAUX
        // =====================================================

        const typeSelect =
            document.getElementById("type");

        if (typeSelect) {

            console.log(
                "4 - select trouvé"
            );

            const types =
                await getTypesTravaux();

            console.log(
                "5 - types récupérés",
                types
            );

            typeSelect.innerHTML = "";

            types.forEach(
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
        // DEMANDES DES ÉTUDIANTS
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
        // IDENTIFIER LE PAVILLON DE L'AGENT
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
        // RÉFÉRENTIEL DES TYPES DE TRAVAUX
        // =====================================================

        const typesTravaux =
            await getTypesTravaux();

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
        // CACHE DES DEMANDES
        // =====================================================

        const demandesCache =
            new Map();


        // =====================================================
        // ÉCOUTE TEMPS RÉEL DES DEMANDES
        // =====================================================

        onSnapshot(

            demandesQuery,

            (snapshot) => {

                console.log(
                    "📋 Demandes mises à jour :",
                    snapshot.size
                );

                demandesBody.innerHTML = "";

                let demandesActives = 0;


                snapshot.forEach(
                    (documentSnapshot) => {

                        const demande =
                            documentSnapshot.data();

                        const demandeId =
                            documentSnapshot.id;


                        demandesCache.set(
                            demandeId,
                            demande
                        );


                        if (
                            demande.statut &&
                            demande.statut !== "en_attente" &&
                            demande.statut !== "en_cours"
                        ) {
                            return;
                        }


                        demandesActives++;


                        const nomComplet =
                            `${demande.prenom || ""} ${demande.nom || ""}`
                                .trim();


                        let actions = "";


                        // =============================================
                        // EN ATTENTE
                        // =============================================

                        if (
                            !lectureSeule &&
                            (demande.statut || "en_attente") ===
                                "en_attente"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-encours"
                                        data-id="${demandeId}"
                                        data-action="encours"
                                    >
                                        En cours
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-forclos"
                                        data-id="${demandeId}"
                                        data-action="forclos"
                                    >
                                        Forclos
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demandeId}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;
                        }


                        // =============================================
                        // EN COURS
                        // =============================================

                        else if (
                            !lectureSeule &&
                            demande.statut === "en_cours"
                        ) {

                            actions = `

                                <div class="demande-actions">

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-termine"
                                        data-id="${demandeId}"
                                        data-action="termine"
                                    >
                                        Terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-nontermine"
                                        data-id="${demandeId}"
                                        data-action="nontermine"
                                    >
                                        Non terminée
                                    </button>

                                    <button
                                        type="button"
                                        class="demande-action-btn demande-action-bon"
                                        data-id="${demandeId}"
                                        data-action="bon"
                                    >
                                        Rédiger un bon
                                    </button>

                                </div>

                            `;
                        }


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


            (error) => {

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
        // DATE AUTORISÉE
        // =====================================================
        //
        // Un bon peut être daté :
        //
        // - aujourd'hui
        // - demain
        //
        // Interdit :
        //
        // - toute date passée
        // - après-demain et au-delà
        //
        // =====================================================

        function obtenirDateLocaleISO(
            date = new Date()
        ) {

            const annee =
                date.getFullYear();

            const mois =
                String(
                    date.getMonth() + 1
                ).padStart(2, "0");

            const jour =
                String(
                    date.getDate()
                ).padStart(2, "0");

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
        // INITIALISER LA DATE DU FORMULAIRE
        // =====================================================

        const dateInputInitial =
            document.getElementById(
                "date"
            );

        if (dateInputInitial) {

            dateInputInitial.value =
                obtenirDateLocaleISO();

            dateInputInitial.min =
                obtenirDateLocaleISO();

            dateInputInitial.max =
                obtenirDateDemainISO();
        }


        bonForm?.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                // =================================================
                // LECTURE SEULE
                // =================================================

                if (lectureSeule) {
                    return;
                }


                try {

                    const date =
                        document
                            .getElementById("date")
                            ?.value;


                    // =================================================
                    // CONTRÔLE DE DATE
                    // =================================================

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
                            .getElementById("type")
                            ?.value;

                    const description =
                        document
                            .getElementById("description")
                            ?.value
                            .trim();

                    const chambre =
                        document
                            .getElementById("chambre")
                            ?.value
                            .trim();


                    // =================================================
                    // PRÉCISIONS DE LOCALISATION
                    // =================================================

                    const localisation =
                        document
                            .getElementById("localisation")
                            ?.value
                            .trim();

                    const niveau =
                        document
                            .getElementById("niveau")
                            ?.value
                            .trim();

                    const cote =
                        document
                            .getElementById("cote")
                            ?.value
                            .trim();


                    // =================================================
                    // CRÉATION DU BON
                    // =================================================

                    await createBon({

                        date,
                            heureEnvoi: new Date().toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            }),

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


                    alert(
                        "Bon envoyé avec succès."
                    );


                    bonForm.reset();

                    delete bonForm.dataset.demandeId;


                    // =================================================
                    // DATE PAR DÉFAUT APRÈS RESET
                    // =================================================

                    const dateInput =
                        document.getElementById(
                            "date"
                        );

                    if (dateInput) {

                        dateInput.value =
                            obtenirDateLocaleISO();

                        dateInput.min =
                            obtenirDateLocaleISO();

                        dateInput.max =
                            obtenirDateDemainISO();
                    }


                    // =================================================
                    // NETTOYAGE DES CHAMPS DE PRÉCISION
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


                    if (localisationInput) {
                        localisationInput.value = "";
                    }

                    if (niveauInput) {
                        niveauInput.value = "";
                    }

                    if (coteInput) {
                        coteInput.value = "";
                    }


                } catch (error) {

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
        // ACTIONS DES DEMANDES ÉTUDIANTS
        // =====================================================

        demandesBody.addEventListener(
            "click",
            async (event) => {

                if (lectureSeule) {

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
                    action === "bon"
                ) {

                    const demande =
                        demandesCache.get(id);


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

                    if (dateInput) {

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

                    if (typeInput) {

                        typeInput.value =
                            demande.type || "";

                    }


                    // =================================================
                    // DESCRIPTION / PROBLÈME
                    // =================================================

                    const descriptionInput =
                        document.getElementById(
                            "description"
                        );

                    if (descriptionInput) {

                        descriptionInput.value =
                            demande.probleme || "";

                    }


                    // =================================================
                    // CHAMBRE
                    // =================================================

                    const chambreInput =
                        document.getElementById(
                            "chambre"
                        );

                    if (chambreInput) {

                        const localisation =
                            String(
                                demande.localisation || ""
                            )
                            .trim()
                            .toLowerCase();

                        const concerneChambre =
                            localisation === "chambre";

                        chambreInput.value =
                            concerneChambre
                                ? (demande.chambre || "")
                                : "";

                    }


                    // =================================================
                    // LOCALISATION
                    // =================================================

                    const localisationInput =
                        document.getElementById(
                            "localisation"
                        );

                    if (localisationInput) {

                        localisationInput.value =
                            demande.localisation || "";

                    }


                    // =================================================
                    // NIVEAU / ÉTAGE
                    // =================================================

                    const niveauInput =
                        document.getElementById(
                            "niveau"
                        );

                    if (niveauInput) {

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

                    if (coteInput) {

                        coteInput.value =
                            demande.cote ||
                            "";

                    }


                    // =================================================
                    // LIER LE BON À LA DEMANDE
                    // =================================================

                    if (bonForm) {

                        bonForm.dataset.demandeId =
                            id;

                    }


                    // =================================================
                    // ALLER AU FORMULAIRE
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
                // VALIDATION ACTION
                // =================================================

                if (
                    !id ||
                    !action
                ) {
                    return;
                }


                // =================================================
                // EMPÊCHE LES DOUBLES CLICS
                // =================================================

                if (
                    button.disabled
                ) {
                    return;
                }

                button.disabled = true;


                try {

                    // =================================================
                    // EN COURS
                    // =================================================

                    if (
                        action === "encours"
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
                        action === "forclos"
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
                    }


                    // =================================================
                    // TERMINÉE
                    // =================================================

                    else if (
                        action === "termine"
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
                    }


                    // =================================================
                    // NON TERMINÉE
                    // =================================================

                    else if (
                        action === "nontermine"
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
                    }

                } catch (error) {

                    console.error(
                        "❌ Erreur action demande :",
                        error
                    );

                    button.disabled = false;

                    alert(
                        "Impossible de modifier la demande."
                    );
                }

            }
        );


        // =====================================================
        // SUIVI DES BONS — TEMPS RÉEL
        // =====================================================

        const bonsBody =
            document.getElementById(
                "bons-body"
            );


        if (!bonsBody) {

            console.error(
                "❌ bons-body introuvable"
            );

            return;
        }


        // =====================================================
        // REQUÊTE TEMPS RÉEL DES BONS
        // =====================================================

        const bonsQuery =
            query(
                collection(db, "bons"),

                where("site", "==", siteAgent),

                where("pavillon", "==", pavillonAgent),

                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                )
            );


        // =====================================================
        // ÉCOUTE TEMPS RÉEL DES BONS
        // =====================================================

        onSnapshot(

            bonsQuery,

            (snapshot) => {

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
                                bon.supprime !== true
                        );


                // =================================================
                // DATE DU JOUR — LOCALE
                // =================================================

                const aujourdHui =
                    obtenirDateLocaleISO();


                const bonsDuJour =
                    bons.filter(
                        bon =>
                            bon.date ===
                            aujourdHui
                    );


                // =================================================
                // TRI
                // =================================================

                bonsDuJour.sort(
                    (a, b) =>
                        String(
                            b.date || ""
                        ).localeCompare(
                            String(
                                a.date || ""
                            )
                        )
                );


                bonsBody.innerHTML = "";


                // =================================================
                // AUCUN BON
                // =================================================

                if (
                    bonsDuJour.length === 0
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


                // =================================================
                // AFFICHAGE
                // =================================================

                bonsDuJour.forEach(
                    (bon) => {

                        const boutonSuppression =
                            !lectureSeule &&
                            bon.statut === "envoye"
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
                                    ${formaterDate(bon.date)}
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
                                    ${bon.statut || "-"}
                                </td>

                                <td>
                                    ${bon.cause || "-"}
                                </td>

                            </tr>

                        `;
                    }
                );



function formaterDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(d);
}


                // =================================================
                // ACTION SUPPRESSION
                // =================================================

                if (!lectureSeule) {

                    bonsBody
                        .querySelectorAll(
                            ".bon-delete-btn"
                        )
                        .forEach(
                            (button) => {

                                button.addEventListener(
                                    "click",
                                    async () => {

                                        const bonId =
                                            button.dataset.bonId;


                                        if (!bonId) {
                                            return;
                                        }


                                        if (
                                            lectureSeule
                                        ) {

                                            console.warn(
                                                "🔒 Suppression bloquée : session en lecture seule."
                                            );

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

                                            // Pas de refresh manuel :
                                            // onSnapshot actualise automatiquement.


                                        } catch (error) {

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


            (error) => {

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