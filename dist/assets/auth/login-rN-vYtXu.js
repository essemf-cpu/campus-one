import"../modulepreload-polyfill-Dezn_h7o.js";import{b as e,c as t,o as n,p as r,r as i,u as a}from"../authService-CdYSz198.js";var o={APP:{NAME:`Campus One`,DESCRIPTION:`Système d'information du COUD`},LOGIN:{IDENTIFIER:`Identifiant`,PASSWORD:`Mot de passe`,BUTTON:`Se connecter`,FORGOT:`Mot de passe oublié ?`},ERRORS:{EMPTY_FIELDS:`Veuillez renseigner votre identifiant et votre mot de passe.`,INVALID_CREDENTIALS:`Identifiant ou mot de passe incorrect.`,NETWORK:`Erreur de connexion.`,USER_NOT_FOUND:`Utilisateur introuvable.`,UNKNOWN:`Une erreur est survenue.`},SUCCESS:{LOGIN:`Connexion réussie.`}},s=document.getElementById(`loginForm`),c=document.getElementById(`identifiant`),l=document.getElementById(`password`),u=document.getElementById(`btnLogin`),d=document.getElementById(`message`),f=document.getElementById(`togglePassword`);document.getElementById(`annee-group`);var p=document.getElementById(`anneeAcademique`);async function m(){if(!p){console.error(`❌ Élément #anneeAcademique introuvable.`);return}p.innerHTML=`

        <option value="">
            Chargement...
        </option>

    `;try{console.log(`📚 Chargement des années académiques...`);let t=await r(e(a,`anneesAcademiques`));console.log(`📚 Nombre de documents trouvés :`,t.size),t.forEach(e=>{console.log(`📅 Année :`,e.id,e.data())});let n=t.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.active===!0).sort((e,t)=>(t.ordre||0)-(e.ordre||0));console.log(`📅 Années académiques actives :`,n),p.innerHTML=`

            <option value="">
                Choisir l'année académique
            </option>

        `,n.forEach(e=>{let t=document.createElement(`option`);t.value=e.libelle,t.textContent=e.libelle,p.appendChild(t)}),n.length===0&&(p.innerHTML=`

                <option value="">
                    Aucune année disponible
                </option>

            `,console.warn(`⚠️ Aucune année académique active.`))}catch(e){console.error(`❌ Erreur chargement années académiques :`,e),p.innerHTML=`

            <option value="">
                Impossible de charger les années
            </option>

        `}}s.addEventListener(`submit`,async e=>{e.preventDefault(),d.textContent=``,d.style.color=`red`;let r=c.value.trim(),a=l.value.trim(),s=p.value.trim();if(!s){d.textContent=`Veuillez choisir une année académique.`;return}if(!r||!a){d.textContent=o.ERRORS.EMPTY_FIELDS;return}u.disabled=!0,u.textContent=`Connexion...`;try{let e=await i(r);switch(await n(e.email,a),t(s),sessionStorage.setItem(`user`,JSON.stringify(e)),console.log(`✅ Connexion réussie`),console.log(`📅 Année académique sélectionnée :`,s),d.style.color=`green`,d.textContent=o.SUCCESS.LOGIN,e.collection){case`agents`:window.location.href=`../dashboards/agent/dashboard.html`;break;case`etudiants`:window.location.href=`../dashboards/etudiant/dashboard.html`;break;default:throw Error(`UNKNOWN_ROLE`)}}catch(e){switch(console.error(`❌ ERREUR CONNEXION :`,e),d.style.color=`red`,e.message){case`USER_NOT_FOUND`:d.textContent=o.ERRORS.USER_NOT_FOUND;break;case`UNKNOWN_ROLE`:d.textContent=`Rôle inconnu.`;break;default:switch(e.code){case`auth/invalid-credential`:d.textContent=o.ERRORS.INVALID_CREDENTIALS;break;case`auth/network-request-failed`:d.textContent=o.ERRORS.NETWORK;break;default:d.textContent=o.ERRORS.UNKNOWN}}}finally{u.disabled=!1,u.textContent=`Se connecter`}}),f.addEventListener(`click`,()=>{l.type===`password`?(l.type=`text`,f.classList.replace(`fa-eye`,`fa-eye-slash`)):(l.type=`password`,f.classList.replace(`fa-eye-slash`,`fa-eye`))}),m();