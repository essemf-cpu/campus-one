export default [

    // =====================================================
    // 2026ABC — 2026-2027
    // =====================================================

    {
        id: "2026ABC_2026-2027",

        matricule: "2026ABC",

        anneeAcademique: "2026-2027",

        montantMensuel: 3000,

        // =================================================
        // CAUTION
        // =================================================

        caution: {
            montant: 3000,
            statut: "paye",
            datePaiement: null
        },

        // =================================================
        // MOIS
        // =================================================

        mois: {

            novembre: {
                libelle: "Novembre 2026",
                statut: "paye",
                datePaiement: null
            },

            decembre: {
                libelle: "Décembre 2026",
                statut: "paye",
                datePaiement: null
            },

            janvier: {
                libelle: "Janvier 2027",
                statut: "a_payer",
                datePaiement: null
            },

            fevrier: {
                libelle: "Février 2027",
                statut: "a_payer",
                datePaiement: null
            },

            mars: {
                libelle: "Mars 2027",
                statut: "a_payer",
                datePaiement: null
            },

            avril: {
                libelle: "Avril 2027",
                statut: "a_payer",
                datePaiement: null
            },

            mai: {
                libelle: "Mai 2027",
                statut: "a_payer",
                datePaiement: null
            },

            juin: {
                libelle: "Juin 2027",
                statut: "a_payer",
                datePaiement: null
            },

            juillet: {
                libelle: "Juillet 2027",
                statut: "a_payer",
                datePaiement: null
            }

        },

        // =================================================
        // DERNIER PAIEMENT
        // =================================================

        dernierPaiement: {
            date: null,
            montant: 0,
            mois: [],
            mode: null
        },

        statut: "en_cours",

        creeLe: null,

        modifieLe: null
    }

];