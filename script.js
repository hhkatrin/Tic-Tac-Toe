const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const roundInfo = document.getElementById("roundInfo");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endScore = document.getElementById("endScore");
const motivation = document.getElementById("motivation");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;

let rounds = 1;
let round = 1;

let score = { X:0, O:0 };
let mode = "pvp";

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

startBtn.onclick = () => {
  rounds = +document.getElementById("roundsInput").value;
  mode = document.getElementById("modeSelect").value;

  startScreen.style.display = "none";
  gameActive = true;

  render();
  updateUI();
};

function render(){
  boardEl.innerHTML = "";

  board.forEach((v,i)=>{
    const div=document.createElement("div");
    div.className="cell";
    div.textContent=v;

    div.onclick=()=>move(i);

    boardEl.appendChild(div);
  });
}

function move(i){
  if(!gameActive || board[i]) return;

  board[i]=currentPlayer;
  playSound(clickSound);

  render();

  let win = checkWin();

  if(win){
    score[currentPlayer]++;
    gameActive=false;
    highlight(win);
    playSound(winSound);

    setTimeout(nextRound,800);
    return;
  }

  if(board.every(x=>x)){
    gameActive=false;
    setTimeout(nextRound,800);
    return;
  }

  currentPlayer = currentPlayer==="X"?"O":"X";
  updateUI();

  if(mode==="cpu" && currentPlayer==="O"){
    setTimeout(aiMove,400);
  }
}

/* 🧠 UNBESIEGBARE AI */
function aiMove(){
  let bestScore=-Infinity;
  let move;

  for(let i=0;i<9;i++){
    if(board[i]==""){
      board[i]="O";
      let score=minimax(board,false);
      board[i]="";

      if(score>bestScore){
        bestScore=score;
        move=i;
      }
    }
  }

  move && move !== undefined ? moveCell(move) : null;
}

function moveCell(i){
  move(i);
}

/* MINIMAX */
function minimax(b,isMax){
  let winner = getWinner();

  if(winner==="O") return 10;
  if(winner==="X") return -10;
  if(b.every(x=>x)) return 0;

  if(isMax){
    let best=-Infinity;
    for(let i=0;i<9;i++){
      if(b[i]==""){
        b[i]="O";
        best=Math.max(best,minimax(b,false));
        b[i]="";
      }
    }
    return best;
  } else {
    let best=Infinity;
    for(let i=0;i<9;i++){
      if(b[i]==""){
        b[i]="X";
        best=Math.min(best,minimax(b,true));
        b[i]="";
      }
    }
    return best;
  }
}

function getWinner(){
  for(let c of wins){
    let [a,b,c2]=c;
    if(board[a]&&board[a]===board[b]&&board[a]===board[c2]) return board[a];
  }
  return null;
}

function checkWin(){
  return wins.find(c=>{
    let[a,b,c2]=c;
    return board[a]&&board[a]===board[b]&&board[a]===board[c2];
  });
}

function highlight(combo){
  document.querySelectorAll(".cell").forEach((el,i)=>{
    if(combo.includes(i)) el.classList.add("win");
  });
}

function nextRound(){
  round++;

  if(round>rounds){
    endGame();
    return;
  }

  board=Array(9).fill("");
  currentPlayer="X";
  gameActive=true;

  render();
  updateUI();
}

function updateUI(){
  statusEl.textContent="Player "+currentPlayer;
  roundInfo.textContent=`Round ${round}/${rounds} | X:${score.X} O:${score.O}`;
}

function endGame(){
  gameActive=false;

  let msg =
    score.X>score.O ? "X gewinnt 🏆" :
    score.O>score.X ? "O gewinnt 🏆" :
    "Unentschieden";

  endTitle.textContent="Game Over";
  endScore.textContent=`X:${score.X} O:${score.O}`;
  motivation.textContent="Du kannst besser werden 🚀";

  endScreen.style.display="flex";
  statusEl.textContent=msg;
}

function playSound(s){
  s.currentTime=0;
  s.play();
}