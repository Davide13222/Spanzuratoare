const startButton = document.getElementById("start-game");
const gameSettings = document.querySelector(".game-settings");
const gameContainer = document.querySelector(".game-container");
const restartButton = document.getElementById("restart-game");
const wordDisplay = document.getElementById("word-display");
const livesDisplay = document.getElementById("lives-display");
const letterButtonsContainer = document.getElementById("letter-buttons");
const gameMessage = document.getElementById("game-message");
const hangmanImage = document.getElementById("hangman-image");
const timerDisplay = document.getElementById("timer-display");
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

let timerSeconds = 30;
let timerInterval = null;
const words = {
    animals: ["pisica", "caine", "elefant", "girafa", "tigru"],
    fruits: ["mar", "para", "banana", "portocala", "cirese"],
    countries: ["romania", "franta", "italia", "spania", "germania"]
};

const difficultyRules = {
    easy: { maxLetters: 7, maxWrongGuesses: 10 },
    medium: { minLetters: 7, maxLetters: 10, maxWrongGuesses: 8 },
    hard: { minLetters: 10, maxWrongGuesses: 8 }
};

difficultySelect.addEventListener("change", function () {
    const settings = difficultyRules[difficultySelect.value];
    console.log(settings);
});

// Check whether the entered word contains only letters, spaces, and hyphens.
function isWordValid(word) {
    const regex = /^[a-zA-ZăâîșțĂÂÎȘȚ \-]+$/;
    return regex.test(word);
}

// Check whether the word length matches the selected difficulty rules.
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

// Validate the word entered in the custom input field and save it if it is correct.
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

// Choose a word from the selected category or use the word entered by the player.
function chooseWord() {
    const category = categorySelect.value;

    if (wordSet !== "") {
        return wordSet;
    }

    const wordsList = words[category];
    const index = Math.floor(Math.random() * wordsList.length);
    return wordsList[index];
}

// Update the hangman image based on the current game stage.
function updateHangmanImage(stage) {
    const totalStages = 6;
    const currentStage = Math.min(stage, totalStages);
    hangmanImage.src = "assets/images/" + currentStage + ".svg";

    // Remove and re-add pop class to retrigger animation
    hangmanImage.classList.remove("hangman-pop");
    void hangmanImage.offsetWidth; //force reflow
    hangmanImage.classList.add("hangman-pop");
}

// Initialize the game state and prepare the word, lives, and messages.
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

// Display the secret word as underscores and guessed letters.
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

// Check whether all letters of the word have been guessed.
function wordIsComplete() {
    for (let i = 0; i < secretWord.length; i++) {
        if (secretWord[i] !== " " && !lettersGuessed.includes(secretWord[i])) {
            return false;
        }
    }
    return true;
}

// Start the timer for hard mode and apply a penalty when time runs out.
function startTimer() {
    // Only on hard difficulty
    if (difficultySelect.value !== "hard") {
        timerDisplay.classList.add("hidden");
        return;
    }

    timerSeconds = 30;
    timerDisplay.classList.remove("hidden", "timer-urgent");
    updateTimerDisplay();

    timerInterval = setInterval(function () {
        timerSeconds--;

        if (timerSeconds <= 10) {
            timerDisplay.classList.add("timer-urgent");
        }

        updateTimerDisplay();

        if (timerSeconds <=0) {
            //Time's up auto penalty 
            gameMessage.textContent = "Timpul a expirat, pierzi o viata."
            gameMessage.style.color = "red";

            //Lose life
            livesRemaining--;
            livesDisplay.textContent = "Vieti ramase: " + livesRemaining;

            //Advance hangman image
            const wrongCount = wrongLetters.length + 1;
            const stage = Math.ceil((wrongCount / maxWrongGuesses) * 6);
            updateHangmanImage(stage);

        triggerWrongAnimation();
        if (livesRemaining <= 0) {
            stopTimer();
            endGame(false);
            return;
        }

        // Reset timer for next letter
        resetTimer();
        }
    }, 1000);
}

// Reset the timer and restart it for the next time round.
function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 30;
    timerDisplay.classList.remove("timer-urgent");
    updateTimerDisplay();

    //Restart if still on hard difficulty and game is active
    if (difficultySelect.value === "hard" && !gameContainer.classList.contains("hidden")) {
        timerInterval = setInterval(function () {
            timerSeconds--;

            if (timerSeconds <= 10) {
                timerDisplay.classList.add("timer-urgent");
            }

            updateTimerDisplay();

            if (timerSeconds <= 0) {
                gameMessage.textContent = "Timpul a expirat, pierzi o viata.";
                gameMessage.style.color = "red";

                livesRemaining--;
                livesDisplay.textContent = "Vieti ramase: " + livesRemaining;

                const wrongCount = wrongLetters.length + 1;
                const stage = Math.ceil((wrongCount / maxWrongGuesses) * 6);
                updateHangmanImage(stage)
                triggerWrongAnimation();
                if (livesRemaining <= 0) {
                    stopTimer();
                    endGame(false);
                    return;
                }

                resetTimer();
            }
        

        }, 1000);
    }
}

// Stop the active timer so it does not continue in the background.
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Update the text that shows the remaining time in the game.
function updateTimerDisplay() {
    timerDisplay.textContent = "Timp ramas: " + timerSeconds + "s";
}

// Animation functions 

// Trigger the error animation when the player guesses a letter incorrectly.
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

// Trigger the success animation for a correctly guessed letter.
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

// Mark a letter button as correct or incorrect based on the player's choice.
function markButton(letter, isCorrect) {
    const buttons = letterButtonsContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.toLowerCase() === letter.toLowerCase()) {
            buttons[i].classList.add(isCorrect ? "correct-guess" : "wrong-guess");
        }
    }
}

// Generate confetti to animate a win.
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

// Run the special animations at the end of a win.
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

// Run the special animations at the end of a loss.
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

// Build a link to the Dexonline definition page for the current word.
function getWordDefinitionLink(word) {
    if (!word) {
        return "";
    }

    const normalizedWord = word.toLowerCase().trim();
    return `https://dexonline.ro/definitie/${encodeURIComponent(normalizedWord)}`;
}

// Display a clickable link to the word definition inside the game-over screen.
function showWordDefinition(link) {
    const gameOverScreen = document.querySelector(".game-over");
    const existingDefinition = document.getElementById("word-definition");

    if (existingDefinition) {
        existingDefinition.remove();
    }

    if (!link) {
        return;
    }

    const definitionElement = document.createElement("a");
    definitionElement.id = "word-definition";
    definitionElement.href = link;
    definitionElement.target = "_blank";
    definitionElement.rel = "noopener noreferrer";
    definitionElement.textContent = "Vezi definiția pe Dexonline";
    definitionElement.style.display = "inline-block";
    definitionElement.style.marginTop = "12px";
    definitionElement.style.fontSize = "0.95rem";
    definitionElement.style.color = "#7dd3fc";
    definitionElement.style.textDecoration = "none";
    definitionElement.style.fontWeight = "600";
    definitionElement.style.lineHeight = "1.5";

    gameOverScreen.appendChild(definitionElement);
}

// Finish the game and show the end screen with the appropriate result.
async function endGame(hasWon) {
    stopTimer();

    if (hasWon) {
        triggerWinAnimation();
    } else {
        triggerLoseAnimation();
    }

    const definitionLink = getWordDefinitionLink(secretWord);

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

        showWordDefinition(definitionLink);
    }, 800);
}

// Disable the letter button after it has been selected once.
function deactivateKey(letter) {
    const buttons = letterButtonsContainer.querySelectorAll("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.toLowerCase() === letter) {
            buttons[i].disabled = true;
        }
    }
}

// Process the player's choice and update the game state.
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
            stopTimer();
            endGame(true);
            return;
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

        const wrongCount = wrongLetters.length;
        const stage = Math.ceil((wrongCount / maxWrongGuesses) * 6);
        updateHangmanImage(stage);

        triggerWrongAnimation();

        if (livesRemaining === 0) {
            stopTimer();
            endGame(false);
            return;
        }
    }

    resetTimer();
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

// Generate the virtual keyboard with the letters available for the game.
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
    startTimer();
});

restartButton.addEventListener("click", function () {
    stopTimer();
    gameContainer.classList.add("hidden");
    gameContainer.classList.remove("lose-flash", "shake");
    gameSettings.classList.remove("hidden");
});

const playAgainButton = document.getElementById("play-again");
const closeGameButton = document.getElementById("close-game");
const gameOverScreen = document.querySelector(".game-over");

playAgainButton.addEventListener("click", function () {
    stopTimer();
    gameOverScreen.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});

closeGameButton.addEventListener("click", function () {
    stopTimer();
    gameOverScreen.classList.add("hidden");
    gameContainer.classList.add("hidden");
    gameSettings.classList.remove("hidden");
});
