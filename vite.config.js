import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),

        login: resolve(__dirname, "src/auth/login.html"),
        activateAccount: resolve(__dirname, "src/auth/activate-account.html"),
        activationCode: resolve(__dirname, "src/auth/activation-code.html"),
        activationMethod: resolve(__dirname, "src/auth/activation-method.html"),
        createPassword: resolve(__dirname, "src/auth/create-password.html"),

        agentDashboard: resolve(__dirname, "src/dashboards/agent/dashboard.html"),
        etudiantDashboard: resolve(__dirname, "src/dashboards/etudiant/dashboard.html"),

        etudiantIndex: resolve(__dirname, "src/modules/etudiant/dashboard/index.html"),

        demandes: resolve(__dirname, "src/modules/hebergement/demandes/index.html"),
        anciensBons: resolve(__dirname, "src/modules/hebergement/anciens-bons/index.html"),
        historiqueDemandes: resolve(__dirname, "src/modules/hebergement/historique-demandes/index.html"),
        tableauDeBord: resolve(__dirname, "src/modules/hebergement/tableau-de-bord/index.html")
      }
    }
  }
});