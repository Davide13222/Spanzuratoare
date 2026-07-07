const startButton = document.getElementById("start-game");
const gameSettings = document.querySelector(".game-settings");
const gameContainer = document.querySelector(".game-container");

const restartButton = document.getElementById("restart-game");
const wordDisplay = document.getElementById("word-display");
const letterButtonsContainer = document.getElementById("letter-buttons");

let secretWord = "animale";

function showWord() {
    let liniute = "";
    for (let i = 0; i < secretWord.length; i++) {
        liniute += "_ ";
    }
    wordDisplay.textContent = liniute;
}

startButton.addEventListener("click", function () {
    gameSettings.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    showWord();
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});

function generateKeyboard() {
    
    const letterButtonsContainer = document.getElementById("letter-buttons");
    letterButtonsContainer.innerHTML = ""; 
    const keys = [
        "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", // 10 keys
        "A", "S", "D", "F", "G", "H", "J", "K", "L",      // 9 keys
        "Z", "X", "C", "V", "B", "N", "M",                // 7 keys
        "Ă", "Â", "Î", "Ș", "Ț", "-",                     // 6 keys (diacritics + hyphen)
        "Spațiu"                                          // 1 key extra-wide
    ];

    for (let i = 0; i < keys.length; i++) {
        const buton = document.createElement("button");
        buton.textContent = keys[i];
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
    showWord();
    generateKeyboard(); 
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});
