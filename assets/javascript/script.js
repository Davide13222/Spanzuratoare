const startButton = document.getElementById("start-game");
const gameSettings = document.querySelector(".game-settings");
const gameContainer = document.querySelector(".game-container");

const restartButton = document.getElementById("restart-game");
const wordDisplay = document.getElementById("word-display");
const letterButtonsContainer = document.getElementById("letter-buttons");

let secretWord = "animale";

function afiseazaCuvant() {
    let liniute = "";
    for (let i = 0; i < secretWord.length; i++) {
        liniute += "_ ";
    }
    wordDisplay.textContent = liniute;
}

startButton.addEventListener("click", function () {
    gameSettings.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    afiseazaCuvant();
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});

function genereazaTastatura() {
    
    letterButtonsContainer.innerHTML = ""; 

    const alfabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let i = 0; i < alfabet.length; i++) {
        const buton = document.createElement("button");
        buton.textContent = alfabet[i];
        buton.classList.add("letter-btn");  

        buton.addEventListener("click", function () {
            buton.disabled = true; 
        });

        letterButtonsContainer.appendChild(buton);
    }
}

startButton.addEventListener("click", function () {
    gameSettings.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    afiseazaCuvant();
    genereazaTastatura(); 
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});