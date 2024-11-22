document.addEventListener("DOMContentLoaded", () => {
    const exercises = document.querySelectorAll(".unscramble-exercise");

    exercises.forEach(exercise => {
        const scrambledWordsContainer = exercise.querySelector(".scrambled-words");
        const dropArea = exercise.querySelector(".drop-area");
        const feedback = exercise.querySelector(".feedback");
        
        // Parse all correct sentences from the `data-correct` attribute
        const allCorrectSentences = exercise.dataset.correct.split(",").map(s => s.trim());
        
        // Track the index of the current correct sentence
        exercise.dataset.currentIndex = 0;

        console.log("All Correct Sentences:", allCorrectSentences);

        // Initialize the exercise with the first correct sentence
        initExercise(scrambledWordsContainer, dropArea, allCorrectSentences[0].split(" "));

        // Event listeners for buttons
        exercise.querySelector(".check").addEventListener("click", () => {
            checkAnswer(dropArea, feedback, allCorrectSentences);
        });

        exercise.querySelector(".show").addEventListener("click", () => {
            scrambledWordsContainer.innerHTML = ""; // Clear pool
            const currentIndex = parseInt(exercise.dataset.currentIndex, 10);
            showAnswer(dropArea, feedback, allCorrectSentences[currentIndex]);
            // Update the index for the next correct sentence
            exercise.dataset.currentIndex = (currentIndex + 1) % allCorrectSentences.length;

        });

        exercise.querySelector(".reset").addEventListener("click", () => {
            resetExercise(scrambledWordsContainer, dropArea, feedback, allCorrectSentences[0].split(" "));
        });
    });
});

// Initialize the exercise
function initExercise(scrambledWordsContainer, dropArea, words) {
    const shuffledWords = shuffle(words);

    scrambledWordsContainer.innerHTML = "";
    dropArea.innerHTML = "";

    // Add shuffled words to the pool
    shuffledWords.forEach(word => {
        scrambledWordsContainer.appendChild(createWordBlock(word));
    });

    // Add empty slots
    words.forEach(() => {
        const slot = document.createElement("div");
        slot.className = "drop-slot";
        slot.addEventListener("dragover", e => e.preventDefault());
        slot.addEventListener("drop", e => handleDrop(e, slot, scrambledWordsContainer));
        dropArea.appendChild(slot);
    });
}

// Create a draggable word block
function createWordBlock(word) {
    const wordBlock = document.createElement("div");
    wordBlock.className = "word-block";
    wordBlock.textContent = word;
    wordBlock.draggable = true;

    wordBlock.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", word);
        wordBlock.classList.add("dragging");
    });

    wordBlock.addEventListener("dragend", () => {
        wordBlock.classList.remove("dragging");
    });

    return wordBlock;
}function handleDrop(e, slot, scrambledWordsContainer) {
    e.preventDefault();

    const draggingWordBlock = document.querySelector(".word-block.dragging");
    if (!draggingWordBlock) return;

    const existingWord = slot.firstChild;
    const originalParent = draggingWordBlock.parentElement;

    // If the slot is already filled, swap the words
    if (existingWord) {
        if (originalParent.classList.contains("drop-slot")) {
            // Swap the existing word into the dragging word's original slot
            originalParent.appendChild(existingWord);
        } else {
            // If the dragging word came from the pool, move the existing word back to the pool
            scrambledWordsContainer.appendChild(existingWord);
        }
    }

    // Place the dragging word into the target slot
    slot.appendChild(draggingWordBlock);

    console.log("Swapped word:", draggingWordBlock.textContent, "with:", existingWord ? existingWord.textContent : "empty");
}


// Shuffle words randomly
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Check user's sentence against all correct sentences
function checkAnswer(dropArea, feedback, allCorrectSentences) {
    const userSentenceArray = Array.from(dropArea.children).map(slot => slot.firstChild ? slot.firstChild.textContent : "");
    console.log("User Sentence Array:", userSentenceArray);

    let isFullyCorrect = allCorrectSentences.some(correctSentence => {
        const correctWords = correctSentence.split(/\s+/);
        return userSentenceArray.every((word, index) => word === correctWords[index]);
    });

    Array.from(dropArea.children).forEach((slot, index) => {
        const word = slot.firstChild ? slot.firstChild.textContent : "";
        slot.className = `drop-slot ${
            word && allCorrectSentences.some(sentence => sentence.split(/\s+/)[index] === word)
                ? "correct"
                : "wrong"
        }`;
    });

    feedback.textContent = isFullyCorrect ? "Correct!" : "Some words are incorrect or missing!";
    feedback.style.color = isFullyCorrect ? "green" : "red";
}

// Show the correct sentence
function showAnswer(dropArea, feedback, correctSentence) {
    const words = correctSentence.split(/\s+/);
    console.log("Correct Sentence Words:", words);

    Array.from(dropArea.children).forEach((slot, index) => {
        slot.innerHTML = ""; // Clear slot
        if (words[index]) {
            slot.appendChild(createWordBlock(words[index])); // Add correct word
        }
    });

    feedback.textContent = "This is the correct sentence.";
    feedback.style.color = "blue";
}

// Reset the exercise
function resetExercise(scrambledWordsContainer, dropArea, feedback, words) {
    initExercise(scrambledWordsContainer, dropArea, words);
    feedback.textContent = "";
}
