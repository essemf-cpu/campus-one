import"../../../modulepreload-polyfill-Dezn_h7o.js";import{C as e,S as t,b as n,c as r,f as i,g as a,h as o,l as s,o as c,v as l,x as u}from"../../../authService-D_VO4Eli.js";var d=3e3,f=`paiementsLoyers`,p={anneeAcademique:`2026-2027`,montantMensuel:d,mois:[{nom:`Novembre 2026`,statut:`paye`},{nom:`Décembre 2026`,statut:`paye`},{nom:`Janvier 2027`,statut:`a_payer`},{nom:`Février 2027`,statut:`a_payer`},{nom:`Mars 2027`,statut:`a_payer`},{nom:`Avril 2027`,statut:`a_payer`},{nom:`Mai 2027`,statut:`a_payer`},{nom:`Juin 2027`,statut:`a_payer`},{nom:`Juillet 2027`,statut:`a_payer`}]},m={anneeAcademique:p.anneeAcademique,montantMensuel:p.montantMensuel,mois:p.mois.map(e=>({...e}))},h=null,g=null,_=null,v=document.getElementById(`annee-academique`),y=document.getElementById(`montant-total`),b=document.getElementById(`mois-a-payer`),x=document.getElementById(`paiements-list`);function S(e){return`${new Intl.NumberFormat(`fr-FR`).format(e)} FCFA`}function C(){return m.mois.find(e=>e.statut===`a_payer`)}async function w(){if(x.innerHTML=`
    <div class="paiements-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        <span>Chargement...</span>
    </div>
`,!g||!_)return;console.log(`💰 Chargement des paiements du loyer...`);let e=await i(o(n(s,f),l(`matricule`,`==`,g),l(`anneeAcademique`,`==`,_)));console.log(`💰 Paiements Firestore :`,e.size),m={anneeAcademique:_,montantMensuel:d,mois:p.mois.map(e=>({...e}))},e.forEach(e=>{let t=e.data(),n=m.mois.find(e=>e.nom===t.mois);n&&t.statut===`paye`&&(n.statut=`paye`)})}function T(){let e=C();v.textContent=m.anneeAcademique,e?(y.textContent=S(m.montantMensuel),b.textContent=e.nom):(y.textContent=`0 FCFA`,b.textContent=`Aucun mois en attente`)}function E(){x.innerHTML=``,m.mois.forEach(e=>{let t=e.statut===`paye`,n=document.createElement(`div`);n.className=`paiement-row`,n.innerHTML=`

                <div
                    class="paiement-mois"
                >

                    <div
                        class="
                            paiement-status
                            ${t?`status-paye`:`status-attente`}
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${t?`fa-check`:`fa-clock`}
                            "
                        ></i>

                    </div>

                    <span>
                        ${e.nom}
                    </span>

                </div>


                <div
                    class="
                        paiement-etat
                        ${t?`etat-paye`:`etat-attente`}
                    "
                >

                    ${t?`Payé`:`À payer`}

                </div>

            `,x.appendChild(n)})}var D=document.getElementById(`paiement-modal`),O=document.getElementById(`plusieurs-modal`),k=document.getElementById(`recap-modal`);function A(e){e.classList.add(`show`),document.body.classList.add(`modal-open`)}function j(e){e.classList.remove(`show`),document.querySelector(`.modal.show`)||document.body.classList.remove(`modal-open`)}document.getElementById(`payer-btn`).addEventListener(`click`,()=>{let e=C();if(!e){alert(`Votre situation est à jour.`);return}document.getElementById(`modal-mois`).textContent=e.nom,document.getElementById(`montant-mois`).textContent=S(m.montantMensuel),A(D)}),document.getElementById(`payer-seul-btn`).addEventListener(`click`,()=>{let e=C();e&&(M=[e],R(M),j(D),A(k))}),document.getElementById(`payer-plusieurs-btn`).addEventListener(`click`,()=>{j(D),N(),A(O)});var M=[];function N(){let e=document.getElementById(`mois-selection`);e.innerHTML=``,M=[];let t=m.mois.filter(e=>e.statut===`a_payer`);t.forEach((t,n)=>{let r=document.createElement(`button`);r.type=`button`,r.className=`mois-option`,r.dataset.index=n,r.innerHTML=`

                <div>

                    <strong>
                        ${t.nom}
                    </strong>

                    <span>
                        ${S(m.montantMensuel)}
                    </span>

                </div>


                <i
                    class="
                        fa-solid
                        fa-circle-check
                    "
                ></i>

            `,r.addEventListener(`click`,()=>{r.classList.contains(`disabled`)||P(n)}),e.appendChild(r)}),t.length>0&&(M=[t[0]],e.firstElementChild?.classList.add(`selected`)),L()}function P(e){let t=m.mois.filter(e=>e.statut===`a_payer`)[e];if(!t)return;let n=M.indexOf(t);if(n!==-1){if(n!==M.length-1)return;M.splice(n,1)}else{if(e!==M.length)return;M.push(t)}F(),L()}function F(){document.querySelectorAll(`.mois-option`).forEach((e,t)=>{let n=t<M.length,r=t===M.length;e.classList.toggle(`selected`,n),e.classList.toggle(`disabled`,!n&&!r)})}function I(e){return e.length*m.montantMensuel}function L(){let e=I(M);document.getElementById(`total-selection`).textContent=S(e)}document.getElementById(`continuer-paiement-btn`).addEventListener(`click`,()=>{if(M.length===0){alert(`Veuillez sélectionner au moins un mois.`);return}R(M),j(O),A(k)});function R(e){let t=document.getElementById(`recap-list`);t.innerHTML=``,e.forEach(e=>{let n=document.createElement(`div`);n.className=`recap-row`,n.innerHTML=`

                <span>
                    ${e.nom}
                </span>

                <strong>
                    ${S(m.montantMensuel)}
                </strong>

            `,t.appendChild(n)}),document.getElementById(`recap-total`).textContent=S(I(e))}async function z(e){if(!g||!_)throw Error(`UTILISATEUR_NON_INITIALISE`);let n=e.nom.replace(/\s+/g,`-`).replace(/[^a-zA-Z0-9À-ÿ-]/g,``);await a(u(s,f,`${_}_${g}_${n}`),{matricule:g,anneeAcademique:_,mois:e.nom,montant:m.montantMensuel,statut:`paye`,type:`loyer`,origine:`campus-one`,datePaiement:t()},{merge:!0}),console.log(`✅ Paiement enregistré :`,e.nom)}document.getElementById(`confirmer-paiement-btn`).addEventListener(`click`,async()=>{if(M.length===0)return;let e=document.getElementById(`confirmer-paiement-btn`),t=[...M];e.disabled=!0,e.innerHTML=`

                <i
                    class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "
                ></i>

                Enregistrement...

            `;try{for(let e of t)await z(e);t.forEach(e=>{let t=m.mois.find(t=>t.nom===e.nom);t&&(t.statut=`paye`)}),T(),E(),j(k),alert(t.length===1?`Paiement de ${t[0].nom} enregistré.`:`${t.length} mois ont été enregistrés comme payés.`)}catch(e){console.error(`❌ Erreur enregistrement paiement :`,e),alert(`Impossible d'enregistrer le paiement. Veuillez réessayer.`)}finally{e.disabled=!1,e.innerHTML=`

                    <i
                        class="
                            fa-solid
                            fa-lock
                        "
                    ></i>

                    Confirmer et payer

                `}}),document.getElementById(`reglement-btn`).addEventListener(`click`,()=>{alert(`L'article du règlement intérieur sera disponible prochainement.`)}),document.getElementById(`close-modal`).addEventListener(`click`,()=>{j(D)}),document.getElementById(`close-plusieurs-modal`).addEventListener(`click`,()=>{j(O)}),document.getElementById(`close-recap-modal`).addEventListener(`click`,()=>{j(k)}),document.querySelectorAll(`.modal`).forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&j(e)})}),document.getElementById(`back-btn`).addEventListener(`click`,()=>{window.history.back()});async function B(e){try{if(!e)throw Error(`UTILISATEUR_NON_CONNECTE`);if(h=await c(e.uid),g=h.profile?.matricule,_=h.anneeAcademique,!g)throw Error(`MATRICULE_MANQUANT`);if(!_)throw Error(`ANNEE_MANQUANTE`);console.log(`👤 Matricule :`,g),console.log(`📅 Année académique :`,_),await w(),T(),E()}catch(e){console.error(`❌ Erreur initialisation loyer :`,e)}}e(r,async e=>{if(!e){console.error(`❌ Aucun utilisateur Firebase connecté.`);return}console.log(`🔥 Utilisateur Firebase restauré :`,e.uid),await B(e)});