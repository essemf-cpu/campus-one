import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,h as n,l as r,m as i,v as a,x as o}from"../../../authService-D_VO4Eli.js";import{t as s}from"../../../sessionManager-ruQTA9XT.js";import{t as c}from"../../../authGuard-CQaJ0AEA.js";import{t as l}from"../../../referentielService-19ofs0Bh.js";c(`etudiant`,async({profile:c})=>{let u=document.getElementById(`demandes-container`);if(!u){console.error(`❌ demandes-container introuvable`);return}let d=c.matricule;if(!d){u.innerHTML=`

                <div class="error-state">

                    <i class="
                        fa-solid
                        fa-triangle-exclamation
                    "></i>

                    <p>
                        Impossible de déterminer
                        votre matricule.
                    </p>

                </div>

            `;return}let f=await s(),p=f?.anneeAcademique||sessionStorage.getItem(`anneeAcademique`),m=f?.lectureSeule===!0;console.log(`📅 Année académique =`,p),console.log(`🔒 Lecture seule =`,m);let h=document.getElementById(`retour-btn`);h&&h.addEventListener(`click`,()=>{window.location.href=`../index.html`});let g=document.getElementById(`demandes-search`),_=document.getElementById(`demandes-sort-select`),v=document.getElementById(`demandes-type-select`),y=document.getElementById(`demandes-statut-select`),b=[],x=``,S=`date_desc`,C=`tous`,w=`tous`,T=[];try{T=await l()}catch(e){console.error(`❌ Erreur récupération types de travaux :`,e)}v&&(v.innerHTML=`

                <option value="tous">
                    Tous les types
                </option>

            `,T.forEach(e=>{v.innerHTML+=`

                        <option value="${e.id}">
                            ${e.nom}
                        </option>

                    `}));let E=e=>{if(e.date?.toDate)return e.date.toDate();if(e.date){let t=new Date(e.date);if(!isNaN(t.getTime()))return t}return new Date(0)},D=e=>{let t=[e.dateTraitement,e.date_traitement,e.traiteLe,e.dateTerminaison,e.dateFin];for(let e of t){if(e?.toDate)return e.toDate();if(e){let t=new Date(e);if(!isNaN(t.getTime()))return t}}return null},O=e=>e===`en_cours`?`En cours`:e===`termine`?`Terminée`:e===`forclos`?`Forclos`:e===`non_termine`?`Non terminée`:`En attente`,k=e=>{if(e.statut!==`termine`||e.evaluation||e.feedbackAutorise!==!0)return!1;let t=D(e);if(!t)return!1;let n=new Date().getTime()-t.getTime();return n>=0&&n<=10080*60*1e3},A=()=>{let e=[...b];if(x){let t=x.toLowerCase().trim();e=e.filter(e=>{let n=O(e.statut);return[e.probleme,e.type,e.localisation,e.chambre,n,e.cause,e.anneeAcademique].filter(Boolean).join(` `).toLowerCase().includes(t)})}if(C!==`tous`&&(e=e.filter(e=>e.type===C)),w!==`tous`&&(e=e.filter(e=>(e.statut||`en_attente`)===w)),e.sort((e,t)=>S===`date_desc`?E(t)-E(e):S===`date_asc`?E(e)-E(t):S===`statut`?O(e.statut).localeCompare(O(t.statut),`fr`):S===`type`?`${e.type||``}`.localeCompare(`${t.type||``}`,`fr`):0),e.length===0){u.innerHTML=`

                        <div class="empty-state">

                            <i class="
                                fa-solid
                                fa-magnifying-glass
                            "></i>

                            <p>

                                ${x?`Aucune demande ne correspond à votre recherche.`:`Aucune demande pour l'année ${p||`sélectionnée`}.`}

                            </p>

                        </div>

                    `;return}u.innerHTML=``,e.forEach(e=>{let t=e.statut||`en_attente`,n=`En attente`,r=`status-attente`;t===`en_cours`?(n=`En cours`,r=`status-cours`):t===`termine`?(n=`Terminée`,r=`status-termine`):t===`forclos`?(n=`Forclos`,r=`status-forclos`):t===`non_termine`&&(n=`Non terminée`,r=`status-non-termine`);let i=E(e),a=i.getTime()===0?`-`:i.toLocaleDateString(`fr-FR`),o=``;e.cause&&(o=`

                                <div class="demande-cause">

                                    <span class="cause-label">
                                        Motif
                                    </span>

                                    <p class="cause-text">
                                        ${e.cause}
                                    </p>

                                </div>

                            `);let s=``;s=t===`termine`?e.evaluation?`

                                    <div class="feedback-result">

                                        <div class="feedback-result-title">
                                            Votre évaluation
                                        </div>


                                        <div class="feedback-stars">

                                            ${[1,2,3].map(t=>`

                                                        <span
                                                            class="${t<=Number(e.evaluation)?`star-active`:`star-inactive`}"
                                                        >
                                                            ★
                                                        </span>

                                                    `).join(``)}

                                        </div>


                                        ${e.commentaire?`
                                                <div class="feedback-comment">

                                                    ${e.commentaire===`insatisfait`?`Insatisfait`:e.commentaire===`satisfait`?`Satisfait`:e.commentaire===`tres_satisfait`?`Très satisfait`:e.commentaire}

                                                </div>
                                                `:``}

                                    </div>

                                `:k(e)?`

                                    <div
                                        class="feedback-form"
                                        data-feedback-id="${e.id}"
                                    >

                                        <div class="feedback-title">
                                            Évaluer cette demande
                                        </div>


                                        <div class="feedback-group">

                                            <label>
                                                Évaluation
                                            </label>


                                            <div class="feedback-stars-select">

                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="1"
                                                >
                                                    ★
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="2"
                                                >
                                                    ★
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-star"
                                                    data-note="3"
                                                >
                                                    ★
                                                </button>

                                            </div>

                                        </div>


                                        <div class="feedback-group">

                                            <label>
                                                Avis
                                            </label>


                                            <div class="feedback-choices">

                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="insatisfait"
                                                >
                                                    Insatisfait
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="satisfait"
                                                >
                                                    Satisfait
                                                </button>


                                                <button
                                                    type="button"
                                                    class="feedback-choice"
                                                    data-avis="tres_satisfait"
                                                >
                                                    Très satisfait
                                                </button>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            class="feedback-submit"
                                            data-id="${e.id}"
                                            disabled
                                        >
                                            Valider
                                        </button>

                                    </div>

                                `:`

                                    <div class="feedback-locked">

                                        <i class="
                                            fa-solid
                                            fa-lock
                                        "></i>

                                        ${e.feedbackAutorise===!0?`Délai d'évaluation dépassé`:`Évaluation indisponible`}

                                    </div>

                                `:`

                                <div class="feedback-locked">

                                    <i class="
                                        fa-solid
                                        fa-lock
                                    "></i>

                                    Évaluation indisponible

                                </div>

                            `,u.innerHTML+=`

                            <article class="demande-item">

                                <div class="demande-header">

                                    <div>

                                        <h3 class="demande-title">
                                            ${e.probleme||`-`}
                                        </h3>


                                        <div class="demande-date">

                                            Demande du
                                            ${a}

                                        </div>

                                    </div>


                                    <span
                                        class="
                                            demande-status
                                            ${r}
                                        "
                                    >

                                        ${n}

                                    </span>

                                </div>


                                <div class="demande-info">

                                    <div class="info-block">

                                        <span class="info-label">
                                            Type
                                        </span>


                                        <span class="info-value">
                                            ${e.type||`-`}
                                        </span>

                                    </div>


                                    <div class="info-block">

                                        <span class="info-label">
                                            Localisation
                                        </span>


                                        <span class="info-value">
                                            ${e.localisation||`-`}
                                        </span>

                                    </div>


                                    <div class="info-block">

                                        <span class="info-label">
                                            Chambre
                                        </span>


                                        <span class="info-value">
                                            ${e.chambre||`-`}
                                        </span>

                                    </div>

                                </div>


                                ${o}


                                <div class="feedback-section">

                                    ${s}

                                </div>


                            </article>

                        `})};g&&g.addEventListener(`input`,()=>{x=g.value,A()}),_&&_.addEventListener(`change`,()=>{S=_.value,A()}),v&&v.addEventListener(`change`,()=>{C=v.value,A()}),y&&y.addEventListener(`change`,()=>{w=y.value,A()});let j;j=n(t(r,`demandes_etudiants`),a(`matricule`,`==`,d)),i(j,e=>{console.log(`📋 Toutes les demandes du matricule :`,e.size),b=[],e.forEach(e=>{let t=e.data();t.anneeAcademique===p&&b.push({id:e.id,...t})}),console.log(`📋 Demandes pour`,p,`:`,b.length),A()},e=>{console.error(`❌ Erreur écoute demandes :`,e),u.innerHTML=`

                    <div class="error-state">

                        <i class="
                            fa-solid
                            fa-triangle-exclamation
                        "></i>

                        <p>
                            Impossible de charger
                            vos demandes.
                        </p>

                    </div>

                `}),u.addEventListener(`click`,async t=>{let n=t.target.closest(`.feedback-star`);if(n){let e=n.closest(`.feedback-form`);if(!e)return;let t=Number(n.dataset.note);e.dataset.note=t,e.querySelectorAll(`.feedback-star`).forEach(e=>{let n=Number(e.dataset.note);e.classList.toggle(`selected`,n<=t)});let r=e.querySelector(`.feedback-submit`);r&&e.dataset.avis&&(r.disabled=!1);return}let i=t.target.closest(`.feedback-choice`);if(i){let e=i.closest(`.feedback-form`);if(!e)return;e.dataset.avis=i.dataset.avis,e.querySelectorAll(`.feedback-choice`).forEach(e=>{e.classList.remove(`selected`)}),i.classList.add(`selected`);let t=e.querySelector(`.feedback-submit`);t&&e.dataset.note&&(t.disabled=!1);return}let a=t.target.closest(`.feedback-submit`);if(!a)return;let c=a.closest(`.feedback-form`),l=a.dataset.id;if(!c||!l)return;let u=Number(c.dataset.note),d=c.dataset.avis;if(!(!u||!d||a.disabled)){if((await s())?.lectureSeule===!0){alert(`Cette année académique est en lecture seule.`);return}a.disabled=!0,a.innerHTML=`

                    <i class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "></i>

                    Enregistrement...

                `;try{let t=b.find(e=>e.id===l);if(!t)throw Error(`DEMANDE_INTRouvable`);if(!k(t))throw Error(`FEEDBACK_EXPIRE`);await e(o(r,`demandes_etudiants`,l),{evaluation:u,commentaire:d,feedbackAutorise:!1}),console.log(`✅ Feedback enregistré`)}catch(e){console.error(`❌ Erreur feedback :`,e),a.disabled=!1,a.innerHTML=`Valider`,e.message===`FEEDBACK_EXPIRE`?alert(`Le délai de 7 jours pour évaluer cette demande est dépassé.`):alert(`Impossible d'enregistrer votre évaluation.`)}}})});