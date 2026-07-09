const startButton = document.getElementById("start-game");
const gameSettings = document.querySelector(".game-settings");
const gameContainer = document.querySelector(".game-container");
const restartButton = document.getElementById("restart-game");
const wordDisplay = document.getElementById("word-display");
const livesDisplay = document.getElementById("lives-display");
const letterButtonsContainer = document.getElementById("letter-buttons");
const gameMessage = document.getElementById("game-message");
const hangmanImage = document.getElementById("hangman-image");

const difficultySelect = document.getElementById("difficulty");
const categorySelect = document.getElementById("category");
const inputWord = document.getElementById("input-word");
const errorMessage = document.getElementById("error-message");

let wordSet = "";
let lastRandomWord = "";

let secretWord = "";
let livesRemaining = 0;
let maxWrongGuesses = 0;
let lettersGuessed = [];
let wrongLetters = [];

const words = {
    animals: ["pisica", "caine", "elefant", "girafa", "tigru"],
    fruits: ["mar", "para", "banana", "portocala", "cirese"],
    countries: ["romania", "franta", "italia", "spania", "germania"]
};

const difficultyRules = {
    easy: { maxLetters: 7, maxWrongGuesses: 10 },
    medium: { minLetters: 7, maxLetters: 10, maxWrongGuesses: 8 },
    hard: { minLetters: 10, maxWrongGuesses: 6 }
};

difficultySelect.addEventListener("change", function () {
    const setari = difficultyRules[difficultySelect.value];
    console.log(setari);
});

function isWordValid(word) {
    const regex = /^[a-zA-ZăâîșțĂÂÎȘȚ \-]+$/;
    return regex.test(word);
}

function checkWordLength(word) {
    const rules = difficultyRules[difficultySelect.value];
    const length = word.length;

    if (rules.maxLetters && length > rules.maxLetters) {
        return "Cuvantul are prea multe litere! Maxim " + rules.maxLetters + ".";
    }
    if (rules.minLetters && length < rules.minLetters) {
        return "Cuvantul are prea putine litere! Minim " + rules.minLetters + ".";
    }
    return "";
}

function validateInputWord() {
    const word = inputWord.value.trim();

    if (word === "") {
        errorMessage.textContent = "";
        wordSet = "";
        return true;
    }

    if (!isWordValid(word)) {
        errorMessage.textContent = "Foloseste doar litere si cratime!";
        return false;
    }

    const errorLength = checkWordLength(word);
    if (errorLength !== "") {
        errorMessage.textContent = errorLength;
        return false;
    }

    errorMessage.textContent = "";
    wordSet = word.toLowerCase();
    return true;
}

function chooseWord() {
    const category = categorySelect.value;

    if (wordSet !== "") {
        return wordSet;
    }

    const wordsList = words[category];
    const index = Math.floor(Math.random() * wordsList.length);
    return wordsList[index];
}
// Update the hangman image based on the current stage
function updateHangmanImage(stage) {
    const totalStages = 6;
    const currentStage = Math.min(stage, totalStages);
    hangmanImage.src = "assets/images/" + currentStage + ".svg";

    // Remove and re-add pop class to retrigger animation
    hangmanImage.classList.remove("hangman-pop");
    void hangmanImage.offsetWidth; //force reflow
    hangmanImage.classList.add("hangman-pop");
}

function initializeGame() {
    const wordValid = validateInputWord();
    if (!wordValid) {
        return false;
    }

    const wordChosen = chooseWord();
    if (wordChosen === null) {
        return false;
    }

    secretWord = wordChosen;
    maxWrongGuesses = difficultyRules[difficultySelect.value].maxWrongGuesses;
    livesRemaining = maxWrongGuesses;
    lettersGuessed = [];
    wrongLetters = [];
    livesDisplay.textContent = "Vieti ramase: " + livesRemaining;
    document.getElementById("wrong-letters").textContent = "";
    gameMessage.textContent = "";

    // Reset hangman to stage 0
    updateHangmanImage(0);

    return true;
}

function showWord() {
    let underScore = "";
    for (let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] === " ") {
            underScore += "&nbsp;";
        } else if (lettersGuessed.includes(secretWord[i])) {
            underScore += secretWord[i].toUpperCase() + " ";
        } else {
            underScore += "_ ";
        }
    }
    wordDisplay.innerHTML = underScore;
}

function wordIsComplete() {
    for (let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] !== " " && !lettersGuessed.includes(secretWord[i])) {
            return false;
        }
    }
    return true;
}

// Animation functions 

function triggerWrongAnimation() {
    // Shake the hangman image with red glow
    hangmanImage.classList.remove("hangman-wrong");
    void hangmanImage.offsetWidth; //force reflow
    hangmanImage.classList.add("hangman-wrong");

    // Shake the whole game container lightly
    gameContainer.classList.remove("shake");
    void gameContainer.offsetWidth; //force reflow
    gameContainer.classList.add("shake");

    // Flash the lives display red
    livesDisplay.style.color = "red";
    setTimeout(function () {
        livesDisplay.style.color = "orange";
    }, 1000);

    // Show message
    gameMessage.classList.remove("message-flash");
    void gameMessage.offsetWidth; //force reflow
    gameMessage.classList.add("message-flash");
}

function triggerCorrectAnimation() {
    // Green glow on the word display area
    wordDisplay.classList.remove("word-bounce", "letter-correct");
    void wordDisplay.offsetWidth; //force reflow
    wordDisplay.classList.add("word-bounce");
    wordDisplay.classList.add("letter-correct");

    // Brief green border glow on hangman image
    hangmanImage.style.filter = "drop-shadow(0 0 8px green)";
    setTimeout(function () {
        hangmanImage.style.filter = "";
    }, 500);

    gameMessage.textContent = "Corect!";
    gameMessage.style.color = "green"; 
    setTimeout(function () {
        gameMessage.textContent = "";
        gameMessage.style.color = "orange";
    }, 1200);
}

function markButton(letter, isCorrect) {
    const buttons = letterButtonsContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.toLowerCase() === letter.toLowerCase()) {
            buttons[i].classList.add(isCorrect ? "correct-guess" : "wrong-guess");
        }
    }
}

function spawnConfetti() {
    const colors = ["#e8b84b", "#2ecc71", "#d97757", "#4A90D9", "#FF6B6B", "#FFD700", "#FF69B4", "#00CED1"];
    const shapes = ["circle", "square"];

    for (let i = 0; i < 80; i++) {
        const piece = document.createElement("div");
        piece.classList.add("confetti-piece");

        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const size = 8 + Math.random() * 14;

        piece.style.backgroundColor = color;
        piece.style.left = left + "%";
        piece.style.width = size + "px";
        piece.style.height = size + "px";
        piece.style.animationDelay = delay + "s";
        piece.style.animationDuration = (2 + Math.random() * 2) + "s";

        if (shapes[Math.floor(Math.random() * shapes.length)] === "circle") {
            piece.style.borderRadius = "50%";
        }

        document.body.appendChild(piece);

        // Remove after animation ends
        setTimeout(function () {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        }, 4500);
    }   
}

function triggerWinAnimation() {
    // Confetti rain
    spawnConfetti();

    // Hangman image celebration bounce
    hangmanImage.classList.remove("win-celebration");
    void hangmanImage.offsetWidth; //force reflow
    hangmanImage.classList.add("win-celebration");

    // Flash the game container border gold
    gameContainer.style.border = "3px solid #e8b84b";
    gameContainer.style.boxShadow = "0 0 30px rgba(232, 184, 75, 0.5)";
    setTimeout(function () {
        gameContainer.style.border = "2px solid #3d4453";
        gameContainer.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4)";
    }, 2000);
}

function triggerLoseAnimation() {
    // Red flash overlay on container
    gameContainer.classList.remove("lose-flash");
    void gameContainer.offsetWidth; //force reflow
    gameContainer.classList.add("lose-flash");

    // Hangman image skull bounce
    hangmanImage.classList.remove("hangman-dead");
    void hangmanImage.offsetWidth; //force reflow
    hangmanImage.classList.add("hangman-dead");

    gameMessage.textContent = wompMessages[Math.floor(Math.random() * wompMessages.length)];
    gameMessage.style.color = "#d97757";
    gameMessage.classList.add("message-flash");

    // Spawn a few red-toned confetti pieces for dramatic effect
    const redColors = ["#d97757", "#8B0000", "#FF4444", "#4a0000"];
    for (let i = 0; i < 20; i++) {
        const piece = document.createElement("div");
        piece.classList.add("confetti-piece");
        piece.style.backgroundColor = redColors[Math.floor(Math.random() * redColors.length)];
        piece.style.left = Math.random() * 100 + "%";
        piece.style.width = 8 + Math.random() * 10 + "px";
        piece.style.height = 8 + Math.random() * 10 + "px";
        piece.style.animationDelay = Math.random() * 1 + "s";
        piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
        document.body.appendChild(piece);
        setTimeout(function () {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        }, 4000)
    }

}

const wompMessages = [
    "Womp womp...",
    "Ai pierdut!",
    "Ghinion!",
    "Data viitoare!",
    "Offf...",
    "Nu-i nimic, mai incearca!",
];

function endGame(hasWon) {
    if (hasWon) {
        triggerWinAnimation();
    } else {
        triggerLoseAnimation();
    }

    // Short delay before showing game over screen so animations play
    setTimeout(function () {
    gameContainer.classList.add("hidden");
    document.querySelector(".game-over").classList.remove("hidden");

    const finalMessage = document.getElementById("final-message");

    if (hasWon) {
        finalMessage.textContent = "Felicitari, ai castigat! Cuvantul era: " + secretWord;
        finalMessage.style.color = "green";
    } else {
        finalMessage.textContent = "Ai pierdut! Cuvantul era: " + secretWord;
        finalMessage.style.color = "red";
    }
    }, 800);
}

function deactivateKey(letter) {
    const buttons = letterButtonsContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.toLowerCase() === letter) {
            buttons[i].disabled = true;
        }
    }
}

function processKey(letter) {
    letter = letter.toLowerCase();

    // Already guessed? Skip
    if (lettersGuessed.includes(letter) || wrongLetters.includes(letter)) {
        return;
    }

    deactivateKey(letter);

    if (secretWord.includes(letter)) {
        // CORRECT GUESS
        if (!lettersGuessed.includes(letter)) {
            lettersGuessed.push(letter);
        }
        markButton(letter, true);
        showWord();
        triggerCorrectAnimation();

        if (wordIsComplete()) {
            endGame(true);
        }
    } else {
        // WRONG GUESS
        if (!wrongLetters.includes(letter)) {
            wrongLetters.push(letter);
            livesRemaining--;
        }
        
        markButton(letter, false);
        document.getElementById("wrong-letters").textContent = wrongLetters.join(", ").toUpperCase();
        livesDisplay.textContent = "Vieti ramase: " + livesRemaining;

        // Update hangman image based on wrong guesses
        const wrongCount = wrongLetters.length;
        // Scale to 6 stages
        const stage = Math.ceil((wrongCount / maxWrongGuesses) * 6);
        updateHangmanImage(stage);

        triggerWrongAnimation();

        if (livesRemaining === 0) {
            endGame(false);
        }
    }
}

document.addEventListener("keydown", function (event) {
    if (gameContainer.classList.contains("hidden")) {
        return;
    }

    const regexWord = /^[a-zA-ZăâîșțĂÂÎȘȚ]$/;

    // Normalize Romanian diacritics for keyboard input
    let key = event.key.toLowerCase();
    const diacriticsMap = {
        "ă": "a", "â": "a", "î": "i", "ș": "s", "ț": "t"
    };

    if (!regexWord.test(event.key) && !diacriticsMap[key]) {
        gameMessage.textContent = "Se accepta doar litere";
        gameMessage.style.color = "red";
        return;
    }

    gameMessage.textContent = "";
    gameMessage.style.color = "orange";

    // For keyboard input, map diacritics to their base letter for matching
    // (the word may contain diacritics but keyboard input is often without)
    processKey(event.key.toLowerCase());
});

function generateKeyboard() {
    letterButtonsContainer.innerHTML = "";
     const keys = [
        "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", 
        "A", "S", "D", "F", "G", "H", "J", "K", "L",      
        "Z", "X", "C", "V", "B", "N", "M",                
        "Ă", "Â", "Î", "Ș", "Ț", "-",                                                              
    ];

    for (let i = 0; i < keys.length; i++) {
        const buton = document.createElement("button");
        buton.textContent = keys[i];
        buton.classList.add("letter-btn");

        buton.addEventListener("click", function () {
            if (buton.disabled) return;
            buton.disabled = true;
            processKey(keys[i]);
        });

        letterButtonsContainer.appendChild(buton);
    }
}

startButton.addEventListener("click", function () {
    const gameInitialized = initializeGame();
    if (!gameInitialized) {
        return;
    }

    gameSettings.classList.add("hidden");
    gameContainer.classList.remove("hidden");

    // Reset container styles from previous games
    gameContainer.style.border = "2px solid #3d4453";
    gameContainer.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.4)";
    gameContainer.classList.remove("lose-flash", "shake");

    showWord();
    generateKeyboard();
});

restartButton.addEventListener("click", function () {
    gameContainer.classList.add("hidden");
    gameContainer.classList.remove("lose-flash", "shake");
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