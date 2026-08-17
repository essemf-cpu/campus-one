import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase.js";
import { getSession } from "./sessionManager.js";

export async function requireRole(expectedRole, callback) {

    try {

        const session = await getSession();

        if (!session) {

            window.location.href = "/src/auth/login.html";
            return;

        }

        const {
    account,
    profile,
    anneeAcademique
} = session;

        if (account.role !== expectedRole) {

            window.location.href = "/src/403.html";
            return;

        }

        await callback({
            account,
            profile,
            anneeAcademique
        });

    } catch (error) {

    console.error("AUTHGUARD", error);
    debugger;
    throw error;

}

}