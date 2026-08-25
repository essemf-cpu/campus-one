import { requireRole } from "../../auth/authGuard.js";


requireRole(
    "etudiant",
    async ({ profile }) => {

        // =====================================================
        // INTERFACE
        // =====================================================

        const page =
            document.getElementById(
                "medical-page"
            );


        if (!page) {
            return;
        }


        // =====================================================
        // INITIALISATION
        // =====================================================

        page.innerHTML = `

            <!-- ================================================
                 HEADER
            ================================================= -->

            <header class="medical-header">

                <a
                    href="../../modules/etudiant/dashboard/index.html"
                    class="back-button"
                    aria-label="Retour">

                    <i class="fa-solid fa-arrow-left"></i>

                </a>


                <div class="medical-header-title">

                    <span>
                        Fiche médicale
                    </span>

                </div>

            </header>


            <!-- ================================================
                 INTRODUCTION
            ================================================= -->

            <section class="medical-intro">

                <div class="medical-icon">

                    <i class="fa-solid fa-notes-medical"></i>

                </div>


                <h1>
                    Ma fiche médicale
                </h1>


                <p>
                    Ces informations permettent au service médical
                    de mieux vous accompagner en cas de besoin.
                </p>

            </section>


            <!-- ================================================
                 ÉTAT DE LA FICHE
            ================================================= -->

            <section class="medical-status-card">

                <div class="status-icon">

                    <i class="fa-solid fa-circle-info"></i>

                </div>


                <div>

                    <strong>
                        Fiche médicale
                    </strong>

                    <p id="medical-status">
                        À renseigner
                    </p>

                </div>

            </section>


            <!-- ================================================
                 FORMULAIRE
            ================================================= -->

            <form
                id="medical-form"
                novalidate>


                <!-- ============================================
                     INFORMATIONS GÉNÉRALES
                ============================================== -->

                <section class="medical-card">

                    <div class="section-title">

                        <div class="section-title-icon">

                            <i class="fa-solid fa-droplet"></i>

                        </div>

                        <div>

                            <h2>
                                Informations générales
                            </h2>

                            <p>
                                Informations médicales de base
                            </p>

                        </div>

                    </div>


                    <!-- Groupe sanguin -->

                    <div class="form-group">

                        <label for="groupe-sanguin">
                            Groupe sanguin
                        </label>


                        <select
                            id="groupe-sanguin"
                            name="groupeSanguin">

                            <option value="">
                                Sélectionner
                            </option>

                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="inconnu">
                                Je ne connais pas mon groupe
                            </option>

                        </select>

                    </div>


                    <!-- Allergies -->

                    <div class="form-group">

                        <label>
                            Allergies
                        </label>


                        <div class="checkbox-list">

                            <label class="checkbox-item">

                                <input
                                    type="checkbox"
                                    name="allergies"
                                    value="aucune">

                                <span>
                                    Aucune allergie connue
                                </span>

                            </label>


                            <label class="checkbox-item">

                                <input
                                    type="checkbox"
                                    name="allergies"
                                    value="medicaments">

                                <span>
                                    Médicaments
                                </span>

                            </label>


                            <label class="checkbox-item">

                                <input
                                    type="checkbox"
                                    name="allergies"
                                    value="aliments">

                                <span>
                                    Aliments
                                </span>

                            </label>


                            <label class="checkbox-item">

                                <input
                                    type="checkbox"
                                    name="allergies"
                                    value="autres">

                                <span>
                                    Autres
                                </span>

                            </label>

                        </div>

                    </div>


                    <div class="form-group">

                        <label for="allergies-precision">
                            Précisions sur les allergies
                        </label>


                        <textarea
                            id="allergies-precision"
                            name="allergiesPrecision"
                            rows="3"
                            placeholder="Facultatif">
                        </textarea>

                    </div>

                </section>


                <!-- ============================================
                     ANTÉCÉDENTS
                ============================================== -->

                <section class="medical-card">

                    <div class="section-title">

                        <div class="section-title-icon">

                            <i class="fa-solid fa-heart-pulse"></i>

                        </div>

                        <div>

                            <h2>
                                Antécédents médicaux
                            </h2>

                            <p>
                                Informations importantes pour votre suivi
                            </p>

                        </div>

                    </div>


                    <div class="checkbox-list">

                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="aucun">

                            <span>
                                Aucun antécédent connu
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="asthme">

                            <span>
                                Asthme
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="diabete">

                            <span>
                                Diabète
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="epilepsie">

                            <span>
                                Épilepsie
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="drepanocytose">

                            <span>
                                Drépanocytose
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="cardiaque">

                            <span>
                                Maladie cardiaque
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="hypertension">

                            <span>
                                Hypertension
                            </span>

                        </label>


                        <label class="checkbox-item">

                            <input
                                type="checkbox"
                                name="antecedents"
                                value="autre">

                            <span>
                                Autre
                            </span>

                        </label>

                    </div>


                    <div class="form-group">

                        <label for="antecedents-precision">
                            Précisions
                        </label>


                        <textarea
                            id="antecedents-precision"
                            name="antecedentsPrecision"
                            rows="4"
                            placeholder="Facultatif">
                        </textarea>

                    </div>

                </section>


                <!-- ============================================
                     TRAITEMENT
                ============================================== -->

                <section class="medical-card">

                    <div class="section-title">

                        <div class="section-title-icon">

                            <i class="fa-solid fa-pills"></i>

                        </div>

                        <div>

                            <h2>
                                Traitement actuel
                            </h2>

                            <p>
                                Suivez-vous actuellement un traitement ?
                            </p>

                        </div>

                    </div>


                    <div class="radio-list">

                        <label class="radio-item">

                            <input
                                type="radio"
                                name="traitement"
                                value="non">

                            <span>
                                Non
                            </span>

                        </label>


                        <label class="radio-item">

                            <input
                                type="radio"
                                name="traitement"
                                value="oui">

                            <span>
                                Oui
                            </span>

                        </label>

                    </div>


                    <div
                        class="form-group"
                        id="traitement-details-group">

                        <label for="traitement-details">
                            Précisions sur le traitement
                        </label>


                        <textarea
                            id="traitement-details"
                            name="traitementDetails"
                            rows="4"
                            placeholder="Nom du traitement, fréquence, etc.">
                        </textarea>

                    </div>

                </section>


                <!-- ============================================
                     CONTACT D'URGENCE
                ============================================== -->

                <section class="medical-card emergency-card">

                    <div class="section-title">

                        <div class="section-title-icon emergency-icon">

                            <i class="fa-solid fa-triangle-exclamation"></i>

                        </div>

                        <div>

                            <h2>
                                Contact d'urgence
                            </h2>

                            <p>
                                Personne à contacter en cas de besoin
                            </p>

                        </div>

                    </div>


                    <div class="form-group">

                        <label for="urgence-nom">
                            Nom complet
                        </label>

                        <input
                            type="text"
                            id="urgence-nom"
                            name="urgenceNom"
                            placeholder="Nom et prénom">

                    </div>


                    <div class="form-group">

                        <label for="urgence-lien">
                            Lien avec l'étudiant
                        </label>


                        <select
                            id="urgence-lien"
                            name="urgenceLien">

                            <option value="">
                                Sélectionner
                            </option>

                            <option value="pere">
                                Père
                            </option>

                            <option value="mere">
                                Mère
                            </option>

                            <option value="frere">
                                Frère
                            </option>

                            <option value="soeur">
                                Sœur
                            </option>

                            <option value="tuteur">
                                Tuteur
                            </option>

                            <option value="conjoint">
                                Conjoint(e)
                            </option>

                            <option value="autre">
                                Autre
                            </option>

                        </select>

                    </div>


                    <div class="form-group">

                        <label for="urgence-telephone">
                            Numéro de téléphone
                        </label>


                        <input
                            type="tel"
                            id="urgence-telephone"
                            name="urgenceTelephone"
                            placeholder="Téléphone">

                    </div>

                </section>


                <!-- ============================================
                     INFORMATIONS COMPLÉMENTAIRES
                ============================================== -->

                <section class="medical-card">

                    <div class="section-title">

                        <div class="section-title-icon">

                            <i class="fa-solid fa-file-medical"></i>

                        </div>

                        <div>

                            <h2>
                                Informations complémentaires
                            </h2>

                            <p>
                                Une information importante à signaler ?
                            </p>

                        </div>

                    </div>


                    <div class="form-group">

                        <textarea
                            id="informations-complementaires"
                            name="informationsComplementaires"
                            rows="5"
                            placeholder="Vous pouvez ajouter toute information médicale utile...">
                        </textarea>

                    </div>

                </section>


                <!-- ============================================
                     CONFIDENTIALITÉ
                ============================================== -->

                <section class="medical-privacy-card">

                    <div class="privacy-icon">

                        <i class="fa-solid fa-lock"></i>

                    </div>


                    <div class="privacy-content">

                        <h3>
                            Confidentialité
                        </h3>


                        <p>
                            Les informations renseignées dans cette
                            fiche sont des données médicales
                            confidentielles.
                        </p>


                        <p>
                            Elles sont destinées exclusivement aux
                            personnes habilitées du service médical
                            de Campus One.
                        </p>

                    </div>

                </section>


                <!-- ============================================
                     CONSENTEMENT
                ============================================== -->

                <label class="consent-item">

                    <input
                        type="checkbox"
                        id="consentement"
                        name="consentement">

                    <span>
                        J'autorise l'enregistrement de ces
                        informations dans ma fiche médicale.
                    </span>

                </label>


                <!-- ============================================
                     BOUTON
                ============================================== -->

                <button
                    type="submit"
                    id="save-medical-btn"
                    class="primary-btn">

                    <i class="fa-solid fa-floppy-disk"></i>

                    Enregistrer ma fiche médicale

                </button>


            </form>


            <!-- ================================================
                 NAVIGATION BASSE
            ================================================= -->

            <nav class="ios-navbar">

                <a
                    href="../../modules/etudiant/dashboard/index.html"
                    aria-label="Accueil">

                    <i class="fa-solid fa-house"></i>

                </a>


                <a
                    href="../../modules/etudiant/notifications/index.html"
                    aria-label="Notifications">

                    <i class="fa-solid fa-bell"></i>

                </a>


                <a
                    href="#"
                    class="active"
                    aria-label="Fiche médicale">

                    <i class="fa-solid fa-notes-medical"></i>

                </a>

            </nav>

        `;


        // =====================================================
        // TRAITEMENT — AFFICHAGE DES DÉTAILS
        // =====================================================

        const traitementRadios =
            document.querySelectorAll(
                'input[name="traitement"]'
            );


        const traitementDetailsGroup =
            document.getElementById(
                "traitement-details-group"
            );


        traitementRadios.forEach(
            (radio) => {

                radio.addEventListener(
                    "change",
                    () => {

                        traitementDetailsGroup.classList.toggle(
                            "visible",
                            radio.value === "oui" &&
                            radio.checked
                        );

                    }
                );

            }
        );


        // =====================================================
        // CHECKBOX "AUCUN"
        // =====================================================

        function gererCheckboxAucun(
            name
        ) {

            const checkboxes =
                document.querySelectorAll(
                    `input[name="${name}"]`
                );


            checkboxes.forEach(
                (checkbox) => {

                    checkbox.addEventListener(
                        "change",
                        () => {

                            if (
                                checkbox.value ===
                                "aucune" ||
                                checkbox.value ===
                                "aucun"
                            ) {

                                if (
                                    checkbox.checked
                                ) {

                                    checkboxes.forEach(
                                        (other) => {

                                            if (
                                                other !==
                                                checkbox
                                            ) {

                                                other.checked =
                                                    false;

                                            }

                                        }
                                    );

                                }

                            } else if (
                                checkbox.checked
                            ) {

                                const aucun =
                                    [...checkboxes]
                                        .find(
                                            item =>
                                                item.value ===
                                                "aucune" ||
                                                item.value ===
                                                "aucun"
                                        );


                                if (aucun) {
                                    aucun.checked =
                                        false;
                                }

                            }

                        }
                    );

                }
            );

        }


        gererCheckboxAucun(
            "allergies"
        );


        gererCheckboxAucun(
            "antecedents"
        );


        // =====================================================
        // SOUMISSION — POUR L'INSTANT TEST LOCAL
        // =====================================================

        const form =
            document.getElementById(
                "medical-form"
            );


        form.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                const consentement =
                    document.getElementById(
                        "consentement"
                    );


                if (
                    !consentement.checked
                ) {

                    alert(
                        "Veuillez accepter l'enregistrement de votre fiche médicale."
                    );

                    return;

                }


                const status =
                    document.getElementById(
                        "medical-status"
                    );


                if (status) {

                    status.textContent =
                        "Fiche prête à être enregistrée";

                }


                alert(
                    "La fiche médicale est prête. La connexion à la base de données sera ajoutée à l'étape suivante."
                );

            }
        );


        // =====================================================
        // AFFICHAGE
        // =====================================================

        document.body.classList.add(
            "loaded"
        );

    }
);