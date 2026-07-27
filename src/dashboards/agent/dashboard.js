const agent = JSON.parse(
    sessionStorage.getItem("agent")
);

if (!agent) {

    window.location.href =
    "../../auth/login.html";

}

document.getElementById("welcome").textContent =
`Bienvenue ${agent.prenom} ${agent.nom}`;

document.getElementById("fonction").textContent =
agent.fonction;

document.getElementById("service").textContent =
agent.service;

document.getElementById("affectation").textContent =
agent.affectation;