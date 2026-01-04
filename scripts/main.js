const inputField = document.getElementById("enter")
const wordField = document.getElementById("text")
const header = document.getElementById("header")
const results = document.getElementById("results")

let currentWord = 0
let correctKeys = 0
let testLength = 10
let extraKeys = 0
let testStart = 0
let testStarted = false
let mode = "scripture"
let passage = ''

// init lists 
let verseBank = []; 
fetch("./lists/verses.txt")
  .then(res => res.text())
  .then(text => {
    verseBank = text.split('|');
    setTestLength("verse"); 
  })
  .catch(err => console.error(err));

let wordBank = [];
fetch("./lists/wordlist.txt")
  .then(res => res.text())
  .then(text => {
    wordBank = text.split('\n');
  })
  .catch(err => console.error(err));

let generatedWords = []

function setWordField() {
    // Reset class for word spans and input field
    results.classList.add("invisible")
    inputField.classList.remove("currentlyIncorrect")
    for (let i = 0; i < testLength; i++) {
        wordField.children[i].className = "";
    };
    wordField.children[0].classList.add("active");
    currentWord = 0;
    correctKeys = 0;
    extraKeys = 0;
    testStarted = false;
    // Generate words from word bank
    if (mode == "words") {
        generatedWords = [];
        for (let i = 0; i < testLength; i++) {
            word = wordBank[Math.floor(Math.random() * wordBank.length)];
            generatedWords.push(word);
            wordField.children[i].textContent = word + ' ';
        };
    } else {
        generatedWords = passage;
        for (let i = 0; i < testLength; i++) {
            wordField.children[i].textContent = generatedWords[i] + ' ';
        }
    }
};

function checkWord() {
    // Get typed word
    word = inputField.value;
    // If input field isn't blank
    if (word != "") {
        // Check if word was typed correctly
        if (word == generatedWords[currentWord]) {
            wordField.children[currentWord].classList.add("correct");
        } else {
            wordField.children[currentWord].classList.add("incorrect");
        }
        // Increment correct keys variable
        let i = 0
        equal = true
        while (i < generatedWords[currentWord].length && equal) {
            if (word[i] == generatedWords[currentWord][i]) {
                correctKeys++;
            } else {
                equal = false;
            }
            i++;
        }
        // Check if extra characters were typed
        if (word.length > generatedWords[currentWord].length) {
            extraKeys += word.length - generatedWords[currentWord].length;
        }
        // Check if this isn't the last word
        if (currentWord < testLength - 1) {
            currentWord++;
            wordField.children[currentWord].classList.add("active");
        } else {
            getResults();
        }
    }
}

function getResults() {
    chars = generatedWords.join(' ').length;
    correctKeys += testLength - 1;
    time = (Date.now() - testStart) / 1000 / 60;
    // Update text elements
    document.getElementById("wpm").textContent = Math.round((correctKeys/5)/time)
    document.getElementById("raw").textContent = Math.round(((chars + extraKeys)/5)/time)
    document.getElementById("acc").textContent = Math.round((correctKeys/(chars + extraKeys)) * 100) + "%"
    document.getElementById("time").textContent = Math.round(time * 60) + "s"
    // Other basic appearance things
    results.classList.remove("invisible");
    inputField.value = "";
    inputField.disabled = true;
}

function setTestLength(n) {
    if (n == "verse") {
    // Scripture mode
        let passageIndex = (Math.floor(Math.random() * verseBank.length/2)) * 2
        document.getElementById("source").textContent = "You just typed" + verseBank[passageIndex].slice(0, -1) + ".";
        passage = verseBank[passageIndex + 1].split(' ');
        passage = passage.slice(1, -1);
        testLength = passage.length;
        mode = "scripture";
        document.getElementById("source").classList.remove("invisible")
    } else {
        passage = '';
        testLength = n;
        mode = "words";
        document.getElementById("source").classList.add("invisible")
    }
    // Reset underlines
    for (let i = 0; i < header.children.length; i++) {
        header.children[i].className = "";
    }
    // Underline the correct number
    header.children[[10, 25, 50, 100].indexOf(n)+1].classList.add("activemode");
    // Remove all words
    while (wordField.firstChild) {
        wordField.removeChild(wordField.lastChild);
    }
    // Add the words back
    while (wordField.children.length < testLength) {
        const word = document.createElement("span");
        word.textContent = "word ";
        wordField.appendChild(word);
    }
    setWordField();
    inputField.disabled = false;
    inputField.value = "";
    inputField.focus();
}
document.getElementById("verse").onclick = function() {setTestLength("verse")}
document.getElementById("10words").onclick = function() {setTestLength(10)};
document.getElementById("25words").onclick = function() {setTestLength(25)};
document.getElementById("50words").onclick = function() {setTestLength(50)};
document.getElementById("100words").onclick = function() {setTestLength(100)};

document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        // Check typed word, clear input bar, prevent space from being typed
        inputField.classList.remove("currentlyIncorrect")
        checkWord();
        inputField.value = "";
        e.preventDefault();
    } else if (e.code == 'Backspace') {
        inputField.classList.remove("currentlyIncorrect")
        extraKeys++;
    } else {
        // If letter or punctuation typed (checking key.length = 1 seems to be the most elegant solution???)
        if (e.key.length == 1) {
            if (!testStarted) {
                testStart = Date.now();
                testStarted = true;
            };
            // Changing colour of input field
            if (inputField.value + e.key != generatedWords[currentWord].slice(0, inputField.value.length + 1) && !inputField.disabled) {
                inputField.classList.add("currentlyIncorrect")
            } else {
                inputField.classList.remove("currentlyIncorrect")
            }
            // Complete test if last word has been typed, ie. don't need to press space at the end
            if (inputField.value + e.key == generatedWords[currentWord] && currentWord == testLength - 1) {
                inputField.value += e.key;
                checkWord();
            }
        }
    }
})

document.getElementById("restart").addEventListener("click", function() {
    if (mode == "scripture") {
        setTestLength("verse");
    } else {
        setWordField();
    }
    inputField.disabled = false;
    inputField.value = "";
    inputField.focus();
})

window.onload = function() {
    setTestLength("verse");
}

// Settings window
document.getElementById("settings").onclick = function() {
    console.log("settings");
}