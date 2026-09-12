function init() {
  let boardElement = document.getElementById("board");
  turnIndicator = document.getElementById("turnIndicator");
  gameState = {
    toPlay: 0, // 0 = white, 1 = black
    selected: undefined,
    castlingAvailability: 16 // bits (1111) whiteleft, whiteright, blackleft, blackright
  }

  board = [];
  let i = 0;
  let j = 0;
  for (row of boardElement) {
    board[i] = [];
    for (square of row) {
      board[i][j] = square;
      square.addEventListener("click", () => { click(i, j); });
      if (i < 2) {
        square.isWhite = false;
      } else if (i > 5){
        square.isWhite = true;
      }
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
  if (board[movement.from.row][movement.from.column].isWhite === board[movement.to.row][movement.to.column].isWhite) {
    return false;
  }
  switch (board[movement.from.row][movement.from].innerHTML) {
    case '':
      return rookCase(movement);
    case '󰡛':
      return rookCase(movement);
    case '󰡘':
      return knightCase(movement);
    case '':
      return knightCase(movement);
    case '󰡜':
      return bishopCase(movement);
    case '':
      return bishopCase(movement);
    case '󰡚':
      return queenCase(movement);
    case '':
      return queenCase(movement);
    case '󰡗':
      return kingCase(movement);
    case '':
      return kingCase(movement);
    case '':
      return pawnCase(movement);
    case '󰡙':
      return pawnCase(movement);
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
    if (movement.from.row + currentDelta.row > 7 || movement.from.row + currentDelta.row < 0 ||
        movement.from.column + currentDelta.column > 7 || movement.from.column + currentDelta.column < 0) {
      return false;
    }
    if (board[movement.from.row + currentDelta.row][movement.from.column + currentDelta.column].innerHTML === '.') {
      return false;
    }
    currentDelta.row += delta.row;
    currentDelta.column += delta.column;
  }
  return true;
}

function bishopCase(movement) {
  let delta;
  delta.row = (movement.from.row > movement.to.row ? -1 : 1);
  delta.column = (movement.from.column > movement.to.column ? -1 : 1);
  return checkEmptyPath(movement, delta)
}

function queenCase(movement) {
  return bishopCase(movement) || rookCase(movement);
}

function kingCase(movement) {
  // castling
  let castlingAvailable = (gameState.toPlay === 0 ? 12 /*1100*/ : 3 /*0011*/);
  if ((gameState.castlingAvailability & castlingAvailable) !== 0) {
    if ((gameState.toPlay === 0 && movement.to.row === 7) || (gameState.toPlay === 1 && movement.to.row === 0)) {
      if (movement.to.column === 2) {
        return checkEmptyPath(movement, { row: 0, column: -1 });
      }
      if (movement.to.column === 6) {
        return checkEmptyPath(movement, { row: 0, column: 1 });
      }
    }
  }
  // actual movement
  let delta = {
    row: movement.to.row - movement.from.row,
    column: movement.to.column - movement.from.column
  }
  return (delta.row >= -1 && delta.row <= 1 && delta.column <= -1 && delta.column >= 1);
}

function move(movement) {
  board[movement.to.row][movement.to.column].innerHTML = board[movement.from.row][movement.from.column].innerHTML;
  board[movement.to.row][movement.to.column].isWhite = board[movement.from.row][movement.from.column].isWhite;
  board[movement.from.row][movement.from.column].isWhite = undefined;
  board[movement.from.row][movement.from.column].innerHTML = '.';
}

window.onload = init;
