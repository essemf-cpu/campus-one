export default [

    // =====================================================
    // CHEF DE PAVILLON
    // =====================================================

    {
        id: "chef_pavillon",

        posteId: "chef_pavillon",

        permissions: {

            // ---------------------------------------------
            // HÉBERGEMENT
            // ---------------------------------------------

            voirResidents: true,

            voirDonneesResidents: true,

            voirRecouvrement: true,

            gererReclamations: true,


            // ---------------------------------------------
            // BONS DE TRAVAIL
            // ---------------------------------------------

            voirDemandes: true,

            gererBons: true,

            suivreBons: true,

            voirAnciensBons: true,


            // ---------------------------------------------
            // TABLEAU DE BORD
            // ---------------------------------------------

            voirTableauDeBord: false,


            // ---------------------------------------------
            // SUPERVISION
            // ---------------------------------------------

            superviserSite: false

        },

        actif: true
    },


    // =====================================================
// CHEF D'ATELIER
// =====================================================

{
    id: "chef_atelier",
    posteId: "chef_atelier",

    permissions: {

        // ---------------------------------------------
        // ATELIER
        // ---------------------------------------------

        voirDemandes: true,
        gererBons: true,
        suivreBons: true,
        voirAnciensBons: true,

        // ---------------------------------------------
        // TABLEAU DE BORD
        // ---------------------------------------------

        voirTableauDeBord: true,

        // ---------------------------------------------
        // STOCKS
        // ---------------------------------------------

        gererStocks: true,

        // ---------------------------------------------
        // PARAMÈTRES
        // ---------------------------------------------

        gererParametres: true,

        // ---------------------------------------------
        // SUPERVISION
        // ---------------------------------------------

        superviserSite: false
    },

    actif: true
},


    // =====================================================
    // CHEF DE RÉSIDENCE
    // =====================================================

    {
        id: "chef_residence",

        posteId: "chef_residence",

        permissions: {

            // ---------------------------------------------
            // HÉBERGEMENT
            // ---------------------------------------------

            voirResidents: true,

            voirDonneesResidents: true,

            voirRecouvrement: true,

            gererReclamations: true,


            // ---------------------------------------------
            // BONS DE TRAVAIL
            // ---------------------------------------------

            voirDemandes: true,

            gererBons: true,

            suivreBons: true,

            voirAnciensBons: true,


            // ---------------------------------------------
            // TABLEAU DE BORD
            // ---------------------------------------------

            voirTableauDeBord: true,


            // ---------------------------------------------
            // SUPERVISION
            // ---------------------------------------------

            superviserSite: false

        },

        actif: true
    },


    // =====================================================
    // AGENT ADMINISTRATIF DE L'HÉBERGEMENT
    // =====================================================

    {
        id: "employe_administration_simple",

        posteId:
            "employe_administration_simple",

        permissions: {

            // ---------------------------------------------
            // HÉBERGEMENT
            // ---------------------------------------------

            voirResidents: false,

            voirDonneesResidents: false,

            voirRecouvrement: true,

            gererReclamations: true,


            // ---------------------------------------------
            // BONS DE TRAVAIL
            // ---------------------------------------------

            voirDemandes: true,

            gererBons: true,

            suivreBons: true,

            voirAnciensBons: true,


            // ---------------------------------------------
            // TABLEAU DE BORD
            // ---------------------------------------------

            voirTableauDeBord: false,


            // ---------------------------------------------
            // SUPERVISION
            // ---------------------------------------------

            superviserSite: false

        },

        actif: true
    },


    // =====================================================
    // SAF
    // =====================================================
    //
    // Le SAF n'est pas un agent opérationnel du pavillon.
    //
    // Il supervise son SITE :
    //
    //   - pavillons
    //   - ateliers
    //   - lingerie
    //   - activité des agents
    //
    // Les limites géographiques seront appliquées par
    // l'affectation actuelle de l'agent.
    //
    // =====================================================

    {
        id: "superviseur_administratif_financier",

        posteId:
            "superviseur_administratif_financier",

        permissions: {

            // ---------------------------------------------
            // HÉBERGEMENT
            // ---------------------------------------------

            voirResidents: true,

            voirDonneesResidents: true,

            voirRecouvrement: true,

            gererReclamations: false,


            // ---------------------------------------------
            // SUPERVISION BONS
            // ---------------------------------------------

            gererBons: false,

            suivreBons: true,

            voirAnciensBons: true,


            // ---------------------------------------------
            // TABLEAU DE BORD
            // ---------------------------------------------

            voirTableauDeBord: true,


            // ---------------------------------------------
            // SUPERVISION DU SITE
            // ---------------------------------------------

            superviserSite: true

        },

        actif: true
    }

];