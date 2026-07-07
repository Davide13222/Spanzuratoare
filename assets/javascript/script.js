const startButton = document.getElementById("start-game");
const gameSettings = document.querySelector(".game-settings");
const gameContainer = document.querySelector(".game-container");
const restartButton = document.getElementById("restart-game");
const wordDisplay = document.getElementById("word-display");
const livesDisplay = document.getElementById("lives-display");
const letterButtonsContainer = document.getElementById("letter-buttons");
const gameMessage = document.getElementById("game-message");

const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const inputWord = document.getElementById("input-word");
const errorMessage = document.getElementById("error-message");

let cuvantSetat = "";
let ultimulCuvantRandom = "";

let secretWord = "";
let viataRamasa = 0;
let litereGhicite = [];
let litereGresite = [];

const cuvinte = {
    animals: ["pisica", "caine", "elefant", "girafa", "tigru"],
    fruits: ["mar", "para", "banana", "portocala", "cirese"],
    countries: ["romania", "franta", "italia", "spania", "germania"]
};

const reguliDificultate = {
    easy: { maxLitere: 7, maxGreseli: 10 },
    medium: { minLitere: 7, maxLitere: 10, maxGreseli: 8 },
    hard: { minLitere: 10, maxGreseli: 6 }
};

difficultySelect.addEventListener("change", function () {
    const setari = reguliDificultate[difficultySelect.value];
    console.log(setari);
});

function esteCuvantValid(cuvant) {
    const regex = /^[a-zA-ZăâîșțĂÂÎȘȚ ]+$/;
    return regex.test(cuvant);
}

function verificaLungime(cuvant) {
    const reguli = reguliDificultate[difficultySelect.value];
    const lungime = cuvant.length;

    if (reguli.maxLitere && lungime > reguli.maxLitere) {
        return "Cuvantul are prea multe litere! Maxim " + reguli.maxLitere + ".";
    }
    if (reguli.minLitere && lungime < reguli.minLitere) {
        return "Cuvantul are prea putine litere! Minim " + reguli.minLitere + ".";
    }
    return "";
}

function valideazaCuvantIntrodus() {
    const cuvant = inputWord.value.trim();

    if (cuvant === "") {
        errorMessage.textContent = "";
        cuvantSetat = "";
        return true;
    }

    if (!esteCuvantValid(cuvant)) {
        errorMessage.textContent = "Foloseste doar litere!";
        return false;
    }

    const eroareLungime = verificaLungime(cuvant);
    if (eroareLungime !== "") {
        errorMessage.textContent = eroareLungime;
        return false;
    }

    errorMessage.textContent = "";
    cuvantSetat = cuvant.toLowerCase();
    return true;
}

function alegeCuvant() {
    const categorie = categorySelect.value;

    if (cuvantSetat !== "") {
        return cuvantSetat;
    }

    const listaCuvinte = cuvinte[categorie];
    const index = Math.floor(Math.random() * listaCuvinte.length);
    return listaCuvinte[index];
}

function initializeazaJocul() {
    const cuvantValid = valideazaCuvantIntrodus();
    if (!cuvantValid) {
        return false;
    }

    const cuvantAles = alegeCuvant();
    if (cuvantAles === null) {
        return false;
    }

    secretWord = cuvantAles;
    viataRamasa = reguliDificultate[difficultySelect.value].maxGreseli;
    litereGhicite = [];
    litereGresite = [];
    livesDisplay.textContent = "Vieti ramase: " + viataRamasa;

    return true;
}

function showWord() {
    let liniute = "";
    for (let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] === " ") {
            liniute += "&nbsp;&nbsp;&nbsp;";
        } else if (litereGhicite.includes(secretWord[i])) {
            liniute += secretWord[i].toUpperCase() + " ";
        } else {
            liniute += "_ ";
        }
    }
    wordDisplay.innerHTML = liniute;
}

function cuvantulEsteComplet() {
    for (let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] !== " " && !litereGhicite.includes(secretWord[i])) {
            return false;
        }
    }
    return true;
}

function terminaJocul(aCastigat) {
    gameContainer.classList.add("hidden");
    document.querySelector(".game-over").classList.remove("hidden");

    const finalMessage = document.getElementById("final-message");

    if (aCastigat) {
        finalMessage.textContent = "Felicitari, ai castigat! Cuvantul era: " + secretWord;
    } else {
        finalMessage.textContent = "Ai pierdut! Cuvantul era: " + secretWord;
    }
}

function dezactiveazaTasta(litera) {
    const butoane = letterButtonsContainer.querySelectorAll("button");
    for (let i = 0; i < butoane.length; i++) {
        if (butoane[i].textContent.toLowerCase() === litera) {
            butoane[i].disabled = true;
        }
    }
}

function proceseazaLitera(litera) {
    litera = litera.toLowerCase();

    dezactiveazaTasta(litera);

    if (secretWord.includes(litera)) {
        if (!litereGhicite.includes(litera)) {
            litereGhicite.push(litera);
        }
        showWord();

        if (cuvantulEsteComplet()) {
            terminaJocul(true);
        }
    } else {
        if (!litereGresite.includes(litera)) {
            litereGresite.push(litera);
            viataRamasa--;
        }

        document.getElementById("wrong-letters").textContent = litereGresite.join(", ").toUpperCase();
        livesDisplay.textContent = "Vieti ramase: " + viataRamasa;

        if (viataRamasa === 0) {
            terminaJocul(false);
        }
    }
}

document.addEventListener("keydown", function (event) {
    if (gameContainer.classList.contains("hidden")) {
        return;
    }

    const regexLitera = /^[a-zA-Z]$/;

    if (!regexLitera.test(event.key)) {
        gameMessage.textContent = "se accepta doar litere";
        return;
    }

    gameMessage.textContent = "";
    proceseazaLitera(event.key.toUpperCase());
});

function generateKeyboard() {
    letterButtonsContainer.innerHTML = "";
    const keys = [
        "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
        "A", "S", "D", "F", "G", "H", "J", "K", "L",
        "Z", "X", "C", "V", "B", "N", "M",
        "Ă", "Â", "Î", "Ș", "Ț"
    ];

    for (let i = 0; i < keys.length; i++) {
        const buton = document.createElement("button");
        buton.textContent = keys[i];
        buton.classList.add("letter-btn");

        buton.addEventListener("click", function () {
            buton.disabled = true;
            proceseazaLitera(keys[i]);
        });

        letterButtonsContainer.appendChild(buton);
    }
}

startButton.addEventListener("click", function () {
    const jocInitializat = initializeazaJocul();
    if (!jocInitializat) {
        return;
    }

    gameSettings.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    showWord();
    generateKeyboard();
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});

const playAgainButton = document.getElementById("play-again");
const closeGameButton = document.getElementById("close-game");
const gameOverScreen = document.querySelector(".game-over");

playAgainButton.addEventListener("click", function () {
    gameOverScreen.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});

closeGameButton.addEventListener("click", function () {
    gameOverScreen.classList.add("hidden");
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});