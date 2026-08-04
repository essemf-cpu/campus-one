import {
    collection,
    getDocs,
    query,
    orderBy
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";

export async function getBons() {

    const q = query(

        collection(db, "bons"),

        orderBy("date", "desc")

    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({

        id: doc.id,

        ...doc.data()

    }));

}