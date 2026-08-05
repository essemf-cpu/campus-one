import { requireRole } from "../../auth/authGuard.js";

requireRole("etudiant", async () => {

    window.location.href =
        "../../modules/etudiant/dashboard/index.html";

});