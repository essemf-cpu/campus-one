import"../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,f as t,h as n,l as r,u as i,v as a}from"../../../authService-D_VO4Eli.js";import{t as o}from"../../../sessionManager-ruQTA9XT.js";import{t as s}from"../../../authGuard-CQaJ0AEA.js";s(`etudiant`,async({profile:s})=>{let c=document.getElementById(`reclamation-content`),l=await o(),u=l?.anneeAcademique||sessionStorage.getItem(`anneeAcademique`);if(console.log(`📅 Année académique réclamation =`,u),console.log(`🔐 Mode session =`,l?.mode),console.log(`🔒 Lecture seule =`,l?.lectureSeule),l?.lectureSeule===!0){c.innerHTML=`

                <div
                    class="reclamation-unavailable"
                >

                    <div
                        class="
                            reclamation-unavailable-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-lock
                            "
                        ></i>

                    </div>


                    <h1>
                        Année académique clôturée
                    </h1>


                    <p>
                        Cette année académique est désormais
                        accessible uniquement en consultation.
                    </p>


                    <p>
                        Vous pouvez consulter l'historique
                        de vos demandes, mais vous ne pouvez
                        plus effectuer de nouvelle réclamation.
                    </p>

                </div>

            `;return}let d=s.matricule;if(!d){c.innerHTML=`

                <div
                    class="reclamation-unavailable"
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Service momentanément indisponible.
                    </p>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;return}let f=n(e(r,`hebergements`),a(`matricule`,`==`,d),a(`anneeAcademique`,`==`,u)),p;try{p=await t(f)}catch(e){console.error(`❌ Erreur récupération hébergement :`,e),c.innerHTML=`

                <div
                    class="
                        reclamation-unavailable
                    "
                >

                    <h1>
                        Service momentanément indisponible
                    </h1>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;return}if(p.empty){c.innerHTML=`

                <div
                    class="
                        reclamation-unavailable
                    "
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Service momentanément indisponible.
                    </p>

                    <p>
                        Veuillez réessayer ultérieurement.
                    </p>

                </div>

            `;return}let m=p.docs[0].data();c.innerHTML=`

            <div class="reclamation-header">

                <h1>
                    Faire une demande de réclamation
                </h1>

                <p>
                    Signalez un problème dans votre hébergement.
                </p>

            </div>


            <div class="reclamation-card">

                <div class="reclamation-section">

                    <h2>
                        Problème rencontré
                    </h2>


                    <!-- =========================================
                         TYPE DE PROBLÈME
                    ========================================== -->

                    <div class="form-group">

                        <label for="type-probleme">
                            Type de problème
                        </label>

                        <select
                            id="type-probleme"
                        >

                            <option value="">
                                Sélectionner un type
                            </option>

                            <option value="plomberie">
                                Plomberie
                            </option>

                            <option value="electricite">
                                Électricité
                            </option>

                            <option value="menuiserie">
                                Menuiserie
                            </option>

                            <option value="peinture">
                                Peinture
                            </option>

                            <option value="mobilier">
                                Mobilier / équipement
                            </option>

                            <option value="maconnerie">
                                Maçonnerie
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         LOCALISATION
                    ========================================== -->

                    <div
                        class="form-group"
                        id="localisation-group"
                        style="display: none;"
                    >

                        <label for="localisation">
                            Localisation du problème
                        </label>

                        <select
                            id="localisation"
                        >

                            <option value="">
                                Sélectionner une localisation
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         NIVEAU / ÉTAGE
                    ========================================== -->

                    <div
                        class="form-group"
                        id="niveau-group"
                        style="display: none;"
                    >

                        <label for="niveau">
                            Niveau / étage
                        </label>

                        <select
                            id="niveau"
                        >

                            <option value="">
                                Sélectionner le niveau
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         CÔTÉ
                    ========================================== -->

                    <div
                        class="form-group"
                        id="cote-group"
                        style="display: none;"
                    >

                        <label for="cote">
                            Côté
                        </label>

                        <select
                            id="cote"
                        >

                            <option value="">
                                Sélectionner un côté
                            </option>

                            <option value="Gauche">
                                Gauche
                            </option>

                            <option value="Droite">
                                Droite
                            </option>

                        </select>

                    </div>


                    <!-- =========================================
                         PROBLÈME
                    ========================================== -->

                    <div
                        class="form-group"
                        id="probleme-group"
                        style="display: none;"
                    >

                        <label for="probleme">
                            Problème
                        </label>

                        <select
                            id="probleme"
                        >

                            <option value="">
                                Sélectionner un problème
                            </option>

                        </select>

                    </div>

                </div>


                <button
                    id="envoyer-demande-btn"
                    class="
                        reclamation-button
                        reclamation-button-primary
                    "
                    type="button"
                >

                    <i
                        class="
                            fa-solid
                            fa-paper-plane
                        "
                    ></i>

                    Envoyer la demande

                </button>

            </div>

        `;let h=document.getElementById(`type-probleme`),g=document.getElementById(`localisation-group`),_=document.getElementById(`localisation`),v=document.getElementById(`niveau-group`),y=document.getElementById(`niveau`),b=document.getElementById(`cote-group`),x=document.getElementById(`cote`),S=document.getElementById(`probleme-group`),C=document.getElementById(`probleme`),w=[`RDC`,`1er`,`2e`,`3e`,`4e`],T={plomberie:[`Chambre`,`Toilettes`,`Couloir`,`Escalier`],electricite:[`Chambre`,`Toilettes`,`Couloir`,`Escalier`],menuiserie:[`Chambre`,`Toilettes`,`Couloir`,`Escalier`],peinture:[`Chambre`,`Toilettes`,`Couloir`,`Escalier`],mobilier:[`Chambre`,`Couloir`,`Escalier`],maconnerie:[`Chambre`,`Toilettes`,`Couloir`,`Escalier`]},E={plomberie:{Chambre:[`Fuite au robinet`,`Fuite au lavabo`,`Lavabo bouché`,`Évacuation du lavabo bouchée`,`Canalisation qui fuit`,`Absence d'eau`,`Autre`],Toilettes:[`Fuite au robinet`,`Chasse d'eau défectueuse`,`Fuite au niveau de la chasse d'eau`,`WC bouché`,`Lavabo bouché`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`,`Autre`],Couloir:[`Fuite d'eau`,`Canalisation qui fuit`,`Présence d'eau au sol`,`Infiltration d'eau`,`Absence d'eau`,`Autre`],Escalier:[`Fuite d'eau`,`Canalisation qui fuit`,`Présence d'eau au sol`,`Infiltration d'eau`,`Autre`]},electricite:{Chambre:[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Prise électrique sans courant`,`Court-circuit`,`Coupure d'électricité`,`Autre`],Toilettes:[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Coupure d'électricité`,`Autre`],Couloir:[`Ampoule défectueuse`,`Éclairage du couloir défectueux`,`Interrupteur défectueux`,`Coupure d'électricité`,`Autre`],Escalier:[`Ampoule défectueuse`,`Éclairage de l'escalier défectueux`,`Interrupteur défectueux`,`Coupure d'électricité`,`Autre`]},menuiserie:{Chambre:[`Serrure à réparer`,`Serrure à remplacer`,`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte qui ne s'ouvre pas correctement`,`Porte endommagée`,`Charnière défectueuse`,`Lit endommagé`,`Armoire endommagée`,`Autre`],Toilettes:[`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Loquet extérieur à réparer`,`Loquet extérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`,`Autre`],Couloir:[`Porte endommagée`,`Serrure défectueuse`,`Poignée défectueuse`,`Charnière défectueuse`,`Porte qui ne ferme pas correctement`,`Porte qui ne s'ouvre pas correctement`,`Autre`],Escalier:[`Porte endommagée`,`Serrure défectueuse`,`Poignée défectueuse`,`Charnière défectueuse`,`Porte qui ne ferme pas correctement`,`Autre`]},peinture:{Chambre:[`Peinture écaillée`,`Mur taché`,`Mur dégradé`,`Traces d'humidité`,`Peinture complètement détériorée`,`Autre`],Toilettes:[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`,`Autre`],Couloir:[`Peinture écaillée`,`Mur taché`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`,`Autre`],Escalier:[`Peinture écaillée`,`Mur taché`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`,`Autre`]},mobilier:{Chambre:[`Structure du lit endommagée`,`Pied du lit cassé`,`Sommier endommagé`,`Lit instable`,`Lit inutilisable`,`Porte d'armoire endommagée`,`Charnière défectueuse`,`Serrure défectueuse`,`Poignée cassée`,`Armoire instable`,`Plateau de bureau endommagé`,`Bureau instable`,`Assise de chaise endommagée`,`Chaise instable`,`Autre`],Couloir:[`Mobilier endommagé`,`Équipement endommagé`,`Mobilier instable`,`Autre`],Escalier:[`Mobilier endommagé`,`Équipement endommagé`,`Autre`]},maconnerie:{Chambre:[`Mur fissuré`,`Mur endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`,`Carrelage cassé`,`Carrelage décollé`,`Sol endommagé`,`Autre`],Toilettes:[`Mur fissuré`,`Mur endommagé`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`,`Trace importante d'humidité`,`Autre`],Couloir:[`Mur fissuré`,`Mur endommagé`,`Carrelage cassé`,`Carrelage décollé`,`Sol endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`,`Autre`],Escalier:[`Mur fissuré`,`Mur endommagé`,`Carrelage cassé`,`Carrelage décollé`,`Sol endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`,`Autre`]}};h.addEventListener(`change`,()=>{let e=h.value;_.innerHTML=`
                    <option value="">
                        Sélectionner une localisation
                    </option>
                `,y.innerHTML=`
                    <option value="">
                        Sélectionner le niveau
                    </option>
                `,x.value=``,C.innerHTML=`
                    <option value="">
                        Sélectionner un problème
                    </option>
                `,g.style.display=`none`,v.style.display=`none`,b.style.display=`none`,S.style.display=`none`,e&&(T[e].forEach(e=>{_.innerHTML+=`
                            <option value="${e}">
                                ${e}
                            </option>
                        `}),g.style.display=`block`)}),_.addEventListener(`change`,()=>{let e=h.value,t=_.value;y.innerHTML=`
                    <option value="">
                        Sélectionner le niveau
                    </option>
                `,x.value=``,C.innerHTML=`
                    <option value="">
                        Sélectionner un problème
                    </option>
                `,v.style.display=`none`,b.style.display=`none`,S.style.display=`none`,!(!e||!t)&&((t===`Toilettes`||t===`Couloir`||t===`Escalier`)&&(w.forEach(e=>{y.innerHTML+=`
                                <option value="${e}">
                                    ${e}
                                </option>
                            `}),v.style.display=`block`),t===`Toilettes`&&(b.style.display=`block`),t===`Chambre`&&D(e,t))}),y.addEventListener(`change`,()=>{let e=h.value,t=_.value;if(!e||!t||!y.value){S.style.display=`none`;return}if(t===`Toilettes`&&!x.value){S.style.display=`none`;return}D(e,t)}),x.addEventListener(`change`,()=>{let e=h.value,t=_.value;if(!e||!t||!x.value){S.style.display=`none`;return}if(t===`Toilettes`&&!y.value){S.style.display=`none`;return}D(e,t)});function D(e,t){if(C.innerHTML=`
                <option value="">
                    Sélectionner un problème
                </option>
            `,!e||!t||!E[e]||!E[e][t]){S.style.display=`none`;return}E[e][t].forEach(e=>{C.innerHTML+=`
                        <option value="${e}">
                            ${e}
                        </option>
                    `}),S.style.display=`block`}let O=document.getElementById(`envoyer-demande-btn`);O.addEventListener(`click`,async()=>{if((await o())?.lectureSeule===!0){alert(`Cette année académique est clôturée. Vous ne pouvez plus effectuer de nouvelle réclamation.`);return}let t=h.value,n=_.value,a=y.value,c=x.value,l=C.value;if(!t){alert(`Veuillez sélectionner le type de problème.`);return}if(!n){alert(`Veuillez sélectionner la localisation du problème.`);return}if((n===`Toilettes`||n===`Couloir`||n===`Escalier`)&&!a){alert(`Veuillez sélectionner le niveau / étage.`);return}if(n===`Toilettes`&&!c){alert(`Veuillez sélectionner le côté.`);return}if(!l){alert(`Veuillez sélectionner le problème.`);return}try{O.disabled=!0,O.innerHTML=`
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Envoi en cours...
                    `,await i(e(r,`demandes_etudiants`),{matricule:s.matricule,numeroEtudiant:s.numeroEtudiant||s.matricule,prenom:s.prenom,nom:s.nom,anneeAcademique:u,site:m.site,pavillon:m.pavillon,chambre:m.chambre,lit:m.lit,type:t,localisation:n,niveau:a||``,cote:c||``,probleme:l,date:new Date,statut:`en_attente`,notificationVue:!1}),alert(`Votre demande a été envoyée avec succès.`)}catch(e){console.error(`❌ Erreur envoi demande :`,e),alert(`Impossible d'envoyer la demande. Veuillez réessayer.`)}finally{O.disabled=!1,O.innerHTML=`
                        <i class="fa-solid fa-paper-plane"></i>
                        Envoyer la demande
                    `}})});