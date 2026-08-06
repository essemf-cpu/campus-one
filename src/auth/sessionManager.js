import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getCurrentUser } from "./authService.js";

let session = null;
let initialized = false;
let waiting = [];

onAuthStateChanged(auth, async (firebaseUser) => {

    try {

        if (!firebaseUser) {

            session = null;

        } else {

            const currentUser = await getCurrentUser(firebaseUser.uid);

            console.log("CURRENT USER =", currentUser);

            session = {
                firebaseUser,
                account: currentUser.account,
                profile: currentUser.profile
            };

        }

    } catch (e) {

        console.error("ERREUR SESSION :", e);

        session = null;

    }

    initialized = true;

    waiting.forEach(resolve => resolve(session));
    waiting = [];

});

export async function getSession() {

    if (initialized) {

        return session;

    }

    return new Promise(resolve => {

        waiting.push(resolve);

    });

}

export function clearSession() {

    session = null;

    initialized = false;

}