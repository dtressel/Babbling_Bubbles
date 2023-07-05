class GameBoardState {
  constructor(columns, rows, visibleNextRows) {
    this.columns = columns;
    this.rows = rows;
    this.visibleNextRows = visibleNextRows;
    this.hiddenNextRows = rows;
    this.currentBoard = this.createNewBoard();
    /* 
      this.savedPaths is an array of objects of paths for a built string structured like:
      [
        {
          input: "a",
          paths: [
            {
              path: ["01"],
              primary: true
            },
            {
              path: ["23"],
              primary: false
            }
          ]
        },
        {
          input: "ab",
          paths: [
            {
              path: ["01", "12"],
              primary: true
            },
            {
              path: ["23", "12"],
              primary: false
            }
          ]
        }
      ]
    */
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

  /* 
    Find all paths of instances of the new input

    Returns a paths array structured like the following:
      [
        {
          path: ["01", "12"],
          primary: true
        },
        {
          path: ["23", "12"],
          primary: false
        }
      ]
    Only one path should be set as primary: true
  */
  findPaths(newInput) {
    // if input field is empty return an empty array and reset this.savedPaths
    if (!newInput) {
      this.savedPaths = [];
      return [];
    }

    const lastSavedPathsObj = this.savedPaths[this.savedPaths.length - 1];
    const savedInput = lastSavedPathsObj.input;
    const savedInputLength = savedInput.length;
    const newInputLength = newInput.length;

    // if input field is unchanged yet somehow this function was called, return formerly saved paths
    if (newInput === savedInput) {
      return lastSavedPathsObj.paths;
    }

    // if the newInput passed is not one less or one more character than the last input value
    // then use alternative method 'findFullPaths' to find paths.
    // This is necessary in case of an error, a user copy and pastes, or a user has 
    // a way to input multiple characters at once
    if (this.input !== newInput.slice(0, -1) && this.input(0, -1) !== newInput) {
      this.savedPaths = [];
      return this.findFullPaths(newInput);
    }

    // if new input is one character, find occurances of first letter
    if (newInputLength === 1) {
      this.savedPaths = [];
      const paths = [];
      for (let i = 0; i < this.columns; i++) {
        for (let j = 0; j < this.rows; j++) {
          if (newInput[0] === this.currentBoard[i][j]) {
            if (!paths.length) {
              paths.push({path: [`${i}${j}`], primary: true});
            }
            else {
              paths.push({path: [`${i}${j}`], primary: false});
            }
          }
        }
      }
      this.savedPaths.push(
        {
          input: newInput,
          paths: paths
        }
      );
      return paths;
    }

    // if a character was deleted from the input field
    if (newInputLength === savedInputLength - 1) {
      this.savedPaths.pop();
      return this.savedPaths[this.savedPaths.legnth - 1].paths;
    }

    // Finally, if user added one character to the input field, find new paths based on saved paths 
    if (newInputLength === savedInputLength + 1) {
      let extendedPaths = GameBoardState.extendPaths.call(this, newInput[newInputLength - 1]);
      // since the above may create duplicate paths, check for and remove duplicate paths
      if (extendedPaths > 1) {
        GameBoardState.removeDuplicatePaths(extendedPaths);
      }
      this.savedPaths.push(
        {
          input: newInput,
          paths: extendedPaths
        }
      );
      return extendedPaths;
    }
  }

  static extendPaths(letter) {
    const oldPaths = this.savedPaths[this.savedPaths.length - 1].paths;
    let makeNextPrimary = false;
    const foundPathsCumulative = [];

    // for each old path
    for (let i = 0; i < oldPaths.length; i++) {
      const currColumn = +oldPaths[i].path.slice(-1)[0];
      const currRow = +oldPaths[i].path.slice(-1)[1];
      const foundPaths = [];
      let makePrimary = oldPaths[i].primary || makeNextPrimary;
      foundPaths.push(
        GameBoardState.testNeighbors.call(this, currColumn, currRow, letter, oldPaths[i], makePrimary)
      );
      if (makePrimary && !foundPaths.length) makeNextPrimary = true;
      foundPathsCumulative.push(...foundPaths);
    }
    return foundPathsCumulative;
  }

  // returns and array of found paths
  static testNeighbors(currColumn, currRow, letter, oldPath, makePrimary) {
    const foundPaths = [];
    const startColumn = (currColumn - 1 >= 0) ? currColumn - 1 : currColumn;
    const endColumn = (currColumn + 1 < this.columns) ? currColumn + 1 : currColumn;
    for (let testColumn = startColumn; testColumn <= endColumn; testColumn++) {
      let startRow = (currRow - 1 >= 0) ? currRow - 1 : currRow;
      let endRow = (currRow + 1 < this.rows) ? currRow + 1 : currRow;
      for (let testRow = startRow; testRow <= endRow; testRow++) {
        // if you the letter we're looking for is found at this test bubble
        if (this.currentBoard[testColumn][testRow] === letter) {
          // if this path has not already been used in this path
          if (!oldPath.includes(`${testColumn}${testRow}`)) {
            const foundPath = 
            {
              path: [...oldPath, `${testColumn}${testRow}`], 
              primary: makePrimary
            }
            if (makePrimary) makePrimary = false;
            foundPaths.push(foundPath);
          }
        }
      }
    }
    return foundPaths;
  }

  static removeDuplicatePaths(extendedPaths) {
    // sum the coordinates (as a number) of each path and add to Array
    const sumsArr = [];
    for (let i = 0; i < extendedPaths.length; i++) {
      sumsArr.push(extendedPaths[i].reduce((sum, curr) => +sum + +curr));
    }
    // check for duplicate sums
    // duplicates array will be an array of arrays of pairs of extendedPaths indices with duplicate sums
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
        const testSet = new Set([...extendedPaths[duplicates[i][0]], ...extendedPaths[duplicates[i][1]]]);
        // if size of the set is the same as the size of a path, remove path
        if (testSet.size === extendedPaths[0].path.length) {
          // push indices to delete into an array
          const indexToDelete = duplicates[i][1];
          // if index to delete is primary index, make other duplicate primary
          // in case of 3 or more duplicates, this will still work
          indicesToDelete.push(indexToDelete);
          if (extendedPaths[indexToDelete].primary) {
            extendedPaths[duplicates[i][0]].primary = true;
          }
        }
      }
      // if there are indices to delete
      if (indicesToDelete.length) {
        // remove any duplicate indices
        indicesToDelete = [...new Set(indicesToDelete)];
        // remove all indices from paths
        for (let i = 0; i < indicesToDelete.length; i++) {
          extendedPaths.splice(indicesToDelete[i], 1);
        }
      }
    }
  }

  // find all paths of instances of newInputing
  findFullPaths(newInput, primaryPathIdx) {
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
        if (gameInstance.currentBoard[testColumn][currRow + k] === newInput[i]) {
          // if this path has not already been used in this path
          if (!paths[j].includes(`${testColumn}${currRow + k}`)) {
            // if this is not the only matching neighbor
            if (paths[j].length > i) {
              const newPath = paths[j].slice(0, -1);
              newPath.push(`${testColumn}${currRow + k}`);
              paths.splice(j + 1, 0, newPath);
              if (i === newInput.length - 1 && j < primaryPathIdx) {
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
        if (newInput[0] === this.currentBoard[i][j]) {
          paths.push([`${i}${j}`]);
        }
      }
    }
    // build paths for rest of new input
    // for each letter of new input after first letter
    for (let i = 1; i < newInput.length; i++) {
      // Will loop through paths using 'distFromEndOfPathsArr' variable since we'll be adding
      // new paths after current testing path and before next testing path
      // and will need to skip the added paths or else we'll get an infinite loop.
      // 'j' will still be an incrementing variable starting at 0 but will skip indices 
      // based on the potentially increasing length of paths.
      // This looping method will also cause us to avoid skipping paths when deleting one.
      let distFromEndOfPathsArr = paths.length;
      // for each path in paths array
      for (let j = 0; distFromEndOfPathsArr > 0; j = paths.length - distFromEndOfPathsArr) {
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
        distFromEndOfPathsArr--;
      }
    }
    // check for duplicate paths
    if (newInput.length > 1 && paths.length > 1) {
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