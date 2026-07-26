import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";

import { auth } from "../firebase/firebase.js";

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