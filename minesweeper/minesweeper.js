class MineGrid {
  constructor(rowSize, mineRatio) {
    this.rowSize = rowSize;
    this.gridSize = rowSize * rowSize;
    this.mineRatio = mineRatio;
    this.numMines = Math.floor(this.gridSize * this.mineRatio);
    this.reveals = {};
    this.mines = this.generateMines();
    this.lostGame = false;
    this.lostGuess = 0;
    this.wonGame = false;
    this.firstGuess = true;
  }

  gridSize() {
    return this.rowSize ** 2;
  }

  // Determine all valid adjacent yx coordinates when passed a guess in yx coordinates
  getAdjacentSquares(guess) {
    let gx = guess[0];
    let gy = guess[1];

    let adjacent = [
      [gx + 1, gy],
      [gx + 1, gy + 1],
      [gx, gy + 1],
      [gx - 1, gy + 1],
      [gx - 1, gy],
      [gx - 1, gy - 1],
      [gx, gy - 1],
      [gx + 1, gy - 1]
    ];

    return adjacent.filter(val => {
      return (
        val[0] >= 0 &&
        val[0] < this.rowSize &&
        val[1] >= 0 &&
        val[1] < this.rowSize
      );
    });
  }

  //Generate a random set of mines based on the number of mines configured
  generateMines() {
    var mines = new Set();

    while (mines.size < this.numMines) {
      mines.add(Math.floor(Math.random() * this.gridSize));
    }

    return mines;
  }

  //given an absolute position in the grid this will return an array of yx coordinates
  mineYX(pos) {
    let y = Math.floor(pos / this.rowSize);
    let x = pos % this.rowSize;
    return [y, x];
  }

  // Returns an absolute position in the grid when given an array of yx coordinates
  minePos(yx) {
    return yx[0] * this.rowSize + yx[1];
  }

  // Return the number of adjacent mines when passed in an array of yx coordinates
  numAdjacentMines(guess) {
    var numAdj = 0;
    var adj = this.getAdjacentSquares(guess);
    for (var i = 0; i < adj.length; i++) {
      if (this.mines.has(this.minePos(adj[i]))) {
        numAdj++;
      }
    }
    return numAdj;
  }

  // This gets called when the mouse is clicked on a square
  // If a square has a mine, the game is lost. If a square does't have a mine
  // the number of mines adjacent to the clicked square will be displayed.
  // If there are no adjacent mines all the ajdacent squares mine counts will be displayed.
  // This function is recursively called for all adjacent squares if there are no adjacent mines to the guess.
  processGuess(guess) {
    if (guess in this.reveals) {
      return;
    }
    let na = this.numAdjacentMines(this.mineYX(guess));
    this.reveals[guess] = na;
    if (na == 0) {
      let adj = this.getAdjacentSquares(this.mineYX(guess));
      for (var i = 0; i < adj.length; i++) {
        this.processGuess(this.minePos(adj[i]));
      }
    }
  }
}

// create divs for the minegrid styled by minesweeper.css
function renderSquares(numsquares) {
  for (let i = 0; i < numsquares; i++) {
    var idiv = document.createElement("div");
    idiv.className = "square";
    idiv.innerText = "?";
    idiv.onclick = function() {
      handleClick(i);
    };
    document.getElementById("container").appendChild(idiv);
  }
}

// The game is won when revealed squares + number of mines = gridsize

function handleClick(id) {
  if ((mg.firstGuess === undefined || mg.firstGuess) && mg.mines.has(id)) {
    mg.mines.delete(id);
  }
  mg.firstGuess = false;

  if (mg.mines.has(id)) {
    mg.lostGame = true;
    mg.lostGuess = id;
  } else {
    mg.processGuess(id);
    if (Object.keys(mg.reveals).length + mg.mines.size === mg.gridSize) {
      mg.wonGame = true;
    }
  }
  renderReveals();
}

// Use the reveals array to send the changes to the grid to the DOM
function renderReveals() {
  const container = document.getElementById("container");

  if (mg.wonGame) {
    document.querySelector("body").classList.toggle("wonGame");
  }

  for (let i = 0; i < mg.gridSize; i++) {
    if (i in mg.reveals) {
      container.children[i].innerHTML =
        mg.reveals[i] == 0 ? '<i class="fas fa-expand"></i>' : mg.reveals[i];
    } else if (mg.mines.has(i)) {
      if (mg.lostGame && i === mg.lostGuess) {
        mg.lostGuess = -1;
        container.children[i].classList.toggle("squareLose");
        document.querySelector("body").classList.toggle("lostGame");
      }
      container.children[i].innerHTML = mg.lostGame
        ? '<i class="fas fa-bomb"></i>'
        : "?";
    } else {
      container.children[i].innerHTML = "?";
    }
  }
}

function playGame() {
  renderSquares(64);
}
var mg = new MineGrid(8, 0.2);
playGame();
