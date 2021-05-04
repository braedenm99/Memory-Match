//Sound effects obtained from https://www.zapsplat.com
var gameWon = new sound("sounds/gameWon.mp3");
var roundWon = new sound("sounds/roundWon.mp3");
var roundLost = new sound("sounds/roundLost.mp3");

var elements = document.getElementsByTagName("td");
var allEmojis = [127814, 127827, 128004, 128035, 128064, 128166, 128169, 129313, 129335, 129372, 129414, 128570, 128536, 128000, 128585, 129322, 129421, 10024, 127770, 128051, 128125];

//New game button -- just refreshes the page
var newGameButton = document.getElementById("newGameButton");
newGameButton.addEventListener('click', function () {
    window.location.reload();
});

playGame();

function playGame() {

    if (localStorage.getItem("bestTime") != null) {
        let bestTotalSeconds = localStorage.getItem("bestTime");
        let bestTimeString = displayTime(bestTotalSeconds);
        document.getElementById("bestTime").innerHTML = "Best time: <span id=bestTimeTimer>" + bestTimeString + "</span>";
    }

    //Timer
    var totalSeconds = 0;
    var timer = setInterval(function () {
        if (totalSeconds == 3600) {
            //Stop the timer after 1 hour. Display 59:59
            clearInterval(timer);
            return;
        }
        let timerString = displayTime(totalSeconds);
        document.getElementById("timer").innerHTML = timerString;
        totalSeconds++;
    }, 1000);

    //Select which emojis to use this game
    var emojisInUse = [];
    var numPairs = elements.length / 2;
    for (i = 0; i < numPairs; i++) {
        let emojiIndex = Math.floor(Math.random() * allEmojis.length);
        emojisInUse.push(allEmojis[emojiIndex]);
        allEmojis.splice(emojiIndex, 1);
    }

    //Fill the table elements with emojis
    var elementsEmojiArray = new Array(elements.length).fill(0);
    var elementsNotYetFilled = Array.from(Array(elements.length).keys())
    for (i = 0; i < numPairs; i++) {
        let indexToFill = elementsNotYetFilled[Math.floor(Math.random() * elementsNotYetFilled.length)];
        elementsNotYetFilled.splice(elementsNotYetFilled.indexOf(indexToFill), 1);
        elementsEmojiArray[indexToFill] = emojisInUse[i];

        indexToFill = elementsNotYetFilled[Math.floor(Math.random() * elementsNotYetFilled.length)];
        elementsNotYetFilled.splice(elementsNotYetFilled.indexOf(indexToFill), 1);
        elementsEmojiArray[indexToFill] = emojisInUse[i];
    }

    var isStageZero = true;
    var prevIndex = -1;
    var showingBadMatch = false;
    var numMatches = 0;

    //Add an event listener to each table element
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("click", function () {
            if (showingBadMatch) {
                return;
            }
            if (elements[i].className == "matched") {
                return;
            }

            let localPrevIndex = prevIndex;

            if (isStageZero) {
                elements[i].innerHTML = "&#" + elementsEmojiArray[i];
                elements[i].className = "unhidden";
                prevIndex = i;
                isStageZero = false;
            } else { //stage one
                elements[i].innerHTML = "&#" + elementsEmojiArray[i];
                if (localPrevIndex == i) {
                    //Same element clicked on twice in a row (deselected)
                    elements[i].innerHTML = "";
                    elements[i].className = "hidden";
                } else if (elementsEmojiArray[localPrevIndex] == elementsEmojiArray[i]) {
                    //Pair matched (2 cases)
                    elements[localPrevIndex].className = "matched";
                    elements[i].className = "matched";
                    numMatches++;
                    if (numMatches == numPairs) {
                        //Final pair matched (game over)
                        clearInterval(timer);
                        if (localStorage.getItem("bestTime") == null || totalSeconds - 1 < localStorage.getItem("bestTime")) {
                            localStorage.setItem("bestTime", totalSeconds - 1);
                            let bestTimeString = displayTime(totalSeconds - 1);
                            document.getElementById("bestTime").innerHTML = "NEW BEST TIME: <span id=bestTimeTimer>" + bestTimeString + "</span>";
                        }
                        gameWon.play();
                    } else {
                        //Pair matched
                        roundWon.play();
                    }
                } else {
                    //Bad match
                    showingBadMatch = true;
                    elements[i].className = "badMatch";
                    elements[localPrevIndex].className = "badMatch";
                    roundLost.play();
                    setTimeout(function () {
                        elements[localPrevIndex].innerHTML = "";
                        elements[localPrevIndex].className = "hidden";
                        elements[i].innerHTML = "";
                        elements[i].className = "hidden";
                        showingBadMatch = false;
                    }, 1000);
                }
                //prevIndex = -1; 
                isStageZero = true;
            }
        });
    }
}

//Convert number of seconds to minutes:seconds
function displayTime(totalSeconds) {
    let timerString = "";
    let minutes = Math.floor(totalSeconds / 60);
    if (minutes < 10) {
        timerString += "0";
    }
    timerString += (minutes + ":");
    let seconds = totalSeconds % 60;
    if (seconds < 10) {
        timerString += "0";
    }
    timerString += seconds;
    return timerString;
}

//Sound
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}
