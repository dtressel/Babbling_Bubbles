/* 
  This GameBoardState class keeps track of the state of the game board
  and provides functions to alter the game board.

  Used in /src/pages/Play/play.js

  play.js creates an instance of this class and then stores the instance of
  this class using useRef() to access that instance.

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
    this.totalRows = this.rows + this.visibleNextRows + this.hiddenNextRows;
    this.currentBoard = this.createNewBoard();
    this.score = 0;
    this.numOfWords = 0;
    // [ { bestType, word, score, boardState }, ... ]
    this.bstWords = [];
    this.crzWords = [];
    this.lngWords = [];
    this.bstWordScoreBar = { thisGameBest: 0, allTimeTenthBest: 0 };
    this.crzWordScoreBar = { thisGameBest: 0, allTimeTenthBest: 0 };
    this.lngWordScoreBar = { thisGameBest: 0, allTimeTenthBest: 0 };
    this.tenBestWords = null;
    this.currWordScore = 0;
    this.currPathMultiplier = 1;
    /* 
      savedPaths contains a history of paths including relevant duplicates
      savedPaths is an array of objects of paths for a built string structured like:
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
    /* an array of paths for current board state, allows easy primary path switching */
    this.currentPaths = [];
    /* a set of coordinates for the primary path */
    this.primaryPath = null;
    /* a set of coordinates for all bubbles in all secondary paths */
    this.secondaryPaths = null;
    this.gameActive = true;
    // To be set on game end
    this.avgWordScore = null;
    this.curr100Wma = null;
    this.curr20Wma = null;
    this.isPeak100Wma = null;
    this.isPeak20Wma = null;
    this.ttlScorePlace = null;
    this.avgScorePlace = null;
    this.finalBstWord = null;
    // { word, score }
    this.finalLngWord = '';
    this.finalCrzWord = '';
  }
  
  // creates an array of arrays, each inner array represents a column on the game board
  createNewBoard() {
    const gameBoard = [];
    for (let i = 0; i < this.columns; i++) {
      gameBoard.push(GameBoardState.chooseLetters(this.rows + this.visibleNextRows + this.hiddenNextRows));
    }
    return gameBoard;
  }

  popBubbles(bubbles) {
    // sort bubbles from highest to lowest so splicing by index removes correct bubble
    bubbles.sort((a, b) => b - a);
    const poppedByColumn = [...Array(this.columns)].map(() => ([]));
    for (const bubble of bubbles) {
      const x = +bubble[0];
      const y = +bubble[1];
      // add bubble to poppedByColumn
      if (poppedByColumn[x]) {
        poppedByColumn[x].unshift(y);
      } 
      else {
        poppedByColumn[x] = [y];
      }
      this.currentBoard[x].splice(y, 1);
      GameBoardState.addNewBubbles.call(this, x, 1);
    }
    /* 
      Empty spaces example:
      [
        [],
        [undefined, 1, undefined, 1],
        [undefined, undefined, 2],
        [],
        []
      ]
      There will be this.columns # of inner arrays
    */
    return GameBoardState.findEmptySpaces(poppedByColumn);
  }

  static addNewBubbles(column, numOfBubbles) {
    const newLetters = GameBoardState.chooseLetters(numOfBubbles);
    this.currentBoard[column].push(...newLetters);
  }

  static findEmptySpaces(poppedByColumn) {
    return poppedByColumn.map((column) => {
      if (!column) return null;
      /* 
        example of spaces = [undefined, 2, undefined, 1]
        meaning:
          before 2nd spot there are 2 empty spaces
          before 4th spot there is 1 empty space
      */
      let spaces = [];
      let lastPopped = -2;
      for (const popped of column) {
        if (popped === lastPopped + 1) {
          spaces[spaces.length - 1]++;
        }
        else {
          const currEmptySpots = spaces.reduce((accum, curr) => {
            return curr ? accum + curr : accum;
          }, 0);
          spaces[popped - currEmptySpots] = 1;
        }
        lastPopped = popped;
      }
      return spaces;
    });
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

    coordinate paramter is optional and used for clicked bubbles
  */
  findPaths(newInput, coordinate) {
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
      newPaths = GameBoardState.findPathForFirstLetter.call(this, newInput, coordinate);
    }
    // Finally, if user added one character to the input field, find new paths based on saved paths
    else if (newInputLength === savedInputLength + 1) {
      let extendedPaths = GameBoardState.extendPaths.call(this, newInput[newInputLength - 1], coordinate);
      // If a coordinate and there are no paths, return undefined to ignore click
      if (coordinate && !extendedPaths.length) return undefined;
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

    // Use newPaths created from any of the above to create object of paths
    // and primary path index for return to Play.js
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
    return finalPaths;
    // find paths for last letter and save return value
  }

  // coordinate parameter is optional
  static findPathForFirstLetter(letter, coordinate) {
    this.savedPaths = [];
    const paths = [];
    for (let i = 0; i < this.columns; i++) {
      for (let j = 0; j < this.rows; j++) {
        if (letter === this.currentBoard[i][j][0]) {
          if ((!coordinate && !paths.length) || (coordinate === `${i}${j}`)) {
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

  // coordinate parameter is optional
  static extendPaths(letter, coordinate) {
    const oldPaths = this.savedPaths[this.savedPaths.length - 1].paths;
    let makePrimary = false;
    const foundPathsCumulative = [];

    // for each old path
    for (let i = 0; i < oldPaths.length; i++) {
      const currColumn = +oldPaths[i].path[oldPaths[i].path.length - 1][0];
      const currRow = +oldPaths[i].path[oldPaths[i].path.length - 1][1];
      const foundPaths = [];
      if (oldPaths[i].flag === 0) makePrimary = true;
      const newFoundPaths = GameBoardState.testNeighbors.call(this, currColumn, currRow, letter, oldPaths[i], makePrimary, coordinate);
      foundPaths.push(...newFoundPaths.foundPaths);
      if (newFoundPaths.madeOnePrimary) makePrimary = false;
      if (foundPaths.length) foundPathsCumulative.push(...foundPaths);
    }
    // if none of the paths were made primary yet and there is a coordinate, find match, and make primary
    if (coordinate && makePrimary && foundPathsCumulative.length) {
      for (const path of foundPathsCumulative) {
        if (path.path.at(-1) === coordinate) {
          path.flag = 0;
          makePrimary = false;
        }
      }
    }
    // if a coordinate and there was still no match on last bubble of any path, then illegal bubble click
    if (coordinate && makePrimary) return [];
    if (makePrimary && foundPathsCumulative.length) {
      foundPathsCumulative[foundPathsCumulative.length - 1].flag = 0;
    }
    return foundPathsCumulative;
  }

  // returns and array of found paths
  // coordinate parameter is optional
  static testNeighbors(currColumn, currRow, letter, oldPath, makePrimary, coordinate) {
    let madeOnePrimary = false;
    const foundPaths = [];
    const startColumn = (currColumn - 1 >= 0) ? currColumn - 1 : currColumn;
    const endColumn = (currColumn + 1 < this.columns) ? currColumn + 1 : currColumn;
    for (let testColumn = startColumn; testColumn <= endColumn; testColumn++) {
      let startRow = (currRow - 1 >= 0) ? currRow - 1 : currRow;
      let endRow = (currRow + 1 < this.rows) ? currRow + 1 : currRow;
      for (let testRow = startRow; testRow <= endRow; testRow++) {
        // if you the letter we're looking for is found at this test bubble
        if (this.currentBoard[testColumn][testRow][0] === letter) {
          // if this bubble has not already been used in this path
          if (!oldPath.path.includes(`${testColumn}${testRow}`)) {
            let flag = 1;
            if (makePrimary && (!coordinate || coordinate === `${testColumn}${testRow}`)) {
              flag = 0;
              makePrimary = false;
              madeOnePrimary = true;
            }
            const foundPath = 
            {
              path: [...oldPath.path, `${testColumn}${testRow}`], 
              flag: flag
            }
            foundPaths.push(foundPath);
          }
        }
      }
    }
    return { foundPaths, madeOnePrimary };
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
      const multiplierChooserNum = Math.floor(Math.random() * 60);
      const letter = this.letterArray[Math.floor(Math.random() * 100)];
      // if less than 1, triple chosen letter for 3x multiplier (1/60 chance)
      if (multiplierChooserNum < 1) {
        letters.push(letter + letter + letter);
      }
      // if greater than 94, double chosen letter for 2x multiplier (1/30 chance)
      else if (multiplierChooserNum > 57) {
        letters.push(letter + letter);
      }
      else {
        letters.push(letter);
      }
    }
    return letters;
  }

  static letterArray = [
    'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'B', 
    'B', 'C', 'C', 'D', 'D', 'D', 'D', 'E', 'E', 'E', 
    'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'F', 
    'F', 'G', 'G', 'G', 'H', 'H', 'H', 'I', 'I', 'I', 
    'I', 'I', 'I', 'I', 'I', 'I', 'J', 'K', 'L', 'L', 
    'L', 'L', 'M', 'M', 'N', 'N', 'N', 'N', 'N', 'N', 
    'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'P', 'P', 
    'Q', 'R', 'R', 'R', 'R', 'R', 'R', 'S', 'S', 'S', 
    'S', 'S', 'T', 'T', 'T', 'T', 'T', 'T', 'U', 'U', 
    'U', 'U', 'V', 'V', 'W', 'W', 'X', 'Y', 'Y', 'Z'
  ];

  calcCurrWordScore(word) {
    if (word.length < 3) {
      this.currWordScore = 0;
      this.currPathMultiplier = 1;
      return;
    }
    let wordScorePreMult = 0;
    // for each letter, create sum of letter values
    for (const char of word) {
      wordScorePreMult += GameBoardState.letterValues[char];
    }
    // add number of letters bonus
    wordScorePreMult += GameBoardState.numOfLettersBonus[word.length];
    // check if multiplier bubbles used, if so, multiply by multiplier
    let multiplier = 1;
    for (const bubble of this.primaryPath) {
      multiplier *= this.currentBoard[bubble[0]][bubble[1]].length;
    }
    this.currPathMultiplier = multiplier;
    this.currWordScore = wordScorePreMult * multiplier;
  }

  calcSubmittedWordScore(word, primaryPath) {
    // create current board string variable to store current board string if needed
    let currBoardString;
    let wordScorePreMult = 0;
    // for each letter, create sum of letter values
    for (const char of word) {
      wordScorePreMult += GameBoardState.letterValues[char];
    }
    // add number of letters bonus
    wordScorePreMult += GameBoardState.numOfLettersBonus[word.length];

    // see if this is the craziest word so far, if so, update instance
    if (wordScorePreMult > this.crzWordScoreBar.thisGameBest) {
      this.crzWordScoreBar.thisGameBest = wordScorePreMult;
      currBoardString = this.convertCurrBoardToString(primaryPath);
      this.crzWords.push({
        bestType: 'crz',
        word,
        score: wordScorePreMult,
        boardState: currBoardString
      });
    }
    else if (wordScorePreMult > this.crzWordScoreBar.allTimeTenthBest) {
      currBoardString = this.convertCurrBoardToString(primaryPath);
      this.crzWords.push({
        bestType: 'crz',
        word,
        score: wordScorePreMult,
        boardState: currBoardString
      });
    }

    // see if this is the longest word so far, if so, update instance
    const currWordLongestWordScore = (word.length * 1000) + wordScorePreMult;
    if (currWordLongestWordScore > this.lngWordScoreBar.thisGameBest) {
      this.lngWordScoreBar.thisGameBest = currWordLongestWordScore;
      if (!currBoardString) currBoardString = this.convertCurrBoardToString(primaryPath);
      this.lngWords.push({
        bestType: 'lng',
        word,
        score: currWordLongestWordScore,
        boardState: currBoardString
      });
    }
    else if (currWordLongestWordScore > this.lngWordScoreBar.allTimeTenthBest) {
      if (!currBoardString) currBoardString = this.convertCurrBoardToString(primaryPath);
      this.lngWords.push({
        bestType: 'lng',
        word,
        score: currWordLongestWordScore,
        boardState: currBoardString
      });
    }

    // check if multiplier bubbles used, if so, multiply by multiplier
    let multiplier = 1;
    for (const bubble of primaryPath) {
      multiplier *= this.currentBoard[bubble[0]][bubble[1]].length;
    }
    let wordScore = wordScorePreMult * multiplier;

    // see if this is the best word so far, if so, update instance
    if (wordScore > this.bstWordScoreBar.thisGameBest) {
      this.bstWordScoreBar.thisGameBest = wordScore;
      if (!currBoardString) currBoardString = this.convertCurrBoardToString(primaryPath);
      this.bstWords.push({
        bestType: 'bst',
        word,
        score: wordScore,
        boardState: currBoardString
      });
    }
    else if (wordScore > this.bstWordScoreBar.allTimeTenthBest) {
      if (!currBoardString) currBoardString = this.convertCurrBoardToString(primaryPath);
      this.bstWords.push({
        bestType: 'bst',
        word,
        score: wordScore,
        boardState: currBoardString
      });
    }
  
    return wordScore;    
  }

  // old primary path is already an array, new primary path is a set
  findNewPathCurrWordScore() {
    const newPrimaryPathMultiplier = [...this.primaryPath].reduce((accum, curr) => {
      return accum * this.currentBoard[curr[0]][curr[1]].length;
    }, 1);
    this.currWordScore = this.currWordScore * newPrimaryPathMultiplier / this.currPathMultiplier;
    this.currPathMultiplier = newPrimaryPathMultiplier;
  }

  calcTotalScoreAndUpdateStats(word, primaryPath) {
    let wordScore = this.calcSubmittedWordScore(word, primaryPath);
    this.score += wordScore;
    this.numOfWords++;
  
    return this.score;
  }

  convertCurrBoardToString(primaryPath = []) {
    const flatBoard = [];
    for (const column of this.currentBoard) {
      for (const letter of column.slice(0, this.rows)) {
        flatBoard.push(letter.toLowerCase());
      }
    }
    // make letters of primary path upper case to show path of word
    for (const coordinate of primaryPath) {
      const index = (+coordinate[0] * this.rows) + (+coordinate[1]);
      flatBoard[index] = flatBoard[index].toUpperCase();
    }
    // create board state string
    let boardStateString = '';
    for (const letter of flatBoard) {
      boardStateString += (letter[0]);
      // after letter put 
      if (letter.length > 1) boardStateString += (letter.length);
    }

    return boardStateString;
  }

  /*
    Collects stats to send to API
    Creates the following stas object:
    {
      score: <int>,
      numOfWords: <int>,
      bestWords: {
        bst: [{ bestType, word, score, boardState }, { ... }],
        crz: [...],
        lng: [...]
      }
    }
    bestWords may or may not be present in object
  */
  getStatsOnGameEnd() {
    this.gameActive = false;
    // if no words were found, short circuit
    if (!this.score) return { score: 0, numOfWords: 0 };

    // sort and then trim best words arrays
    this.bstWords.sort((a, b) => b.score - a.score);
    const bstWordsForUpdate = this.bstWords.filter((wordObj, idx) => {
      return wordObj.score > this.bstWordScoreBar.allTimeTenthBest && idx < 10;
    });

    this.crzWords.sort((a, b) => b.score - a.score);
    const crzWordsForUpdate = this.crzWords.filter((wordObj, idx) => {
      return wordObj.score > this.crzWordScoreBar.allTimeTenthBest && idx < 10;
    });

    this.lngWords.sort((a, b) => b.score - a.score);
    const lngWordsForUpdate = this.lngWords.filter((wordObj, idx) => {
      return wordObj.score > this.lngWordScoreBar.allTimeTenthBest && idx < 10;
    });

    // otherwise, create stats object
    const statKeys = ['score', 'numOfWords'];
    const stats = statKeys.reduce((accum, curr) => {
      if (this[curr]) accum[curr] = this[curr];
      return accum;
    }, {});

    // only add bestWords to stats object if there are best words to add to database
    if (bstWordsForUpdate.length || crzWordsForUpdate.length || lngWordsForUpdate.length) {
      stats.bestWords = { bst: bstWordsForUpdate, crz: crzWordsForUpdate, lng: lngWordsForUpdate };
    }

    return stats;
  }

  /* Sets the stats collected from backend on game over to game instance */
  setGameOverStats(returnedStats) {
    this.avgWordScore = returnedStats.avgWordScore;
    this.curr100Wma = returnedStats.curr100Wma;
    this.curr20Wma = returnedStats.curr20Wma;
    this.isPeak100Wma = returnedStats.isPeak100Wma;
    this.isPeak20Wma = returnedStats.isPeak20Wma;
    this.ttlScorePlace = returnedStats.ttlScorePlace;
    this.avgScorePlace = returnedStats.avgScorePlace;
    // final bst, lng, and crz word arrays already sorted in getStatsOnGameEnd()
    if (this.bstWords.length) {
      this.finalBstWord = { word: this.bstWords[0].word, score: this.bstWords[0].score };
    }
    if (this.lngWords.length) {
      this.finalLngWord = this.lngWords[0].word;
    }
    if (this.crzWords.length) {
      this.finalCrzWord = this.crzWords[0].word;
    }
  }

  static letterValues = { a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
                          j: 8, k: 5, l: 1, m: 3, n: 1, o: 1, p: 3, q: 10, r: 1,
                          s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10 };

  static numOfLettersBonus = { 3: 0, 4: 1, 5: 2, 6: 3, 7: 5, 8: 7, 9: 10, 10: 13, 
                               11: 16, 12: 20, 13: 24, 14: 29, 15: 34, 16: 39,
                               17: 45, 18: 50, 19: 55, 20: 60 };

}

export default GameBoardState;