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

    if (!accountSnap.exists()) {
        throw new Error("ACCOUNT_NOT_FOUND");
    }

    const account = accountSnap.data();

    const profileRef = doc(db, account.profile);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
        throw new Error("PROFILE_NOT_FOUND");
    }

    currentUserCache = {

        account,
        profile: profileSnap.data()

    };

    return currentUserCache;

}

export function clearCurrentUserCache() {

    currentUserCache = null;

}

/**
 * Recherche un utilisateur par matricule
 */
export async function findUserByMatricule(
    matricule,
    collectionName = "agents"
) {

    const snapshot = await getDocs(

        query(

            collection(db, collectionName),

            where("matricule", "==", matricule)

        )

    );

    if (snapshot.empty) {

        throw new Error("USER_NOT_FOUND");

    }

    return snapshot.docs[0].data();

}

/**
 * Vérifie si un matricule existe
 */
export async function checkMatricule(
    matricule,
    collectionName = "agents"
) {

    const snapshot = await getDocs(

        query(

            collection(db, collectionName),

            where("matricule", "==", matricule)

        )

    );

    return !snapshot.empty;

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

export async function getActivationInfos(
    matricule,
    collectionName = "agents"
) {

    const user = await findUserByMatricule(
        matricule,
        collectionName
    );

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