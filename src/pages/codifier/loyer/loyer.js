// =====================================================
// DONNÉES DE DÉMONSTRATION
// =====================================================
//
// Aucun raccordement Firestore pour le moment.
// Ces données seront remplacées par les données
// du système de recouvrement plus tard.
// =====================================================

const situation = {

    anneeAcademique: "2026-2027",

    montantMensuel: 3000,

    mois: [

        {
            nom: "Novembre 2026",
            statut: "paye"
        },

        {
            nom: "Décembre 2026",
            statut: "paye"
        },

        {
            nom: "Janvier 2027",
            statut: "a_payer"
        },

        {
            nom: "Février 2027",
            statut: "a_payer"
        },

        {
            nom: "Mars 2027",
            statut: "a_payer"
        },

        {
            nom: "Avril 2027",
            statut: "a_payer"
        },

        {
            nom: "Mai 2027",
            statut: "a_payer"
        },

        {
            nom: "Juin 2027",
            statut: "a_payer"
        },

        {
            nom: "Juillet 2027",
            statut: "a_payer"
        }

    ]

};


// =====================================================
// ÉLÉMENTS
// =====================================================

const anneeElement =
    document.getElementById(
        "annee-academique"
    );

const montantTotalElement =
    document.getElementById(
        "montant-total"
    );

const moisAPayerElement =
    document.getElementById(
        "mois-a-payer"
    );

const paiementsList =
    document.getElementById(
        "paiements-list"
    );


// =====================================================
// FORMATAGE
// =====================================================

function formaterMontant(
    montant
) {

    return `${new Intl.NumberFormat(
        "fr-FR"
    ).format(montant)} FCFA`;

}


// =====================================================
// PREMIER MOIS À RÉGULARISER
// =====================================================

function obtenirPremierMoisAPayer() {

    return situation.mois.find(
        mois =>
            mois.statut === "a_payer"
    );

}


// =====================================================
// AFFICHER SITUATION
// =====================================================

function afficherSituation() {

    const premierMois =
        obtenirPremierMoisAPayer();


    anneeElement.textContent =
        situation.anneeAcademique;


    if (premierMois) {

        montantTotalElement.textContent =
            formaterMontant(
                situation.montantMensuel
            );

        moisAPayerElement.textContent =
            premierMois.nom;

    } else {

        montantTotalElement.textContent =
            "0 FCFA";

        moisAPayerElement.textContent =
            "Aucun mois en attente";

    }

}


// =====================================================
// AFFICHER HISTORIQUE
// =====================================================

function afficherPaiements() {

    paiementsList.innerHTML = "";


    situation.mois.forEach(
        mois => {

            const estPaye =
                mois.statut === "paye";


            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "paiement-row";


            element.innerHTML = `

                <div class="paiement-mois">

                    <div
                        class="
                            paiement-status
                            ${estPaye
                                ? "status-paye"
                                : "status-attente"
                            }
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${
                                    estPaye
                                        ? "fa-check"
                                        : "fa-clock"
                                }
                            "
                        ></i>

                    </div>

                    <span>
                        ${mois.nom}
                    </span>

                </div>


                <div
                    class="
                        paiement-etat
                        ${estPaye
                            ? "etat-paye"
                            : "etat-attente"
                        }
                    "
                >

                    ${
                        estPaye
                            ? "Payé"
                            : "À payer"
                    }

                </div>

            `;


            paiementsList.appendChild(
                element
            );

        }
    );

}


// =====================================================
// MODALES
// =====================================================

const paiementModal =
    document.getElementById(
        "paiement-modal"
    );

const plusieursModal =
    document.getElementById(
        "plusieurs-modal"
    );

const recapModal =
    document.getElementById(
        "recap-modal"
    );


// =====================================================
// OUVRIR / FERMER
// =====================================================

function ouvrirModal(
    modal
) {

    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


function fermerModal(
    modal
) {

    modal.classList.remove(
        "show"
    );

    if (
        !document.querySelector(
            ".modal.show"
        )
    ) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


// =====================================================
// BOUTON PAYER
// =====================================================

document
    .getElementById(
        "payer-btn"
    )
    .addEventListener(
        "click",
        () => {

            const premierMois =
                obtenirPremierMoisAPayer();


            if (!premierMois) {

                alert(
                    "Votre situation est à jour."
                );

                return;

            }


            document.getElementById(
                "modal-mois"
            ).textContent =
                premierMois.nom;


            document.getElementById(
                "montant-mois"
            ).textContent =
                formaterMontant(
                    situation.montantMensuel
                );


            ouvrirModal(
                paiementModal
            );

        }
    );


// =====================================================
// PAYER UNIQUEMENT LE MOIS
// =====================================================

document
    .getElementById("payer-seul-btn")
    .addEventListener(
        "click",
        () => {

            const premierMois =
                obtenirPremierMoisAPayer();

            if (!premierMois) {

                alert(
                    "Aucun mois à régulariser."
                );

                return;
            }

            // Important :
            // le paiement unique devient lui aussi
            // une sélection valide.

            moisSelectionnes = [
                premierMois
            ];

            afficherRecap(
                moisSelectionnes
            );

            fermerModal(
                paiementModal
            );

            ouvrirModal(
                recapModal
            );

        }
    );


// =====================================================
// PAYER PLUSIEURS MOIS
// =====================================================

document
    .getElementById(
        "payer-plusieurs-btn"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                paiementModal
            );

            afficherSelectionMois();

            ouvrirModal(
                plusieursModal
            );

        }
    );


// =====================================================
// SÉLECTION DES MOIS
// =====================================================

let moisSelectionnes = [];


function afficherSelectionMois() {

    const container =
        document.getElementById(
            "mois-selection"
        );

    container.innerHTML = "";

    moisSelectionnes = [];

    const moisAPayer =
        situation.mois.filter(
            mois =>
                mois.statut === "a_payer"
        );


    moisAPayer.forEach(
        (mois, index) => {

            const element =
                document.createElement(
                    "button"
                );

            element.type = "button";

            element.className =
                "mois-option";

            element.dataset.index =
                index;


            element.innerHTML = `

                <div>

                    <strong>
                        ${mois.nom}
                    </strong>

                    <span>
                        ${formaterMontant(
                            situation.montantMensuel
                        )}
                    </span>

                </div>

                <i
                    class="
                        fa-solid
                        fa-circle-check
                    "
                ></i>

            `;


            element.addEventListener(
                "click",
                () => {

                    toggleMois(index);

                }
            );


            container.appendChild(
                element
            );

        }
    );


    // ==========================================
    // LE PREMIER MOIS EST SÉLECTIONNÉ
    // ==========================================

    if (moisAPayer.length > 0) {

        moisSelectionnes = [
            moisAPayer[0]
        ];

    }


    actualiserSelectionVisuelle();

    mettreAJourTotal();

}


// =====================================================
// TOGGLE MOIS
// =====================================================

function toggleMois(index) {

    const moisAPayer =
        situation.mois.filter(
            mois =>
                mois.statut === "a_payer"
        );


    const moisClique =
        moisAPayer[index];


    if (!moisClique) {
        return;
    }


    const position =
        moisSelectionnes.indexOf(
            moisClique
        );


    // =================================================
    // MOIS DÉJÀ SÉLECTIONNÉ
    // =================================================

    if (position !== -1) {

        // On ne peut retirer qu'à partir
        // du dernier mois sélectionné.

        if (
            position !==
            moisSelectionnes.length - 1
        ) {

            return;

        }


        moisSelectionnes.splice(
            position,
            1
        );

    }


    // =================================================
    // NOUVEAU MOIS
    // =================================================

    else {

        // Le mois doit être exactement
        // celui qui suit le dernier sélectionné.

        if (
            index !==
            moisSelectionnes.length
        ) {

            return;

        }


        moisSelectionnes.push(
            moisClique
        );

    }


    actualiserSelectionVisuelle();

    mettreAJourTotal();

}


// =====================================================
// VISUEL SÉLECTION
// =====================================================

function actualiserSelectionVisuelle() {

    document
        .querySelectorAll(
            ".mois-option"
        )
        .forEach(
            (element, index) => {

                const selectionne =
                    index <
                    moisSelectionnes.length;


                element.classList.toggle(
                    "selected",
                    selectionne
                );


                element.classList.remove(
                    "disabled"
                );

            }
        );

}


// =====================================================
// TOTAL
// =====================================================

function calculerTotal(
    mois
) {

    return mois.length *
        situation.montantMensuel;

}


function mettreAJourTotal() {

    const total =
        calculerTotal(
            moisSelectionnes
        );


    document.getElementById(
        "total-selection"
    ).textContent =
        formaterMontant(
            total
        );

}


// =====================================================
// CONTINUER
// =====================================================

document
    .getElementById(
        "continuer-paiement-btn"
    )
    .addEventListener(
        "click",
        () => {

            if (
                moisSelectionnes.length === 0
            ) {

                alert(
                    "Veuillez sélectionner au moins un mois."
                );

                return;

            }


            afficherRecap(
                moisSelectionnes
            );

            fermerModal(
                plusieursModal
            );

            ouvrirModal(
                recapModal
            );

        }
    );


// =====================================================
// RÉCAPITULATIF
// =====================================================

function afficherRecap(
    mois
) {

    const recapList =
        document.getElementById(
            "recap-list"
        );


    recapList.innerHTML = "";


    mois.forEach(
        element => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "recap-row";


            row.innerHTML = `

                <span>
                    ${element.nom}
                </span>

                <strong>
                    ${formaterMontant(
                        situation.montantMensuel
                    )}
                </strong>

            `;


            recapList.appendChild(
                row
            );

        }
    );


    document.getElementById(
        "recap-total"
    ).textContent =
        formaterMontant(
            calculerTotal(
                mois
            )
        );

}


// =====================================================
// CONFIRMATION
// =====================================================

document
    .getElementById(
        "confirmer-paiement-btn"
    )
    .addEventListener(
        "click",
        () => {

            if (
                moisSelectionnes.length === 0
            ) {
                alert(
                    "Aucun mois sélectionné."
                );

                return;
            }

            const total =
                calculerTotal(
                    moisSelectionnes
                );

            const confirmation =
                confirm(
                    `Confirmer le paiement fictif de ${formaterMontant(total)} ?`
                );

            if (!confirmation) {
                return;
            }

            // ==========================================
            // SIMULATION DU PAIEMENT
            // ==========================================

            moisSelectionnes.forEach(
                mois => {

                    mois.statut =
                        "paye";

                }
            );

            alert(
                `Paiement effectué avec succès.\n\nMontant : ${formaterMontant(total)}`
            );

            // ==========================================
            // ACTUALISATION
            // ==========================================

            afficherSituation();

            afficherPaiements();

            // ==========================================
            // NETTOYAGE
            // ==========================================

            moisSelectionnes = [];

            fermerModal(
                recapModal
            );
        }
    );

// =====================================================
// RÈGLEMENT INTÉRIEUR
// =====================================================

document
    .getElementById(
        "reglement-btn"
    )
    .addEventListener(
        "click",
        () => {

            alert(
                "L'article du règlement intérieur sera disponible prochainement."
            );

        }
    );


// =====================================================
// FERMETURE MODALES
// =====================================================

document
    .getElementById(
        "close-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                paiementModal
            );

        }
    );


document
    .getElementById(
        "close-plusieurs-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                plusieursModal
            );

        }
    );


document
    .getElementById(
        "close-recap-modal"
    )
    .addEventListener(
        "click",
        () => {

            fermerModal(
                recapModal
            );

        }
    );


// =====================================================
// CLIC SUR FOND
// =====================================================

document
    .querySelectorAll(
        ".modal"
    )
    .forEach(
        modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        fermerModal(
                            modal
                        );

                    }

                }
            );

        }
    );


// =====================================================
// RETOUR
// =====================================================

document
    .getElementById(
        "back-btn"
    )
    .addEventListener(
        "click",
        () => {

            window.history.back();

        }
    );


// =====================================================
// INITIALISATION
// =====================================================

afficherSituation();

afficherPaiements();