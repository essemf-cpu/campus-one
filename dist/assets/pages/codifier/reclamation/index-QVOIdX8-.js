import"../../../modulepreload-polyfill-Dezn_h7o.js";import{f as e,g as t,l as n,u as r,v as i,y as a}from"../../../authService-DTiP6P1g.js";import{t as o}from"../../../authGuard-BnlEFo-L.js";o(`etudiant`,async({profile:o})=>{let s=document.getElementById(`reclamation-content`),c=o.matricule,l=await e(t(a(n,`hebergements`),i(`matricule`,`==`,c)));if(l.empty){s.innerHTML=`

                <div class="reclamation-unavailable">

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

            `;return}let u=l.docs[0].data();s.innerHTML=`

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

`;let d=document.getElementById(`type-probleme`),f=document.getElementById(`localisation-group`),p=document.getElementById(`localisation`),m=document.getElementById(`probleme-group`),h=document.getElementById(`probleme`),g={plomberie:[`Chambre`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],electricite:[`Chambre`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],menuiserie:[`Porte de la chambre`,`Porte des toilettes gauche`,`Porte des toilettes droite`,`Porte de la douche gauche`,`Porte de la douche droite`,`Lit`,`Armoire`],peinture:[`Mur de la chambre`,`Plafond`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`],mobilier:[`Lit`,`Armoire`,`Bureau`,`Chaise`],maconnerie:[`Mur de la chambre`,`Plafond`,`Sol`,`Toilettes gauche`,`Toilettes droite`,`Douche gauche`,`Douche droite`]};d.addEventListener(`change`,()=>{let e=d.value;if(p.innerHTML=`
            <option value="">
                Sélectionner une localisation
            </option>
        `,h.innerHTML=`
            <option value="">
                Sélectionner un problème
            </option>
        `,m.style.display=`none`,!e){f.style.display=`none`;return}g[e].forEach(e=>{p.innerHTML+=`
                    <option value="${e}">
                        ${e}
                    </option>
                `}),f.style.display=`block`});let _={plomberie:{Chambre:[`Fuite au robinet`,`Fuite au lavabo`,`Lavabo bouché`,`Évacuation du lavabo bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Toilettes gauche":[`Fuite au robinet`,`Chasse d'eau défectueuse`,`Fuite au niveau de la chasse d'eau`,`WC bouché`,`Lavabo bouché`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Toilettes droite":[`Fuite au robinet`,`Chasse d'eau défectueuse`,`Fuite au niveau de la chasse d'eau`,`WC bouché`,`Lavabo bouché`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Douche gauche":[`Robinet défectueux`,`Douchette défectueuse`,`Fuite au robinet`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`],"Douche droite":[`Robinet défectueux`,`Douchette défectueuse`,`Fuite au robinet`,`Évacuation bouchée`,`Canalisation qui fuit`,`Absence d'eau`]},electricite:{Chambre:[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Prise électrique sans courant`,`Court-circuit`,`Coupure d'électricité`],"Toilettes gauche":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Coupure d'électricité`],"Toilettes droite":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Prise électrique défectueuse`,`Coupure d'électricité`],"Douche gauche":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Coupure d'électricité`],"Douche droite":[`Ampoule défectueuse`,`Interrupteur défectueux`,`Coupure d'électricité`]},menuiserie:{"Porte de la chambre":[`Serrure à réparer`,`Serrure à remplacer`,`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte qui ne s'ouvre pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte des toilettes gauche":[`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Loquet extérieur à réparer`,`Loquet extérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte des toilettes droite":[`Loquet intérieur à réparer`,`Loquet intérieur à remplacer`,`Loquet extérieur à réparer`,`Loquet extérieur à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte de la douche gauche":[`Loquet à réparer`,`Loquet à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],"Porte de la douche droite":[`Loquet à réparer`,`Loquet à remplacer`,`Poignée à réparer`,`Poignée à remplacer`,`Porte qui ne ferme pas correctement`,`Porte endommagée`,`Charnière défectueuse`],Lit:[`Structure du lit endommagée`,`Pied du lit endommagé`,`Sommier endommagé`,`Lit instable`,`Lit inutilisable`],Armoire:[`Porte d'armoire endommagée`,`Charnière défectueuse`,`Serrure défectueuse`,`Poignée cassée`,`Armoire instable`]},peinture:{"Mur de la chambre":[`Peinture écaillée`,`Mur taché`,`Mur dégradé`,`Traces d'humidité`,`Peinture complètement détériorée`],Plafond:[`Peinture écaillée`,`Traces d'humidité`,`Plafond taché`,`Peinture détériorée`],"Toilettes gauche":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Toilettes droite":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Douche gauche":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`],"Douche droite":[`Peinture écaillée`,`Mur dégradé`,`Traces d'humidité`,`Peinture détériorée`]},mobilier:{Lit:[`Structure du lit endommagée`,`Pied du lit cassé`,`Sommier endommagé`,`Lit instable`,`Lit inutilisable`],Armoire:[`Porte d'armoire endommagée`,`Charnière défectueuse`,`Serrure défectueuse`,`Poignée cassée`,`Armoire instable`],Bureau:[`Plateau endommagé`,`Pied cassé`,`Bureau instable`],Chaise:[`Assise endommagée`,`Pied cassé`,`Chaise instable`]},maconnerie:{"Mur de la chambre":[`Mur fissuré`,`Mur endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`],Plafond:[`Plafond fissuré`,`Plafond endommagé`,`Infiltration d'eau`,`Trace importante d'humidité`],Sol:[`Carrelage cassé`,`Carrelage décollé`,`Sol endommagé`],"Toilettes gauche":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Toilettes droite":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Douche gauche":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`],"Douche droite":[`Mur fissuré`,`Carrelage cassé`,`Carrelage décollé`,`Infiltration d'eau`]}};p.addEventListener(`change`,()=>{let e=d.value,t=p.value;if(h.innerHTML=`
            <option value="">
                Sélectionner un problème
            </option>
        `,!e||!t||!_[e]||!_[e][t]){m.style.display=`none`;return}_[e][t].forEach(e=>{h.innerHTML+=`
                    <option value="${e}">
                        ${e}
                    </option>
                `}),m.style.display=`block`});let v=document.getElementById(`envoyer-demande-btn`);v.addEventListener(`click`,async()=>{let e=d.value,t=p.value,i=h.value;if(!e||!t||!i){alert(`Veuillez sélectionner le type, la localisation et le problème.`);return}try{v.disabled=!0,v.innerHTML=`
                <i class="fa-solid fa-spinner fa-spin"></i>
                Envoi en cours...
            `,await r(a(n,`demandes_etudiants`),{matricule:o.matricule,numeroEtudiant:o.numeroEtudiant||o.matricule,prenom:o.prenom,nom:o.nom,site:u.site,pavillon:u.pavillon,chambre:u.chambre,lit:u.lit,type:e,localisation:t,probleme:i,date:new Date,statut:`en_attente`,notificationVue:!1}),alert(`Votre demande a été envoyée avec succès.`)}catch(e){console.error(`❌ Erreur envoi demande :`,e),alert(`Impossible d'envoyer la demande. Veuillez réessayer.`)}finally{v.disabled=!1,v.innerHTML=`
                <i class="fa-solid fa-paper-plane"></i>
                Envoyer la demande
            `}})});