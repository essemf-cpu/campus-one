import {
    collection,
    getDocs
} from "firebase/firestore";

import { db } from "../firebase/firebase.js";

// =====================================================
// CACHE DES RÉFÉRENTIELS
// =====================================================

const cache = new Map();
const pending = new Map();

async function getReferentiel(
    collectionName
) {

    if (cache.has(collectionName)) {
        return cache.get(collectionName);
    }

    // Évite deux requêtes simultanées
    // pour la même collection.
    if (pending.has(collectionName)) {
        return pending.get(collectionName);
    }

    const request =
        getDocs(
            collection(
                db,
                collectionName
            )
        )
            .then(snapshot => {

                const data =
                    snapshot.docs.map(
                        document => ({
                            id: document.id,
                            ...document.data()
                        })
                    );

                cache.set(
                    collectionName,
                    data
                );

                return data;
            })
            .finally(() => {

                pending.delete(
                    collectionName
                );
            });

    pending.set(
        collectionName,
        request
    );

    return request;
}

// =====================================================
// TYPES DE TRAVAUX
// =====================================================

export function getTypesTravaux() {

    return getReferentiel(
        "typesTravaux"
    );

}

// =====================================================
// PAVILLONS
// =====================================================

export function getPavillons() {

    return getReferentiel(
        "pavillons"
    );

}

// =====================================================
// SITES
// =====================================================

export function getSites() {

    return getReferentiel(
        "sites"
    );

}

// =====================================================
// ATELIERS
// =====================================================

export function getAteliers() {

    return getReferentiel(
        "ateliers"
    );

}

// =====================================================
// VIDER LE CACHE
// =====================================================

export function clearReferentielCache() {

    cache.clear();

}