import"../../modulepreload-polyfill-Dezn_h7o.js";import{b as e,f as t,h as n,l as r,v as i}from"../../authService-D_VO4Eli.js";import{t as a}from"../../authGuard-CQaJ0AEA.js";a(`etudiant`,async({profile:a,lectureSeule:o,mode:s,anneeAcademique:c})=>{let l=document.getElementById(`codifier-content`),u=a.matricule;if(!u){l.innerHTML=`

                <div
                    class="service-indisponible"
                >

                    <div
                        class="
                            service-indisponible-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                            "
                        ></i>

                    </div>

                    <h2>
                        Service momentanément indisponible
                    </h2>

                    <p>
                        Réessayer ultérieurement.
                    </p>

                </div>

            `;return}try{let s=await t(n(e(r,`hebergements`),i(`matricule`,`==`,u),i(`anneeAcademique`,`==`,c)));if(s.empty){l.innerHTML=`

                    <div
                        class="
                            service-indisponible
                        "
                    >

                        <div
                            class="
                                service-indisponible-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-house-circle-exclamation
                                "
                            ></i>

                        </div>

                        <h2>
                            Service momentanément indisponible
                        </h2>

                        <p>
                            Réessayer ultérieurement.
                        </p>

                    </div>

                `;return}let d=s.docs[0].data();l.innerHTML=`

                <div
                    class="
                        codifier-header
                    "
                >

                    <h1>
                        Mon dossier d'hébergement
                    </h1>

                    <p>
                        Informations
                    </p>

                    <p>
                      ${c}
                    </p>

                </div>


                <div
                    class="
                        hebergement-card
                    "
                >

                    <div
                        class="
                            hebergement-card-header
                        "
                    >

                        <div
                            class="
                                hebergement-icon
                            "
                        >

                            <i
                                class="
                                    fa-solid
                                    fa-house
                                "
                            ></i>

                        </div>


                        <div>

                            <h2>
    ${a.prenom} ${a.nom}
</h2>

<p>
    Carte n° ${a.numeroEtudiant||`-`}
</p>

                        </div>

                    </div>


                    <div
                        class="
                            hebergement-info
                        "
                    >

                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Site
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${d.site||`-`}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Pavillon
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${d.pavillon||`-`}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Chambre
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${d.chambre||`-`}
                            </span>

                        </div>


                        <div
                            class="
                                hebergement-row
                            "
                        >

                            <span
                                class="
                                    hebergement-label
                                "
                            >
                                Lit
                            </span>

                            <span
                                class="
                                    hebergement-value
                                "
                            >
                                ${d.lit||`-`}
                            </span>

                        </div>

                    </div>


                    <div
    class="
        codifier-actions
    "
>

    ${o?``:`
                <button
                    id="faire-reclamation-btn"
                    class="
                        codifier-button
                        codifier-button-primary
                    "
                    type="button"
                >

                    <i
                        class="
                            fa-solid
                            fa-screwdriver-wrench
                        "
                    ></i>

                    Faire une demande de réclamation

                </button>
            `}


    <button
        id="voir-demandes-btn"
        class="
            codifier-button
            codifier-button-secondary
        "
        type="button"
    >

        <i
            class="
                fa-solid
                fa-clock-rotate-left
            "
        ></i>

        Voir mes demandes

    </button>


    <div class="codifier-loyer-separator"></div>

<button
    id="payer-loyer-btn"
    class="
        codifier-button
        codifier-button-secondary
    "
    type="button"
>

    <i
        class="
            fa-solid
            fa-money-bill-wave
        "
    ></i>

    Payer mon loyer

</button>

</div>

                </div>

            `;let f=document.getElementById(`faire-reclamation-btn`);f&&f.addEventListener(`click`,()=>{window.location.href=`./reclamation/index.html`});let p=document.getElementById(`voir-demandes-btn`);p&&p.addEventListener(`click`,()=>{window.location.href=`./mes-demandes/index.html`});let m=document.getElementById(`payer-loyer-btn`);m&&m.addEventListener(`click`,()=>{window.location.href=`./loyer/index.html`})}catch(e){console.error(`❌ Erreur récupération hébergement :`,e),l.innerHTML=`

                <div
                    class="
                        service-indisponible
                    "
                >

                    <div
                        class="
                            service-indisponible-icon
                        "
                    >

                        <i
                            class="
                                fa-solid
                                fa-triangle-exclamation
                            "
                        ></i>

                    </div>

                    <h2>
                        Service momentanément indisponible
                    </h2>

                    <p>
                        Réessayer ultérieurement.
                    </p>

                </div>

            `}});