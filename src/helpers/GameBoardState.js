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

  setPrimaryPathIdx(idx) {
    const savedPathsLength = this.savedPaths.length;
    const lastSavedPaths = this.savedPaths[savedPathsLength - 1];
    if (!savedPathsLength) return;
    // clear old primaryPathIdx info
    for (let i = 0; i < lastSavedPaths.length; i++) {
      lastSavedPaths.paths[i].primary = false;
    }
    lastSavedPaths.paths[idx].primary = true;
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
    console.log(this.savedPaths);
    let newPaths;

    let lastSavedPathsObj;
    let savedInput = '';
    let savedInputLength = 0;
    const newInputLength = newInput.length;

    if (this.savedPaths.length) {
      lastSavedPathsObj = this.savedPaths[this.savedPaths.length - 1];
      savedInput = lastSavedPathsObj.input;
      savedInputLength = savedInput.length;
    }

    // if input field is empty set newPaths as an empty array and reset this.savedPaths
    if (!newInput) {
      this.savedPaths = [];
      newPaths = [];
    }
    // if input field is unchanged yet somehow this function was called, set newPaths as formerly saved paths
    else if (newInput === savedInput) {
      newPaths = lastSavedPathsObj.paths;
    }
    // if the newInput passed is not one less or one more character than the last input value
    // then use alternative method 'findFullPaths' to find paths.
    // This is necessary in case of an error, a user copy and pastes, or a user has 
    // a way to input multiple characters at once
    else if (savedInput !== newInput.slice(0, -1) && savedInput.slice(0, -1) !== newInput) {
      newPaths = GameBoardState.findFullPaths.call(this, newInput);
    }
    // if a character was deleted from the input field
    else if (newInputLength === savedInputLength - 1) {
      this.savedPaths.pop();
      newPaths = this.savedPaths[this.savedPaths.length - 1].paths;
    }
    // if new input is one character, find occurances of first letter
    else if (newInputLength === 1) {
      newPaths = GameBoardState.findPathForFirstLetter.call(this, newInput);
    }
    // Finally, if user added one character to the input field, find new paths based on saved paths
    else if (newInputLength === savedInputLength + 1) {
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
      newPaths = extendedPaths;
    }

    // create object of paths and primary path index for return to Play.js
    const pathsObj = {paths: []};
    for (let i = 0; i < newPaths.length; i++) {
      pathsObj.paths.push(newPaths[i].path);
      if (newPaths[i].primary) {
        pathsObj.primaryPathIdx = i;
      }
    }
    return pathsObj;
  }

  static findFullPaths(newInput) {
    let finalPaths;
    // will update this.savedPaths; we do not need return value
    GameBoardState.findPathForFirstLetter.call(this, newInput[0]);
    // loop through middle letters in newInput
    for (let i = 1; i < newInput.length; i++) {
      let extendedPaths = GameBoardState.extendPaths.call(this, newInput[i]);
      // since the above may create duplicate paths, check for and remove duplicate paths
      if (extendedPaths > 1) {
        GameBoardState.removeDuplicatePaths(extendedPaths);
      }
      this.savedPaths.push(
        {
          input: newInput.slice(0, i + 1),
          paths: extendedPaths
        }
      );
      finalPaths = extendedPaths;
    }
    return finalPaths;
    // find paths for last letter and save return value
  }

  static findPathForFirstLetter(letter) {
    this.savedPaths = [];
    const paths = [];
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (letter === this.currentBoard[i][j]) {
          
          if (!paths.length) {
            paths.push({ path: [`${i}${j}`], primary: true });
          }
          else {
            paths.push({ path: [`${i}${j}`], primary: false });
          }
        }
      }
    }
    this.savedPaths.push(
      {
        input: letter,
        paths: paths
      }
    );
    return paths;
  }

  static extendPaths(letter) {
    const oldPaths = this.savedPaths[this.savedPaths.length - 1].paths;
    let makeNextPrimary = false;
    const foundPathsCumulative = [];

    // for each old path
    for (let i = 0; i < oldPaths.length; i++) {
      const currColumn = +oldPaths[i].path[oldPaths[i].path.length - 1][0];
      const currRow = +oldPaths[i].path[oldPaths[i].path.length - 1][1];
      const foundPaths = [];
      let makePrimary = oldPaths[i].primary || makeNextPrimary;
      foundPaths.push(
        ...GameBoardState.testNeighbors.call(this, currColumn, currRow, letter, oldPaths[i], makePrimary)
      );
      if (makePrimary && !foundPaths.length) makeNextPrimary = true;
      if (foundPaths.length) foundPathsCumulative.push(...foundPaths);
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
          // if this bubble has not already been used in this path
          if (!oldPath.path.includes(`${testColumn}${testRow}`)) {
            const foundPath = 
            {
              path: [...oldPath.path, `${testColumn}${testRow}`], 
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