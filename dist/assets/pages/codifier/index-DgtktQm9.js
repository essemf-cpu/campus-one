import"../../modulepreload-polyfill-Dezn_h7o.js";import{f as e,g as t,u as n,v as r,y as i}from"../../authService-DlvHUxoR.js";import{t as a}from"../../authGuard-CR_v3-ld.js";a(`etudiant`,async({profile:a,lectureSeule:o,mode:s,anneeAcademique:c})=>{let l=document.getElementById(`codifier-content`),u=a.matricule;if(!u){l.innerHTML=`

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

            `;return}try{let s=await e(t(i(n,`hebergements`),r(`matricule`,`==`,u),r(`anneeAcademique`,`==`,c)));if(s.empty){l.innerHTML=`

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

</div>

                </div>

            `;let f=document.getElementById(`faire-reclamation-btn`);f&&f.addEventListener(`click`,()=>{window.location.href=`./reclamation/index.html`});let p=document.getElementById(`voir-demandes-btn`);p&&p.addEventListener(`click`,()=>{window.location.href=`./mes-demandes/index.html`})}catch(e){console.error(`❌ Erreur récupération hébergement :`,e),l.innerHTML=`

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