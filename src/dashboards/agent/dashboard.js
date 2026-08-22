import { requireRole } from "../../auth/authGuard.js";

requireRole("agent", async ({ profile, posteId }) => {

    // =====================================================
    // HÉBERGEMENT
    // =====================================================

    if (
        profile.service ===
        "Service de l'Hébergement"
    ) {

        window.location.href =
            "../../modules/hebergement/demandes/index.html";

        return;
    }


    // =====================================================
    // ATELIER
    // =====================================================

    if (
        posteId === "chef_atelier"
    ) {

        window.location.href =
            "../../modules/atelier/bons/index.html";

        return;
    }


    // =====================================================
    // AUCUN MODULE CORRESPONDANT
    // =====================================================

    console.warn(
        "⚠️ Aucun module associé à cet agent :",
        {
            service: profile.service,
            affectation: profile.affectation,
            posteId
        }
    );

});