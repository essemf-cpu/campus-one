import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getCurrentUser } from "./authService.js";

export function requireRole(expectedRole, callback) {

    console.time("AUTH");
    onAuthStateChanged(auth, async (firebaseUser) => {

        if (!firebaseUser) {

            window.location.href = "../../auth/login.html";
            return;

        }

        try {

            const currentUser = await getCurrentUser(firebaseUser.uid);
            console.timeEnd("AUTH");

            const account = currentUser.account;
            const profile = currentUser.profile;

            if (account.role !== expectedRole) {

                window.location.href = "../../403.html";
                return;

            }

            await callback({

                account,
                profile

            });

        } catch (error) {

            console.error(error);

            await auth.signOut();

            window.location.href = "../../auth/login.html";

        }
        

    });

}