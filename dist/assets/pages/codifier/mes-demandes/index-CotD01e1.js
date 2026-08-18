import"../../../modulepreload-polyfill-Dezn_h7o.js";import{_ as e,b as t,g as n,l as r,m as i,v as a,y as o}from"../../../authService-kcLQHjqZ.js";import{t as s}from"../../../authGuard-NXoHQF1z.js";import{t as c}from"../../../referentielService-lzYZwhmV.js";s(`etudiant`,async({profile:s})=>{let l=document.getElementById(`demandes-container`);if(!l){console.error(`❌ demandes-container introuvable`);return}let u=s.matricule;if(!u){l.innerHTML=`

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

            `;return}let d=document.getElementById(`retour-btn`);d&&d.addEventListener(`click`,()=>{window.location.href=`../index.html`});let f=document.getElementById(`demandes-search`),p=document.getElementById(`demandes-sort-select`),m=document.getElementById(`demandes-type-select`),h=document.getElementById(`demandes-statut-select`),g=[],_=``,v=`date_desc`,y=`tous`,b=`tous`,x=[];try{x=await c()}catch(e){console.error(`❌ Erreur récupération types de travaux :`,e)}m&&x.forEach(e=>{m.innerHTML+=`

                <option value="${e.id}">
                    ${e.nom}
                </option>

            `});let S=e=>{if(e.date?.toDate)return e.date.toDate();if(e.date){let t=new Date(e.date);if(!isNaN(t.getTime()))return t}return new Date(0)},C=e=>e===`en_cours`?`En cours`:e===`termine`?`Terminée`:e===`forclos`?`Forclos`:e===`non_termine`?`Non terminée`:`En attente`,w=()=>{let e=[...g];if(_){let t=_.toLowerCase().trim();e=e.filter(e=>{let n=C(e.statut);return[e.probleme,e.type,e.localisation,e.chambre,n,e.cause].filter(Boolean).join(` `).toLowerCase().includes(t)})}if(y!==`tous`&&(e=e.filter(e=>e.type===y)),b!==`tous`&&(e=e.filter(e=>(e.statut||`en_attente`)===b)),e.sort((e,t)=>v===`date_desc`?S(t)-S(e):v===`date_asc`?S(e)-S(t):v===`statut`?C(e.statut).localeCompare(C(t.statut),`fr`):v===`type`?`${e.type||``}`.localeCompare(`${t.type||``}`,`fr`):0),e.length===0){l.innerHTML=`

                        <div class="empty-state">

                            <i class="
                                fa-solid
                                fa-magnifying-glass
                            "></i>

                            <p>

                                ${_?`Aucune demande ne correspond à votre recherche.`:`Vous n'avez encore formulé aucune demande.`}

                            </p>

                        </div>

                    `;return}l.innerHTML=``,e.forEach(e=>{let t=e.statut||`en_attente`,n=`En attente`,r=`status-attente`;t===`en_cours`?(n=`En cours`,r=`status-cours`):t===`termine`?(n=`Terminée`,r=`status-termine`):t===`forclos`?(n=`Forclos`,r=`status-forclos`):t===`non_termine`&&(n=`Non terminée`,r=`status-non-termine`);let i=S(e),a=i.getTime()===0?`-`:i.toLocaleDateString(`fr-FR`),o=``;e.cause&&(o=`

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

                                `:e.feedbackAutorise===!0?`

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

                                        Évaluation indisponible

                                    </div>

                                `:`

                                <div class="feedback-locked">

                                    <i class="
                                        fa-solid
                                        fa-lock
                                    "></i>

                                    Évaluation indisponible

                                </div>

                            `,l.innerHTML+=`

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

                        `})};f&&f.addEventListener(`input`,()=>{_=f.value,w()}),p&&p.addEventListener(`change`,()=>{v=p.value,w()}),m&&m.addEventListener(`change`,()=>{y=m.value,w()}),h&&h.addEventListener(`change`,()=>{b=h.value,w()}),i(n(o(r,`demandes_etudiants`),a(`matricule`,`==`,u)),e=>{console.log(`📋 Mes demandes :`,e.size),g=[],e.forEach(e=>{g.push({id:e.id,...e.data()})}),w()},e=>{console.error(`❌ Erreur écoute demandes :`,e),l.innerHTML=`

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

                `}),l.addEventListener(`click`,async n=>{let i=n.target.closest(`.feedback-star`);if(i){let e=i.closest(`.feedback-form`);if(!e)return;let t=Number(i.dataset.note);e.dataset.note=t,e.querySelectorAll(`.feedback-star`).forEach(e=>{let n=Number(e.dataset.note);e.classList.toggle(`selected`,n<=t)});let n=e.querySelector(`.feedback-submit`);n&&e.dataset.avis&&(n.disabled=!1);return}let a=n.target.closest(`.feedback-choice`);if(a){let e=a.closest(`.feedback-form`);if(!e)return;e.dataset.avis=a.dataset.avis,e.querySelectorAll(`.feedback-choice`).forEach(e=>{e.classList.remove(`selected`)}),a.classList.add(`selected`);let t=e.querySelector(`.feedback-submit`);t&&e.dataset.note&&(t.disabled=!1);return}let o=n.target.closest(`.feedback-submit`);if(!o)return;let s=o.closest(`.feedback-form`),c=o.dataset.id;if(!s||!c)return;let l=Number(s.dataset.note),u=s.dataset.avis;if(!(!l||!u||o.disabled)){o.disabled=!0,o.innerHTML=`

                    <i class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "></i>

                    Enregistrement...

                `;try{await e(t(r,`demandes_etudiants`,c),{evaluation:l,commentaire:u,feedbackAutorise:!1}),console.log(`✅ Feedback enregistré`)}catch(e){console.error(`❌ Erreur feedback :`,e),o.disabled=!1,o.innerHTML=`Valider`,alert(`Impossible d'enregistrer votre évaluation.`)}}})});