import"../../../modulepreload-polyfill-Dezn_h7o.js";import{d as e,f as t,g as n,s as r,u as i,v as a,y as o}from"../../../authService-DlvHUxoR.js";import{t as s}from"../../../authGuard-CR_v3-ld.js";s(`etudiant`,async({profile:s})=>{let c=document.getElementById(`reclamation-content`),l=await r(),u=l?.anneeAcademique||sessionStorage.getItem(`anneeAcademique`);if(console.log(`📅 Année académique réclamation =`,u),console.log(`🔐 Mode session =`,l?.mode),console.log(`🔒 Lecture seule =`,l?.lectureSeule),l?.lectureSeule===!0){c.innerHTML=`

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

            `;return}let f=n(o(i,`hebergements`),a(`matricule`,`==`,d),a(`anneeAcademique`,`==`,u)),p;try{p=await t(f)}catch(e){console.error(`❌ Erreur récupération hébergement :`,e),c.innerHTML=`

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

        `;let h=document.getElementById(`type-probleme`),g=document.getElementById(`localisation-group`),_=document.getElementById(`localisation`),v=document.getElementById(`probleme-group`),y=document.getElementById(`probleme`),b={plomberie:[`Chambre`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],electricite:[`Chambre`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],menuiserie:[`Porte de la chambre`,`Porte des toilettes gauche`,`Porte des toilettes droite`,`Porte de la douche gauche`,`Porte de la douche droite`,`Lit`,`Armoire`],peinture:[`Mur de la chambre`,`Plafond`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],mobilier:[`Lit`,`Armoire`,`Bureau`,`Chaise`],maconnerie:[`Mur de la chambre`,`Plafond`,`Sol`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`]},x={plomberie:{Chambre:[`Fuite au robinet`,`Fuite au lavabo`,`Lavabo bouché`,`Évacuation du lavabo bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Toilettes gauche":[`Fuite au robinet`,`Chasse d'eau défectueuse`,`Fuite au niveau de la chasse d'eau`,`WC bouché`,`Lavabo bouché`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Toilettes droite":[`Fuite au robinet`,`Chasse d'eau défectueuse`,`Fuite au niveau de la chasse d'eau`,`WC bouché`,`Lavabo bouché`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Douche gauche":[`Robinet défectueux`,`Douchette défectueuse`,`Fuite au robinet`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Douche droite":[`Robinet défectueux`,`Douchette défectueuse`,`Fuite au robinet`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`]},electricite:{Chambre:[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Prise électrique sans courant`,`Court-circuit`,`Coupure d'électricité`],"Toilettes gauche":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Coupure d'électricité`],"Toilettes droite":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Coupure d'électricité`],"Douche gauche":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Coupure d'électricité`],"Douche droite":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Coupure d'électricité`]},menuiserie:{"Porte de la chambre":[`Serrure à réparer`,`Serrure à remplacer`,`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte qui ne s'ouvre pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte des toilettes gauche":[`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Loquet extérieur à réparer`,`Loquet extérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte des toilettes droite":[`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Loquet extérieur à réparer`,`Loquet extérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte de la douche gauche":[`Loquet à réparer`,`Loquet à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte de la douche droite":[`Loquet à réparer`,`Loquet à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],Lit:[`Structure du lit endommagée`,`Pied du lit endommagé`,`Sommier endommagé`,`Lit instable`,`Lit inutilisable`],Armoire:[`Porte d'armoire endommagée`,`Charnière défectueuse`,`Serrure défectueuse`,`Poignée cassée`,`Armoire instable`]},peinture:{"Mur de la chambre":[`Peinture écaillée`,`Mur taché`,`Mur dégradé`,`Traces d'humidité`,`Peinture complètement détériorée`],Plafond:[`Peinture écaillée`,`Traces d'humidité`,`Plafond taché`,`Peinture détériorée`],"Toilettes gauche":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Toilettes droite":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Douche gauche":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Douche droite":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`]},mobilier:{Lit:[`Structure du lit endommagée`,`Pied du lit cassé`,`Sommier endommagé`,`Lit instable`,`Lit inutilisable`],Armoire:[`Porte d'armoire endommagée`,`Charnière défectueuse`,`Serrure défectueuse`,`Poignée cassée`,`Armoire instable`],Bureau:[`Plateau endommagé`,`Pied cassé`,`Bureau instable`],Chaise:[`Assise endommagée`,`Pied cassé`,`Chaise instable`]},maconnerie:{"Mur de la chambre":[`Mur fissuré`,`Mur endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`],Plafond:[`Plafond fissuré`,`Plafond endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`],Sol:[`Carrelage cassé`,`Carrelage décollé`,`Sol endommagé`],"Toilettes gauche":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Toilettes droite":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Douche gauche":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Douche droite":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`]}};h.addEventListener(`change`,()=>{let e=h.value;if(_.innerHTML=`
                    <option value="">
                        Sélectionner une localisation
                    </option>
                `,y.innerHTML=`
                    <option value="">
                        Sélectionner un problème
                    </option>
                `,v.style.display=`none`,!e){g.style.display=`none`;return}b[e].forEach(e=>{_.innerHTML+=`
                            <option value="${e}">
                                ${e}
                            </option>
                        `}),g.style.display=`block`}),_.addEventListener(`change`,()=>{let e=h.value,t=_.value;if(y.innerHTML=`
                    <option value="">
                        Sélectionner un problème
                    </option>
                `,!e||!t||!x[e]||!x[e][t]){v.style.display=`none`;return}x[e][t].forEach(e=>{y.innerHTML+=`
                            <option value="${e}">
                                ${e}
                            </option>
                        `}),v.style.display=`block`});let S=document.getElementById(`envoyer-demande-btn`);S.addEventListener(`click`,async()=>{if((await r())?.lectureSeule===!0){alert(`Cette année académique est clôturée. Vous ne pouvez plus effectuer de nouvelle réclamation.`);return}let t=h.value,n=_.value,a=y.value;if(!t||!n||!a){alert(`Veuillez sélectionner le type, la localisation et le problème.`);return}try{S.disabled=!0,S.innerHTML=`
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        Envoi en cours...
                    `,await e(o(i,`demandes_etudiants`),{matricule:s.matricule,numeroEtudiant:s.numeroEtudiant||s.matricule,prenom:s.prenom,nom:s.nom,anneeAcademique:u,site:m.site,pavillon:m.pavillon,chambre:m.chambre,lit:m.lit,type:t,localisation:n,probleme:a,date:new Date,statut:`en_attente`,notificationVue:!1}),alert(`Votre demande a été envoyée avec succès.`)}catch(e){console.error(`❌ Erreur envoi demande :`,e),alert(`Impossible d'envoyer la demande. Veuillez réessayer.`)}finally{S.disabled=!1,S.innerHTML=`
                        <i class="fa-solid fa-paper-plane"></i>
                        Envoyer la demande
                    `}})});