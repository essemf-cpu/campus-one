import { defineConfig } from "vite";
import { resolve, relative } from "path";
import { readdirSync } from "fs";


// ==================================================
// RECHERCHE AUTOMATIQUE DES FICHIERS HTML
// ==================================================

function findHtmlFiles(directory) {

    const files = [];

    for (const entry of readdirSync(directory, {
        withFileTypes: true
    })) {

        const fullPath = resolve(
            directory,
            entry.name
        );

        if (entry.isDirectory()) {

            files.push(
                ...findHtmlFiles(fullPath)
            );

        } else if (
            entry.isFile() &&
            entry.name.endsWith(".html")
        ) {

            files.push(fullPath);

        }

    }

    return files;
}


// ==================================================
// DOSSIERS
// ==================================================

const rootDir = __dirname;

const srcDir = resolve(
    rootDir,
    "src"
);


// ==================================================
// CONSTRUCTION AUTOMATIQUE DES INPUTS
// ==================================================

const input = {};


// Page principale
input.main = resolve(
    rootDir,
    "index.html"
);


// Toutes les pages HTML présentes dans src/
const htmlFiles = findHtmlFiles(srcDir);

for (const file of htmlFiles) {

    const relativePath = relative(
        srcDir,
        file
    );

    const key = relativePath
        .replace(/\\/g, "/")
        .replace(/\.html$/i, "");

    input[key] = file;

}


// ==================================================
// CONFIGURATION VITE
// ==================================================

export default defineConfig({

    build: {

        outDir: "dist",

        rollupOptions: {

            input

        }

    }

});