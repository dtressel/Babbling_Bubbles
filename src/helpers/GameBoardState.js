/* 
  Improvements to make:
    1. if deleting more than one character check for match starting with first character
    2. if adding more than one charcter check for subset already recorded
    3. "pass up" primary index changes so deletes will follow primary path 
*/ 


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
              flag: 0
            },
            {
              path: ["23"],
              flag: 1
            }
          ]
        },
        {
          input: "ab",
          paths: [
            {
              path: ["01", "12"],
              flag: 0
            },
            {
              path: ["23", "12"],
              flag: 1
            }
          ]
        }
      ]

      flag values: 0: primary, 1: secondary, 2: relevant duplicates
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
    const lastSavedPaths = this.savedPaths.slice(-1)[0];
    if (!lastSavedPaths) return;
    // clear old primaryPathIdx info
    for (let i = 0; i < lastSavedPaths.paths.length; i++) {
      lastSavedPaths.paths[i].flag = 1;
    }
    lastSavedPaths.paths[idx].flag = 0;
  }

  /* 
    Find all paths of instances of the new input

    Returns a paths array structured like the following:
      [
        {
          path: ["01", "12"],
          flag: 0
        },
        {
          path: ["23", "12"],
          flag: 1
        }
      ]
    Only one path should be set as flag: 0
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
      newPaths = lastSavedPathsObj.paths.filter((path) => path.flag !== 2);
    }
    // if the newInput passed is not one less or one more character than the last input value
    // then use alternative method 'findFullPaths' to find paths.
    // This is necessary in case of an error, a user copy and pastes, or a user has 
    // a way to input multiple characters at once
    else if (savedInput !== newInput.slice(0, -1) && savedInput.slice(0, -1) !== newInput) {
      newPaths = GameBoardState.findFullPaths.call(this, newInput).filter((path) => path.flag !== 2);
    }
    // if a character was deleted from the input field
    else if (newInputLength === savedInputLength - 1) {
      this.savedPaths.pop();
      newPaths = this.savedPaths[this.savedPaths.length - 1].paths.filter((path) => path.flag !== 2);
    }
    // if new input is one character, find occurances of first letter
    else if (newInputLength === 1) {
      newPaths = GameBoardState.findPathForFirstLetter.call(this, newInput);
    }
    // Finally, if user added one character to the input field, find new paths based on saved paths
    else if (newInputLength === savedInputLength + 1) {
      let extendedPaths = GameBoardState.extendPaths.call(this, newInput[newInputLength - 1]);
      // since the above may create duplicate paths, check for and remove duplicate paths
      if (extendedPaths.length > 1) {
        GameBoardState.removeDuplicatePaths(extendedPaths);
      }
      this.savedPaths.push(
        {
          input: newInput,
          paths: extendedPaths
        }
      );
      // filter out relevant duplicates for send to Play.js
      newPaths = extendedPaths.filter((path) => path.flag !== 2);
    }

    // create object of paths and primary path index for return to Play.js
    const pathsObj = {paths: []};
    for (let i = 0; i < newPaths.length; i++) {
      pathsObj.paths.push(newPaths[i].path);
      if (newPaths[i].flag === 0) {
        pathsObj.primaryPathIdx = i;
      }
    }
    return pathsObj;
  }

  static findFullPaths(newInput) {
    let finalPaths;
    // update this.savedPaths and set return to finalPaths
    // finalPaths will be redefined if newInput is more than one letter
    finalPaths = GameBoardState.findPathForFirstLetter.call(this, newInput[0]);
    // loop through middle letters in newInput
    for (let i = 1; i < newInput.length; i++) {
      let extendedPaths = GameBoardState.extendPaths.call(this, newInput[i]);
      // since the above may create duplicate paths, check for and remove duplicate paths
      if (extendedPaths.length > 1) {
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
    console.log(finalPaths);
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
            paths.push({ path: [`${i}${j}`], flag: 0 });
          }
          else {
            paths.push({ path: [`${i}${j}`], flag: 1 });
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
    let makePrimary = false;
    const foundPathsCumulative = [];

    // for each old path
    for (let i = 0; i < oldPaths.length; i++) {
      const currColumn = +oldPaths[i].path[oldPaths[i].path.length - 1][0];
      const currRow = +oldPaths[i].path[oldPaths[i].path.length - 1][1];
      const foundPaths = [];
      if (oldPaths[i].flag === 0) makePrimary = true;
      foundPaths.push(
        ...GameBoardState.testNeighbors.call(this, currColumn, currRow, letter, oldPaths[i], makePrimary)
      );
      if (makePrimary && foundPaths.length) makePrimary = false;
      if (foundPaths.length) foundPathsCumulative.push(...foundPaths);
    }
    if (makePrimary && foundPathsCumulative.length) {
      foundPathsCumulative[foundPathsCumulative.length - 1].flag = 0;
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
              flag: makePrimary ? 0 : 1
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
      sumsArr.push(extendedPaths[i].path.reduce((sum, curr) => +sum + +curr));
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
        const testSet = new Set([...extendedPaths[duplicates[i][0]].path, ...extendedPaths[duplicates[i][1]].path]);
        // if size of the set is the same as the size of a path, remove path
        if (testSet.size === extendedPaths[0].path.length) {
          // mark second path for deleltion
          const indexToKeep = duplicates[i][0];
          const indexQuarentined = duplicates[i][1];
          // if quarentined index is primary index, make other duplicate primary
          // in case of 3 or more duplicates, this will still work
          if (extendedPaths[indexQuarentined].flag === 0) {
            extendedPaths[indexToKeep].flag = 0;
          }
          // if they have the same ending bubble, delete path
          if (extendedPaths[indexToKeep].path.slice(-1)[0] 
            === extendedPaths[indexQuarentined].path.slice(-1)[0]) {
            // push indices to delete into an array
            indicesToDelete.push(indexQuarentined);
          }
          // else if they have different ending bubbles, mark as relevant duplicate
          else {
            extendedPaths[indexQuarentined].flag = 2;
          }
        }
      }
      // if there are indices to delete
      if (indicesToDelete.length) {
        // remove any duplicate indices
        indicesToDelete = [...new Set(indicesToDelete)];
        // sort them from largest to smallest so that correct indices will be deleted
        indicesToDelete.sort((a, b) => (b - a));
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