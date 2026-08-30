import { requireRole } from "../../../../auth/authGuard.js";

import { loadSidebar } from "../../components/sidebar.js";

import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from "firebase/firestore";

import { db } from "../../../../firebase/firebase.js";

import recouvrementsSeed
    from "../../../../../scripts/data/seed/recouvrements.js";


// =====================================================
// CONFIGURATION
// =====================================================

const COLLECTION_RECOUVREMENTS =
    "recouvrements";

const COLLECTION_PAIEMENTS =
    "paiementsLoyers";

const COLLECTION_HEBERGEMENTS =
    "hebergements";

const MONTANT_MENSUEL_DEFAUT =
    3000;


// =====================================================
// VARIABLES
// =====================================================

let recouvrementsSource = [];

let hebergements = [];

let paiementsLoyers = [];

let unsubscribePaiements = null;

let profilAgent = null;

let anneeAcademiqueCourante = "";

let siteCourant = "";

let pavillonCourant = "";

let lectureSeuleCourante = false;


// =====================================================
// FILTRES
// =====================================================

let filtrePeriodeCourant =
    "toutes";

let filtreEtatCourant =
    "tous";


// =====================================================
// ÉLÉMENTS DOM
// =====================================================

const pavillonConcerneElement =
    document.getElementById(
        "pavillon-concerne"
    );

const anneeAcademiqueElement =
    document.getElementById(
        "annee-academique"
    );

const infoAnneeElement =
    document.getElementById(
        "info-annee"
    );

const infoSiteElement =
    document.getElementById(
        "info-site"
    );

const infoPavillonElement =
    document.getElementById(
        "info-pavillon"
    );

const infoPeriodeElement =
    document.getElementById(
        "info-periode"
    );

const infoDateElement =
    document.getElementById(
        "info-date"
    );

const statutSituationElement =
    document.getElementById(
        "statut-situation"
    );


// =====================================================
// FILTRES DOM
// =====================================================

const filtrePeriodeElement =
    document.getElementById(
        "filtre-periode"
    );

const filtreEtatElement =
    document.getElementById(
        "filtre-etat"
    );

const reinitialiserFiltresElement =
    document.getElementById(
        "reinitialiser-filtres"
    );


// =====================================================
// SYNTHÈSE FINANCIÈRE
// =====================================================

const montantTheoriqueElement =
    document.getElementById(
        "montant-theorique"
    );

const montantEncaisseElement =
    document.getElementById(
        "montant-encaisse"
    );

const resteARecouvrerElement =
    document.getElementById(
        "reste-a-recouvrer"
    );

const tauxRecouvrementElement =
    document.getElementById(
        "taux-recouvrement"
    );


// =====================================================
// EFFECTIFS
// =====================================================

const effectifConcerneElement =
    document.getElementById(
        "effectif-concerne"
    );

const effectifRegulierElement =
    document.getElementById(
        "effectif-regulier"
    );

const effectifDetteElement =
    document.getElementById(
        "effectif-dette"
    );

const tauxRegularisationElement =
    document.getElementById(
        "taux-regularisation"
    );


// =====================================================
// TABLEAU MENSUEL
// =====================================================

const situationMensuelleBody =
    document.getElementById(
        "situation-mensuelle-body"
    );

const totalEffectifMensuelElement =
    document.getElementById(
        "total-effectif-mensuel"
    );

const totalTheoriqueMensuelElement =
    document.getElementById(
        "total-theorique-mensuel"
    );

const totalEncaisseMensuelElement =
    document.getElementById(
        "total-encaisse-mensuel"
    );

const totalResteMensuelElement =
    document.getElementById(
        "total-reste-mensuel"
    );

const totalTauxMensuelElement =
    document.getElementById(
        "total-taux-mensuel"
    );


// =====================================================
// SYNTHÈSE RECOUVREMENT
// =====================================================

const periodesRegulieresElement =
    document.getElementById(
        "periodes-regulieres"
    );

const periodesAvecResteElement =
    document.getElementById(
        "periodes-avec-reste"
    );

const meilleurTauxElement =
    document.getElementById(
        "meilleur-taux"
    );

const dernierePeriodeElement =
    document.getElementById(
        "derniere-periode"
    );


// =====================================================
// OBSERVATIONS / VISA
// =====================================================

const observationsContainer =
    document.getElementById(
        "observations-container"
    );

const etabliParElement =
    document.getElementById(
        "etabli-par"
    );

const dateEtablissementElement =
    document.getElementById(
        "date-etablissement"
    );

const etatDocumentElement =
    document.getElementById(
        "etat-document"
    );


// =====================================================
// BOUTONS
// =====================================================

const boutonRetour =
    document.getElementById(
        "retour-recouvrement"
    );

const boutonImprimer =
    document.getElementById(
        "imprimer-situation"
    );


// =====================================================
// OUTILS
// =====================================================

function extrairePavillon(
    affectation
) {

    const texte =
        String(
            affectation ||
            ""
        ).trim();


    const match =
        texte.match(
            /Pavillon\s+(.+)/i
        );


    return match
        ? match[1].trim()
        : texte;

}


// =====================================================
// FORMAT MONTANT
// =====================================================

function formaterMontant(
    montant
) {

    return `${new Intl.NumberFormat(
        "fr-FR"
    ).format(
        Math.round(
            Number(montant) || 0
        )
    )} FCFA`;

}


// =====================================================
// FORMAT TAUX
// =====================================================

function formaterTaux(
    taux
) {

    const valeur =
        Number(
            taux
        ) || 0;


    return `${valeur.toFixed(1)} %`;

}


// =====================================================
// FORMAT DATE
// =====================================================

function formaterDate(
    date = new Date()
) {

    return new Intl.DateTimeFormat(
        "fr-FR",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    ).format(
        date
    );

}


// =====================================================
// ANNÉE ACADÉMIQUE
// =====================================================

function analyserAnneeAcademique(
    anneeAcademique
) {

    const correspondance =
        String(
            anneeAcademique ||
            ""
        ).match(
            /^(\d{4})-(\d{4})$/
        );


    if (
        !correspondance
    ) {

        return null;

    }


    return {

        debut:
            Number(
                correspondance[1]
            ),

        fin:
            Number(
                correspondance[2]
            )

    };

}


// =====================================================
// MOIS DE L'ANNÉE ACADÉMIQUE
// =====================================================

function obtenirMoisAcademiques(
    anneeAcademique
) {

    const annee =
        analyserAnneeAcademique(
            anneeAcademique
        );


    if (!annee) {

        return [];

    }


    return [

        {
            cle:
                "novembre",

            libelle:
                `Novembre ${annee.debut}`,

            type:
                "codification",

            index:
                0
        },

        {
            cle:
                "decembre",

            libelle:
                `Décembre ${annee.debut}`,

            type:
                "codification",

            index:
                1
        },

        {
            cle:
                "janvier",

            libelle:
                `Janvier ${annee.fin}`,

            type:
                "loyer",

            index:
                2
        },

        {
            cle:
                "fevrier",

            libelle:
                `Février ${annee.fin}`,

            type:
                "loyer",

            index:
                3
        },

        {
            cle:
                "mars",

            libelle:
                `Mars ${annee.fin}`,

            type:
                "loyer",

            index:
                4
        },

        {
            cle:
                "avril",

            libelle:
                `Avril ${annee.fin}`,

            type:
                "loyer",

            index:
                5
        },

        {
            cle:
                "mai",

            libelle:
                `Mai ${annee.fin}`,

            type:
                "loyer",

            index:
                6
        },

        {
            cle:
                "juin",

            libelle:
                `Juin ${annee.fin}`,

            type:
                "loyer",

            index:
                7
        },

        {
            cle:
                "juillet",

            libelle:
                `Juillet ${annee.fin}`,

            type:
                "loyer",

            index:
                8
        }

    ];

}


// =====================================================
// CHARGER LES RECOUVREMENTS
// =====================================================

async function chargerRecouvrements(
    anneeAcademique
) {

    try {

        const snapshot =
            await getDocs(
                query(
                    collection(
                        db,
                        COLLECTION_RECOUVREMENTS
                    ),
                    where(
                        "anneeAcademique",
                        "==",
                        anneeAcademique
                    )
                )
            );


        if (
            !snapshot.empty
        ) {

            return snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );

        }

    } catch (
        error
    ) {

        console.warn(
            "⚠️ Recouvrements Firestore indisponibles. Utilisation du seed.",
            error
        );

    }


    return recouvrementsSeed.filter(
        recouvrement =>
            recouvrement.anneeAcademique ===
            anneeAcademique
    );

}


// =====================================================
// CHARGER LES HÉBERGEMENTS
// =====================================================

async function chargerHebergements(
    site,
    pavillon,
    anneeAcademique
) {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_HEBERGEMENTS
                ),
                where(
                    "site",
                    "==",
                    site
                )
            )
        );


    const resultat = [];


    snapshot.docs.forEach(
        documentSnapshot => {

            const hebergement =
                documentSnapshot.data();


            // =============================================
            // PAVILLON
            // =============================================

            if (
                String(
                    hebergement.pavillon
                ) !==
                String(
                    pavillon
                )
            ) {

                return;

            }


            // =============================================
            // ANNÉE ACADÉMIQUE
            // =============================================

            if (
                hebergement.anneeAcademique !==
                anneeAcademique
            ) {

                return;

            }


            // =============================================
            // SUPPLÉANT
            // =============================================

            if (
                hebergement.typeOccupation ===
                "suppleant"
            ) {

                return;

            }


            // =============================================
            // MATRICULE
            // =============================================

            if (
                !hebergement.matricule
            ) {

                return;

            }


            // =============================================
            // OCCUPATION
            // =============================================

            if (
                !lectureSeuleCourante &&
                hebergement.statutOccupation !==
                "actif"
            ) {

                return;

            }


            resultat.push({

                id:
                    documentSnapshot.id,

                ...hebergement

            });

        }
    );


    return resultat;

}


// =====================================================
// CHARGER LES PAIEMENTS
// =====================================================

async function chargerPaiementsLoyers(
    anneeAcademique
) {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    COLLECTION_PAIEMENTS
                ),
                where(
                    "anneeAcademique",
                    "==",
                    anneeAcademique
                ),
                where(
                    "statut",
                    "==",
                    "paye"
                )
            )
        );


    return snapshot.docs.map(
        documentSnapshot => ({

            id:
                documentSnapshot.id,

            ...documentSnapshot.data()

        })
    );

}


// =====================================================
// RÉCUPÉRER LE RECOUVREMENT D'UN ÉTUDIANT
// =====================================================

function obtenirRecouvrementEtudiant(
    matricule
) {

    return recouvrementsSource.find(
        recouvrement =>
            String(
                recouvrement.matricule
            ) ===
            String(
                matricule
            )
    ) || null;

}


// =====================================================
// MONTANT MENSUEL D'UN ÉTUDIANT
// =====================================================

function obtenirMontantMensuel(
    matricule
) {

    const recouvrement =
        obtenirRecouvrementEtudiant(
            matricule
        );


    const montant =
        Number(
            recouvrement
                ?.montantMensuel
        );


    if (
        Number.isFinite(
            montant
        ) &&
        montant > 0
    ) {

        return montant;

    }


    return MONTANT_MENSUEL_DEFAUT;

}


// =====================================================
// PAIEMENTS D'UN ÉTUDIANT
// =====================================================

function obtenirPaiementsEtudiant(
    matricule
) {

    return paiementsLoyers.filter(
        paiement =>

            String(
                paiement.matricule
            ) ===
            String(
                matricule
            ) &&

            paiement.statut ===
            "paye"
    );

}


// =====================================================
// PAIEMENT D'UN MOIS
// =====================================================

function obtenirPaiementPourMois(
    matricule,
    libelleMois
) {

    return obtenirPaiementsEtudiant(
        matricule
    ).filter(
        paiement =>
            String(
                paiement.mois ||
                ""
            ).trim() ===
            String(
                libelleMois ||
                ""
            ).trim()
    );

}


// =====================================================
// MONTANT PAYÉ POUR UN MOIS
// =====================================================

function obtenirMontantPayePourMois(
    matricule,
    mois
) {

    const paiements =
        obtenirPaiementPourMois(
            matricule,
            mois.libelle
        );


    return paiements.reduce(
        (
            total,
            paiement
        ) => {

            return total +
                (
                    Number(
                        paiement.montant
                    ) || 0
                );

        },
        0
    );

}


// =====================================================
// SAVOIR SI LE MOIS EST DÛ POUR L'ÉTUDIANT
// =====================================================

function moisEstDuPourEtudiant(
    matricule,
    mois
) {

    if (
        mois.type ===
        "codification"
    ) {

        return false;

    }


    const recouvrement =
        obtenirRecouvrementEtudiant(
            matricule
        );


    const situationMois =
        recouvrement
            ?.mois
            ?.[mois.cle];


    if (
        situationMois
    ) {

        return (

            situationMois.statut ===
                "a_payer" ||

            situationMois.statut ===
                "paye"

        );

    }


    return true;

}


// =====================================================
// CONSTRUIRE UNE SITUATION INDIVIDUELLE
// =====================================================
//
// IMPORTANT :
// Cette fonction peut maintenant recevoir un mois précis.
//
// - mois = null  → situation cumulée janvier → juillet
// - mois = janvier → situation de janvier uniquement
//
// =====================================================

function construireSituationIndividuelle(
    hebergement,
    moisSelectionne = null
) {

    const matricule =
        String(
            hebergement.matricule ||
            ""
        );


    const moisAcademiques =
        obtenirMoisAcademiques(
            anneeAcademiqueCourante
        );


    let moisAAnalyser =
        moisAcademiques.filter(
            mois =>
                mois.type ===
                "loyer"
        );


    // =================================================
    // SI UNE PÉRIODE EST SÉLECTIONNÉE
    // =================================================

    if (
        moisSelectionne &&
        moisSelectionne !==
        "toutes"
    ) {

        moisAAnalyser =
            moisAAnalyser.filter(
                mois =>
                    mois.cle ===
                    moisSelectionne
            );

    }


    let montantTheorique =
        0;


    let montantPaye =
        0;


    let nombreMoisDus =
        0;


    let nombreMoisRegles =
        0;


    moisAAnalyser.forEach(
        mois => {

            if (
                !moisEstDuPourEtudiant(
                    matricule,
                    mois
                )
            ) {

                return;

            }


            nombreMoisDus++;


            const montantMensuel =
                obtenirMontantMensuel(
                    matricule
                );


            montantTheorique +=
                montantMensuel;


            const montantMois =
                obtenirMontantPayePourMois(
                    matricule,
                    mois
                );


            montantPaye +=
                montantMois;


            if (
                montantMois >=
                montantMensuel
            ) {

                nombreMoisRegles++;

            }

        }
    );


    const reste =
        Math.max(
            0,
            montantTheorique -
            montantPaye
        );


    return {

        matricule,

        montantTheorique,

        montantPaye,

        reste,

        nombreMoisDus,

        nombreMoisRegles,

        regle:
            reste === 0

    };

}


// =====================================================
// CONSTRUIRE LA SITUATION MENSUELLE
// =====================================================

function construireSituationMensuelle() {

    const moisAcademiques =
        obtenirMoisAcademiques(
            anneeAcademiqueCourante
        );


    return moisAcademiques.map(
        mois => {

            // =============================================
            // CODIFICATION
            // =============================================

            if (
                mois.type ===
                "codification"
            ) {

                return {

                    ...mois,

                    effectif:
                        hebergements.length,

                    montantTheorique:
                        0,

                    montantEncaisse:
                        0,

                    reste:
                        0,

                    taux:
                        0,

                    codification:
                        true

                };

            }


            // =============================================
            // LOYER
            // =============================================

            let effectif =
                0;


            let montantTheorique =
                0;


            let montantEncaisse =
                0;


            hebergements.forEach(
                hebergement => {

                    const matricule =
                        String(
                            hebergement.matricule ||
                            ""
                        );


                    if (
                        !moisEstDuPourEtudiant(
                            matricule,
                            mois
                        )
                    ) {

                        return;

                    }


                    effectif++;


                    montantTheorique +=
                        obtenirMontantMensuel(
                            matricule
                        );


                    montantEncaisse +=
                        obtenirMontantPayePourMois(
                            matricule,
                            mois
                        );

                }
            );


            const reste =
                Math.max(
                    0,
                    montantTheorique -
                    montantEncaisse
                );


            const taux =
                montantTheorique > 0

                    ? (
                        montantEncaisse /
                        montantTheorique
                    ) * 100

                    : 0;


            return {

                ...mois,

                effectif,

                montantTheorique,

                montantEncaisse,

                reste,

                taux,

                codification:
                    false

            };

        }
    );

}


// =====================================================
// FILTRER UNE SITUATION PAR ÉTAT
// =====================================================

function situationCorrespondEtat(
    situation
) {

    if (
        filtreEtatCourant ===
        "tous"
    ) {

        return true;

    }


    if (
        filtreEtatCourant ===
        "regularisee"
    ) {

        return (
            situation.montantTheorique >
                0 &&
            situation.reste ===
                0
        );

    }


    if (
        filtreEtatCourant ===
        "reste"
    ) {

        return (
            situation.montantTheorique >
                0 &&
            situation.reste >
                0
        );

    }


    return true;

}


// =====================================================
// OBTENIR LES HÉBERGEMENTS CONCERNÉS PAR L'ÉTAT
// =====================================================
//
// Pour les cartes et les effectifs, le filtre d'état
// agit également sur la population concernée.
//
// =====================================================

function obtenirSituationsIndividuellesFiltrees() {

    const situations =
        hebergements.map(
            hebergement =>
                construireSituationIndividuelle(
                    hebergement,
                    filtrePeriodeCourant
                )
        );


    return situations.filter(
        situation =>
            situationCorrespondEtat(
                situation
            )
    );

}


// =====================================================
// FILTRER LES SITUATIONS MENSUELLES
// =====================================================

function filtrerSituationsMensuelles(
    situationsMensuelles
) {

    let resultat =
        situationsMensuelles;


    // =================================================
    // FILTRE PÉRIODE
    // =================================================

    if (
        filtrePeriodeCourant !==
        "toutes"
    ) {

        resultat =
            resultat.filter(
                situation =>
                    situation.cle ===
                    filtrePeriodeCourant
            );

    }


    // =================================================
    // FILTRE ÉTAT
    // =================================================

    if (
        filtreEtatCourant !==
        "tous"
    ) {

        resultat =
            resultat.filter(
                situation =>
                    situationCorrespondEtat(
                        situation
                    )
            );

    }


    return resultat;

}


// =====================================================
// LIBELLÉ DE L'ÉTAT MENSUEL
// =====================================================

function obtenirEtatMensuel(
    situation
) {

    if (
        situation.codification
    ) {

        return {

            texte:
                "Codification",

            classe:
                "regulier"

        };

    }


    if (
        situation.montantTheorique <=
        0
    ) {

        return {

            texte:
                "Non applicable",

            classe:
                "regulier"

        };

    }


    if (
        situation.reste ===
        0
    ) {

        return {

            texte:
                "Régularisé",

            classe:
                "regulier"

        };

    }


    if (
        situation.montantEncaisse >
        0
    ) {

        return {

            texte:
                "Partiel",

            classe:
                "partiel"

        };

    }


    return {

        texte:
            "À recouvrer",

        classe:
            "impaye"

    };

}


// =====================================================
// AFFICHER LE TABLEAU MENSUEL
// =====================================================

function afficherSituationMensuelle(
    situationsMensuelles
) {

    if (
        !situationMensuelleBody
    ) {

        return;

    }


    situationMensuelleBody.innerHTML =
        "";


    if (
        situationsMensuelles.length ===
        0
    ) {

        situationMensuelleBody.innerHTML = `

            <tr class="empty-row">

                <td colspan="7">

                    Aucune donnée disponible.

                </td>

            </tr>

        `;


        return;

    }


    situationsMensuelles.forEach(
        situation => {

            const etat =
                obtenirEtatMensuel(
                    situation
                );


            const tauxAffiche =

                situation.codification

                    ? "—"

                    : formaterTaux(
                        situation.taux
                    );


            situationMensuelleBody.innerHTML += `

                <tr>

                    <td>

                        <strong>
                            ${situation.libelle}
                        </strong>

                    </td>


                    <td>
                        ${situation.effectif}
                    </td>


                    <td>
                        ${
                            situation.codification

                                ? "—"

                                : formaterMontant(
                                    situation.montantTheorique
                                )
                        }
                    </td>


                    <td>
                        ${
                            situation.codification

                                ? "—"

                                : formaterMontant(
                                    situation.montantEncaisse
                                )
                        }
                    </td>


                    <td>
                        ${
                            situation.codification

                                ? "—"

                                : formaterMontant(
                                    situation.reste
                                )
                        }
                    </td>


                    <td>
                        ${tauxAffiche}
                    </td>


                    <td>

                        <span
                            class="
                                etat-mensuel
                                ${etat.classe}
                            "
                        >
                            ${etat.texte}
                        </span>

                    </td>

                </tr>

            `;

        }
    );

}


// =====================================================
// OBSERVATIONS AUTOMATIQUES
// =====================================================

function construireObservations({
    totalTheorique,
    totalEncaisse,
    totalReste,
    tauxRecouvrement,
    effectifConcerne,
    effectifDette,
    situationsMensuelles
}) {

    const observations = [];


    if (
        effectifConcerne ===
        0
    ) {

        observations.push(
            "Aucun occupant n'est actuellement pris en compte dans la situation."
        );


        return observations;

    }


    if (
        totalTheorique ===
        0
    ) {

        observations.push(
            "Aucune créance de loyer n'est actuellement constatée sur la période considérée."
        );

    }

    else if (
        totalReste ===
        0
    ) {

        observations.push(
            "La situation ne fait apparaître aucun reste à recouvrer."
        );

    }

    else {

        observations.push(
            `Un reste à recouvrer de ${formaterMontant(
                totalReste
            )} est constaté à la date de situation.`
        );

    }


    if (
        tauxRecouvrement >=
        100
    ) {

        observations.push(
            "Le taux global de recouvrement est de 100 %."
        );

    }

    else if (
        tauxRecouvrement >=
        90
    ) {

        observations.push(
            "Le niveau global de recouvrement est supérieur ou égal à 90 %."
        );

    }

    else if (
        tauxRecouvrement >
        0
    ) {

        observations.push(
            `Le taux global de recouvrement s'établit à ${formaterTaux(
                tauxRecouvrement
            )}.`
        );

    }


    if (
        effectifDette >
        0
    ) {

        observations.push(
            `${effectifDette} situation${
                effectifDette > 1
                    ? "s"
                    : ""
            } présente${
                effectifDette > 1
                    ? "nt"
                    : ""
            } encore un solde.`
        );

    }


    const periodesAvecReste =
        situationsMensuelles.filter(
            situation =>
                !situation.codification &&
                situation.reste >
                0
        );


    if (
        periodesAvecReste.length >
        0
    ) {

        observations.push(
            `Des restes à recouvrer sont constatés sur ${periodesAvecReste.length} période${
                periodesAvecReste.length > 1
                    ? "s"
                    : ""
            }.`
        );

    }


    return observations;

}


// =====================================================
// AFFICHER LES OBSERVATIONS
// =====================================================

function afficherObservations(
    observations
) {

    if (
        !observationsContainer
    ) {

        return;

    }


    if (
        !observations.length
    ) {

        observationsContainer.innerHTML = `

            <p class="observation-empty">

                Aucune observation particulière.

            </p>

        `;


        return;

    }


    observationsContainer.innerHTML =
        observations
            .map(
                observation => `

                    <p>
                        ${observation}
                    </p>

                `
            )
            .join("");

}


// =====================================================
// METTRE À JOUR L'INFORMATION DE PÉRIODE
// =====================================================

function afficherPeriodeSelectionnee() {

    if (
        !infoPeriodeElement
    ) {

        return;

    }


    const moisAcademiques =
        obtenirMoisAcademiques(
            anneeAcademiqueCourante
        );


    if (
        filtrePeriodeCourant ===
        "toutes"
    ) {

        const annee =
            analyserAnneeAcademique(
                anneeAcademiqueCourante
            );


        infoPeriodeElement.textContent =
            annee
                ? `Novembre ${annee.debut} — Juillet ${annee.fin}`
                : "—";


        return;

    }


    const mois =
        moisAcademiques.find(
            element =>
                element.cle ===
                filtrePeriodeCourant
        );


    infoPeriodeElement.textContent =
        mois?.libelle ||
        "—";

}


// =====================================================
// CALCULER ET AFFICHER LA SITUATION
// =====================================================

function reconstruireSituationExtraComptable() {

    // =================================================
    // SITUATIONS MENSUELLES COMPLÈTES
    // =================================================

    const situationsMensuelles =
        construireSituationMensuelle();


    // =================================================
    // SITUATIONS MENSUELLES AFFICHÉES
    // =================================================

    const situationsMensuellesFiltrees =
        filtrerSituationsMensuelles(
            situationsMensuelles
        );


    // =================================================
    // SITUATIONS INDIVIDUELLES
    // =================================================
    //
    // C'est ici que se fait le changement essentiel :
    //
    // "toutes"  → cumul janvier à juillet
    // "janvier" → janvier uniquement
    // "février" → février uniquement
    // etc.
    //
    // =================================================

    const situationsIndividuelles =
        obtenirSituationsIndividuellesFiltrees();


    // =================================================
    // EFFECTIF
    // =================================================

    const effectifConcerne =
        situationsIndividuelles.length;


    const effectifRegulier =
        situationsIndividuelles.filter(
            situation =>
                situation.regle
        ).length;


    const effectifDette =
        situationsIndividuelles.filter(
            situation =>
                !situation.regle
        ).length;


    const tauxRegularisation =
        effectifConcerne > 0

            ? (
                effectifRegulier /
                effectifConcerne
            ) * 100

            : 0;


    // =================================================
    // MONTANTS
    // =================================================

    let situationsLoyer =
        situationsMensuellesFiltrees.filter(
            situation =>
                !situation.codification
        );


    // =================================================
    // CAS D'UNE PÉRIODE PRÉCISE
    // =================================================
    //
    // Le montant des cartes doit représenter
    // exactement la période sélectionnée.
    //
    // =================================================

    let totalTheorique =
        0;


    let totalEncaisse =
        0;


    if (
        filtrePeriodeCourant ===
        "toutes"
    ) {

        totalTheorique =
            situationsLoyer.reduce(
                (
                    total,
                    situation
                ) =>
                    total +
                    situation.montantTheorique,
                0
            );


        totalEncaisse =
            situationsLoyer.reduce(
                (
                    total,
                    situation
                ) =>
                    total +
                    situation.montantEncaisse,
                0
            );

    }

    else {

        // =============================================
        // UNE SEULE PÉRIODE
        // =============================================

        const situationSelectionnee =
            situationsLoyer.find(
                situation =>
                    situation.cle ===
                    filtrePeriodeCourant
            );


        if (
            situationSelectionnee
        ) {

            // -----------------------------------------
            // Sans filtre d'état
            // -----------------------------------------

            if (
                filtreEtatCourant ===
                "tous"
            ) {

                totalTheorique =
                    situationSelectionnee
                        .montantTheorique;

                totalEncaisse =
                    situationSelectionnee
                        .montantEncaisse;

            }

            // -----------------------------------------
            // Avec filtre d'état
            // -----------------------------------------

            else {

                totalTheorique =
                    situationsIndividuelles.reduce(
                        (
                            total,
                            situation
                        ) =>
                            total +
                            situation.montantTheorique,
                        0
                    );


                totalEncaisse =
                    situationsIndividuelles.reduce(
                        (
                            total,
                            situation
                        ) =>
                            total +
                            situation.montantPaye,
                        0
                    );

            }

        }

    }


    const totalReste =
        Math.max(
            0,
            totalTheorique -
            totalEncaisse
        );


    const tauxRecouvrement =
        totalTheorique > 0

            ? (
                totalEncaisse /
                totalTheorique
            ) * 100

            : 0;


    // =================================================
    // CARTES FINANCIÈRES
    // =================================================

    if (
        montantTheoriqueElement
    ) {

        montantTheoriqueElement.textContent =
            formaterMontant(
                totalTheorique
            );

    }


    if (
        montantEncaisseElement
    ) {

        montantEncaisseElement.textContent =
            formaterMontant(
                totalEncaisse
            );

    }


    if (
        resteARecouvrerElement
    ) {

        resteARecouvrerElement.textContent =
            formaterMontant(
                totalReste
            );

    }


    if (
        tauxRecouvrementElement
    ) {

        tauxRecouvrementElement.textContent =
            formaterTaux(
                tauxRecouvrement
            );

    }


    // =================================================
    // EFFECTIFS
    // =================================================

    if (
        effectifConcerneElement
    ) {

        effectifConcerneElement.textContent =
            effectifConcerne;

    }


    if (
        effectifRegulierElement
    ) {

        effectifRegulierElement.textContent =
            effectifRegulier;

    }


    if (
        effectifDetteElement
    ) {

        effectifDetteElement.textContent =
            effectifDette;

    }


    if (
        tauxRegularisationElement
    ) {

        tauxRegularisationElement.textContent =
            formaterTaux(
                tauxRegularisation
            );

    }


    // =================================================
    // TABLEAU MENSUEL
    // =================================================

    afficherSituationMensuelle(
        situationsMensuellesFiltrees
    );


    // =================================================
    // TOTAL DU TABLEAU
    // =================================================

    if (
        totalEffectifMensuelElement
    ) {

        totalEffectifMensuelElement.textContent =
            effectifConcerne;

    }


    if (
        totalTheoriqueMensuelElement
    ) {

        totalTheoriqueMensuelElement.textContent =
            formaterMontant(
                totalTheorique
            );

    }


    if (
        totalEncaisseMensuelElement
    ) {

        totalEncaisseMensuelElement.textContent =
            formaterMontant(
                totalEncaisse
            );

    }


    if (
        totalResteMensuelElement
    ) {

        totalResteMensuelElement.textContent =
            formaterMontant(
                totalReste
            );

    }


    if (
        totalTauxMensuelElement
    ) {

        totalTauxMensuelElement.textContent =
            formaterTaux(
                tauxRecouvrement
            );

    }


    // =================================================
    // SYNTHÈSE DES PÉRIODES
    // =================================================

    const periodesRegulieres =
        situationsMensuellesFiltrees.filter(
            situation =>

                situation.montantTheorique >
                0 &&

                situation.reste ===
                0
        );


    const periodesAvecReste =
        situationsMensuellesFiltrees.filter(
            situation =>
                situation.reste >
                0
        );


    const periodesAvecActivite =
        situationsMensuellesFiltrees.filter(
            situation =>
                situation.montantTheorique >
                0
        );


    let meilleurTaux =
        0;


    periodesAvecActivite.forEach(
        situation => {

            if (
                situation.taux >
                meilleurTaux
            ) {

                meilleurTaux =
                    situation.taux;

            }

        }
    );


    const dernierePeriode =
        [...periodesAvecActivite]
            .reverse()
            .find(
                situation =>

                    situation.montantEncaisse >
                    0 ||

                    situation.montantTheorique >
                    0
            );


    if (
        periodesRegulieresElement
    ) {

        periodesRegulieresElement.textContent =
            periodesRegulieres.length;

    }


    if (
        periodesAvecResteElement
    ) {

        periodesAvecResteElement.textContent =
            periodesAvecReste.length;

    }


    if (
        meilleurTauxElement
    ) {

        meilleurTauxElement.textContent =
            formaterTaux(
                meilleurTaux
            );

    }


    if (
        dernierePeriodeElement
    ) {

        dernierePeriodeElement.textContent =
            dernierePeriode
                ?.libelle ||
            "—";

    }


    // =================================================
    // ÉTAT DOCUMENT
    // =================================================

    let etatDocument =
        "Situation en cours";


    if (
        totalTheorique >
            0 &&
        totalReste ===
        0
    ) {

        etatDocument =
            "Situation régularisée";

    }

    else if (
        totalReste >
        0
    ) {

        etatDocument =
            "Situation avec reste à recouvrer";

    }


    if (
        etatDocumentElement
    ) {

        etatDocumentElement.textContent =
            etatDocument;

    }


    if (
        statutSituationElement
    ) {

        statutSituationElement.textContent =

            lectureSeuleCourante

                ? "Clôturée"

                : "En cours";

    }


    // =================================================
    // OBSERVATIONS
    // =================================================

    afficherObservations(

        construireObservations({

            totalTheorique,

            totalEncaisse,

            totalReste,

            tauxRecouvrement,

            effectifConcerne,

            effectifDette,

            situationsMensuelles:
                situationsMensuellesFiltrees

        })

    );


    // =================================================
    // INFORMATIONS DE PÉRIODE
    // =================================================

    afficherPeriodeSelectionnee();


    // =================================================
    // CONSOLE
    // =================================================

    console.log(
        "📊 Situation extra-comptable calculée :",
        {

            periode:
                filtrePeriodeCourant,

            etat:
                filtreEtatCourant,

            effectifConcerne,

            effectifRegulier,

            effectifDette,

            totalTheorique,

            totalEncaisse,

            totalReste,

            tauxRecouvrement

        }
    );

}


// =====================================================
// ÉVÉNEMENTS DES FILTRES
// =====================================================

// =====================================================
// FILTRE PÉRIODE
// =====================================================

if (
    filtrePeriodeElement
) {

    filtrePeriodeElement.addEventListener(
        "change",
        () => {

            filtrePeriodeCourant =
                filtrePeriodeElement.value ||
                "toutes";


            console.log(
                "🔎 Période sélectionnée :",
                filtrePeriodeCourant
            );


            reconstruireSituationExtraComptable();

        }
    );

}


// =====================================================
// FILTRE ÉTAT
// =====================================================

if (
    filtreEtatElement
) {

    filtreEtatElement.addEventListener(
        "change",
        () => {

            filtreEtatCourant =
                filtreEtatElement.value ||
                "tous";


            console.log(
                "🔎 État sélectionné :",
                filtreEtatCourant
            );


            reconstruireSituationExtraComptable();

        }
    );

}


// =====================================================
// RÉINITIALISER LES FILTRES
// =====================================================

if (
    reinitialiserFiltresElement
) {

    reinitialiserFiltresElement.addEventListener(
        "click",
        () => {

            filtrePeriodeCourant =
                "toutes";


            filtreEtatCourant =
                "tous";


            if (
                filtrePeriodeElement
            ) {

                filtrePeriodeElement.value =
                    "toutes";

            }


            if (
                filtreEtatElement
            ) {

                filtreEtatElement.value =
                    "tous";

            }


            reconstruireSituationExtraComptable();

        }
    );

}


// =====================================================
// ÉCOUTE TEMPS RÉEL DES PAIEMENTS
// =====================================================

function ecouterPaiementsLoyers() {

    if (
        typeof unsubscribePaiements ===
        "function"
    ) {

        unsubscribePaiements();

        unsubscribePaiements =
            null;

    }


    const paiementsQuery =
        query(
            collection(
                db,
                COLLECTION_PAIEMENTS
            ),
            where(
                "anneeAcademique",
                "==",
                anneeAcademiqueCourante
            ),
            where(
                "statut",
                "==",
                "paye"
            )
        );


    unsubscribePaiements =
        onSnapshot(

            paiementsQuery,

            snapshot => {

                paiementsLoyers =
                    snapshot.docs.map(
                        documentSnapshot => ({

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        })
                    );


                console.log(
                    "🔄 Situation extra-comptable — paiements mis à jour :",
                    paiementsLoyers.length
                );


                reconstruireSituationExtraComptable();

            },


            error => {

                console.error(
                    "❌ Erreur écoute paiements de la situation extra-comptable :",
                    error
                );

            }

        );

}


// =====================================================
// EN-TÊTE DU DOCUMENT
// =====================================================

function afficherIdentification() {

    const date =
        formaterDate(
            new Date()
        );


    if (
        pavillonConcerneElement
    ) {

        pavillonConcerneElement.textContent =
            pavillonCourant ||
            "—";

    }


    if (
        anneeAcademiqueElement
    ) {

        anneeAcademiqueElement.textContent =
            anneeAcademiqueCourante ||
            "—";

    }


    if (
        infoAnneeElement
    ) {

        infoAnneeElement.textContent =
            anneeAcademiqueCourante ||
            "—";

    }


    if (
        infoSiteElement
    ) {

        infoSiteElement.textContent =
            siteCourant ||
            "—";

    }


    if (
        infoPavillonElement
    ) {

        infoPavillonElement.textContent =
            pavillonCourant ||
            "—";

    }


    if (
        infoDateElement
    ) {

        infoDateElement.textContent =
            date;

    }


    if (
        dateEtablissementElement
    ) {

        dateEtablissementElement.textContent =
            date;

    }


    if (
        etabliParElement
    ) {

        const nomComplet =
            `${profilAgent?.prenom || ""} ${profilAgent?.nom || ""}`
                .trim();


        etabliParElement.textContent =
            nomComplet ||
            "Service de l'Hébergement";

    }


    // =================================================
    // PÉRIODE
    // =================================================

    afficherPeriodeSelectionnee();

}


// =====================================================
// RETOUR RECOUVREMENT
// =====================================================

if (
    boutonRetour
) {

    boutonRetour.addEventListener(
        "click",
        () => {

            window.location.href =
                "../../recouvrement/index.html";

        }
    );

}


// =====================================================
// IMPRESSION
// =====================================================

if (
    boutonImprimer
) {

    boutonImprimer.addEventListener(
        "click",
        () => {

            window.print();

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
        permissions,
        affectation,
        posteId,
        anneeAcademique,
        lectureSeule
    }) => {

        try {

            // =============================================
            // SERVICE
            // =============================================

            if (
                profile?.service !==
                "Service de l'Hébergement"
            ) {

                console.error(
                    "❌ Accès refusé : service incorrect."
                );


                return;

            }


            // =============================================
            // CONTEXTE
            // =============================================

            profilAgent =
                profile;


            anneeAcademiqueCourante =
                anneeAcademique ||
                "";


            lectureSeuleCourante =
                Boolean(
                    lectureSeule
                );


            siteCourant =
                affectation?.site ||
                profile?.site ||
                "";


            pavillonCourant =
                affectation?.pavillon ||

                extrairePavillon(
                    affectation?.affectation ||
                    profile?.affectation ||
                    ""
                );


            // =============================================
            // FILTRES PAR DÉFAUT
            // =============================================

            filtrePeriodeCourant =
                "toutes";


            filtreEtatCourant =
                "tous";


            if (
                filtrePeriodeElement
            ) {

                filtrePeriodeElement.value =
                    "toutes";

            }


            if (
                filtreEtatElement
            ) {

                filtreEtatElement.value =
                    "tous";

            }


            // =============================================
            // SIDEBAR
            // =============================================

            await loadSidebar({

                ...profile,

                permissions,

                affectation:
                    affectation?.affectation ||
                    affectation?.site ||
                    profile?.affectation ||
                    "",

                posteId,

                anneeAcademique,

                lectureSeule

            });


            // =============================================
            // VÉRIFICATION
            // =============================================

            if (
                !siteCourant ||
                !pavillonCourant ||
                !anneeAcademiqueCourante
            ) {

                throw new Error(
                    "CONTEXTE_SITUATION_EXTRA_COMPTABLE_INCOMPLET"
                );

            }


            console.log(
                "📑 Situation extra-comptable :",
                {

                    site:
                        siteCourant,

                    pavillon:
                        pavillonCourant,

                    anneeAcademique:
                        anneeAcademiqueCourante,

                    lectureSeule:
                        lectureSeuleCourante

                }
            );


            // =============================================
            // IDENTIFICATION
            // =============================================

            afficherIdentification();


            // =============================================
            // CHARGEMENT INITIAL
            // =============================================

            const [
                recouvrementsCharges,
                hebergementsCharges,
                paiementsCharges
            ] =
                await Promise.all([

                    chargerRecouvrements(
                        anneeAcademiqueCourante
                    ),

                    chargerHebergements(
                        siteCourant,
                        pavillonCourant,
                        anneeAcademiqueCourante
                    ),

                    chargerPaiementsLoyers(
                        anneeAcademiqueCourante
                    )

                ]);


            recouvrementsSource =
                recouvrementsCharges;


            hebergements =
                hebergementsCharges;


            paiementsLoyers =
                paiementsCharges;


            console.log(
                "📑 Données de situation chargées :",
                {

                    hebergements:
                        hebergements.length,

                    recouvrements:
                        recouvrementsSource.length,

                    paiements:
                        paiementsLoyers.length

                }
            );


            // =============================================
            // PREMIER CALCUL
            // =============================================

            reconstruireSituationExtraComptable();


            // =============================================
            // TEMPS RÉEL
            // =============================================

            ecouterPaiementsLoyers();


        } catch (
            error
        ) {

            console.error(
                "❌ Erreur situation extra-comptable :",
                error
            );


            if (
                situationMensuelleBody
            ) {

                situationMensuelleBody.innerHTML = `

                    <tr class="empty-row">

                        <td colspan="7">

                            Impossible de charger
                            la situation extra-comptable.

                        </td>

                    </tr>

                `;

            }

        } finally {

            document.body.classList.add(
                "loaded"
            );

        }

    },

    "voirTableauDeBord"

);


// =====================================================
// NETTOYAGE LISTENER
// =====================================================

window.addEventListener(
    "beforeunload",
    () => {

        if (
            typeof unsubscribePaiements ===
            "function"
        ) {

            unsubscribePaiements();

            unsubscribePaiements =
                null;

        }

    }
);