/* 
  Improvements to be made:
    1. When clicking on letters, work out primary path index so that the clicked path is the primary path
    2. make change path button
    3. make backspace button
    4. make it so that when pressing spacebar anywhere, add space to input to trigger path change
*/

import { useState, useRef, useCallback, forwardRef } from 'react';
import GameBoard from './GameBoard';
import GameBoardState from '../../helpers/GameBoardState';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import calcScore from '../../helpers/calcScore';
import './Play.css';

const wordDictionary = require('an-array-of-english-words');
const COLUMNS = 5;
const ROWS = 4;
const VISIBLE_NEXT_ROWS = 2;
const EMPTY_SPACES_INITIAL_VALUE = [...Array(COLUMNS)].map(() => ([]));

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

function Play() {
  const [notStarted, setNotStarted] = useState(true);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(180);
  const [wordInput, setWordInput] = useState('');
  const [result, setResult] = useState('placeholder for div height');
  const [resultShowing, setResultShowing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [emptySpaces, setEmptySpaces] = useState(EMPTY_SPACES_INITIAL_VALUE);
  const [popCollapse, setPopCollapse] = useState(false);
  const [primaryPathIdx, setPrimaryPathIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timerIntervalId = useRef();
  const resultTimeoutId = useRef();
  const gameInstanceRef = useRef();

  const wordInputElement = useCallback((input) => {
    if (input) {
      input.focus();
    }
  }, []); 

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleStartGame = () => {
    setNotStarted(false);
    setTimeout(() => setCountdown(2), 1000);
    setTimeout(() => setCountdown(1), 2000);
    setTimeout(() => {
      setCountdown(0);
      setGameInProgress(true);
      timerIntervalId.current = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    }, 3000);
    gameInstanceRef.current = new GameBoardState(COLUMNS, ROWS, VISIBLE_NEXT_ROWS);
  }

  const handleGameEnd = () => {
    setGameFinished(true);
    setGameInProgress(false);
    clearInterval(timerIntervalId.current);
    setTimer(null);
    setDialogOpen(true);
  }

  let timeDisplay;
  const primaryPath = new Set(paths[primaryPathIdx]);
  const secondaryPaths = new Set([
    ...paths.slice(0, primaryPathIdx),
    ...paths.slice(primaryPathIdx + 1)
  ].flat());

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
    processNewInput(wordInput + evt.target.textContent.toLowerCase());
  }

  const processNewInput = (str) => {
    // ignore if word input length is greater than number of letters in game board
    // This stops GameBoardState from keeping track of word in needless scenarios
    if (str.length > COLUMNS * ROWS) return;
    // if user typed a space change the primary path index and do not add space to input
    if (str[str.length - 1] === ' ') {
      str = str.slice(0, -1);
      setPrimaryPathIdx((primaryPathIdx) => (
        (primaryPathIdx >= paths.length - 1) ? 0 : primaryPathIdx + 1
      ));
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
      const pathsObj = gameInstanceRef.current.findPaths(str.toUpperCase());
      // set paths and primary path index here in Play.js
      setPaths(pathsObj.paths);
      setPrimaryPathIdx(pathsObj.primaryPathIdx);
    }
  }
  
  // handle word submit
  const handleSubmit = (evt) => {
    evt.preventDefault();
    const submittedWord = wordInput.toLowerCase();
    // if paths exist then submitted word is on board so continue
    if (paths.length) {
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
        // get empty spaces array of arrays by submitting primary path
        const emptySpaces = gameInstanceRef.current.popBubbles([...primaryPath]);
        setEmptySpaces(emptySpaces);
        // start animation, pop collapse shrinks empty spaces to zero
        setTimeout(() => {
          setPopCollapse(true);
        }, 200);
        // end animation, clear empty spaces and set popCollapse to false to be ready for next pop
        setTimeout(() => {
          setEmptySpaces(EMPTY_SPACES_INITIAL_VALUE);
          setPopCollapse(false);
        }, 1000);
        setScore(calcScore(submittedWord, score));
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
    setPaths([]);
    setPrimaryPathIdx(0);
    gameInstanceRef.current.savedPaths = [];
  }

  if (notStarted) {
    return (
      <div className="Play Play-before-start">
        <Button
          onClick={handleStartGame}
          variant="contained"
          size="large"
          sx={{
            background: "linear-gradient(90deg, rgba(9,161,182,1) 0%, rgba(0,212,255,1) 50%, rgba(9,161,182,1) 100%)",
            borderRadius: "0.5rem"
          }}
        >Start Game</Button>
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
        <p>Score: {score}</p>
        <p>Timer: {timeDisplay}</p>
        <GameBoard
          gameInstance={gameInstanceRef.current}
          primaryPath={primaryPath}
          secondaryPaths={secondaryPaths}
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
        <form onSubmit={handleSubmit}>
          <input type='text' onChange={handleChange} value={wordInput} ref={wordInputElement} />
          <button type='submit'>check</button>
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
        <p>Timer: {timeDisplay}</p>
        <GameBoard
          gameInstance={gameInstanceRef.current}
          primaryPath={primaryPath}
          secondaryPaths={secondaryPaths}
          emptySpaces={emptySpaces}
        />
        <Dialog
          open={dialogOpen}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleDialogClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{"Game Over!"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Final Score: {score}
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