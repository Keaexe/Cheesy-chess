function init() {
  turnIndicator = document.getElementById("turnIndicator");
  board = [];
  gameState = {
    toPlay: 0, // 0 = white, 1 = black
    selected: undefined,
    enPassant: undefined,
    usedEnPassant: false,
    usedCastling: false,
    promotion: undefined,
    whiteKingPosition: { row: 7, column: 4},
    blackKingPosition: {row: 0, column: 4}
  }
  createBoard();
}

function createBoard() {
  let boardElement = document.getElementById("board");
  for (let i = 0; i < 8; i++) {
    let tr = document.createElement("tr");
    boardElement.appendChild(tr);
    board[i] = [];
    for (let j = 0; j < 8; j++) {
      let td = document.createElement("td")
      board[i][j] = tr.appendChild(td)
      board[i][j].addEventListener("click", () => { select(i, j); });
      if ((i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0)) {
        board[i][j].classList.add("whiteSquare");
      } else {
        board[i][j].classList.add("blackSquare");
      }

      if (i === 1 || i === 6) {
        board[i][j].innerHTML = '󰡙';
      } else if (i === 0 || i === 7) {
        if (j === 0 || j === 7) {
          board[i][j].innerHTML = '󰡛';
          board[i][j].castlingAvailable = true;
        } else if (j === 1 || j === 6) {
          board[i][j].innerHTML = '󰡘';
        } else if (j === 2 || j === 5) {
          board[i][j].innerHTML = '󰡜';
        } else if (j === 3) {
          board[i][j].innerHTML = '󰡚';
        } else if (j === 4) {
          board[i][j].innerHTML = '󰡗';
          board[i][j].castlingAvailable = true;
        }
      }

      if (i < 2) {
        board[i][j].isWhite = false;
      } else if (i > 5){
        board[i][j].isWhite = true;
        board[i][j].classList.add("whitePiece");
      }
    }
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
}

function select(row, column){
  if (gameState.selected === undefined) {
    if (board[row][column].innerHTML === '') {
      return;
    }
    if (
      (board[row][column].isWhite && gameState.toPlay === 1) ||
      ((!board[row][column].isWhite) && gameState.toPlay === 0)
    ) {
      alert("It's " + (gameState.toPlay === 0 ? "white" : "black") + "'s turn");
      return;
    }
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
  unselect();
  if (!move(movement)) {
    alert("Illegal move (check)");
    return;
  }
  changeTurn();
}

function changeTurn() {
  gameState.toPlay = gameState.toPlay * -1 + 1;
  turnIndicator.innerHTML = gameState.toPlay === 0 ? "White's turn ⬜" : "Black's turn ⬛";
}

function unselect() {
  board[gameState.selected.row][gameState.selected.column].classList.remove("selected");
  gameState.selected = undefined;
}

function isLegal(movement) {
  gameState.usedEnPassant = false;
  gameState.usedCastling = false;
  gameState.promotion = undefined;
  if (board[movement.from.row][movement.from.column].isWhite === board[movement.to.row][movement.to.column].isWhite) {
    return false;
  }
  switch (board[movement.from.row][movement.from.column].innerHTML) {
    case '󰡛':
      return rookCase(movement);
    case '󰡘':
      return knightCase(movement);
    case '󰡜':
      return bishopCase(movement);
    case '󰡚':
      return queenCase(movement);
    case '󰡗':
      return kingCase(movement);
    case '󰡙':
      return pawnCase(movement);
    default:
      alert("Error");
      return false;
  }
}

function rookCase(movement) {
  if (movement.from.row === movement.to.row) {
    return checkEmptyPath(movement, {row: 0, column: (movement.from.column > movement.to.column ? -1 : 1)})
  }
  if (movement.from.column === movement.to.column) {
    return checkEmptyPath(movement, {row: (movement.from.row > movement.to.row ? -1 : 1), column: 0})
  }
  return false;
}

// checks if a movement can be accomplished with the given delta and if no pieces are in the way
function checkEmptyPath(movement, delta) {
  let currentDelta = { ...delta };
  while (
    movement.from.row + currentDelta.row !== movement.to.row ||
    movement.from.column + currentDelta.column !== movement.to.column
  ) {
    if (movement.from.row + currentDelta.row > 7 || movement.from.row + currentDelta.row < 0 ||
        movement.from.column + currentDelta.column > 7 || movement.from.column + currentDelta.column < 0) {
      return false;
    }
    if (board[movement.from.row + currentDelta.row][movement.from.column + currentDelta.column].innerHTML !== '') {
      return false;
    }
    currentDelta.row += delta.row;
    currentDelta.column += delta.column;
  }
  return true;
}

function bishopCase(movement) {
  let delta = {
    row: (movement.from.row > movement.to.row ? -1 : 1),
    column: (movement.from.column > movement.to.column ? -1 : 1)
  };
  return checkEmptyPath(movement, delta);
}

function queenCase(movement) {
  return bishopCase(movement) || rookCase(movement);
}

function kingCase(movement) {
  // castling
  if (board[movement.from.row][movement.from.column].castlingAvailable !== undefined) {
    if ((gameState.toPlay === 0 && movement.to.row === 7) || (gameState.toPlay === 1 && movement.to.row === 0)) {
      if (movement.to.column === 2) {
        gameState.usedCastling = true;
        return checkEmptyPath(movement, { row: 0, column: -1 });
      }
      if (movement.to.column === 6) {
        gameState.usedCastling = true;
        return checkEmptyPath(movement, { row: 0, column: 1 });
      }
    }
  }
  // actual movement
  let delta = {
    row: movement.to.row - movement.from.row,
    column: movement.to.column - movement.from.column
  }
  return (delta.row >= -1 && delta.row <= 1 && delta.column >= -1 && delta.column <= 1);
}

function knightCase(movement) {
  let absDelta = {
    row: Math.abs(movement.to.row - movement.from.row),
    column: Math.abs(movement.to.column - movement.from.column)
  }
  if (absDelta.row === 2) {
    return absDelta.column === 1;
  }
  if (absDelta.column === 2) {
    return absDelta.row === 1;
  }
  return false;
}

function pawnCase(movement) {
  let delta = {
    row: movement.to.row - movement.from.row,
    column: movement.to.column - movement.from.column
  }
  // first move
  if (
    (gameState.toPlay === 0 && movement.from.row === 6 || gameState.toPlay === 1 && movement.from.row === 1)
    &&
    delta.column === 0
  ) {
    // if next square isn't free
    if (board[movement.from.row + (gameState.toPlay === 0 ? -1 : 1)][movement.from.column].innerHTML !== '') {
      return false;
    }
    if (delta.row === (gameState.toPlay === 0 ? -1 : 1)) {
      return true;
    }
    if (delta.row !== (gameState.toPlay === 0 ? -2 : 2)) {
      return false;
    }
    // movement is legal, now looking for en passant
    if (movement.to.column > 0 && board[movement.to.row][movement.to.column - 1].innerHTML !== '') {
      gameState.enPassant = movement.to;
    } else if (movement.to.column < 7 && board[movement.to.row][movement.to.column + 1].innerHTML !== '') {
      gameState.enPassant = movement.to;
    }
    return true
  }
  // normal moves
  if (delta.row !== (gameState.toPlay === 0 ? -1 : 1)) {
    return false;
  }
  if (delta.column > 1 || delta.column < -1) {
    return false;
  }
  if (delta.column === 0) {
    if (board[movement.to.row][movement.to.column].innerHTML !== '') {
      return false;
    }
  } else {
    if (board[movement.to.row][movement.to.column].innerHTML === '') {
      if (
        gameState.enPassant !== undefined &&
        movement.to.column === gameState.enPassant.column &&
        movement.to.row - gameState.enPassant.row === (gameState.toPlay === 0 ? -1 : 1)
      ) {
        // en passant
        gameState.usedEnPassant = true;
        return true;
      }
      return false;
    }
  }
  // movement is legal, now looking for promotion
  if (movement.to.row === 7 || movement.to.row === 0) {
    gameState.promotion = movement.to;
  }
  return true;
}

function promotion() {
  let answer = undefined;
  do {
    answer = prompt("Enter the piece you wanna promote to\n(Q/󰡚, B/󰡜, K/󰡘, R/󰡛)");
    if (answer === 'Q' || answer === 'q' || answer === '󰡚') {
      board[gameState.promotion.row][gameState.promotion.column].innerHTML = '󰡚';
    } else if (answer === 'B' || answer === 'b' || answer === '󰡜') {
      board[gameState.promotion.row][gameState.promotion.column].innerHTML = '󰡜';
    } else if (answer === 'K' || answer === 'k' || answer === '󰡘') {
      board[gameState.promotion.row][gameState.promotion.column].innerHTML = '󰡘';
    } else if (answer === 'R' || answer === 'r' || answer === '󰡛') {
      board[gameState.promotion.row][gameState.promotion.column].innerHTML = '󰡛';
    } else {
      answer = undefined;
    }
  } while (answer === undefined);
  gameState.promotion = undefined;
}

function move(movement) {
  let deadPiece = undefined;
  if (board[movement.to.row][movement.to.column].innerHTML !== '') {
    deadPiece = savePiece(movement.to);
  }
  simpleMove(movement);

  // special cases
  if (gameState.promotion !== undefined) {
    promotion();
  } else if (gameState.usedEnPassant) {
    deadPiece = savePiece(gameState.enPassant);
    clearSquare(gameState.enPassant);
  } else if (board[movement.to.row][movement.to.column].innerHTML === '󰡗') {
    board[movement.from.row][movement.from.column].castlingAvailable = undefined;
    if (gameState.toPlay === 0) {
      gameState.whiteKingPosition = movement.to;
    } else {
      gameState.blackKingPosition = movement.to;
    }
    if (gameState.usedCastling) {
      gameState.usedCastling = false;
      if (movement.to.column === 2) {
        move({
          from: { row: movement.from.row, column: 0 },
          to: { row: movement.from.row, column: 3 }
        });
      } else {
        move({
          from: { row: movement.from.row, column: 7 },
          to: { row: movement.from.row, column: 5 }
        });
      }
    }
  } else if (board[movement.to.row][movement.to.column].innerHTML === '󰡛') {
      if (board[movement.from.row][movement.from.column].castlingAvailable !== undefined) {
        board[movement.from.row][movement.from.column].castlingAvailable = undefined;
      }
  }
  // check
  if (!isCheckFree()) {
    simpleMove({ from: movement.to, to: movement.from });
    if (board[movement.from.row][movement.from.column].innerHTML === '󰡗'){
      // reverting king position in gameState
      if (gameState.toPlay === 0) {
        gameState.whiteKingPosition = movement.from;
      } else {
        gameState.blackKingPosition = movement.from;
      }
    }

    if (deadPiece !== undefined) {
      resurrectPiece(deadPiece, movement.to);
    }
    return false;
  }
  return true;
}

function simpleMove(movement) {
  board[movement.to.row][movement.to.column].innerHTML = board[movement.from.row][movement.from.column].innerHTML;
  board[movement.to.row][movement.to.column].isWhite = board[movement.from.row][movement.from.column].isWhite;
  if (board[movement.from.row][movement.from.column].isWhite) {
    board[movement.to.row][movement.to.column].classList.add("whitePiece");
  } else {
    board[movement.to.row][movement.to.column].classList.remove("whitePiece");
  }
  clearSquare(movement.from);
}

function clearSquare({ row, column }) {
  board[row][column].innerHTML = '';
  board[row][column].isWhite = undefined;
  board[row][column].classList.remove("whitePiece");
}

function savePiece({ row, column }) {
  return {
    innerHTML: board[row][column].innerHTML,
    isWhite: board[row][column].isWhite
  }
}

function resurrectPiece(deadPiece, {row, column}) {
  board[row][column].innerHTML = deadPiece.innerHTML;
  board[row][column].isWhite = deadPiece.isWhite;
  if (deadPiece.isWhite) {
    board[row][column].classList.add("whitePiece");
  }
}

function isCheckFree() {
  for (let i = 0; i < 8; i++){
    for (let j = 0; j < 8; j++){
        if (endangersTheKing(i, j)) {
          console.log("Endangered by " + i + ", " + j);
          return false;
        }
    }
  }
  return true;
}

function endangersTheKing(row, column) {
  gameState.toPlay = gameState.toPlay * -1 + 1;
  let isInDanger = board[row][column].isWhite === (gameState.toPlay === 0) &&
    isLegal({
      from: { row: row, column: column },
      to: (gameState.toPlay === 1 ? gameState.whiteKingPosition : gameState.blackKingPosition)
    });
  gameState.toPlay = gameState.toPlay * -1 + 1;
  return isInDanger;
}

window.onload = init;
