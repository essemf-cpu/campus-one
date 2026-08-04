import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase.js";

export async function getTypesTravaux() {

    const snapshot = await getDocs(collection(db, "typesTravaux"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function getPavillons() {

    const snapshot = await getDocs(collection(db, "pavillons"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function getSites() {

    const snapshot = await getDocs(collection(db, "sites"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}

export async function getAteliers() {

    const snapshot = await getDocs(collection(db, "ateliers"));

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

}