const form = document.getElementById("puzzleForm");
const letterBtnContainer = document.getElementById("letterBtnContainer");
const numberBtnContainer = document.getElementById("numberBtnContainer");
const canvas = document.getElementById("canvas");
const modal = document.getElementById("modal");
const ctx = canvas.getContext("2d");
ctx.font = "30px Monospace";
const letterWidth = 30;
const letterGap = 5;
const alphaNumeric = /^[a-zA-Z0-9]{1}$/g;
let currentX = 0;
let currentY = 0;
let solution = null;
let lostGame = false;
let gameStarted = false;

const topOfHeadX = 225;
const topOfHeadY = 205;
const headRadius = 15;

const aCharCode = "A".charCodeAt(0);
const zCharCode = "Z".charCodeAt(0);
const zeroCharCode = "0".charCodeAt(0);
const nineCharCode = "9".charCodeAt(0);

window.addEventListener("keydown", (e) => {
  if (gameStarted && e.key.match(alphaNumeric)) {
    guessLetter(e.key);
  }
});

const missedLetters = [];
const drawMissedLetters = () => {
  const rectWidth = 300;
  const rectHeight = 100;
  currentX = 110;
  currentY = 80;
  ctx.beginPath();
  ctx.rect(100, 50, rectWidth, rectHeight);
  ctx.stroke();
  if (missedLetters.length === drawPersonParts.length) {
    lostGame = true;
  }
  missedLetters.forEach((letter, i) => {
    ctx.beginPath();
    if (currentX + letterWidth / 2 + letterGap > rectWidth) {
      currentX = 110;
      currentY += 30;
    }
    ctx.fillText(letter, currentX, currentY);
    currentX += letterWidth / 2 + letterGap;
    ctx.moveTo(currentX, currentY);
    ctx.stroke();
    drawPersonParts[i]();
  });
  if (lostGame) {
    setTimeout(() => {
      modal.style.opacity = 1;
      modal.innerHTML = `You Lost!`; //<br> <button type="button">restart</button>`;
      setTimeout(() => {
        modal.style.opacity = 0;
      }, 3000);
    });
  }
};

const drawHangman = () => {
  currentX = 100;
  currentY = 330;
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  currentX += 150;
  ctx.lineTo(currentX, currentY);
  currentX -= 100;
  ctx.moveTo(currentX, currentY);
  currentY -= 150;
  ctx.lineTo(currentX, currentY);
  currentX += 75;
  ctx.lineTo(currentX, currentY);
  currentY += 25;
  ctx.lineTo(currentX, currentY);
  ctx.stroke();
};

const guessLetter = (letter) => {
  const letterBtn = document.getElementById(letter.toUpperCase() + "Btn");
  if (letterBtn.disabled) {
    return;
  }
  letterBtn.disabled = true;
  const letterRegExp = new RegExp(letter, "gi");
  const solString = solution.map((charObj) => charObj.char).join("");
  let match;
  let matchFound = false;
  while ((match = letterRegExp.exec(solString)) != null) {
    matchFound = true;
    solution[match.index].guessed = true;
  }
  if (matchFound) {
    const wonGame = !solution.find((letter) => !letter.guessed);
    if (wonGame) {
      setTimeout(() => {
        modal.style.opacity = 1;
        modal.innerHTML = `You Won!`; //<br> <button type="button">restart</button>`;
        setTimeout(() => {
          modal.style.opacity = 0;
        }, 3000);
      });
    }
  } else {
    missedLetters.push(letter);
  }
  draw();
};

const drawLetterBtn = (character, number = false) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = `${character}Btn`;
  btn.innerText = character;
  btn.className = "characterBtn";
  btn.addEventListener("click", () => {
    guessLetter(character);
  });
  if (number) {
    numberBtnContainer.appendChild(btn);
  } else {
    letterBtnContainer.appendChild(btn);
  }
};

const drawButtons = () => {
  for (let i = aCharCode; i <= zCharCode; i++) {
    const letter = String.fromCharCode(i);
    drawLetterBtn(letter);
  }
  for (let i = zeroCharCode; i <= nineCharCode; i++) {
    const number = String.fromCharCode(i);
    drawLetterBtn(number, true);
  }
};

const drawWordBlanks = (word) => {
  for (var i = 0; i < word.length; i++) {}
};

const drawAllBlanksAndLetters = (characters) => {
  currentX = 500;
  currentY = 100;
  ctx.beginPath();
  ctx.moveTo(currentX, currentY);
  const spaceIndexes = [];
  let i = characters.findIndex((charObj) => charObj.char === " ");
  while (i >= 0) {
    spaceIndexes.push(i);
    foundIndex = characters
      .slice(i + 1)
      .findIndex((charObj) => charObj.char === " ");
    i = foundIndex === -1 ? foundIndex : foundIndex + i + 1;
  }
  characters.forEach((charObj, j) => {
    let nextSpaceIndex = spaceIndexes.find((spaceIndex) => {
      return j < spaceIndex;
    });
    let nextLine = false;
    nextSpaceIndex = nextSpaceIndex ? nextSpaceIndex : characters.length - 1;
    if (
      charObj.char === " " &&
      (nextSpaceIndex - j) * (letterWidth + letterGap) + currentX > 1200
    ) {
      currentX = 500;
      currentY += 50;
      ctx.moveTo(currentX, currentY);
      nextLine = true;
    }

    if (charObj.char.match(alphaNumeric) || charObj.char === " ") {
      if (!nextLine) {
        currentX += letterWidth;
      }
      if (charObj.char === " ") {
        ctx.moveTo(currentX, currentY);
      } else {
        if (charObj.guessed) {
          ctx.fillText(
            charObj.char,
            currentX - 0.75 * letterWidth,
            currentY - 5
          );
        }
        ctx.lineTo(currentX, currentY);
      }
    } else {
      ctx.fillText(charObj.char, currentX, currentY);
      currentX += 10;
    }
    if (!nextLine) {
      currentX += letterGap;
      ctx.moveTo(currentX, currentY);
    }
  });
  ctx.stroke();
};

const draw = () => {
  ctx.clearRect(0, 0, 1200, 600);
  solution =
    solution ||
    form.puzzleSolution.value
      .trim()
      .replace(/\s+/, " ")
      .split("")
      .map((char) => ({
        char,
        guessed: char.match(alphaNumeric) ? false : true,
      }));
  drawAllBlanksAndLetters(solution);
  drawMissedLetters();
  drawHangman();
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (form.puzzleSolution.value) {
    gameStarted = true;
    form.style.display = "none";
    canvas.style.display = "inline";
    draw();
    drawButtons();
  }
});

const drawPersonParts = [
  function head() {
    ctx.beginPath();
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + headRadius;
    ctx.arc(startingX, startingY, headRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
  },
  function body() {
    ctx.beginPath();
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + headRadius * 2;
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(startingX, startingY + 50);
    ctx.stroke();
  },
  function leftLeg() {
    ctx.beginPath();
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + 50 + headRadius * 2;
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(startingX - 25, startingY + 40);
    ctx.stroke();
  },
  function rightLeg() {
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + 50 + headRadius * 2;
    ctx.beginPath();
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(startingX + 25, startingY + 40);
    ctx.stroke();
  },
  function leftArm() {
    ctx.beginPath();
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + 5 + headRadius * 2;
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(startingX - 25, startingY + 40);
    ctx.stroke();
  },
  function rightArm() {
    ctx.beginPath();
    const startingX = topOfHeadX;
    const startingY = topOfHeadY + 5 + headRadius * 2;
    ctx.moveTo(startingX, startingY);
    ctx.lineTo(startingX + 25, startingY + 40);
    ctx.stroke();
  },
];
