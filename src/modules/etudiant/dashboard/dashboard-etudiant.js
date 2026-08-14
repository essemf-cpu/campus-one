import { requireRole } from "../../../auth/authGuard.js";
import QRCode from "qrcode";

requireRole("etudiant", async ({ profile }) => {

    const initials =
        `${profile.prenom?.[0] || ""}${profile.nom?.[0] || ""}`;


    // ==================================================
    // QR ÉTUDIANT
    // ==================================================

    const qrData = JSON.stringify({

        type: "student",

        matricule: profile.matricule

    });


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
        <div id="dashboard-avatar"
             class="avatar-placeholder">

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


<!-- ==================================================
     QR ÉTUDIANT
================================================== -->

<section class="qr-section">

    <div class="section-header">

        <h2>Mon QR Code étudiant</h2>

    </div>


    <div class="qr-card">

        <div id="student-qrcode">

            <div class="qr-placeholder">
                QR
            </div>

        </div>


        <p class="qr-matricule">

            ${profile.matricule}

        </p>


        <small class="qr-campus">

            Campus One

        </small>


        <button
            id="open-qr"
            class="primary-btn">

            <i class="fa-solid fa-expand"></i>

            Agrandir

        </button>

    </div>

</section>


<!-- ==================================================
     SCANNER
================================================== -->

<section class="scanner-section">

    <a
        href="../scanner/index.html"
        class="scanner-card">

        <i class="fa-solid fa-qrcode"></i>

        <div>

            <strong>
                Scanner un QR Code
            </strong>

            <p>
                Restaurant • Ami • Campus
            </p>

        </div>

    </a>

</section>


<!-- ==================================================
     AUTRES
================================================== -->

<section class="others-section">

    <div class="section-header">

        <h2>Autres</h2>

    </div>


    <div class="premium-grid">

        <a
            href="../../pages/bibliotheque/index.html"
            class="premium-card">

            <i class="fa-solid fa-book-open"></i>

            <span>
                Bibliothèque
            </span>

        </a>


        <a
            href="../../pages/planning/index.html"
            class="premium-card">

            <i class="fa-solid fa-calendar-days"></i>

            <span>
                Planning
            </span>

        </a>

    </div>

</section>


<!-- ==================================================
     MODAL QR
================================================== -->

<div
    id="qr-modal"
    class="qr-modal">

    <div class="qr-modal-content">

        <div id="qr-modal-code"></div>


        <p id="qr-modal-matricule">

            ${profile.matricule}

        </p>


        <button id="close-qr">

            Fermer

        </button>

    </div>

</div>


<!-- ==================================================
     NAVIGATION BASSE
================================================== -->

<nav class="ios-navbar">

    <a href="#" aria-label="Accueil">

        <i class="fa-solid fa-house"></i>

    </a>

    <a href="../notifications/index.html" class="nav-bell" aria-label="Notifications">

        <i class="fa-solid fa-bell"></i>

        <div
            id="notification-badge"
            class="notification-badge">
        </div>

    </a>

    <a href="#" aria-label="Profil">

        <i class="fa-solid fa-user"></i>

    </a>

</nav>

`;


    // ==================================================
    // AFFICHAGE
    // ==================================================

    document.body.classList.add("loaded");


    // ==================================================
    // GÉNÉRATION DU QR
    // ==================================================

    await genererQRCode();


    // ==================================================
    // MODAL QR
    // ==================================================

    initialiserModalQR();


    // ==================================================
    // BADGE NOTIFICATIONS
    // ==================================================

    if (
        typeof afficherBadgeNotifications === "function"
    ) {

        afficherBadgeNotifications();

    }


    // ==================================================
    // FONCTION : GÉNÉRER QR
    // ==================================================

    async function genererQRCode() {

        const zone =
            document.getElementById(
                "student-qrcode"
            );

        if (!zone) return;


        zone.innerHTML = "";


        const canvas =
            document.createElement("canvas");


        await QRCode.toCanvas(

            canvas,

            qrData,

            {

                width: 180,

                margin: 2

            }

        );


        zone.appendChild(canvas);

    }


    // ==================================================
    // MODAL QR
    // ==================================================

    function initialiserModalQR() {

        const open =
            document.getElementById(
                "open-qr"
            );


        const close =
            document.getElementById(
                "close-qr"
            );


        const modal =
            document.getElementById(
                "qr-modal"
            );


        const zone =
            document.getElementById(
                "qr-modal-code"
            );


        if (
            !open ||
            !close ||
            !modal ||
            !zone
        ) {

            return;

        }


        // OUVRIR

        open.onclick = async () => {

            modal.classList.add("show");


            zone.innerHTML = "";


            const canvas =
                document.createElement(
                    "canvas"
                );


            await QRCode.toCanvas(

                canvas,

                qrData,

                {

                    width: 320,

                    margin: 2

                }

            );


            zone.appendChild(canvas);


            document.getElementById(
                "qr-modal-matricule"
            ).textContent =
                profile.matricule;

        };


        // FERMER

        close.onclick = () => {

            modal.classList.remove(
                "show"
            );

        };

    }

});