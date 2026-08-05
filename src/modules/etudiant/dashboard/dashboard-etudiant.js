import { requireRole } from "../../../auth/authGuard.js";

requireRole("etudiant", async ({ profile }) => {

 const initials =
`${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`;

document.getElementById("dashboard").innerHTML = `

<section class="dashboard-header">

    <div class="user-info">

        <p class="hello-title">
            Bonjour 👋
        </p>

        <h1 id="nom-user">
            ${profile.prenom}
        </h1>

    </div>

    ${
        profile.avatar

        ? `
        <img
            id="dashboard-avatar"
            src="${profile.avatar}"
            alt="Avatar">
        `

        : `
        <div id="dashboard-avatar" class="avatar-placeholder">
            ${initials}
        </div>
        `
    }

</section>

<section class="modern-search">

    <i class="fa-solid fa-magnifying-glass"></i>

    <input
        type="text"
        placeholder="Rechercher un service...">

</section>

<section class="premium-grid">

    <a href="../../pages/guide/index.html"
       class="premium-card">

        <i class="fa-solid fa-book"></i>

        <span>Guide</span>

    </a>

    <a href="../../restaurant/index.html"
       class="premium-card">

        <i class="fa-solid fa-utensils"></i>

        <span>Restaurant</span>

    </a>

    <a href="../../pages/gps/index.html"
       class="premium-card">

        <i class="fa-solid fa-location-dot"></i>

        <span>GPS</span>

    </a>

    <a href="../../pages/amis/index.html"
       class="premium-card">

        <i class="fa-solid fa-user-group"></i>

        <span>Amis</span>

    </a>

    <a href="../../pages/messages/index.html"
       class="premium-card">

        <i class="fa-solid fa-comments"></i>

        <span>Messages</span>

    </a>

    <a href="../../pages/codifier/index.html"
       class="premium-card">

        <i class="fa-solid fa-id-badge"></i>

        <span>Codifier</span>

    </a>

</section>

`;

    document.body.classList.add("loaded");

});