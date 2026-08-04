import { requireRole } from "../../auth/authGuard.js";

requireRole("agent", async ({ profile }) => {

    if (profile.service === "Service de l'Hébergement") {

        window.location.href =
            "../../modules/hebergement/demandes/index.html";

    }

});