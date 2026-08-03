import { createIcons, icons } from "lucide";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/firebase.js";
import { clearCurrentUserCache } from "../../../auth/authService.js";


export async function loadSidebar(profile) {

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

    // Menu 
    const menuBtn = document.querySelector(".menu-btn");

    if (menuBtn && !menuBtn.dataset.binded) {

        menuBtn.dataset.binded = "true";

        menuBtn.onclick = () => {

            document.querySelector(".sidebar")
                .classList.toggle("collapsed");

        };

    }

   const notifBtn = document.querySelector(".notif-btn");

if (notifBtn && !notifBtn.dataset.binded) {

    notifBtn.dataset.binded = "true";

    notifBtn.onclick = () => {

        window.location.href = "../notifications/index.html";

    };

};

}