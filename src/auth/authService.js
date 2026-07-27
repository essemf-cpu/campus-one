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