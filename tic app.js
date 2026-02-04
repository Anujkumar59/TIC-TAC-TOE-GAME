
  // DOM ELEMENTS

const boxes = document.querySelectorAll(".box");
const resetBtn = document.querySelector("#reset");
const newGameBtn = document.querySelector("#new-btn");
const msgContainer = document.querySelector(".msg-container");
const msg = document.querySelector("#msg");

const pvpBtn = document.querySelector("#pvp");
const pvcBtn = document.querySelector("#pvc");

/* AUDIO */
const clickSound = document.querySelector("#clickSound");
const oWinSound = document.querySelector("#oWinSound");
const xWinSound = document.querySelector("#xWinSound");
const botWinSound = document.querySelector("#botWinSound");
const drawSound = document.querySelector("#drawSound");
const youwin = document.querySelector("#winSound");

/*  GAME STATE */
let gameMode = null;      
let turnO = true;         
let moveCount = 0;

/*  WINNING PATTERNS */
const winPatterns = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* BOARD CONTROL */
const lockBoard = () => boxes.forEach(b => b.disabled = true);

const unlockBoard = () => {
  boxes.forEach(b => {
    if (b.innerText === "") b.disabled = false;
  });
};

const disableBoxes = () => boxes.forEach(b => b.disabled = true);

/*RESET GAME*/
const resetGame = () => {
  turnO = true;
  moveCount = 0;
  msgContainer.classList.add("hide");

  boxes.forEach(box => {
    box.innerText = "";
    box.classList.remove("win");
  });

  gameMode ? unlockBoard() : lockBoard();
};

/* MODE SELECTION */
pvpBtn.addEventListener("click", () => {
  gameMode = "PVP";
  pvpBtn.classList.add("active");
  pvcBtn.classList.remove("active");
  resetGame();
});

pvcBtn.addEventListener("click", () => {
  gameMode = "PVC";
  pvcBtn.classList.add("active");
  pvpBtn.classList.remove("active");
  resetGame();
});

/* GAME RESULT HANDLERS */
const showWinner = (winner, pattern) => {
  msgContainer.classList.remove("hide");
  disableBoxes();

  pattern.forEach(i => boxes[i].classList.add("win"));

  if (gameMode === "PVP") {
    msg.innerText = `🎉 Player ${winner} Wins!`;
    winner === "O" ? oWinSound.play() : xWinSound.play();
  } else {
    if (winner === "O") {
      msg.innerText = "🎉 You Win!";
      youwin.play();
    } else {
      msg.innerText = "🤖 Bot Wins!";
      botWinSound.play();
    }
  }
};

const showDraw = () => {
  msg.innerText = "🟰 It's a Draw!";
  msgContainer.classList.remove("hide");
  drawSound.play();
};

/*WIN CHECK*/
const checkWinner = () => {
  for (const pattern of winPatterns) {
    const [a,b,c] = pattern;
    const v1 = boxes[a].innerText;
    const v2 = boxes[b].innerText;
    const v3 = boxes[c].innerText;

    if (v1 && v1 === v2 && v2 === v3) {
      showWinner(v1, pattern);
      return true;
    }
  }
  return false;
};

/* MEDIUM BOT (WIN → BLOCK → RANDOM)*/
const getBoardState = () => [...boxes].map(b => b.innerText);

const checkWinnerForAI = (board) => {
  for (const [a,b,c] of winPatterns) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const playBotAtIndex = (i) => {
  boxes[i].innerText = "X";
  boxes[i].disabled = true;
  moveCount++;
  clickSound.play();

  if (!checkWinner() && moveCount === 9) showDraw();
};

const mediumBotMove = () => {
  let board = getBoardState();

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "X";
      if (checkWinnerForAI(board) === "X") {
        playBotAtIndex(i);
        return;
      }
      board[i] = "";
    }
  }

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      if (checkWinnerForAI(board) === "O") {
        playBotAtIndex(i);
        return;
      }
      board[i] = "";
    }
  }

  const emptyBoxes = [...boxes].filter(b => b.innerText === "");
  if (!emptyBoxes.length) return;

  const randomBox = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
  randomBox.innerText = "X";
  randomBox.disabled = true;
  moveCount++;
  clickSound.play();

  if (!checkWinner() && moveCount === 9) showDraw();
};

/*BOX CLICK HANDLER*/
boxes.forEach(box => {
  box.addEventListener("click", () => {
    if (!gameMode || box.innerText !== "") return;

    if (gameMode === "PVP") {
      box.innerText = turnO ? "O" : "X";
      turnO = !turnO;
    } else {
      box.innerText = "O"; 
    }

    box.disabled = true;
    moveCount++;
    clickSound.play();

    if (checkWinner()) return;
    if (moveCount === 9) return showDraw();

    if (gameMode === "PVC") {
      lockBoard();
      setTimeout(() => {
        mediumBotMove();
        unlockBoard();
      }, 400);
    }
  });
});

/*  BUTTON EVENTS */
resetBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", resetGame);

/*  INITIAL STATE */
lockBoard();
msg.innerText = "Choose a game mode to start";
msgContainer.classList.remove("hide");
