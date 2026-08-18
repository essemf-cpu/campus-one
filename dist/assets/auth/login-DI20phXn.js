import"../modulepreload-polyfill-Dezn_h7o.js";import{f as e,l as t,o as n,r,y as i}from"../authService-kcLQHjqZ.js";var a={APP:{NAME:`Campus One`,DESCRIPTION:`Système d'information du COUD`},LOGIN:{IDENTIFIER:`Identifiant`,PASSWORD:`Mot de passe`,BUTTON:`Se connecter`,FORGOT:`Mot de passe oublié ?`},ERRORS:{EMPTY_FIELDS:`Veuillez renseigner votre identifiant et votre mot de passe.`,INVALID_CREDENTIALS:`Identifiant ou mot de passe incorrect.`,NETWORK:`Erreur de connexion.`,USER_NOT_FOUND:`Utilisateur introuvable.`,UNKNOWN:`Une erreur est survenue.`},SUCCESS:{LOGIN:`Connexion réussie.`}},o=document.getElementById(`loginForm`),s=document.getElementById(`identifiant`),c=document.getElementById(`password`),l=document.getElementById(`btnLogin`),u=document.getElementById(`message`),d=document.getElementById(`togglePassword`);document.getElementById(`annee-group`);var f=document.getElementById(`anneeAcademique`);async function p(){if(!f){console.error(`❌ Élément #anneeAcademique introuvable.`);return}f.innerHTML=`

        <option value="">
            Chargement...
        </option>

    `;try{console.log(`📚 Chargement des années académiques...`);let n=await e(i(t,`anneesAcademiques`));console.log(`📚 Nombre de documents trouvés :`,n.size),n.forEach(e=>{console.log(`📅 Année :`,e.id,e.data())});let r=n.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.active===!0).sort((e,t)=>(t.ordre||0)-(e.ordre||0));console.log(`📅 Années académiques actives :`,r),f.innerHTML=`

            <option value="">
                Choisir l'année académique
            </option>

        `,r.forEach(e=>{let t=document.createElement(`option`);t.value=e.libelle,t.textContent=e.libelle,f.appendChild(t)}),r.length===0&&(f.innerHTML=`

                <option value="">
                    Aucune année disponible
                </option>

            `,console.warn(`⚠️ Aucune année académique active.`))}catch(e){console.error(`❌ Erreur chargement années académiques :`,e),f.innerHTML=`

            <option value="">
                Impossible de charger les années
            </option>

        `}}o.addEventListener(`submit`,async e=>{e.preventDefault(),u.textContent=``,u.style.color=`red`;let t=s.value.trim(),i=c.value.trim(),o=f.value.trim();if(!o){u.textContent=`Veuillez choisir une année académique.`;return}if(!t||!i){u.textContent=a.ERRORS.EMPTY_FIELDS;return}l.disabled=!0,l.textContent=`Connexion...`;try{let e=await r(t);switch(await n(e.email,i),sessionStorage.setItem(`anneeAcademique`,o),sessionStorage.setItem(`user`,JSON.stringify(e)),console.log(`✅ Connexion réussie`),console.log(`📅 Année académique sélectionnée :`,o),u.style.color=`green`,u.textContent=a.SUCCESS.LOGIN,e.collection){case`agents`:window.location.href=`../dashboards/agent/dashboard.html`;break;case`etudiants`:window.location.href=`../dashboards/etudiant/dashboard.html`;break;default:throw Error(`UNKNOWN_ROLE`)}}catch(e){switch(console.error(`❌ ERREUR CONNEXION :`,e),u.style.color=`red`,e.message){case`USER_NOT_FOUND`:u.textContent=a.ERRORS.USER_NOT_FOUND;break;case`UNKNOWN_ROLE`:u.textContent=`Rôle inconnu.`;break;default:switch(e.code){case`auth/invalid-credential`:u.textContent=a.ERRORS.INVALID_CREDENTIALS;break;case`auth/network-request-failed`:u.textContent=a.ERRORS.NETWORK;break;default:u.textContent=a.ERRORS.UNKNOWN}}}finally{l.disabled=!1,l.textContent=`Se connecter`}}),d.addEventListener(`click`,()=>{c.type===`password`?(c.type=`text`,d.classList.replace(`fa-eye`,`fa-eye-slash`)):(c.type=`password`,d.classList.replace(`fa-eye-slash`,`fa-eye`))}),p();