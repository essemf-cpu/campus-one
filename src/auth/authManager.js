import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getCurrentUser } from "./authService.js";

let authPromise = null;
let currentSession = null;

export function getSession() {

    if (currentSession) {
        return Promise.resolve(currentSession);
    }

    if (authPromise) {
        return authPromise;
    }

    authPromise = new Promise((resolve, reject) => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

            unsubscribe();

            if (!firebaseUser) {

                currentSession = null;

                resolve(null);

                return;

            }

            try {

                const currentUser = await getCurrentUser(firebaseUser.uid);

                currentSession = {

                    firebaseUser,

                    account: currentUser.account,

                    profile: currentUser.profile

                };

                resolve(currentSession);

            } catch (error) {

                reject(error);

            }

        });

    });

    return authPromise;

}

export function clearSession() {

    currentSession = null;

    authPromise = null;

}