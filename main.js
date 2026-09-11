function init() {
  let boardElement = document.getElementById("board");
  turnIndicator = document.getElementById("turnIndicator");
  gameState = {
    toPlay: 0, // 0 = white, 1 = black
    selected: undefined
  }

  board = [];
  let i = 0;
  let j = 0;
  for (row of boardElement) {
    board[i] = [];
    for (square of row) {
      board[i][j] = square;
      square.addEventListener("click", () => { click(i, j); });
      j++;
    }
    i++;
  }
}

function click(row, column){
  if (gameState.selected === undefined) {
    if (board[row][column].innerHTML === '.') {
      return;
    }
    gameState.state = 1;
    board[row][column].classList.add("selected");
    gameState.selected = { row: row, column: column };
    return;
  }
  if (row === gameState.selected.row && column === gameState.selected.column) {
    unselect();
    return;
  }
  let movement = {
    from: gameState.selected,
    to: { row, column }
  };
  if (!isLegal(movement)) {
    alert("Illegal move");
    unselect();
    return;
  }
  if (move(movement)) {
    return;
  }
  alert("Movement failed !!!");
}

function changeTurn() {
  turnIndicator.innerHTML = gameState.toPlay === 0 ? "White's turn ⬜" : "Black's turn ⬛";
  gameState.toPlay = gameState.toPlay * -1 + 1;
}

function unselect() {
  board[gameState.selected.row][gameState.selected.column].classList.remove("selected");
  gameState.selected = undefined;
}

function isLegal(movement) {
  switch (board[movement.from.row][movement.from].innerHTML) {
    case '':
      rookCase(movement);
      break;
    case '󰡛':
      rookCase(movement);
      break;
    case '󰡘':
      knightCase(movement);
      break;
    case '':
      knightCase(movement);
      break;
    case '󰡜':
      bishopCase(movement);
      break;
    case '':
      bishopCase(movement);
      break;
    case '󰡚':
      queenCase(movement);
      break;
    case '':
      queenCase(movement);
      break;
    case '󰡗':
      kingCase(movement);
      break;
    case '':
      kingCase(movement);
      break;
    case '':
      pawnCase(movement);
      break;
    case '󰡙':
      pawnCase(movement);
      break;
  }
}

function rookCase(movement) {
  if (movement.from.row === movement.to.row) {
    if (movement.from.column > movement.to.column) {
      return checkEmptyPath(movement, {row: 0, column: -1})
    }
    return checkEmptyPath(movement, {row: 0, column: 1})
  }
  if (movement.from.column === movement.to.column) {
    if (movement.from.row > movement.to.row) {
      return checkEmptyPath(movement, {row: -1, column: 0})
    }
    return checkEmptyPath(movement, {row: 1, column: 0})
  }
  return false;
}

function checkEmptyPath(movement, delta) {
  let currentDelta = delta;
  while (movement.from.row + currentDelta.row !== movement.to.row && movement.from.column + currentDelta.column !== movement.to.column) {
    if (board[movement.from.row + currentDelta.row][movement.from.column + currentDelta.column].innerHTML === '.') {
      return false;
    }
    currentDelta.row += delta.row;
    currentDelta.column += delta.column;
  }
  return true;
}

function move(movement) {
  let temp = board[movement.from.row][movement.from.column].innerHTML;
  board[movement.from.row][movement.from.column].innerHTML = '.';
  board[movement.to.row][movement.to.column].innerHTML = temp;
}

window.onload = init;
