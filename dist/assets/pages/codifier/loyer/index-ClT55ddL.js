import"../../../modulepreload-polyfill-Dezn_h7o.js";import{C as e,S as t,b as n,c as r,d as i,f as a,g as o,h as s,l as c,o as l,u,v as d,x as f}from"../../../authService-D_VO4Eli.js";var p=3e3,m=`paiementsLoyers`,h={anneeAcademique:`2026-2027`,montantMensuel:p,mois:[{nom:`Novembre 2026`,statut:`codification`},{nom:`Décembre 2026`,statut:`codification`},{nom:`Janvier 2027`,statut:`a_payer`},{nom:`Février 2027`,statut:`a_payer`},{nom:`Mars 2027`,statut:`a_payer`},{nom:`Avril 2027`,statut:`a_payer`},{nom:`Mai 2027`,statut:`a_payer`},{nom:`Juin 2027`,statut:`a_payer`},{nom:`Juillet 2027`,statut:`a_payer`}]},g={anneeAcademique:h.anneeAcademique,montantMensuel:h.montantMensuel,mois:h.mois.map(e=>({...e}))},_=null,v=null,y=null,b=[],x=null,S=!1,C=null,w=[],T=document.getElementById(`annee-academique`),E=document.getElementById(`montant-total`),D=document.getElementById(`mois-a-payer`),O=document.getElementById(`paiements-list`);function k(e){return`${new Intl.NumberFormat(`fr-FR`).format(e)} FCFA`}function A(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function ee(e=``){return e.trim().split(/\s+/).slice(0,2).map(e=>e[0]?.toUpperCase()||``).join(``)}function te(){return g.mois.find(e=>e.statut===`a_payer`)}function ne(e){return String(e).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/\s+/g,`-`).replace(/[^a-zA-Z0-9-]/g,``)}function j(e,t){let n=ne(t);return`${y}_${e}_${n}`}async function re(){return!v||!y?[]:(await a(s(n(c,`friends`),d(`userCarte`,`==`,v),d(`anneeAcademique`,`==`,y)))).docs.map(e=>{let t=e.data();return{id:e.id,matricule:String(t.friendCarte||``),nom:t.friendNom||``,avatar:t.friendAvatar||``}})}function ie(e){let t=String(e||``).trim().toLowerCase();return t?b.filter(e=>e.matricule.toLowerCase().includes(t)):[]}var M=document.getElementById(`ami-modal`),ae=document.getElementById(`payer-ami-btn`),N=document.getElementById(`ami-select`),P=document.getElementById(`ami-search`),F=document.getElementById(`ami-search-results`),I=document.getElementById(`aucun-ami-message`),L=document.getElementById(`ami-selection-zone`),R=document.getElementById(`continuer-ami-btn`),z=document.getElementById(`ami-selected`),oe=document.getElementById(`close-ami-modal`);function B(e){if(e){if(x=e,N){let t=b.findIndex(t=>t.matricule===e.matricule);t!==-1&&(N.value=String(t))}z&&(z.innerHTML=`

            <div class="ami-selected-avatar">

                ${e.avatar?`
                            <img
                                src="${A(e.avatar)}"
                                alt="Avatar"
                            >
                        `:`
                            <div class="ami-avatar-placeholder">
                                ${A(ee(e.nom))}
                            </div>
                        `}

            </div>

            <div class="ami-selected-info">

                <strong>
                    ${A(e.nom||e.matricule)}
                </strong>

                <span>
                    Carte :
                    ${A(e.matricule)}
                </span>

            </div>

        `,z.style.display=`flex`),R&&(R.disabled=!1)}}async function se(){S=!0,x=null,C=null,w=[],N&&(N.innerHTML=`
            <option value="">
                Chargement...
            </option>
        `),P&&(P.value=``),F&&(F.innerHTML=``),z&&(z.innerHTML=``,z.style.display=`none`),I&&(I.style.display=`none`),L&&(L.style.display=`none`),R&&(R.disabled=!0),W(M);try{if(b=await re(),b.length===0){I&&(I.style.display=`flex`);return}L&&(L.style.display=`block`),N&&(N.innerHTML=`
                <option value="">
                    Sélectionner un ami
                </option>
            `,b.forEach((e,t)=>{let n=document.createElement(`option`);n.value=String(t),n.textContent=e.nom?`${e.nom} — ${e.matricule}`:e.matricule,N.appendChild(n)}))}catch(e){console.error(`❌ Chargement amis :`,e),G(M),alert(`Impossible de charger votre liste d'amis.`)}}N?.addEventListener(`change`,()=>{let e=N.value;if(e===``){x=null,R&&(R.disabled=!0),z&&(z.style.display=`none`);return}let t=b[Number(e)];t&&B(t)}),P?.addEventListener(`input`,()=>{let e=P.value.trim();if(F&&(F.innerHTML=``),!e)return;let t=ie(e);if(t.length===0){F&&(F.innerHTML=`

                    <div class="ami-no-result">
                        Aucun résultat dans
                        votre liste d'amis.
                    </div>

                `);return}t.forEach(e=>{let t=document.createElement(`button`);t.type=`button`,t.className=`ami-search-result`,t.innerHTML=`

                    <strong>
                        ${A(e.nom||e.matricule)}
                    </strong>

                    <span>
                        ${A(e.matricule)}
                    </span>

                `,t.addEventListener(`click`,()=>{B(e),P.value=e.matricule,F.innerHTML=``}),F.appendChild(t)})}),ae?.addEventListener(`click`,se),R?.addEventListener(`click`,async()=>{if(!x){alert(`Veuillez sélectionner un ami.`);return}S=!0,w=[],C=null,G(M),await K(x)});var V=document.getElementById(`paiement-modal`),H=document.getElementById(`plusieurs-modal`),U=document.getElementById(`recap-modal`);function W(e){e&&(e.classList.add(`show`),document.body.classList.add(`modal-open`))}function G(e){e&&(e.classList.remove(`show`),document.querySelector(`.modal.show`)||document.body.classList.remove(`modal-open`))}async function ce(e){if(!e)throw Error(`BENEFICIAIRE_MANQUANT`);if(!y)throw Error(`ANNEE_MANQUANTE`);if(!x?.id)throw Error(`FRIEND_DOCUMENT_ID_MANQUANT`);let t=await i(f(c,`friends`,x.id));if(!t.exists())throw Error(`RELATION_AMI_INTROUVABLE`);let r=t.data();if(String(r.userCarte||``).trim()!==String(v||``).trim()||String(r.friendCarte||``).trim()!==String(e||``).trim()||String(r.anneeAcademique||``).trim()!==String(y||``).trim())throw console.error(`❌ Relation ami invalide :`,{friendDocumentId:x.id,userCarte:r.userCarte,friendCarte:r.friendCarte,anneeAcademique:r.anneeAcademique,utilisateur:v,beneficiaire:e}),Error(`RELATION_AMI_INVALIDE`);let o={anneeAcademique:y,montantMensuel:p,mois:h.mois.map(e=>({...e}))},l=s(n(c,m),d(`matricule`,`==`,e),d(`anneeAcademique`,`==`,y)),u;try{u=await a(l)}catch(t){throw console.error(`❌ Erreur lecture paiements bénéficiaire :`,{beneficiaire:e,anneeAcademique:y,error:t}),t}let g=u.docs.map(e=>({id:e.id,...e.data()}));return o.mois.forEach(t=>{g.find(n=>n.mois===t.nom&&n.statut===`paye`&&String(n.matricule||``).trim()===String(e).trim())&&(t.statut=`paye`)}),console.log(`✅ Situation bénéficiaire chargée :`,{beneficiaire:e,anneeAcademique:y,paiementsTrouves:g.length,mois:o.mois}),o}async function K(e=null){let t;try{t=S&&e?await ce(e.matricule):g;let n=t.mois.find(e=>e.statut===`a_payer`);if(!n){alert(e?`La situation de ${e.nom||e.matricule} est à jour.`:`Votre situation est à jour.`);return}C=t;let r=document.getElementById(`modal-mois`),i=document.getElementById(`montant-mois`);r&&(r.textContent=n.nom),i&&(i.textContent=k(t.montantMensuel));let a=V?.querySelector(`h2`),o=V?.querySelector(`.modal-description`);S&&e?(a&&(a.textContent=`Régler le loyer d'un ami`),o&&(o.innerHTML=`

                    Le prochain mois à régulariser pour

                    <strong>
                        ${A(e.nom||e.matricule)}
                    </strong>

                    est

                    <strong>
                        ${A(n.nom)}
                    </strong>.

                    <br>

                    Souhaitez-vous payer uniquement ce mois
                    ou plusieurs mois à l'avance ?

                `)):(a&&(a.textContent=`Régulariser votre loyer`),o&&(o.innerHTML=`

                    Votre prochain mois à régulariser est

                    <strong>
                        ${A(n.nom)}
                    </strong>.

                    <br>

                    Souhaitez-vous payer uniquement ce mois
                    ou plusieurs mois à l'avance ?

                `)),W(V)}catch(e){console.error(`❌ Erreur chargement situation bénéficiaire :`,e),G(V),alert(`Impossible de charger la situation du bénéficiaire.`)}}document.getElementById(`payer-btn`)?.addEventListener(`click`,()=>{S=!1,x=null,C=null,w=[],K()}),document.getElementById(`payer-seul-btn`)?.addEventListener(`click`,()=>{let e=C?.mois.find(e=>e.statut===`a_payer`);e&&(w=[e],X(w),G(V),W(U))}),document.getElementById(`payer-plusieurs-btn`)?.addEventListener(`click`,()=>{G(V),le(),W(H)});function le(){let e=document.getElementById(`mois-selection`);if(!e)return;e.innerHTML=``,w=[];let t=C||g,n=t.mois.filter(e=>e.statut===`a_payer`);n.forEach((n,r)=>{let i=document.createElement(`button`);i.type=`button`,i.className=`mois-option`,i.dataset.index=r,i.innerHTML=`

                <div>

                    <strong>
                        ${A(n.nom)}
                    </strong>

                    <span>
                        ${k(t.montantMensuel)}
                    </span>

                </div>

                <i
                    class="fa-solid fa-circle-check"
                ></i>

            `,i.addEventListener(`click`,()=>{i.classList.contains(`disabled`)||ue(r)}),e.appendChild(i)}),n.length>0&&(w=[n[0]]),q(),Y()}function ue(e){let t=(C||g).mois.filter(e=>e.statut===`a_payer`)[e];if(!t)return;let n=w.indexOf(t);if(n!==-1){if(n!==w.length-1)return;w.splice(n,1)}else{if(e!==w.length)return;w.push(t)}q(),Y()}function q(){document.querySelectorAll(`#mois-selection .mois-option`).forEach((e,t)=>{let n=t<w.length,r=t===w.length;e.classList.toggle(`selected`,n),e.classList.toggle(`disabled`,!n&&!r)})}function J(e){let t=C||g;return e.length*t.montantMensuel}function Y(){let e=J(w),t=document.getElementById(`total-selection`);t&&(t.textContent=k(e))}document.getElementById(`continuer-paiement-btn`)?.addEventListener(`click`,()=>{if(w.length===0){alert(`Veuillez sélectionner au moins un mois.`);return}X(w),G(H),W(U)});function X(e){let t=document.getElementById(`recap-list`);if(!t)return;if(t.innerHTML=``,S&&x){let e=document.createElement(`div`);e.className=`recap-beneficiaire`,e.innerHTML=`

            <span>
                Bénéficiaire
            </span>

            <strong>
                ${A(x.nom||x.matricule)}
            </strong>

            <small>
                Carte :
                ${A(x.matricule)}
            </small>

        `,t.appendChild(e)}e.forEach(e=>{let n=document.createElement(`div`);n.className=`recap-row`,n.innerHTML=`

                <span>
                    ${A(e.nom)}
                </span>

                <strong>
                    ${k((C||g).montantMensuel)}
                </strong>

            `,t.appendChild(n)});let n=document.getElementById(`recap-total`);n&&(n.textContent=k(J(e)));let r=U?.querySelector(`h2`),i=U?.querySelector(`.modal-description`);S&&x?(r&&(r.textContent=`Récapitulatif du paiement`),i&&(i.innerHTML=`

                Vous allez régler le loyer de

                <strong>
                    ${A(x.nom||x.matricule)}
                </strong>.

                <br>

                Vérifiez les informations avant de confirmer.

            `)):(r&&(r.textContent=`Récapitulatif`),i&&(i.textContent=`Vérifiez votre sélection avant de continuer.`))}async function de(e){if(!v||!y)throw Error(`UTILISATEUR_NON_INITIALISE`);let n=S&&x?x.matricule:v;if(!n)throw Error(`BENEFICIAIRE_MANQUANT`);if(S&&!x)throw Error(`AMI_MANQUANT`);if(S&&!x.id)throw Error(`FRIEND_DOCUMENT_ID_MANQUANT`);let r=f(c,m,j(n,e.nom)),i=S&&x?x.nom||``:_?.profile?.prenom?`${_.profile.prenom} ${_.profile.nom||``}`.trim():``,a=_?.profile?.prenom?`${_.profile.prenom} ${_.profile.nom||``}`.trim():``;await o(r,{matricule:n,beneficiaireMatricule:n,payeurMatricule:v,paiementPourAmi:S,friendDocumentId:S?x.id:null,anneeAcademique:y,mois:e.nom,montant:C?.montantMensuel||g.montantMensuel,statut:`paye`,type:`loyer`,origine:`campus-one`,beneficiaireNom:i,payeurNom:a,datePaiement:t()}),console.log(`✅ Paiement enregistré :`,{mois:e.nom,beneficiaire:n,payeur:v,paiementPourAmi:S,friendDocumentId:S?x.id:null})}async function Z({beneficiaireMatricule:e,beneficiaireNom:t,moisPayes:r,montantTotal:i}){if(!v||!y||!e)return;let a=_?.profile?.prenom?`${_.profile.prenom} ${_.profile.nom||``}`.trim():v,o=t||e,s=r.join(`, `),l=k(i);try{await u(n(c,`notifications`),{to:e,type:`loyer`,title:`Loyer payé pour vous`,text:`${a} a payé votre loyer (${s}) — ${l}.`,from:v,fromNom:a,fromAvatar:``,date:Date.now(),seen:!1,anneeAcademique:y}),await u(n(c,`notifications`),{to:v,type:`loyer`,title:`Paiement effectué`,text:`Vous avez payé le loyer de ${o} (${s}) — ${l}.`,from:v,fromNom:a,fromAvatar:``,date:Date.now(),seen:!1,anneeAcademique:y}),console.log(`✅ Notifications de paiement envoyées.`)}catch(e){console.error(`❌ Erreur envoi notifications paiement :`,e)}}document.getElementById(`confirmer-paiement-btn`)?.addEventListener(`click`,async()=>{if(w.length===0)return;if(S&&!x){alert(`Aucun bénéficiaire sélectionné.`);return}let e=document.getElementById(`confirmer-paiement-btn`),t=[...w];e.disabled=!0,e.innerHTML=`

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Enregistrement...

            `;try{for(let e of t)if(e.statut!==`a_payer`)throw Error(`Le mois ${e.nom} n'est plus disponible.`);let e=S&&x?x.matricule:v;for(let n of t){let t=await i(f(c,m,j(e,n.nom)));if(t.exists()&&t.data()?.statut===`paye`&&String(t.data()?.matricule||``)===String(e))throw Error(`Le mois ${n.nom} est déjà payé.`)}for(let e of t)await de(e);S&&x&&await Z({beneficiaireMatricule:x.matricule,beneficiaireNom:x.nom,moisPayes:t.map(e=>e.nom),montantTotal:J(t)}),S||t.forEach(e=>{let t=g.mois.find(t=>t.nom===e.nom);t&&(t.statut=`paye`)}),S||(Q(),$()),G(U),alert(S&&x?t.length===1?`Paiement de ${t[0].nom} enregistré pour ${x.nom||x.matricule}.`:`${t.length} mois ont été enregistrés comme payés pour ${x.nom||x.matricule}.`:t.length===1?`Paiement de ${t[0].nom} enregistré.`:`${t.length} mois ont été enregistrés comme payés.`),w=[],S=!1,x=null,C=null}catch(e){console.error(`❌ Erreur enregistrement paiement :`,e),alert(e?.message?.startsWith(`Le mois`)?e.message:`Impossible d'enregistrer le paiement. Veuillez réessayer.`)}finally{e.disabled=!1,e.innerHTML=`

                    <i
                        class="fa-solid fa-lock"
                    ></i>

                    Confirmer et payer

                `}});async function fe(){if(!O||(O.innerHTML=`

        <div class="paiements-loading">

            <i
                class="fa-solid fa-spinner fa-spin"
            ></i>

            <span>
                Chargement...
            </span>

        </div>

    `,!v||!y))return;console.log(`💰 Chargement des paiements du loyer...`);let e=(await a(s(n(c,m),d(`matricule`,`==`,v),d(`anneeAcademique`,`==`,y)))).docs.map(e=>({id:e.id,...e.data()})),t={anneeAcademique:y,montantMensuel:p,mois:h.mois.map(e=>({...e}))};t.mois.forEach(t=>{e.find(e=>e.mois===t.nom&&e.statut===`paye`&&e.matricule===v&&(!e.beneficiaireMatricule||e.beneficiaireMatricule===v)&&e.anneeAcademique===y)&&(t.statut=`paye`)}),g=t,console.log(`💰 Situation loyer chargée :`,g)}function Q(){let e=te();T&&(T.textContent=g.anneeAcademique),e?(E&&(E.textContent=k(g.montantMensuel)),D&&(D.textContent=e.nom)):(E&&(E.textContent=`0 FCFA`),D&&(D.textContent=`Aucun mois en attente`))}function $(){O&&(O.innerHTML=``,g.mois.forEach(e=>{let t=e.statut===`paye`,n=e.statut===`codification`,r=document.createElement(`div`);r.className=`paiement-row`,r.innerHTML=`

                <div
                    class="paiement-mois"
                >

                    <div
                        class="
                            paiement-status
                            ${t?`status-paye`:n?`status-codification`:`status-attente`}
                        "
                    >

                        <i
                            class="
                                fa-solid
                                ${t?`fa-check`:n?`fa-pen-to-square`:`fa-clock`}
                            "
                        ></i>

                    </div>

                    <span>
                        ${A(e.nom)}
                    </span>

                </div>

                <div
                    class="
                        paiement-etat
                        ${t?`etat-paye`:n?`etat-codification`:`etat-attente`}
                    "
                >

                    ${t?`Payé`:n?`Codification`:`À payer`}

                </div>

            `,O.appendChild(r)}))}document.getElementById(`reglement-btn`)?.addEventListener(`click`,()=>{alert(`L'article du règlement intérieur sera disponible prochainement.`)}),document.getElementById(`close-modal`)?.addEventListener(`click`,()=>{G(V)}),oe?.addEventListener(`click`,()=>{G(M),x=null,S=!1,C=null,w=[]}),document.getElementById(`close-plusieurs-modal`)?.addEventListener(`click`,()=>{G(H)}),document.getElementById(`close-recap-modal`)?.addEventListener(`click`,()=>{G(U)}),document.querySelectorAll(`.modal`).forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&G(e)})}),document.getElementById(`back-btn`)?.addEventListener(`click`,()=>{window.history.back()});async function pe(e){try{if(!e)throw Error(`UTILISATEUR_NON_CONNECTE`);if(_=await l(e.uid),!_)throw Error(`PROFIL_CAMPUS_ONE_INTROUVABLE`);if(v=_.profile?.matricule||_.matricule||null,y=_.anneeAcademique||h.anneeAcademique,!v)throw Error(`MATRICULE_MANQUANT`);if(!y)throw Error(`ANNEE_MANQUANTE`);console.log(`👤 Matricule :`,v),console.log(`📅 Année académique :`,y),await fe(),Q(),$()}catch(e){console.error(`❌ Erreur initialisation loyer :`,e)}}e(r,async e=>{if(!e){console.error(`❌ Aucun utilisateur Firebase connecté.`);return}console.log(`🔥 Utilisateur Firebase restauré :`,e.uid),await pe(e)});