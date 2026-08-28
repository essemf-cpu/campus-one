import"../../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,f as t,h as n,l as r,m as i,u as a,v as o}from"../../../authService-D_VO4Eli.js";import{t as s}from"../../../authGuard-CQaJ0AEA.js";import{t as c}from"../../../sidebar-C4KV5qly.js";var l=[{id:`2026ABC_2026-2027`,matricule:`2026ABC`,anneeAcademique:`2026-2027`,montantMensuel:3e3,caution:{montant:3e3,statut:`paye`,datePaiement:null},mois:{novembre:{libelle:`Novembre 2026`,statut:`paye`,datePaiement:null},decembre:{libelle:`Décembre 2026`,statut:`paye`,datePaiement:null},janvier:{libelle:`Janvier 2027`,statut:`a_payer`,datePaiement:null},fevrier:{libelle:`Février 2027`,statut:`a_payer`,datePaiement:null},mars:{libelle:`Mars 2027`,statut:`a_payer`,datePaiement:null},avril:{libelle:`Avril 2027`,statut:`a_payer`,datePaiement:null},mai:{libelle:`Mai 2027`,statut:`a_payer`,datePaiement:null},juin:{libelle:`Juin 2027`,statut:`a_payer`,datePaiement:null},juillet:{libelle:`Juillet 2027`,statut:`a_payer`,datePaiement:null}},dernierPaiement:{date:null,montant:0,mois:[],mode:null},statut:`en_cours`,creeLe:null,modifieLe:null}],u=`recouvrements`,d=`paiementsLoyers`,f=`notifications`,p=`../dashboard/index.html`,m=[],h=new Map,g=new Map,_=[],v=[],y=null,b=null,x=``,S=!1,C=document.getElementById(`recouvrement-body`),w=document.getElementById(`total-etudiants`),T=document.getElementById(`total-recouvrement`),E=document.getElementById(`total-paye`),D=document.getElementById(`total-du`),O=document.getElementById(`search-recouvrement`),k=document.getElementById(`chambre-filter`),A=document.getElementById(`statut-filter`),j=document.getElementById(`annee-academique`),M=document.getElementById(`pavillon-concerne`);function N(e){return`${new Intl.NumberFormat(`fr-FR`).format(Number(e)||0)} FCFA`}async function P(i){try{let a=await t(n(e(r,u),o(`anneeAcademique`,`==`,i)));if(!a.empty)return a.docs.map(e=>({id:e.id,...e.data()}))}catch(e){console.warn(`⚠️ Impossible de lire les recouvrements Firestore. Utilisation du seed.`,e)}return l.filter(e=>e.anneeAcademique===i)}async function F(i){try{_=(await t(n(e(r,d),o(`anneeAcademique`,`==`,i),o(`statut`,`==`,`paye`)))).docs.map(e=>({id:e.id,...e.data()})),console.log(`💰 Paiements loyers :`,_.length)}catch(e){console.error(`❌ Impossible de charger les paiements de loyers :`,e),_=[]}}function ee(t){typeof y==`function`&&(y(),y=null),y=i(n(e(r,d),o(`anneeAcademique`,`==`,t),o(`statut`,`==`,`paye`)),e=>{_=e.docs.map(e=>({id:e.id,...e.data()})),console.log(`🔄 Paiements loyers mis à jour en temps réel :`,_.length),I()},e=>{console.error(`❌ Erreur écoute temps réel paiementsLoyers :`,e)})}function I(){m=v,m=Array.from(g.values()).map(W).filter(Boolean),m.sort((e,t)=>{let n=String(e.chambre),r=String(t.chambre),i=n.localeCompare(r,`fr`,{numeric:!0});return i===0?String(e.lit).localeCompare(String(t.lit),`fr`,{numeric:!0}):i}),q(),Q()}function L(e,t){!e||!e.mois||_.filter(e=>String(e.matricule)===String(t)&&e.statut===`paye`).forEach(n=>{let r=Object.values(e.mois).find(e=>e&&e.libelle===n.mois);if(!r){console.warn(`⚠️ Mois de paiement introuvable dans le recouvrement :`,{matricule:t,moisPaiement:n.mois});return}r.statut=`paye`,r.datePaiement=n.datePaiement||null,r.montant=Number(n.montant)||0})}async function R(){let n=await t(e(r,`etudiants`));h.clear(),n.docs.forEach(e=>{let t=e.data();t.matricule&&h.set(String(t.matricule),{...t,id:e.id})})}async function z(i,a,s,c){let l=await t(n(e(r,`hebergements`),o(`site`,`==`,i)));g.clear(),l.docs.forEach(e=>{let t=e.data();t.pavillon===a&&t.typeOccupation!==`suppleant`&&t.anneeAcademique===s&&(!c&&t.statutOccupation!==`actif`||t.matricule&&g.set(String(t.matricule),{...t,id:e.id}))})}function B(e){if(!e)return 0;let t=String(e.matricule||``);return _.filter(e=>String(e.matricule)===t&&e.statut===`paye`).reduce((e,t)=>e+(Number(t.montant)||0),0)}function V(e){if(!e)return 0;let t=Number(e.montantMensuel)||0,n=0;return e.mois&&Object.values(e.mois).forEach(e=>{e&&e.statut===`a_payer`&&(n+=t)}),n}function H(e,t){let n=String(t||``).match(/^(\d{4})-(\d{4})$/);if(!n)return console.error(`❌ Année académique invalide :`,t),{id:`${t}_${e}`,matricule:e,anneeAcademique:t,montantMensuel:3e3,mois:{},dernierPaiement:{date:null,montant:0,mois:[],mode:null},statut:`en_cours`};let r=Number(n[1]),i=Number(n[2]),a=[[`novembre`,`Novembre ${r}`],[`decembre`,`Décembre ${r}`],[`janvier`,`Janvier ${i}`],[`fevrier`,`Février ${i}`],[`mars`,`Mars ${i}`],[`avril`,`Avril ${i}`],[`mai`,`Mai ${i}`],[`juin`,`Juin ${i}`],[`juillet`,`Juillet ${i}`]],o={};return a.forEach(([e,t])=>{o[e]={libelle:t,statut:e===`novembre`||e===`decembre`?`codification`:`a_payer`,datePaiement:null,montant:0}}),{id:`${t}_${e}`,matricule:e,anneeAcademique:t,montantMensuel:3e3,mois:o,dernierPaiement:{date:null,montant:0,mois:[],mode:null},statut:`en_cours`}}function U(e){e?.mois&&[`novembre`,`decembre`].forEach(t=>{let n=e.mois[t];n&&n.statut!==`paye`&&(n.statut=`codification`,n.datePaiement=null,n.montant=0)})}function W(e){let t=String(e.matricule||``),n=h.get(t);if(!n)return null;let r=v.find(e=>String(e.matricule)===t);r||=H(t,e.anneeAcademique),U(r),L(r,t);let i=B(r),a=V(r),o=Object.values(r.mois||{}).filter(e=>e&&e.statut===`a_payer`);return{matricule:t,chambre:e.chambre||`-`,lit:G(e.lit||e.numeroLit||e.bed||``),carte:n.numeroEtudiant||n.numeroCarte||n.carte||n.matricule||`-`,nom:n.nom||``,prenom:n.prenom||``,montantPaye:i,montantDu:a,moisEnRetard:o,recouvrement:r}}function G(e){if(e==null)return`-`;let t=String(e).trim();if(!t)return`-`;let n=t.match(/(\d+)$/);return n?n[1]:t}function K(e=``){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function q(){if(!k)return;let e=[...new Set(m.map(e=>String(e.chambre)).filter(e=>e&&e!==`-`))];e.sort((e,t)=>e.localeCompare(t,`fr`,{numeric:!0}));let t=k.value;k.innerHTML=`
        <option value="">
            Toutes les chambres
        </option>
    `,e.forEach(e=>{let t=document.createElement(`option`);t.value=e,t.textContent=e,k.appendChild(t)}),e.includes(t)&&(k.value=t)}function J(e){let t=String(e||``).match(/^(\d{4})-(\d{4})$/);if(!t)return[];let n=Number(t[1]),r=Number(t[2]);return[{cle:`novembre`,mois:10,annee:n,libelle:`Novembre ${n}`},{cle:`decembre`,mois:11,annee:n,libelle:`Décembre ${n}`},{cle:`janvier`,mois:0,annee:r,libelle:`Janvier ${r}`},{cle:`fevrier`,mois:1,annee:r,libelle:`Février ${r}`},{cle:`mars`,mois:2,annee:r,libelle:`Mars ${r}`},{cle:`avril`,mois:3,annee:r,libelle:`Avril ${r}`},{cle:`mai`,mois:4,annee:r,libelle:`Mai ${r}`},{cle:`juin`,mois:5,annee:r,libelle:`Juin ${r}`},{cle:`juillet`,mois:6,annee:r,libelle:`Juillet ${r}`}]}function Y(e){if(!e?.recouvrement?.mois)return null;let t=J(x);for(let n of t){let t=e.recouvrement.mois[n.cle];if(t&&t.statut===`a_payer`)return{cle:n.cle,mois:n.libelle}}return null}async function X(i,a){if(!a)return 0;try{return(await t(n(e(r,f),o(`to`,`==`,String(i))))).docs.filter(e=>{let t=e.data();return t.type===`rappel_loyer`&&t.anneeAcademique===x&&t.mois===a}).length}catch(e){return console.error(`❌ Impossible de vérifier les rappels :`,e),0}}async function Z(e){if(S)return{autorise:!1,raison:`Cette année académique est en lecture seule. Une nouvelle codification est en cours.`};let t=Y(e);if(!t)return{autorise:!1,raison:`Aucun loyer n'est actuellement dû.`};let n=await X(e.matricule,t.mois);return n>=2?{autorise:!1,raison:`Deux rappels ont déjà été envoyés pour ${t.mois}.`}:{autorise:!0,nombreRappels:n,mois:t.mois,cle:t.cle}}function Q(){if(!C)return;let e=O?O.value.toLowerCase().trim():``,t=k?k.value:``,n=A?A.value:``,r=m.filter(r=>{let i=[r.chambre,r.lit,r.carte,r.matricule,r.prenom,r.nom].filter(Boolean).join(` `).toLowerCase(),a=!e||i.includes(e),o=!t||String(r.chambre)===String(t),s=!0;return n===`paye`&&(s=r.montantDu===0),n===`du`&&(s=r.montantDu>0),a&&o&&s});C.innerHTML=``;let i=m.length,a=m.reduce((e,t)=>e+(Number(t.montantPaye)||0),0),o=m.reduce((e,t)=>e+(Number(t.montantDu)||0),0);if(w&&(w.textContent=i),T&&(T.textContent=r.length),E&&(E.textContent=N(a)),D&&(D.textContent=N(o)),r.length===0){C.innerHTML=`

            <tr class="empty-row">

                <td colspan="8">

                    Aucun étudiant trouvé.

                </td>

            </tr>

        `;return}r.forEach((e,t)=>{let n=document.createElement(`tr`);t>0&&r[t-1].chambre!==e.chambre&&n.classList.add(`room-separator`);let i=`${e.prenom} ${e.nom}`.trim(),a=e.montantDu>0,o=S;n.innerHTML=`

                <td>

                    <strong>

                        ${K(e.chambre)}

                    </strong>

                </td>


                <td>

                    ${K(e.lit)}

                </td>


                <td>

                    ${K(e.carte)}

                </td>


                <td>

                    <strong>

                        ${K(i||e.matricule)}

                    </strong>

                </td>


                <td class="montant-paye">

                    ${N(e.montantPaye)}

                </td>


                <td
                    class="
                        montant-du
                        ${a?`dette`:`a-jour`}
                    "
                >

                    ${N(e.montantDu)}

                </td>


                <td>

                ${a?o?`
                            <span
                                class="rappel-ferme"
                            >
                                Rappel fermé
                            </span>
                        `:`
                            <button
                                type="button"
                                class="rappel-btn"
                                data-matricule="${K(e.matricule)}"
                            >
                                ENVOYER
                            </button>
                        `:`
                            <span
                                class="rappel-ok"
                            >
                                À jour
                            </span>
                        `}

                </td>


                <td>

                    <button
                        type="button"
                        class="details-btn"
                        data-matricule="${K(e.matricule)}"
                    >

                        Voir

                    </button>

                </td>

            `,C.appendChild(n)}),C.querySelectorAll(`.rappel-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.matricule,n=m.find(e=>String(e.matricule)===String(t));if(n){e.disabled=!0;try{await te(n)}finally{e.disabled=!1}}})}),C.querySelectorAll(`.details-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.matricule;t&&(window.location.href=`./details/index.html?matricule=${encodeURIComponent(t)}`)})})}async function te(e){let t=await Z(e);if(!t.autorise){alert(t.raison);return}let n=document.createElement(`div`);n.className=`rappel-menu-overlay`,n.innerHTML=`

        <div class="rappel-menu">

            <div class="rappel-menu-header">

                <h3>
                    Envoyer un rappel
                </h3>

                <button
                    type="button"
                    class="rappel-menu-close"
                >
                    ×
                </button>

            </div>


            <p>

                Choisissez le moyen de rappel
                pour

                <strong>
                    ${K(`${e.prenom} ${e.nom}`.trim()||e.matricule)}
                </strong>.

            </p>


            <div class="rappel-menu-actions">

                <button
                    type="button"
                    class="rappel-choice notification"
                    data-action="notification"
                >

                    <span>
                        <i class="fa-solid fa-bell"></i>
                    </span>

                    <div>

                        <strong>
                            Notification
                        </strong>

                        <small>
                            Envoyer dans Campus One
                        </small>

                    </div>

                </button>


                <button
                    type="button"
                    class="rappel-choice sms"
                    data-action="sms"
                >

                    <span>
                        <i class="fa-solid fa-message"></i>
                    </span>

                    <div>

                        <strong>
                            SMS
                        </strong>

                        <small>
                            Disponible prochainement
                        </small>

                    </div>

                </button>

            </div>

        </div>

    `,document.body.appendChild(n);let r=()=>{n.remove()};n.querySelector(`.rappel-menu-close`).addEventListener(`click`,r),n.addEventListener(`click`,e=>{e.target===n&&r()}),n.querySelector(`[data-action="notification"]`).addEventListener(`click`,async()=>{let t=n.querySelector(`[data-action="notification"]`);t.disabled=!0;try{await ne(e)&&r()}finally{t.disabled=!1}}),n.querySelector(`[data-action="sms"]`).addEventListener(`click`,()=>{alert(`L'envoi de SMS sera disponible prochainement.`)})}async function ne(t){let n=await Z(t);if(!n.autorise)return alert(n.raison),!1;let i=`${t.prenom} ${t.nom}`.trim(),o=Number(t.recouvrement?.montantMensuel)||0;try{return await a(e(r,f),{anneeAcademique:x,date:Date.now(),from:b?.uid||b?.id||b?.matricule||`service-hebergement`,fromAvatar:b?.avatar||``,fromNom:b?.nomComplet||b?.nom||`Service de l'Hébergement`,seen:!1,title:`Rappel de loyer`,text:`Votre loyer du mois de ${n.mois.toLowerCase()} reste à régulariser. Montant mensuel : ${N(o)}.`,to:String(t.matricule),type:`rappel_loyer`,mois:n.mois}),console.log(`📩 Rappel de loyer envoyé :`,{matricule:t.matricule,mois:n.mois,anneeAcademique:x}),alert(`Rappel envoyé à ${i||t.matricule}.`),!0}catch(e){return console.error(`❌ Erreur lors de l'envoi du rappel :`,e),alert(`Impossible d'envoyer le rappel.`),!1}}function re(){window.location.href=p}var $=document.getElementById(`voir-tableau-bord`);$&&$.addEventListener(`click`,re),O&&O.addEventListener(`input`,Q),k&&k.addEventListener(`change`,Q),A&&A.addEventListener(`change`,Q),s(`agent`,async({profile:e,affectation:t,anneeAcademique:n,lectureSeule:r})=>{try{if(b=e,x=n||``,S=!!r,e.service!==`Service de l'Hébergement`){console.error(`❌ Accès refusé : service incorrect.`);return}await c(e);let i=t?.site||e.site||``,a=t?.pavillon||ie(t?.affectation||e.affectation||``);if(j&&(j.textContent=n||`-`),M&&(M.textContent=a||`-`),!i||!a){C.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="8">

                            Votre affectation
                            n'est pas correctement
                            définie.

                        </td>

                    </tr>

                `;return}console.log(`💰 Recouvrement - affectation :`,{site:i,pavillon:a,anneeAcademique:n});let[o]=await Promise.all([P(n),F(n),R(),z(i,a,n,r)]);v=o,I(),ee(n),console.log(`💰 Étudiants affichés :`,m.length),console.log(`💰 Paiements utilisés :`,_.length)}catch(e){console.error(`❌ Erreur chargement recouvrement :`,e),C&&(C.innerHTML=`

                    <tr class="empty-row">

                        <td colspan="8">

                            Impossible de charger
                            les données de recouvrement.

                        </td>

                    </tr>

                `)}finally{document.body.classList.add(`loaded`)}});function ie(e){let t=String(e||``).trim().match(/Pavillon\s+(.+)/i);return t?t[1].trim():``}