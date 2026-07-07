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
    
    const letterButtonsContainer = document.getElementById("letter-buttons");
    letterButtonsContainer.innerHTML = ""; 
    const taste = [
        "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", // 10 taste
        "A", "S", "D", "F", "G", "H", "J", "K", "L",      // 9 taste
        "Z", "X", "C", "V", "B", "N", "M",                // 7 taste
        "Ă", "Â", "Î", "Ș", "Ț", "-",                     // 6 taste (diacritice + cratimă)
        "Spațiu"                                          // 1 tastă extra-lată
    ];

    for (let i = 0; i < taste.length; i++) {
        const buton = document.createElement("button");
        buton.textContent = taste[i];
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
