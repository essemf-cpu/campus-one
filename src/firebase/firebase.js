import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDxMwlH0n3H0vyq9q7_vhP3_DLkwsB4spU",
  authDomain: "campus-one-2af72.firebaseapp.com",
  projectId: "campus-one-2af72",
  storageBucket: "campus-one-2af72.firebasestorage.app",
  messagingSenderId: "776181789599",
  appId: "1:776181789599:web:ff51e9479c50df288783aa"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };