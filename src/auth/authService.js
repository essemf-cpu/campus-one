import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut
} from "firebase/auth";

import { auth, db } from "../firebase/firebase.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "firebase/firestore";

import { clearSession } from "./sessionManager.js";

/* ===========================
   AUTHENTIFICATION
=========================== */

let currentUserCache = null;

export async function login(email, password) {

    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}

export async function logout() {

    return signOut(auth);

}

export async function forgotPassword(email) {

    return sendPasswordResetEmail(
        auth,
        email
    );

}

/* ===========================
   UTILISATEURS
=========================== */

/**
 * Recherche un utilisateur par UID
 * (agents aujourd'hui, étudiants demain)
 */
export async function getCurrentUser(uid) {

    if (currentUserCache) {
        return currentUserCache;
    }

    const accountRef = doc(db, "users", uid);
    const accountSnap = await getDoc(accountRef);

    console.time("PROFILE");

    const account = accountSnap.data();

    const profileRef = doc(db, account.profile);
    const profileSnap = await getDoc(profileRef);

    console.timeEnd("PROFILE");

    currentUserCache = {

        account,
        profile: profileSnap.data()

    };

    return currentUserCache;

}

export function clearCurrentUserCache() {

    currentUserCache = null;

    clearSession();

}

/**
 * Recherche un utilisateur par matricule
 */
export async function findUserByMatricule(matricule) {

    // Recherche chez les agents
    let snapshot = await getDocs(
        query(
            collection(db, "agents"),
            where("matricule", "==", matricule)
        )
    );

    if (!snapshot.empty) {

        return snapshot.docs[0].data();

    }

    // Recherche chez les étudiants
    snapshot = await getDocs(
        query(
            collection(db, "etudiants"),
            where("matricule", "==", matricule)
        )
    );

    if (!snapshot.empty) {

        return snapshot.docs[0].data();

    }

    throw new Error("USER_NOT_FOUND");

}

/**
 * Vérifie si un matricule existe
 * chez les agents ou les étudiants.
 */
export async function checkMatricule(matricule) {

    console.log("Recherche :", matricule);

    const collections = [
        "agents",
        "etudiants"
    ];

    for (const collectionName of collections) {

        const snapshot = await getDocs(

            


            query(

                collection(db, collectionName),

                where("matricule", "==", matricule)

            )

        );
        const all = await getDocs(collection(db, collectionName));
        all.forEach(doc => {

    console.log(doc.id, doc.data());

});

        console.log(collectionName, snapshot.size);

        if (!snapshot.empty) {

            return true;

        }

    }

    return false;

}

/* ===========================
   ACTIVATION
=========================== */

function maskEmail(email) {

    const [nom, domaine] = email.split("@");

    return (
        nom.substring(0, 2) +
        "*".repeat(Math.max(1, nom.length - 2)) +
        "@" +
        domaine
    );

}

function maskPhone(phone) {

    const numero = phone.toString();

    return (
        numero.substring(0, 2) +
        " *** ** " +
        numero.substring(numero.length - 2)
    );

}

export async function getActivationInfos(matricule) {

    const user = await findUserByMatricule(matricule);

    return {

        email: maskEmail(user.email),

        phone: maskPhone(user.telephone)

    };

}

export async function findUser(matricule) {

    const collections = [
        "agents",
        "etudiants"
    ];

    for (const collectionName of collections) {

        const snapshot = await getDocs(

            query(

                collection(db, collectionName),

                where("matricule", "==", matricule)

            )

        );

        if (!snapshot.empty) {

            return {

                ...snapshot.docs[0].data(),

                collection: collectionName

            };

        }

    }

    throw new Error("USER_NOT_FOUND");

}