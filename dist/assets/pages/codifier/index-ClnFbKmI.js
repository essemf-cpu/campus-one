import"../../modulepreload-polyfill-Dezn_h7o.js";import{f as e,g as t,l as n,v as r,y as i}from"../../authService-kcLQHjqZ.js";import{t as a}from"../../authGuard-NXoHQF1z.js";a(`etudiant`,async({profile:a})=>{let o=document.getElementById(`codifier-content`),s=a.matricule;if(!s){o.innerHTML=`

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

            `;return}try{let c=await e(t(i(n,`hebergements`),r(`matricule`,`==`,s)));if(c.empty){o.innerHTML=`

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

                `;return}let l=c.docs[0].data();o.innerHTML=`

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
                                ${l.site||`-`}
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
                                ${l.pavillon||`-`}
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
                                ${l.chambre||`-`}
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
                                ${l.lit||`-`}
                            </span>

                        </div>

                    </div>


                    <div
                        class="
                            codifier-actions
                        "
                    >

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

            `;let u=document.getElementById(`faire-reclamation-btn`);u&&u.addEventListener(`click`,()=>{window.location.href=`./reclamation/index.html`});let d=document.getElementById(`voir-demandes-btn`);d&&d.addEventListener(`click`,()=>{window.location.href=`./mes-demandes/index.html`})}catch(e){console.error(`❌ Erreur récupération hébergement :`,e),o.innerHTML=`

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