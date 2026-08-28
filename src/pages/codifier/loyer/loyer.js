import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    doc,
    getDoc,
    serverTimestamp,
    addDoc
} from "firebase/firestore";

import {
    auth,
    db
} from "../../../firebase/firebase.js";

import {
    getCurrentUser
} from "../../../auth/authService.js";

import {
    onAuthStateChanged
} from "firebase/auth";


// =====================================================
// CONFIGURATION
// =====================================================

const MONTANT_MENSUEL = 3000;
const COLLECTION_PAIEMENTS = "paiementsLoyers";


// =====================================================
// SITUATION DE BASE
// =====================================================

const situationBase = {

    anneeAcademique: "2026-2027",

    montantMensuel: MONTANT_MENSUEL,

    mois: [

        {
            nom: "Novembre 2026",
            statut: "codification"
        },

        {
            nom: "Décembre 2026",
            statut: "codification"
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
// SITUATION UTILISÉE PAR LA PAGE
// =====================================================

let situation = {

    anneeAcademique:
        situationBase.anneeAcademique,

    montantMensuel:
        situationBase.montantMensuel,

    mois:
        situationBase.mois.map(
            mois => ({
                ...mois
            })
        )

};


// =====================================================
// UTILISATEUR CONNECTÉ
// =====================================================

let utilisateur = null;
let matricule = null;
let anneeAcademique = null;


// =====================================================
// PAIEMENT POUR UN AMI
// =====================================================

let amis = [];
let amiSelectionne = null;
let paiementPourAmi = false;
let situationPaiementActive = null;


// =====================================================
// MOIS SÉLECTIONNÉS
// =====================================================

let moisSelectionnes = [];


// =====================================================
// ÉLÉMENTS PRINCIPAUX
// =====================================================

const anneeElement =
    document.getElementById("annee-academique");

const montantTotalElement =
    document.getElementById("montant-total");

const moisAPayerElement =
    document.getElementById("mois-a-payer");

const paiementsList =
    document.getElementById("paiements-list");


// =====================================================
// FORMATAGE
// =====================================================

function formaterMontant(montant) {

    return `${new Intl.NumberFormat(
        "fr-FR"
    ).format(montant)} FCFA`;

}


// =====================================================
// ÉCHAPPEMENT HTML
// =====================================================

function escapeHtmlAmi(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// INITIALES
// =====================================================

function getInitialesAmi(nom = "") {

    return nom
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            mot =>
                mot[0]?.toUpperCase() || ""
        )
        .join("");

}


// =====================================================
// PREMIER MOIS À PAYER
// =====================================================

function obtenirPremierMoisAPayer() {

    return situation.mois.find(
        mois =>
            mois.statut === "a_payer"
    );

}


// =====================================================
// IDENTIFIANT MOIS
// =====================================================

function creerIdentifiantMois(nom) {

    return String(nom)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^a-zA-Z0-9-]/g,
            ""
        );

}


// =====================================================
// ID PAIEMENT
// =====================================================

function creerDocumentPaiement(
    beneficiaireMatricule,
    moisNom
) {

    const identifiantMois =
        creerIdentifiantMois(
            moisNom
        );

    return `${anneeAcademique}_${beneficiaireMatricule}_${identifiantMois}`;

}


// =====================================================
// CHARGER LES AMIS
// =====================================================

async function chargerAmis() {

    if (
        !matricule ||
        !anneeAcademique
    ) {
        return [];
    }

    const amisQuery = query(

        collection(
            db,
            "friends"
        ),

        where(
            "userCarte",
            "==",
            matricule
        ),

        where(
            "anneeAcademique",
            "==",
            anneeAcademique
        )

    );

    const snapshot =
        await getDocs(
            amisQuery
        );

    return snapshot.docs.map(
        document => {

            const data =
                document.data();

            return {

                id:
                    document.id,

                matricule:
                    String(
                        data.friendCarte || ""
                    ),

                nom:
                    data.friendNom || "",

                avatar:
                    data.friendAvatar || ""

            };

        }
    );

}


// =====================================================
// RECHERCHE AMI
// =====================================================

function rechercherAmiParCarte(
    recherche
) {

    const valeur =
        String(recherche || "")
            .trim()
            .toLowerCase();

    if (!valeur) {
        return [];
    }

    return amis.filter(
        ami =>
            ami.matricule
                .toLowerCase()
                .includes(valeur)
    );

}


// =====================================================
// MODALE AMI
// =====================================================

const amiModal =
    document.getElementById("ami-modal");

const payerAmiBtn =
    document.getElementById("payer-ami-btn");

const amiSelect =
    document.getElementById("ami-select");

const amiSearch =
    document.getElementById("ami-search");

const amiSearchResults =
    document.getElementById("ami-search-results");

const aucunAmiMessage =
    document.getElementById("aucun-ami-message");

const amiSelectionZone =
    document.getElementById("ami-selection-zone");

const continuerAmiBtn =
    document.getElementById("continuer-ami-btn");

const amiSelectedElement =
    document.getElementById("ami-selected");

const closeAmiModal =
    document.getElementById("close-ami-modal");


// =====================================================
// SÉLECTION AMI
// =====================================================

function selectionnerAmi(ami) {

    if (!ami) {
        return;
    }

    amiSelectionne = ami;

    if (amiSelect) {

        const index =
            amis.findIndex(
                element =>
                    element.matricule ===
                    ami.matricule
            );

        if (index !== -1) {

            amiSelect.value =
                String(index);

        }

    }

    if (amiSelectedElement) {

        amiSelectedElement.innerHTML = `

            <div class="ami-selected-avatar">

                ${
                    ami.avatar
                        ? `
                            <img
                                src="${escapeHtmlAmi(ami.avatar)}"
                                alt="Avatar"
                            >
                        `
                        : `
                            <div class="ami-avatar-placeholder">
                                ${escapeHtmlAmi(
                                    getInitialesAmi(
                                        ami.nom
                                    )
                                )}
                            </div>
                        `
                }

            </div>

            <div class="ami-selected-info">

                <strong>
                    ${escapeHtmlAmi(
                        ami.nom ||
                        ami.matricule
                    )}
                </strong>

                <span>
                    Carte :
                    ${escapeHtmlAmi(
                        ami.matricule
                    )}
                </span>

            </div>

        `;

        amiSelectedElement.style.display =
            "flex";

    }

    if (continuerAmiBtn) {

        continuerAmiBtn.disabled =
            false;

    }

}


// =====================================================
// OUVRIR PAIEMENT AMI
// =====================================================

async function ouvrirPaiementAmi() {

    paiementPourAmi = true;
    amiSelectionne = null;
    situationPaiementActive = null;
    moisSelectionnes = [];

    if (amiSelect) {

        amiSelect.innerHTML = `
            <option value="">
                Chargement...
            </option>
        `;

    }

    if (amiSearch) {
        amiSearch.value = "";
    }

    if (amiSearchResults) {
        amiSearchResults.innerHTML = "";
    }

    if (amiSelectedElement) {

        amiSelectedElement.innerHTML = "";

        amiSelectedElement.style.display =
            "none";

    }

    if (aucunAmiMessage) {

        aucunAmiMessage.style.display =
            "none";

    }

    if (amiSelectionZone) {

        amiSelectionZone.style.display =
            "none";

    }

    if (continuerAmiBtn) {

        continuerAmiBtn.disabled =
            true;

    }

    ouvrirModal(
        amiModal
    );

    try {

        amis =
            await chargerAmis();

        if (amis.length === 0) {

            if (aucunAmiMessage) {

                aucunAmiMessage.style.display =
                    "flex";

            }

            return;

        }

        if (amiSelectionZone) {

            amiSelectionZone.style.display =
                "block";

        }

        if (amiSelect) {

            amiSelect.innerHTML = `
                <option value="">
                    Sélectionner un ami
                </option>
            `;

            amis.forEach(
                (
                    ami,
                    index
                ) => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        String(index);

                    option.textContent =
                        ami.nom
                            ? `${ami.nom} — ${ami.matricule}`
                            : ami.matricule;

                    amiSelect.appendChild(
                        option
                    );

                }
            );

        }

    } catch (error) {

        console.error(
            "❌ Chargement amis :",
            error
        );

        fermerModal(
            amiModal
        );

        alert(
            "Impossible de charger votre liste d'amis."
        );

    }

}


// =====================================================
// CHANGEMENT AMI
// =====================================================

amiSelect?.addEventListener(
    "change",
    () => {

        const index =
            amiSelect.value;

        if (index === "") {

            amiSelectionne = null;

            if (continuerAmiBtn) {
                continuerAmiBtn.disabled = true;
            }

            if (amiSelectedElement) {
                amiSelectedElement.style.display =
                    "none";
            }

            return;

        }

        const ami =
            amis[
                Number(index)
            ];

        if (!ami) {
            return;
        }

        selectionnerAmi(
            ami
        );

    }
);


// =====================================================
// RECHERCHE AMI
// =====================================================

amiSearch?.addEventListener(
    "input",
    () => {

        const recherche =
            amiSearch.value.trim();

        if (amiSearchResults) {
            amiSearchResults.innerHTML = "";
        }

        if (!recherche) {
            return;
        }

        const resultats =
            rechercherAmiParCarte(
                recherche
            );

        if (resultats.length === 0) {

            if (amiSearchResults) {

                amiSearchResults.innerHTML = `

                    <div class="ami-no-result">
                        Aucun résultat dans
                        votre liste d'amis.
                    </div>

                `;

            }

            return;

        }

        resultats.forEach(
            ami => {

                const element =
                    document.createElement(
                        "button"
                    );

                element.type = "button";

                element.className =
                    "ami-search-result";

                element.innerHTML = `

                    <strong>
                        ${escapeHtmlAmi(
                            ami.nom ||
                            ami.matricule
                        )}
                    </strong>

                    <span>
                        ${escapeHtmlAmi(
                            ami.matricule
                        )}
                    </span>

                `;

                element.addEventListener(
                    "click",
                    () => {

                        selectionnerAmi(
                            ami
                        );

                        amiSearch.value =
                            ami.matricule;

                        amiSearchResults.innerHTML =
                            "";

                    }
                );

                amiSearchResults.appendChild(
                    element
                );

            }
        );

    }
);


// =====================================================
// PAYER POUR UN AMI
// =====================================================

payerAmiBtn?.addEventListener(
    "click",
    ouvrirPaiementAmi
);


// =====================================================
// CONTINUER APRÈS SÉLECTION AMI
// =====================================================

continuerAmiBtn?.addEventListener(
    "click",
    async () => {

        if (!amiSelectionne) {

            alert(
                "Veuillez sélectionner un ami."
            );

            return;

        }

        paiementPourAmi = true;
        moisSelectionnes = [];
        situationPaiementActive = null;

        fermerModal(
            amiModal
        );

        await ouvrirModalPaiement(
            amiSelectionne
        );

    }
);


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
// OUVRIR MODALE
// =====================================================

function ouvrirModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "show"
    );

    document.body.classList.add(
        "modal-open"
    );

}


// =====================================================
// FERMER MODALE
// =====================================================

function fermerModal(modal) {

    if (!modal) {
        return;
    }

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
// CHARGER SITUATION BÉNÉFICIAIRE
// =====================================================

async function chargerSituationBeneficiaire(
    beneficiaireMatricule
) {

    if (!beneficiaireMatricule) {
        throw new Error(
            "BENEFICIAIRE_MANQUANT"
        );
    }

    if (!anneeAcademique) {
        throw new Error(
            "ANNEE_MANQUANTE"
        );
    }

    if (!amiSelectionne?.id) {
        throw new Error(
            "FRIEND_DOCUMENT_ID_MANQUANT"
        );
    }


    // =================================================
    // 1. VÉRIFICATION DE L'AMI
    // =================================================

    const friendReference =
        doc(
            db,
            "friends",
            amiSelectionne.id
        );


    const friendSnapshot =
        await getDoc(
            friendReference
        );


    if (!friendSnapshot.exists()) {

        throw new Error(
            "RELATION_AMI_INTROUVABLE"
        );

    }


    const friendData =
        friendSnapshot.data();


    if (
        String(
            friendData.userCarte || ""
        ).trim()
        !==
        String(
            matricule || ""
        ).trim()
        ||

        String(
            friendData.friendCarte || ""
        ).trim()
        !==
        String(
            beneficiaireMatricule || ""
        ).trim()
        ||

        String(
            friendData.anneeAcademique || ""
        ).trim()
        !==
        String(
            anneeAcademique || ""
        ).trim()
    ) {

        console.error(
            "❌ Relation ami invalide :",
            {
                friendDocumentId:
                    amiSelectionne.id,

                userCarte:
                    friendData.userCarte,

                friendCarte:
                    friendData.friendCarte,

                anneeAcademique:
                    friendData.anneeAcademique,

                utilisateur:
                    matricule,

                beneficiaire:
                    beneficiaireMatricule
            }
        );

        throw new Error(
            "RELATION_AMI_INVALIDE"
        );

    }


    // =================================================
    // 2. SITUATION DE BASE
    // =================================================

    const nouvelleSituation = {

        anneeAcademique,

        montantMensuel:
            MONTANT_MENSUEL,

        mois:
            situationBase.mois.map(
                mois => ({
                    ...mois
                })
            )

    };


    // =================================================
    // 3. CHARGER LES PAIEMENTS DU BÉNÉFICIAIRE
    // =================================================
    //
    // On ne fait plus un getDoc() pour chaque mois.
    //
    // On récupère uniquement les paiements existants
    // du bénéficiaire pour l'année courante.
    //
    // Les mois sans paiement restent "a_payer".
    //
    // =================================================

    const paiementsQuery =
        query(

            collection(
                db,
                COLLECTION_PAIEMENTS
            ),

            where(
                "matricule",
                "==",
                beneficiaireMatricule
            ),

            where(
                "anneeAcademique",
                "==",
                anneeAcademique
            )

        );


    let snapshot;

    try {

        snapshot =
            await getDocs(
                paiementsQuery
            );

    } catch (error) {

        console.error(
            "❌ Erreur lecture paiements bénéficiaire :",
            {
                beneficiaire:
                    beneficiaireMatricule,

                anneeAcademique,

                error
            }
        );

        throw error;

    }


    // =================================================
    // 4. INDEXER LES PAIEMENTS
    // =================================================

    const paiements =
        snapshot.docs.map(
            document => ({

                id:
                    document.id,

                ...document.data()

            })
        );


    // =================================================
    // 5. APPLIQUER LES PAIEMENTS
    // =================================================

    nouvelleSituation.mois.forEach(
        mois => {

            const paiement =
                paiements.find(
                    paiement =>

                        paiement.mois ===
                        mois.nom

                        &&

                        paiement.statut ===
                        "paye"

                        &&

                        String(
                            paiement.matricule || ""
                        ).trim()
                        ===
                        String(
                            beneficiaireMatricule
                        ).trim()
                );


            if (paiement) {

                mois.statut =
                    "paye";

            }

        }
    );


    // =================================================
    // 6. LOG
    // =================================================

    console.log(
        "✅ Situation bénéficiaire chargée :",
        {
            beneficiaire:
                beneficiaireMatricule,

            anneeAcademique,

            paiementsTrouves:
                paiements.length,

            mois:
                nouvelleSituation.mois
        }
    );


    return nouvelleSituation;

}


// =====================================================
// OUVRIR MODALE PAIEMENT
// =====================================================

async function ouvrirModalPaiement(
    ami = null
) {

    let situationPaiement;

    try {

        if (
            paiementPourAmi &&
            ami
        ) {

            situationPaiement =
                await chargerSituationBeneficiaire(
                    ami.matricule
                );

        } else {

            situationPaiement =
                situation;

        }

        const premierMois =
            situationPaiement.mois.find(
                mois =>
                    mois.statut ===
                    "a_payer"
            );

        if (!premierMois) {

            alert(
                ami
                    ? `La situation de ${ami.nom || ami.matricule} est à jour.`
                    : "Votre situation est à jour."
            );

            return;

        }

        situationPaiementActive =
            situationPaiement;

        const modalMois =
            document.getElementById(
                "modal-mois"
            );

        const montantMois =
            document.getElementById(
                "montant-mois"
            );

        if (modalMois) {

            modalMois.textContent =
                premierMois.nom;

        }

        if (montantMois) {

            montantMois.textContent =
                formaterMontant(
                    situationPaiement.montantMensuel
                );

        }

        const titre =
            paiementModal?.querySelector(
                "h2"
            );

        const description =
            paiementModal?.querySelector(
                ".modal-description"
            );

        if (
            paiementPourAmi &&
            ami
        ) {

            if (titre) {

                titre.textContent =
                    "Régler le loyer d'un ami";

            }

            if (description) {

                description.innerHTML = `

                    Le prochain mois à régulariser pour

                    <strong>
                        ${escapeHtmlAmi(
                            ami.nom ||
                            ami.matricule
                        )}
                    </strong>

                    est

                    <strong>
                        ${escapeHtmlAmi(
                            premierMois.nom
                        )}
                    </strong>.

                    <br>

                    Souhaitez-vous payer uniquement ce mois
                    ou plusieurs mois à l'avance ?

                `;

            }

        } else {

            if (titre) {

                titre.textContent =
                    "Régulariser votre loyer";

            }

            if (description) {

                description.innerHTML = `

                    Votre prochain mois à régulariser est

                    <strong>
                        ${escapeHtmlAmi(
                            premierMois.nom
                        )}
                    </strong>.

                    <br>

                    Souhaitez-vous payer uniquement ce mois
                    ou plusieurs mois à l'avance ?

                `;

            }

        }

        ouvrirModal(
            paiementModal
        );

    } catch (error) {

        console.error(
            "❌ Erreur chargement situation bénéficiaire :",
            error
        );

        fermerModal(
            paiementModal
        );

        alert(
            "Impossible de charger la situation du bénéficiaire."
        );

    }

}


// =====================================================
// PAYER MON LOYER
// =====================================================

document
    .getElementById(
        "payer-btn"
    )
    ?.addEventListener(
        "click",
        () => {

            paiementPourAmi = false;
            amiSelectionne = null;
            situationPaiementActive = null;
            moisSelectionnes = [];

            ouvrirModalPaiement();

        }
    );


// =====================================================
// PAYER UN SEUL MOIS
// =====================================================

document
    .getElementById(
        "payer-seul-btn"
    )
    ?.addEventListener(
        "click",
        () => {

            const premierMois =
                situationPaiementActive?.mois.find(
                    mois =>
                        mois.statut ===
                        "a_payer"
                );

            if (!premierMois) {
                return;
            }

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
    ?.addEventListener(
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
// AFFICHER SÉLECTION MOIS
// =====================================================

function afficherSelectionMois() {

    const container =
        document.getElementById(
            "mois-selection"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    moisSelectionnes = [];

    const situationSource =
        situationPaiementActive ||
        situation;

    const moisAPayer =
        situationSource.mois.filter(
            mois =>
                mois.statut ===
                "a_payer"
        );

    moisAPayer.forEach(
        (
            mois,
            index
        ) => {

            const element =
                document.createElement(
                    "button"
                );

            element.type =
                "button";

            element.className =
                "mois-option";

            element.dataset.index =
                index;

            element.innerHTML = `

                <div>

                    <strong>
                        ${escapeHtmlAmi(
                            mois.nom
                        )}
                    </strong>

                    <span>
                        ${formaterMontant(
                            situationSource.montantMensuel
                        )}
                    </span>

                </div>

                <i
                    class="fa-solid fa-circle-check"
                ></i>

            `;

            element.addEventListener(
                "click",
                () => {

                    if (
                        element.classList.contains(
                            "disabled"
                        )
                    ) {
                        return;
                    }

                    toggleMois(
                        index
                    );

                }
            );

            container.appendChild(
                element
            );

        }
    );

    if (
        moisAPayer.length > 0
    ) {

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

    const situationSource =
        situationPaiementActive ||
        situation;

    const moisAPayer =
        situationSource.mois.filter(
            mois =>
                mois.statut ===
                "a_payer"
        );

    const nouveauMois =
        moisAPayer[index];

    if (!nouveauMois) {
        return;
    }

    const position =
        moisSelectionnes.indexOf(
            nouveauMois
        );

    if (position !== -1) {

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

    } else {

        if (
            index !==
            moisSelectionnes.length
        ) {
            return;
        }

        moisSelectionnes.push(
            nouveauMois
        );

    }

    actualiserSelectionVisuelle();

    mettreAJourTotal();

}


// =====================================================
// ACTUALISER SÉLECTION VISUELLE
// =====================================================

function actualiserSelectionVisuelle() {

    const options =
        document.querySelectorAll(
            "#mois-selection .mois-option"
        );

    options.forEach(
        (
            element,
            index
        ) => {

            const selectionne =
                index <
                moisSelectionnes.length;

            const prochainDisponible =
                index ===
                moisSelectionnes.length;

            element.classList.toggle(
                "selected",
                selectionne
            );

            element.classList.toggle(
                "disabled",
                !selectionne &&
                !prochainDisponible
            );

        }
    );

}


// =====================================================
// CALCUL TOTAL
// =====================================================

function calculerTotal(mois) {

    const situationSource =
        situationPaiementActive ||
        situation;

    return (
        mois.length *
        situationSource.montantMensuel
    );

}


// =====================================================
// ACTUALISER TOTAL
// =====================================================

function mettreAJourTotal() {

    const total =
        calculerTotal(
            moisSelectionnes
        );

    const totalElement =
        document.getElementById(
            "total-selection"
        );

    if (totalElement) {

        totalElement.textContent =
            formaterMontant(
                total
            );

    }

}


// =====================================================
// CONTINUER PAIEMENT
// =====================================================

document
    .getElementById(
        "continuer-paiement-btn"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                moisSelectionnes.length ===
                0
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

function afficherRecap(mois) {

    const recapList =
        document.getElementById(
            "recap-list"
        );

    if (!recapList) {
        return;
    }

    recapList.innerHTML = "";

    if (
        paiementPourAmi &&
        amiSelectionne
    ) {

        const beneficiaire =
            document.createElement(
                "div"
            );

        beneficiaire.className =
            "recap-beneficiaire";

        beneficiaire.innerHTML = `

            <span>
                Bénéficiaire
            </span>

            <strong>
                ${escapeHtmlAmi(
                    amiSelectionne.nom ||
                    amiSelectionne.matricule
                )}
            </strong>

            <small>
                Carte :
                ${escapeHtmlAmi(
                    amiSelectionne.matricule
                )}
            </small>

        `;

        recapList.appendChild(
            beneficiaire
        );

    }

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
                    ${escapeHtmlAmi(
                        element.nom
                    )}
                </span>

                <strong>
                    ${formaterMontant(
                        (
                            situationPaiementActive ||
                            situation
                        ).montantMensuel
                    )}
                </strong>

            `;

            recapList.appendChild(
                row
            );

        }
    );

    const recapTotal =
        document.getElementById(
            "recap-total"
        );

    if (recapTotal) {

        recapTotal.textContent =
            formaterMontant(
                calculerTotal(
                    mois
                )
            );

    }

    const recapModalTitle =
        recapModal?.querySelector(
            "h2"
        );

    const recapDescription =
        recapModal?.querySelector(
            ".modal-description"
        );

    if (
        paiementPourAmi &&
        amiSelectionne
    ) {

        if (recapModalTitle) {

            recapModalTitle.textContent =
                "Récapitulatif du paiement";

        }

        if (recapDescription) {

            recapDescription.innerHTML = `

                Vous allez régler le loyer de

                <strong>
                    ${escapeHtmlAmi(
                        amiSelectionne.nom ||
                        amiSelectionne.matricule
                    )}
                </strong>.

                <br>

                Vérifiez les informations avant de confirmer.

            `;

        }

    } else {

        if (recapModalTitle) {

            recapModalTitle.textContent =
                "Récapitulatif";

        }

        if (recapDescription) {

            recapDescription.textContent =
                "Vérifiez votre sélection avant de continuer.";

        }

    }

}


// =====================================================
// ENREGISTRER PAIEMENT
// =====================================================

async function enregistrerPaiement(mois) {

    if (
        !matricule ||
        !anneeAcademique
    ) {

        throw new Error(
            "UTILISATEUR_NON_INITIALISE"
        );

    }

    const beneficiaireMatricule =
        paiementPourAmi &&
        amiSelectionne
            ? amiSelectionne.matricule
            : matricule;

    if (!beneficiaireMatricule) {

        throw new Error(
            "BENEFICIAIRE_MANQUANT"
        );

    }

    if (
        paiementPourAmi &&
        !amiSelectionne
    ) {

        throw new Error(
            "AMI_MANQUANT"
        );

    }

    if (
        paiementPourAmi &&
        !amiSelectionne.id
    ) {

        throw new Error(
            "FRIEND_DOCUMENT_ID_MANQUANT"
        );

    }

    const documentId =
        creerDocumentPaiement(
            beneficiaireMatricule,
            mois.nom
        );

    const paiementReference =
        doc(
            db,
            COLLECTION_PAIEMENTS,
            documentId
        );

    const beneficiaireNom =
        paiementPourAmi &&
        amiSelectionne
            ? (
                amiSelectionne.nom ||
                ""
            )
            : (
                utilisateur?.profile?.prenom
                    ? `${utilisateur.profile.prenom} ${utilisateur.profile.nom || ""}`.trim()
                    : ""
            );

    const payeurNom =
        utilisateur?.profile?.prenom
            ? `${utilisateur.profile.prenom} ${utilisateur.profile.nom || ""}`.trim()
            : "";

    await setDoc(
        paiementReference,
        {

            matricule:
                beneficiaireMatricule,

            beneficiaireMatricule:
                beneficiaireMatricule,

            payeurMatricule:
                matricule,

            paiementPourAmi:
                paiementPourAmi,

            friendDocumentId:
                paiementPourAmi
                    ? amiSelectionne.id
                    : null,

            anneeAcademique,

            mois:
                mois.nom,

            montant:
                situationPaiementActive?.montantMensuel ||
                situation.montantMensuel,

            statut:
                "paye",

            type:
                "loyer",

            origine:
                "campus-one",

            beneficiaireNom,

            payeurNom,

            datePaiement:
                serverTimestamp()

        }
    );

    console.log(
        "✅ Paiement enregistré :",
        {
            mois:
                mois.nom,

            beneficiaire:
                beneficiaireMatricule,

            payeur:
                matricule,

            paiementPourAmi:
                paiementPourAmi,

            friendDocumentId:
                paiementPourAmi
                    ? amiSelectionne.id
                    : null
        }
    );

}


// =====================================================
// NOTIFICATIONS PAIEMENT POUR UN AMI
// =====================================================
//
// Envoie une notification :
// 1. au bénéficiaire ("X a payé ton loyer")
// 2. au payeur, en confirmation ("Tu as payé pour X")
//
// N'est appelée QUE dans le cas "payer pour un ami".
//
// =====================================================

async function envoyerNotificationsPaiementAmi({
    beneficiaireMatricule,
    beneficiaireNom,
    moisPayes,
    montantTotal
}) {

    if (
        !matricule ||
        !anneeAcademique ||
        !beneficiaireMatricule
    ) {
        return;
    }

    const payeurNomAffiche =
        utilisateur?.profile?.prenom
            ? `${utilisateur.profile.prenom} ${utilisateur.profile.nom || ""}`.trim()
            : matricule;

    const beneficiaireNomAffiche =
        beneficiaireNom ||
        beneficiaireMatricule;

    const listeMois =
        moisPayes.join(", ");

    const montantFormate =
        formaterMontant(
            montantTotal
        );

    try {

        // -------------------------------------------------
        // NOTIFICATION POUR LE BÉNÉFICIAIRE
        // -------------------------------------------------

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                to:
                    beneficiaireMatricule,

                type:
                    "loyer",

                title:
                    "Loyer payé pour vous",

                text:
                    `${payeurNomAffiche} a payé votre loyer (${listeMois}) — ${montantFormate}.`,

                from:
                    matricule,

                fromNom:
                    payeurNomAffiche,

                fromAvatar:
                    "",

                date:
                    Date.now(),

                seen:
                    false,

                anneeAcademique
            }
        );

        // -------------------------------------------------
        // NOTIFICATION DE CONFIRMATION POUR LE PAYEUR
        // -------------------------------------------------

        await addDoc(
            collection(
                db,
                "notifications"
            ),
            {
                to:
                    matricule,

                type:
                    "loyer",

                title:
                    "Paiement effectué",

                text:
                    `Vous avez payé le loyer de ${beneficiaireNomAffiche} (${listeMois}) — ${montantFormate}.`,

                from:
                    matricule,

                fromNom:
                    payeurNomAffiche,

                fromAvatar:
                    "",

                date:
                    Date.now(),

                seen:
                    false,

                anneeAcademique
            }
        );

        console.log(
            "✅ Notifications de paiement envoyées."
        );

    } catch (error) {

        console.error(
            "❌ Erreur envoi notifications paiement :",
            error
        );

    }

}


// =====================================================
// CONFIRMER PAIEMENT
// =====================================================

document
    .getElementById(
        "confirmer-paiement-btn"
    )
    ?.addEventListener(
        "click",
        async () => {

            if (
                moisSelectionnes.length ===
                0
            ) {
                return;
            }

            if (
                paiementPourAmi &&
                !amiSelectionne
            ) {

                alert(
                    "Aucun bénéficiaire sélectionné."
                );

                return;

            }

            const bouton =
                document.getElementById(
                    "confirmer-paiement-btn"
                );

            const selection =
                [
                    ...moisSelectionnes
                ];

            bouton.disabled =
                true;

            bouton.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Enregistrement...

            `;

            try {

                // Vérifier les mois
                for (
                    const mois
                    of selection
                ) {

                    if (
                        mois.statut !==
                        "a_payer"
                    ) {

                        throw new Error(
                            `Le mois ${mois.nom} n'est plus disponible.`
                        );

                    }

                }

                const beneficiaireMatricule =
                    paiementPourAmi &&
                    amiSelectionne
                        ? amiSelectionne.matricule
                        : matricule;

                // Vérifier les paiements existants
                for (
                    const mois
                    of selection
                ) {

                    const paiementReference =
                        doc(
                            db,
                            COLLECTION_PAIEMENTS,
                            creerDocumentPaiement(
                                beneficiaireMatricule,
                                mois.nom
                            )
                        );

                    const paiementExistant =
                        await getDoc(
                            paiementReference
                        );

                    if (
                        paiementExistant.exists() &&
                        paiementExistant.data()?.statut ===
                        "paye" &&
                        String(
                            paiementExistant.data()?.matricule || ""
                        ) ===
                        String(
                            beneficiaireMatricule
                        )
                    ) {

                        throw new Error(
                            `Le mois ${mois.nom} est déjà payé.`
                        );

                    }

                }

                // Enregistrer
                for (
                    const mois
                    of selection
                ) {

                    await enregistrerPaiement(
                        mois
                    );

                }

                // Notifications (uniquement paiement pour un ami)
                if (
                    paiementPourAmi &&
                    amiSelectionne
                ) {

                    await envoyerNotificationsPaiementAmi(
                        {
                            beneficiaireMatricule:
                                amiSelectionne.matricule,

                            beneficiaireNom:
                                amiSelectionne.nom,

                            moisPayes:
                                selection.map(
                                    mois => mois.nom
                                ),

                            montantTotal:
                                calculerTotal(
                                    selection
                                )
                        }
                    );

                }

                // Paiement personnel
                if (
                    !paiementPourAmi
                ) {

                    selection.forEach(
                        moisPaye => {

                            const mois =
                                situation.mois.find(
                                    element =>
                                        element.nom ===
                                        moisPaye.nom
                                );

                            if (mois) {

                                mois.statut =
                                    "paye";

                            }

                        }
                    );

                }

                // Interface
                if (
                    !paiementPourAmi
                ) {

                    afficherSituation();
                    afficherPaiements();

                }

                fermerModal(
                    recapModal
                );

                // Message
                if (
                    paiementPourAmi &&
                    amiSelectionne
                ) {

                    alert(

                        selection.length === 1

                            ? `Paiement de ${selection[0].nom} enregistré pour ${amiSelectionne.nom || amiSelectionne.matricule}.`

                            : `${selection.length} mois ont été enregistrés comme payés pour ${amiSelectionne.nom || amiSelectionne.matricule}.`

                    );

                } else {

                    alert(

                        selection.length === 1

                            ? `Paiement de ${selection[0].nom} enregistré.`

                            : `${selection.length} mois ont été enregistrés comme payés.`

                    );

                }

                // Reset
                moisSelectionnes = [];

                paiementPourAmi = false;

                amiSelectionne = null;

                situationPaiementActive = null;

            } catch (error) {

                console.error(
                    "❌ Erreur enregistrement paiement :",
                    error
                );

                alert(
                    error?.message?.startsWith(
                        "Le mois"
                    )
                        ? error.message
                        : "Impossible d'enregistrer le paiement. Veuillez réessayer."
                );

            } finally {

                bouton.disabled =
                    false;

                bouton.innerHTML = `

                    <i
                        class="fa-solid fa-lock"
                    ></i>

                    Confirmer et payer

                `;

            }

        }
    );


// =====================================================
// CHARGER LES PAIEMENTS FIRESTORE
// =====================================================

async function chargerPaiementsFirestore() {

    if (!paiementsList) {
        return;
    }

    paiementsList.innerHTML = `

        <div class="paiements-loading">

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <span>
                Chargement...
            </span>

        </div>

    `;

    if (
        !matricule ||
        !anneeAcademique
    ) {
        return;
    }

    console.log(
        "💰 Chargement des paiements du loyer..."
    );

    const paiementsQuery =
        query(

            collection(
                db,
                COLLECTION_PAIEMENTS
            ),

            where(
                "matricule",
                "==",
                matricule
            ),

            where(
                "anneeAcademique",
                "==",
                anneeAcademique
            )

        );

    const snapshot =
        await getDocs(
            paiementsQuery
        );

    const paiements =
        snapshot.docs.map(
            document => ({
                id:
                    document.id,
                ...document.data()
            })
        );

    const nouvelleSituation = {

        anneeAcademique,

        montantMensuel:
            MONTANT_MENSUEL,

        mois:
            situationBase.mois.map(
                mois => ({
                    ...mois
                })
            )

    };

    nouvelleSituation.mois.forEach(
        mois => {

            const paiement =
                paiements.find(
                    paiement =>

                        paiement.mois ===
                        mois.nom

                        &&

                        paiement.statut ===
                        "paye"

                        &&

                        paiement.matricule ===
                        matricule

                        &&

                        (
                            !paiement.beneficiaireMatricule
                            ||
                            paiement.beneficiaireMatricule ===
                            matricule
                        )

                        &&

                        paiement.anneeAcademique ===
                        anneeAcademique
                );

            if (paiement) {

                mois.statut =
                    "paye";

            }

        }
    );

    situation =
        nouvelleSituation;

    console.log(
        "💰 Situation loyer chargée :",
        situation
    );

}


// =====================================================
// AFFICHER SITUATION
// =====================================================

function afficherSituation() {

    const premierMois =
        obtenirPremierMoisAPayer();

    if (anneeElement) {

        anneeElement.textContent =
            situation.anneeAcademique;

    }

    if (premierMois) {

        if (montantTotalElement) {

            montantTotalElement.textContent =
                formaterMontant(
                    situation.montantMensuel
                );

        }

        if (moisAPayerElement) {

            moisAPayerElement.textContent =
                premierMois.nom;

        }

    } else {

        if (montantTotalElement) {

            montantTotalElement.textContent =
                "0 FCFA";

        }

        if (moisAPayerElement) {

            moisAPayerElement.textContent =
                "Aucun mois en attente";

        }

    }

}


// =====================================================
// AFFICHER HISTORIQUE
// =====================================================

function afficherPaiements() {

    if (!paiementsList) {
        return;
    }

    paiementsList.innerHTML = "";

    situation.mois.forEach(
        mois => {

            const estPaye =
                mois.statut ===
                "paye";

            const estCodification =
                mois.statut ===
                "codification";

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "paiement-row";

            element.innerHTML = `

                <div
                    class="paiement-mois"
                >

                    <div
                        class="
                            paiement-status
                            ${
                                estPaye
                                    ? "status-paye"
                                    : estCodification
                                        ? "status-codification"
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
                                        : estCodification
                                            ? "fa-pen-to-square"
                                            : "fa-clock"
                                }
                            "
                        ></i>

                    </div>

                    <span>
                        ${escapeHtmlAmi(
                            mois.nom
                        )}
                    </span>

                </div>

                <div
                    class="
                        paiement-etat
                        ${
                            estPaye
                                ? "etat-paye"
                                : estCodification
                                    ? "etat-codification"
                                    : "etat-attente"
                        }
                    "
                >

                    ${
                        estPaye
                            ? "Payé"
                            : estCodification
                                ? "Codification"
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
// RÈGLEMENT INTÉRIEUR
// =====================================================

document
    .getElementById(
        "reglement-btn"
    )
    ?.addEventListener(
        "click",
        () => {

            alert(
                "L'article du règlement intérieur sera disponible prochainement."
            );

        }
    );


// =====================================================
// FERMETURE MODALE PAIEMENT
// =====================================================

document
    .getElementById(
        "close-modal"
    )
    ?.addEventListener(
        "click",
        () => {

            fermerModal(
                paiementModal
            );

        }
    );


// =====================================================
// FERMETURE MODALE AMI
// =====================================================

closeAmiModal?.addEventListener(
    "click",
    () => {

        fermerModal(
            amiModal
        );

        amiSelectionne =
            null;

        paiementPourAmi =
            false;

        situationPaiementActive =
            null;

        moisSelectionnes =
            [];

    }
);


// =====================================================
// FERMETURE MODALE PLUSIEURS
// =====================================================

document
    .getElementById(
        "close-plusieurs-modal"
    )
    ?.addEventListener(
        "click",
        () => {

            fermerModal(
                plusieursModal
            );

        }
    );


// =====================================================
// FERMETURE MODALE RÉCAP
// =====================================================

document
    .getElementById(
        "close-recap-modal"
    )
    ?.addEventListener(
        "click",
        () => {

            fermerModal(
                recapModal
            );

        }
    );


// =====================================================
// CLIC SUR LE FOND
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
                        event.target ===
                        modal
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
    ?.addEventListener(
        "click",
        () => {

            window.history.back();

        }

    );


// =====================================================
// INITIALISATION
// =====================================================

async function initialiser(
    firebaseUser
) {

    try {

        if (!firebaseUser) {

            throw new Error(
                "UTILISATEUR_NON_CONNECTE"
            );

        }

        utilisateur =
            await getCurrentUser(
                firebaseUser.uid
            );

        if (!utilisateur) {

            throw new Error(
                "PROFIL_CAMPUS_ONE_INTROUVABLE"
            );

        }

        matricule =
            utilisateur.profile?.matricule ||
            utilisateur.matricule ||
            null;

        anneeAcademique =
            utilisateur.anneeAcademique ||
            situationBase.anneeAcademique;

        if (!matricule) {

            throw new Error(
                "MATRICULE_MANQUANT"
            );

        }

        if (!anneeAcademique) {

            throw new Error(
                "ANNEE_MANQUANTE"
            );

        }

        console.log(
            "👤 Matricule :",
            matricule
        );

        console.log(
            "📅 Année académique :",
            anneeAcademique
        );

        await chargerPaiementsFirestore();

        afficherSituation();

        afficherPaiements();

    } catch (error) {

        console.error(
            "❌ Erreur initialisation loyer :",
            error
        );

    }

}


// =====================================================
// RESTAURATION SESSION FIREBASE
// =====================================================

onAuthStateChanged(
    auth,
    async firebaseUser => {

        if (!firebaseUser) {

            console.error(
                "❌ Aucun utilisateur Firebase connecté."
            );

            return;

        }

        console.log(
            "🔥 Utilisateur Firebase restauré :",
            firebaseUser.uid
        );

        await initialiser(
            firebaseUser
        );

    }
);