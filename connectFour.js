/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;
const htmlBoard = document.getElementById("board");


let currPlayer = 1; // active player: 1 or 2
let board = makeBoard(HEIGHT, WIDTH); // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard(h, w) {
  let grid = []
  for(let rows = 0;rows < h;rows++) {
    let row = [];
    for(let column = 0;column < w;column++ ) {
      row.push("null");
    }
    grid.push(row);
  }
  return grid;
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
  // Set top row for player to select column to place piece
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");
  top.addEventListener("click", handleClick);

  for (let x = 0; x < WIDTH; x++) {
    const headCell = document.createElement("td");
    headCell.setAttribute("id", x);
    const tempPiece = document.createElement('div');
    tempPiece.classList.add("piece");
    headCell.addEventListener("mouseover", setColor); 

    headCell.append(tempPiece);
    top.append(headCell);
  }
  htmlBoard.append(top);

  // Create spaces, each with Id of space coordinate
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
  // Traverse from bottom to top checking for empty of y 
  for(let y = board.length-1;y > -1; y--) {
    if (!(board[y][x] === 1 || board[y][x] === 2)) {
      return y;
    }
  }
  return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  // create piece, set color, put on board
  const piece = document.createElement("div");
  const color = currPlayer === 1 ? "red" : "blue";
  piece.classList.add("piece");
  piece.classList.add(color);
  document.getElementById(`${y}-${x}`).append(piece);

  // add/play drop animation
  const duration = -getPosition(x, piece) + 100;
  piece.animate([{top: getPosition(x, piece)+"px"}, {top: "0px"}], duration);
}

function getPosition(column, piece) {
  const columnTopTd = document.getElementById(column);
  const pieceTopPx = piece.getBoundingClientRect().top;
  const columnTopPx = columnTopTd.getBoundingClientRect().top;
  return columnTopPx - pieceTopPx + 10;
}

/** endGame: announce game end */

function endGame(msg) {
  // timeout allows for piece to be placed before anouncing winner
  setTimeout(() => {
    if (window.confirm(msg)) startNewGame();
  }, 450);
}

/** Starts new game if player chooses so */

function startNewGame() {
  board = makeBoard(HEIGHT, WIDTH);
  htmlBoard.innerHTML = "";
  makeHtmlBoard();
}

/** setColor: set color of piece to preview on mouseover */

function setColor(evt) {
  const test = evt.target.nodeName === "DIV";
  const divPiece = test ? evt.target : evt.target.firstElementChild;
  const color = currPlayer === 1 ? "red" : "blue";
  divPiece.style.backgroundColor = color;
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  const test = evt.target.nodeName === "DIV";
  const x = test ? +evt.target.parentElement.id : +evt.target.id;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  placeInTable(y, x);
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won! \n\nPlay Again? `);
  }

  // check for tie
  if(isBoardFull()) {
    return endGame("Tie!");
  }

  // switch players
  currPlayer === 1 ? currPlayer = 2 : currPlayer = 1;
  setColor(evt);
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // TODO: read and understand this code. Add comments to help you.
  // looping through rows and columns top to bottom / left to right
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      // sets a nested array of cells coordinate in line to check
      let horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      let vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      let diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      let diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
      // run _win passing each array of cells, returning true if 4 in a row
      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}

// check if all spaces are full
function isBoardFull() {
  return board.every((row) => {
    return row.every((col) => {
      return (col === 1 || col === 2);
    })
  });
} 

makeHtmlBoard();
