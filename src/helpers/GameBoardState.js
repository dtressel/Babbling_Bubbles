class GameBoardState {
  constructor(columns, rows, visibleNextRows) {
    this.columns = columns;
    this.rows = rows;
    this.visibleNextRows = visibleNextRows;
    this.hiddenNextRows = rows;
    this.currentBoard = this.createNewBoard();
    this.savedPaths = [];
  }
  
  // creates an array of arrays, each inner array represents a column on the game board
  createNewBoard() {
    const gameBoard = [];
    for (let i = 0; i < this.columns; i++) {
      gameBoard.push(GameBoardState.chooseLetters(this.rows + this.visibleNextRows + this.hiddenNextRows));
    }
    return gameBoard;
  }

  // find all paths of instances of a string
  findPaths(str, primaryPathIdx) {
    // creates an array of arrays
    // each inner array is an array of coordinates for each step in the path
    const paths = [];
    function testColumnsOfNeighbors(testColumn, currRow, i, j, gameInstance) {
      // Omit testing the row below the bottom-most row
      let testUntilRow = 1;
      // if currRow is the bottom-most row
      if (currRow === gameInstance.rows - 1) {
        testUntilRow = 0;
      }
      // for each of the neighboring letters in the test column
      for (let k = -1; k <= testUntilRow; k++) {
        // if you the letter we're looking for is found at this test path
        if (gameInstance.currentBoard[testColumn][currRow + k] === str[i]) {
          // if this path has not already been used in this path
          if (!paths[j].includes(`${testColumn}${currRow + k}`)) {
            // if this is not the only matching neighbor
            if (paths[j].length > i) {
              const newPath = paths[j].slice(0, -1);
              newPath.push(`${testColumn}${currRow + k}`);
              paths.splice(j + 1, 0, newPath);
              if (i === str.length - 1 && j < primaryPathIdx) {
                primaryPathIdx++;
              }
            } 
            // else if this is the only matching neighbor so far
            else {
              paths[j].push(`${testColumn}${currRow + k}`);
            }
          }
        }
      }
    }

    // find occurances of first letter
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (str[0] === this.currentBoard[i][j]) {
          paths.push([`${i}${j}`]);
        }
      }
    }
    // build paths for rest of string
    // for each letter of string after first letter
    for (let i = 1; i < str.length; i++) {
      // Will loop through paths using 'distanceFromEnd' variable since we'll be adding
      // new paths after current testing path and before next testing path
      // and will need to skip the added paths or else we'll get an infinite loop.
      // 'j' will still be an incrementing variable starting at 0 but will skip indices 
      // based on the potentially increasing length of paths.
      // This looping method will also cause us to avoid skipping paths when deleting one.
      let distanceFromEnd = paths.length;
      // for each path in paths array
      for (let j = 0; distanceFromEnd > 0; j = paths.length - distanceFromEnd) {
        console.log(primaryPathIdx);
        const currColumn = +paths[j][i - 1][0];
        const currRow = +paths[j][i - 1][1];
        // if column to the right is in bounds, test
        if (currColumn + 1 < this.columns) {
          testColumnsOfNeighbors(currColumn + 1, currRow, i, j, this);
        }
        // test currColumn
        testColumnsOfNeighbors(currColumn, currRow, i, j, this);
        // if the left adjacent column is in bounds, test
        if (currColumn - 1 >= 0) {
          testColumnsOfNeighbors(currColumn - 1, currRow, i, j, this);
        }
        // if no neighbors matched, delete this path
        if (paths[j].length === i) {
          paths.splice(j, 1);
        }
        distanceFromEnd--;
      }
    }
    // check for duplicate paths
    if (str.length > 1 && paths.length > 1) {
      // sum the coordinates (as a number) of each path and add to Array
      const sumsArr = [];
      for (let i = 0; i < paths.length; i++) {
        sumsArr.push(paths[i].reduce((sum, curr) => +sum + +curr));
      }
      // check for duplicate sums
      const duplicates = [];
      for (let i = 0; i < sumsArr.length; i++) {
        for (let j = 1 + i; j < sumsArr.length; j++) {
          if (sumsArr[i] === sumsArr[j]) {
            duplicates.push([i, j]);
          }
        }
      }
      // if two paths have a duplicate sum, they may be the same path so check
      if (duplicates.length > 0) {
        let indicesToDelete = [];
        for (let i = 0; i < duplicates.length; i++) {
          // join paths with same sums into a set
          const testSet = new Set([...paths[duplicates[i][0]], ...paths[duplicates[i][1]]]);
          // if size of the set is the same as the size of a path, remove path
          if (testSet.size === paths[0].length) {
            // push indices to delete into an array
            indicesToDelete.push(duplicates[i][1]);
          }
        }
        // if there are indices to delete
        if (indicesToDelete.length) {
          // remove any duplicate indices
          indicesToDelete = [...new Set(indicesToDelete)];
          // sort them from largest to smallest
          indicesToDelete.sort((a, b) => (b - a));
          // remove all indices from paths
          for (let i = 0; i < indicesToDelete.length; i++) {
            paths.splice(indicesToDelete[i], 1);
            // if indexToDelete is below are the same as the primaryPathIdx, decrement
            if (indicesToDelete[i] <= primaryPathIdx) {
              primaryPathIdx--;
            }
          }
        }
      }
    }
    return {paths, primaryPathIdx};
  }

  static chooseLetters(numOfLetters) {
    const letters = [];
    for (let i = 0; i < numOfLetters; i++) {
      letters.push(GameBoardState.letterArray[Math.floor(Math.random() * 100)]);
    }
    return letters;
  }

  static letterArray = [
    'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'b', 
    'b', 'c', 'c', 'd', 'd', 'd', 'd', 'e', 'e', 'e', 
    'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'e', 'f', 
    'f', 'g', 'g', 'g', 'h', 'h', 'h', 'i', 'i', 'i', 
    'i', 'i', 'i', 'i', 'i', 'i', 'j', 'k', 'l', 'l', 
    'l', 'l', 'm', 'm', 'n', 'n', 'n', 'n', 'n', 'n', 
    'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'p', 'p', 
    'q', 'r', 'r', 'r', 'r', 'r', 'r', 's', 's', 's', 
    's', 's', 't', 't', 't', 't', 't', 't', 'u', 'u', 
    'u', 'u', 'v', 'v', 'w', 'w', 'x', 'y', 'y', 'z'
  ];

}

export default GameBoardState;