/* 
  Improvements to be made:
    1. Fix primary path issue from video on phone taken on 8/9/23

  State management:
    1. Can we get rid of paths state and just reference GameBoardState instead when needed?
*/

import { useState, useRef, useCallback, forwardRef, useContext, useEffect } from 'react';
import UserContext from "../../contexts/UserContext";
import ApiLink from '../../helpers/ApiLink';
import GameBoard from './GameBoard';
import GameBoardState from '../../helpers/GameBoardState';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import { faShuffle } from '@fortawesome/free-solid-svg-icons';
import './Play.css';

const wordDictionary = require('an-array-of-english-words');

const COLUMNS = 5;
const ROWS = 4;
const VISIBLE_NEXT_ROWS = 2;
const EMPTY_SPACES_INITIAL_VALUE = [...Array(COLUMNS)].map(() => ([]));
const PAUSE_BEFORE_COLLAPSE = 200;
const TIME_BEFORE_SNAP_TO_NEW_STATE = 1000;

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function Play() {
  const [notStarted, setNotStarted] = useState(true);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState();
  const [wordInput, setWordInput] = useState('');
  const [result, setResult] = useState('placeholder text for div height');
  const [resultShowing, setResultShowing] = useState(false);
  const [primaryPathIdx, setPrimaryPathIdx] = useState(0);
  const [emptySpaces, setEmptySpaces] = useState(EMPTY_SPACES_INITIAL_VALUE);
  const [popCollapse, setPopCollapse] = useState(false);
  const [score, setScore] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { currentUser } = useContext(UserContext);

  const timerIntervalId = useRef();
  const resultTimeoutId = useRef();
  /* GameBoardState Instance */
  const gameInstanceRef = useRef();
  const playId = useRef();

  const wordInputElement = useCallback((input) => {
    if (input) {
      input.focus();
    }
  }, []); 

  // changes path when space bar is pressed anywhere in window
  useEffect(() => {
    window.addEventListener("keydown", changePath);
    return () => {
      window.removeEventListener("keydown", changePath);
    };
  }, []);

  // prevents the page down default when press space bar when nothing in focus
  // and prevents spaces from being entered in the input
  useEffect(() => {
    window.addEventListener("keypress", preventSpaceBarDefault);
    return () => {
      window.removeEventListener("keypress", preventSpaceBarDefault);
    };
  }, []);

  // prevents the button click default when pressing space bar when a button is in focus
  useEffect(() => {
    window.addEventListener("keyup", preventSpaceBarDefault);
    return () => {
      window.removeEventListener("keyup", preventSpaceBarDefault);
    };
  }, []);

  const changePath = (evt) => {
    if (evt.type === 'click' ||
        (evt.key === ' ' && gameInstanceRef.current && gameInstanceRef.current.gameActive)) {
      setPrimaryPathIdx((primaryPathIdx) => {
        const newPrimaryPathIndex = (primaryPathIdx >= gameInstanceRef.current.currentPaths.length - 1) ? 0 : primaryPathIdx + 1;
        gameInstanceRef.current.primaryPath = new Set(gameInstanceRef.current.currentPaths[newPrimaryPathIndex]);
        gameInstanceRef.current.secondaryPaths = new Set([
          ...gameInstanceRef.current.currentPaths.slice(0, newPrimaryPathIndex),
          ...gameInstanceRef.current.currentPaths.slice(newPrimaryPathIndex + 1)
        ].flat());
        gameInstanceRef.current.findNewPathCurrWordScore();
        return newPrimaryPathIndex;
      });
      gameInstanceRef.current.calcCurrWordScore(wordInput);
    }
  }

  const preventSpaceBarDefault = (evt) => {
    if (evt.key === ' ') evt.preventDefault();
  }

  const removeLetter = () => {
    processNewInput(wordInput.slice(0, wordInput.length - 1));
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleStartGame = (time) => {
    setNotStarted(false);
    setTimeout(() => setCountdown(2), 1000);
    setTimeout(() => setCountdown(1), 2000);
    setTimeout(async () => {
      setCountdown(0);
      setGameInProgress(true);
      setTimer(time);
      if (time) {
        timerIntervalId.current = setInterval(() => {
          setTimer((timer) => timer - 1);
        }, 1000);
      }
      gameInstanceRef.current = new GameBoardState(COLUMNS, ROWS, VISIBLE_NEXT_ROWS);
      if (currentUser) {
        playId.current = await ApiLink.newPlayAtUserStart({ userId: +currentUser.userId });
      }
    }, 3000);
  }

  const handleGameEnd = async () => {
    setGameFinished(true);
    setGameInProgress(false);
    clearInterval(timerIntervalId.current);
    // send update to database
    if (currentUser && timer !== null) {
      const updateInfo = gameInstanceRef.current.getStatsOnGameEnd();
      if (updateInfo) {
        const returnedStats = await ApiLink.updatePlayAtGameOver(playId.current, updateInfo);
        gameInstanceRef.current.setGameOverStats(returnedStats);
      }
    }
    setTimer(null);
    setDialogOpen(true);
  }

  let timeDisplay;

  if (timer === 0) {
    handleGameEnd();
  }

  if (gameInProgress) {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    timeDisplay = `${minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
  }

  // handle change to word input
  const handleChange = (evt) => {
    processNewInput(evt.target.value);
  }

  const handleBubbleClick = (evt) => {
    const coordinate = evt.target.id;
    const word = wordInput + evt.target.textContent.toLowerCase();
    // if primary path index was changed, record that change in GameBoardState
    if (gameInstanceRef.current.savedPaths.length 
      && gameInstanceRef.current.savedPaths.slice(-1)[0].paths.length
      && gameInstanceRef.current.savedPaths.slice(-1)[0].paths[primaryPathIdx].flag !== 0) {
      gameInstanceRef.current.setPrimaryPathIdx(primaryPathIdx);
    }
    // call findPaths in GameBoardState to create new paths or figure out if invalid
    const pathsObj = gameInstanceRef.current.findPaths(word.toUpperCase(), coordinate);
    // if illegal click (clicked a non-adjacent bubble), ignore
    if (!pathsObj) return;
    // Otherwise, continue
    // show change in input
    setWordInput(word);
    // set paths and primary path index here in Play.js
    gameInstanceRef.current.currentPaths = pathsObj.paths;
    setPrimaryPathIdx(pathsObj.primaryPathIdx);
    gameInstanceRef.current.primaryPath = new Set(pathsObj.paths[pathsObj.primaryPathIdx]);
    gameInstanceRef.current.secondaryPaths = new Set([
      ...pathsObj.paths.slice(0, pathsObj.primaryPathIdx),
      ...pathsObj.paths.slice(pathsObj.primaryPathIdx + 1)
    ].flat());
    gameInstanceRef.current.calcCurrWordScore(word);
  }

  const processNewInput = (str, coordinate) => {
    // ignore if word input length is greater than number of letters in game board
    // This stops GameBoardState from keeping track of word in needless scenarios
    if (str.length > COLUMNS * ROWS) return;
    // if user typed a non-letter, ignore
    if (!/^[A-Za-z]+$/.test(str.at(-1))) {
      str = str.slice(0, -1);
      /* 
        If needed to go back to change path only on spacebar press in input, uncomment below and eleminate useEffect
        useEffect and changePath function
       */
      // const newPrimaryPathIndex = (primaryPathIdx >= gameInstanceRef.current.currentPaths.length - 1) ? 0 : primaryPathIdx + 1;
      // setPrimaryPathIdx(newPrimaryPathIndex);
      // gameInstanceRef.current.primaryPath = new Set(gameInstanceRef.current.currentPaths[newPrimaryPathIndex]);
      // gameInstanceRef.current.secondaryPaths = new Set([
      //   ...gameInstanceRef.current.currentPaths.slice(0, newPrimaryPathIndex),
      //   ...gameInstanceRef.current.currentPaths.slice(newPrimaryPathIndex + 1)
      // ].flat());
    }
    // Otherwise, if user didn't type a space
    else {
      // show change in input
      setWordInput(str);
      // if primary path index was changed, record that change in GameBoardState
      if (gameInstanceRef.current.savedPaths.length 
        && gameInstanceRef.current.savedPaths.slice(-1)[0].paths.length
        && gameInstanceRef.current.savedPaths.slice(-1)[0].paths[primaryPathIdx].flag !== 0) {
        gameInstanceRef.current.setPrimaryPathIdx(primaryPathIdx);
      }
      // call findPaths in GameBoardState to create new paths
      const pathsObj = gameInstanceRef.current.findPaths(str.toUpperCase(), coordinate);
      // set currWordScore
      // const currWordScore = gameInstanceRef.current.calcCurrWordScore(str, primaryPath);
      // set paths and primary path index here in Play.js
      gameInstanceRef.current.currentPaths = pathsObj.paths;
      setPrimaryPathIdx(pathsObj.primaryPathIdx);
      gameInstanceRef.current.primaryPath = new Set(pathsObj.paths[pathsObj.primaryPathIdx]);
      gameInstanceRef.current.secondaryPaths = new Set([
        ...pathsObj.paths.slice(0, pathsObj.primaryPathIdx),
        ...pathsObj.paths.slice(pathsObj.primaryPathIdx + 1)
      ].flat());
      gameInstanceRef.current.calcCurrWordScore(str);
    }
  }
  
  // handle word submit
  const handleSubmit = (evt) => {
    evt.preventDefault();
    const submittedWord = wordInput.toLowerCase();
    // if paths exist then submitted word is on board so continue
    if (gameInstanceRef.current.currentPaths.length) {
      // if submitted word is less than 3 letters, display message and ignore submission
      if (submittedWord.length < 3) {
        setResult(`word must contain at least 3 letters`);
        setResultShowing(true);
        clearTimeout(resultTimeoutId.current);
        resultTimeoutId.current = setTimeout(() => {
          setResultShowing(false);
        }, 1000);
      }
      // if word is long enough and found in dictionary, display message and accept submission
      else if (wordDictionary.includes(submittedWord)) {
        setResult(`${submittedWord} found!`);
        setResultShowing(true);
        clearTimeout(resultTimeoutId.current);
        resultTimeoutId.current = setTimeout(() => {
          setResultShowing(false);
        }, 1000);
        setScore(gameInstanceRef.current.calcTotalScoreAndUpdateStats(submittedWord, gameInstanceRef.current.primaryPath));
        // get empty spaces array of arrays by submitting primary path
        const emptySpaces = gameInstanceRef.current.popBubbles([...gameInstanceRef.current.primaryPath]);
        setEmptySpaces(emptySpaces);
        // start animation, pop collapse shrinks empty spaces to zero
        setTimeout(() => {
          setPopCollapse(true);
        }, PAUSE_BEFORE_COLLAPSE);
        // end animation, clear empty spaces and set popCollapse to false to be ready for next pop
        setTimeout(() => {
          setEmptySpaces(EMPTY_SPACES_INITIAL_VALUE);
          setPopCollapse(false);
        }, TIME_BEFORE_SNAP_TO_NEW_STATE)
      }
      // if submitted word is not found in dictionary, display message and ignore submission
      else {
        setResult(`${submittedWord} not a word`);
        setResultShowing(true);
        clearTimeout(resultTimeoutId.current);
        resultTimeoutId.current = setTimeout(() => {
          setResultShowing(false);
        }, 1000);
      }
    }
    // if paths don't exist, then word not found on board, display message and ignore submission
    else {
      setResult(`${submittedWord} not on board`);
      setResultShowing(true);
      clearTimeout(resultTimeoutId.current);
      resultTimeoutId.current = setTimeout(() => {
        setResultShowing(false);
      }, 1000);
    }
    // reset everything to be ready for a new word and new paths
    setWordInput('');
    gameInstanceRef.current.currentPaths = [];
    setPrimaryPathIdx(0);
    gameInstanceRef.current.primaryPath = undefined;
    gameInstanceRef.current.secondaryPaths = undefined;
    gameInstanceRef.current.savedPaths = [];
    gameInstanceRef.current.currWordScore = 0;
    gameInstanceRef.current.currPathMultiplier = 1;
  }

  if (notStarted) {
    return (
      <div className="Play Play-before-start">
        <h3>Choose game type:</h3>
        <div>
          <Button
            onClick={() => handleStartGame(180)}
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, rgba(9,161,182,1) 0%, rgba(0,212,255,1) 50%, rgba(9,161,182,1) 100%)",
              borderRadius: "0.5rem",
            }}
          >3-minute Game</Button>
        </div>
        <div>
          <Button
            onClick={() => handleStartGame(null)}
            variant="contained"
            size="large"
            sx={{
              background: "linear-gradient(90deg, rgba(9,161,182,1) 0%, rgba(0,212,255,1) 50%, rgba(9,161,182,1) 100%)",
              borderRadius: "0.5rem"
            }}
          >Free Play</Button>
        </div>
      </div>
    )
  }

  if (countdown) {
    return (
      <div className="Play Play-before-start">
        <div>{countdown}</div>
      </div>
    )
  }

  if (gameInProgress) {
    return (
      <div className="Play">
        <div className="Play-game-info-wrapper">
          <div className="Play-game-info">
            {timer &&
              <div className="Play-timer">
                <div>Time:&nbsp;</div>
                <div className="Play-timer-digits">{timeDisplay}</div>
              </div>
            }
            <div>Score: {score}</div>
            <div>Current Word: {gameInstanceRef.current.currWordScore}</div>
          </div>
        </div>

        <div className="Play-top-buttons">
          <button className="Play-action-icon-button" onClick={removeLetter}>
            <FontAwesomeIcon icon={faDeleteLeft} size="xl" />
          </button>
          <button className="Play-action-icon-button" onClick={changePath}>
            <FontAwesomeIcon icon={faShuffle} size="xl" />
          </button>
        </div>
        <GameBoard
          gameInstance={gameInstanceRef.current}
          primaryPath={gameInstanceRef.current.primaryPath}
          secondaryPaths={gameInstanceRef.current.secondaryPaths}
          handleBubbleClick={handleBubbleClick}
          emptySpaces={emptySpaces}
          popCollapse={popCollapse}
        />
        {/* <div className='Play-extra-bubbles'>
          <div>
            {gameInstanceRef.current.currentBoard.map((column, columnIdx) => {
              return (
                <div key={columnIdx}>
                  {column.slice(ROWS, ROWS + VISIBLE_NEXT_ROWS).map((letter, rowIdx) => {
                    return (
                      <div 
                        className='Play-letter-bubble Play-next-letters'
                        key={`${columnIdx}${rowIdx}`}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div> */}
        <form className="Play-submit-form" onSubmit={handleSubmit}>
          <input className="Play-word-input" type='text' onChange={handleChange} value={wordInput} ref={wordInputElement} />
          <button className="Play-submit-button" type='submit'>Submit</button>
        </form>
        <div className={resultShowing ? undefined : 'Play-result-hidden'}>{result}</div>
        <Button onClick={handleGameEnd}>End Game</Button>
      </div>
    )
  }

  if (gameFinished) {
    return (
      <div className="Play">
        <p>Score: {score}</p>
        <GameBoard
          gameInstance={gameInstanceRef.current}
          primaryPath={gameInstanceRef.current.primaryPath}
          secondaryPaths={gameInstanceRef.current.secondaryPaths}
          emptySpaces={emptySpaces}
        />
        <Dialog
          open={dialogOpen}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleDialogClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle className="Play-popup-game-over-text">{"Game Over!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              <div className="Play-popup-highlight">
                <div>Final Score:</div>
                <div>{score}</div>
              </div>
              <div>Best Word Found: {gameInstanceRef.current.bestWord}</div>
              <div>Best Word Score: {gameInstanceRef.current.bestWordScore}</div>
              <div># of Words Found: {gameInstanceRef.current.numOfWords}</div>
              <div>Average Word Score: {gameInstanceRef.current.avgWordScore || Math.round(score * 100 / gameInstanceRef.current.numOfWords) / 100}</div>
              <div>Longest Word Found: {gameInstanceRef.current.longestWord}</div>
              {gameInstanceRef.current.curr10Wma && <div>Current 10 WMA: {gameInstanceRef.current.curr10Wma}</div>}
              {gameInstanceRef.current.curr100Wma && <div>Current 100 WMA: {gameInstanceRef.current.curr100Wma}</div>}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Close</Button>
            <Button component="button" href={"/play"}>Play Again</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default Play;