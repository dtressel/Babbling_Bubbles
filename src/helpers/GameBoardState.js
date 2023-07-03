class GameBoardState {
  constructor(columns, rows, visibleNextRows) {
    this.columns = columns;
    this.rows = rows;
    this.visibleNextRows = visibleNextRows;
    this.hiddenNextRows = rows;
    this.currentBoard = this.createNewBoard();
  }
  
  // creates an array of arrays, each inner array represents a column on the game board
  createNewBoard() {
    const gameBoard = [];
    for (let i = 0; i < this.columns; i++) {
      gameBoard.push(GameBoardState.chooseLetters(this.rows + this.visibleNextRows + this.hiddenNextRows));
    }
    return gameBoard;
  }

  // find all locations of instances of a string
  findLocations(str, primaryLocationIdx) {
    // creates an array of arrays
    // each inner array is an array of coordinates for each step in the path
    const locations = [];
    function testColumnsOfNeighbors(testColumn, currRow, i, j, gameInstance) {
      // Omit testing the row below the bottom-most row
      let testUntilRow = 1;
      // if currRow is the bottom-most row
      if (currRow === gameInstance.rows - 1) {
        testUntilRow = 0;
      }
      // for each of the neighboring letters in the test column
      for (let k = -1; k <= testUntilRow; k++) {
        // if you the letter we're looking for is found at this test location
        if (gameInstance.currentBoard[testColumn][currRow + k] === str[i]) {
          // if this location has not already been used in this path
          if (!locations[j].includes(`${testColumn}${currRow + k}`)) {
            // if this is not the only matching neighbor
            if (locations[j].length > i) {
              const newPath = locations[j].slice(0, -1);
              newPath.push(`${testColumn}${currRow + k}`);
              locations.splice(j + 1, 0, newPath);
              if (i === str.length - 1 && j < primaryLocationIdx) {
                primaryLocationIdx++;
              }
            } 
            // else if this is the only matching neighbor so far
            else {
              locations[j].push(`${testColumn}${currRow + k}`);
            }
          }
        }
      }
    }

    // find occurances of first letter
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (str[0] === this.currentBoard[i][j]) {
          locations.push([`${i}${j}`]);
        }
      }
    }
    // build location paths for rest of string
    // for each letter of string after first letter
    for (let i = 1; i < str.length; i++) {
      // Will loop through locations using 'distanceFromEnd' variable since we'll be adding
      // new locations after current testing location and before next testing location
      // and will need to skip the added locations or else we'll get an infinite loop.
      // 'j' will still be an incrementing variable starting at 0 but will skip indices 
      // based on the potentially increasing length of locations.
      // This looping method will also cause us to avoid skipping locations when deleting one.
      let distanceFromEnd = locations.length;
      // for each path in locations array
      for (let j = 0; distanceFromEnd > 0; j = locations.length - distanceFromEnd) {
        console.log(primaryLocationIdx);
        const currColumn = +locations[j][i - 1][0];
        const currRow = +locations[j][i - 1][1];
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
        if (locations[j].length === i) {
          locations.splice(j, 1);
        }
        distanceFromEnd--;
      }
    }
    // check for duplicate paths
    if (str.length > 1 && locations.length > 1) {
      // sum the coordinates (as a number) of each path and add to Array
      const sumsArr = [];
      for (let i = 0; i < locations.length; i++) {
        sumsArr.push(locations[i].reduce((sum, curr) => +sum + +curr));
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
          const testSet = new Set([...locations[duplicates[i][0]], ...locations[duplicates[i][1]]]);
          // if size of the set is the same as the size of a location path, remove location path
          if (testSet.size === locations[0].length) {
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
          // remove all indices from locations
          for (let i = 0; i < indicesToDelete.length; i++) {
            locations.splice(indicesToDelete[i], 1);
            // if indexToDelete is below are the same as the primaryPositionIdx, decrement
            if (indicesToDelete[i] <= primaryLocationIdx) {
              primaryLocationIdx--;
            }
          }
        }
      }
    }
    return {locations, primaryLocationIdx};
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