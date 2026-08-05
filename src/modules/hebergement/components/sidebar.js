import { createIcons, icons } from "lucide";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebase.js";
import { clearCurrentUserCache } from "../../../auth/authService.js";




export async function loadSidebar(profile) {

    const container = document.getElementById("sidebar-container");

    if (container && container.innerHTML.trim() === "") {

        const response = await fetch("../components/sidebar.html");

        container.innerHTML = await response.text();

    }

    document.querySelectorAll(".section a").forEach(link => {
    link.classList.remove("active");
});

const page = window.location.pathname;

if (page.includes("/demandes/")) {
    document.getElementById("menu-demandes")?.classList.add("active");
}

if (page.includes("/tableau-de-bord/")) {
    document.getElementById("menu-dashboard")?.classList.add("active");
}

if (page.includes("/suivi/")) {
    document.getElementById("menu-suivi")?.classList.add("active");
}

if (page.includes("/anciens-bons/")) {
    document.getElementById("menu-anciens")?.classList.add("active");
}

if (page.includes("/historique-demandes/")) {
    document.getElementById("menu-historique")?.classList.add("active");
}

const suiviLink = document.getElementById("menu-suivi");

if (suiviLink && !suiviLink.dataset.binded) {

    suiviLink.dataset.binded = "true";

    suiviLink.onclick = (e) => {

        if (page.includes("/demandes/")) {

            e.preventDefault();

            document.getElementById("suivi")
                ?.scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });

        }

    };

}

    // Informations agent
    document.getElementById("sidebar-affectation").textContent =
        profile.affectation;

    document.getElementById("sidebar-fonction").textContent =
        profile.fonction;

    document.getElementById("sidebar-nom").textContent =
        `${profile.prenom} ${profile.nom}`;

   document.getElementById("sidebar-site").textContent =
    profile.site;

    // Icônes
    createIcons({ icons });

    document.getElementById("notif-count").style.display = "none";

    // Déconnexion
    const logout = document.getElementById("logout-btn");

    if (logout && !logout.dataset.binded) {

        logout.dataset.binded = "true";

        logout.onclick = async (e) => {

            e.preventDefault();



            clearCurrentUserCache();

            await signOut(auth);

            window.location.href = "../../../auth/login.html";

        };

    }

    // ==============================
// MENU
// ==============================

const menuBtn = document.querySelector(".menu-btn");

const sidebar = document.querySelector(".sidebar");

const mobileMenuBtn =
    document.getElementById("mobile-menu-btn");

if (menuBtn && !menuBtn.dataset.binded) {

    menuBtn.dataset.binded = "true";

    menuBtn.onclick = () => {

        if (window.innerWidth <= 768) {

            sidebar.classList.toggle("open");

        } else {

            sidebar.classList.toggle("collapsed");

        }

    };

}

if(mobileMenuBtn){

    mobileMenuBtn.onclick = ()=>{

        sidebar.classList.toggle("open");

    };

}

// Fermer le menu mobile en cliquant à côté

document.addEventListener("click",(e)=>{

    if(window.innerWidth > 768) return;

    if(
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){

        sidebar.classList.remove("open");

    }

});

   const notifBtn = document.querySelector(".notif-btn");

if (notifBtn && !notifBtn.dataset.binded) {

    notifBtn.dataset.binded = "true";

    notifBtn.onclick = () => {

        window.location.href = "../notifications/index.html";

    };

};

}