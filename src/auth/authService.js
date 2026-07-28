import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";

/**
 * Connexion
 */
export async function login(email, password) {
  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

/**
 * Déconnexion
 */
export async function logout() {
  return await signOut(auth);
}

/**
 * Mot de passe oublié
 */
export async function forgotPassword(email) {
  return await sendPasswordResetEmail(
    auth,
    email
  );
}

export async function findUserByMatricule(matricule) {

    const q = query(
        collection(db, "agents"),
        where("matricule", "==", matricule)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        throw new Error("USER_NOT_FOUND");
    }

    return snapshot.docs[0].data();

}

export async function checkMatricule(matricule) {

    const q = query(
        collection(db, "agents"),
        where("matricule", "==", matricule)
    );

    const snapshot = await getDocs(q);

    return !snapshot.empty;

}

function maskEmail(email) {

    const [nom, domaine] = email.split("@");

    const debut = nom.substring(0, 2);

    return debut + "*".repeat(Math.max(1, nom.length - 2)) + "@" + domaine;

}

function maskPhone(phone) {

    const numero = phone.toString();

    return numero.substring(0, 2)
        + " *** ** "
        + numero.substring(numero.length - 2);

}

export async function getActivationInfos(matricule) {

    const agent = await findUserByMatricule(matricule);

    return {

        email: maskEmail(agent.email),
        phone: maskPhone(agent.telephone),

    };

}