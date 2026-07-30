import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";

export function requireAuth(callback) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            window.location.href = "../../auth/login.html";
            return;

        }

        await callback(user);

    });

}