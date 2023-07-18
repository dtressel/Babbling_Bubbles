import { useState, useRef, useCallback, forwardRef } from 'react';
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
  const [result, setResult] = useState('');
  const [resultShowing, setResultShowing] = useState(false);
  const [paths, setPaths] = useState([]);
  const [emptySpaces, setEmptySpaces] = useState(EMPTY_SPACES_INITIAL_VALUE);
  const [popCollapse, setPopCollapse] = useState(false);
  const [primaryPathIdx, setPrimaryPathIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const timerIntervalId = useRef();
  const resultTimeoutId = useRef();
  const gameInstance = useRef();

  const wordInputElement = useCallback((input) => {
    if (input) {
      input.focus();
    }
  }, []); 

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  let timeDisplay;
  const primaryPath = new Set(paths[primaryPathIdx]);
  const secondaryPaths = new Set([
    ...paths.slice(0, primaryPathIdx),
    ...paths.slice(primaryPathIdx + 1)
  ].flat());

  if (timer === 0) {
    setGameFinished(true);
    setGameInProgress(false);
    clearInterval(timerIntervalId.current);
    setTimer(null);
    setDialogOpen(true);
  }

  if (gameInProgress) {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    timeDisplay = `${minutes}:${seconds >= 10 ? seconds : '0' + seconds}`;
  }

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
    gameInstance.current = new GameBoardState(COLUMNS, ROWS, VISIBLE_NEXT_ROWS);
  }

  const handleChange = (evt) => {
    let str = evt.target.value;
    if (str.length > COLUMNS * ROWS) return;
    if (str[str.length - 1] === ' ') {
      str = str.slice(0, -1);
      setPrimaryPathIdx((primaryPathIdx) => (
        (primaryPathIdx >= paths.length - 1) ? 0 : primaryPathIdx + 1
      ));
    }
    else {
      setWordInput(str);
      if (gameInstance.current.savedPaths.length 
        && gameInstance.current.savedPaths.slice(-1)[0].paths.length
        && gameInstance.current.savedPaths.slice(-1)[0].paths[primaryPathIdx].flag !== 0) {
        gameInstance.current.setPrimaryPathIdx(primaryPathIdx);
      }
      const pathsObj = gameInstance.current.findPaths(str.toUpperCase());
      setPaths(pathsObj.paths);
      setPrimaryPathIdx(pathsObj.primaryPathIdx);
    }
  }
  
  const handleSubmit = (evt) => {
    evt.preventDefault();
    const submittedWord = wordInput.toLowerCase();
    if (paths.length) {
      if (wordDictionary.includes(submittedWord)) {
        setResult(`${submittedWord} found!`);
        setResultShowing(true);
        clearTimeout(resultTimeoutId.current);
        resultTimeoutId.current = setTimeout(() => {
          setResultShowing(false);
        }, 1000);
        const emptySpaces = gameInstance.current.popBubbles([...primaryPath]);
        setEmptySpaces(emptySpaces);
        setTimeout(() => {
          setPopCollapse(true);
        }, 200);
        setTimeout(() => {
          setEmptySpaces(EMPTY_SPACES_INITIAL_VALUE);
          setPopCollapse(false);
        }, 1000);
        setScore(calcScore(submittedWord, score));
      }
      else {
        setResult(`${submittedWord} not a word`);
        setResultShowing(true);
        clearTimeout(resultTimeoutId.current);
        resultTimeoutId.current = setTimeout(() => {
          setResultShowing(false);
        }, 1000);
      }
    }
    else {
      setResult(`${submittedWord} not on board`);
      setResultShowing(true);
      clearTimeout(resultTimeoutId.current);
      resultTimeoutId.current = setTimeout(() => {
        setResultShowing(false);
      }, 1000);
    }
    setWordInput('');
    setPaths([]);
    setPrimaryPathIdx(0);
    gameInstance.current.savedPaths = [];
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
        <div className="Play-game-board">
          {gameInstance.current.currentBoard.map((column, columnIdx) => {
            return (
              <div key={columnIdx}>
                {column.slice(0, ROWS).map((letter, rowIdx) => {
                  return (
                    <>
                      {emptySpaces[columnIdx][rowIdx] && 
                        [...Array(emptySpaces[columnIdx][rowIdx])].map((ignore, idx) => {
                          return (
                            <div 
                              className={`
                                Play-empty-bubble-space 
                                ${popCollapse ? 'Play-collapse' : undefined}
                              `} 
                              key={`empty-${columnIdx}${rowIdx}${idx}`}
                            ></div>
                          )
                        })
                      }
                      <div 
                        className=
                          {`
                            Play-letter-bubble 
                            ${primaryPath.has(`${columnIdx}${rowIdx}`) ? 'Play-primary-location' : (
                              secondaryPaths.has(`${columnIdx}${rowIdx}`) ? 'Play-secondary-location' : '')}
                          `}
                        key={`${columnIdx}${rowIdx}`}
                      >
                        {letter}
                      </div>
                    </>
                  )
                })}
              </div>
            )
          })}
        </div>
        {/* <div className='Play-extra-bubbles'>
          <div>
            {gameInstance.current.currentBoard.map((column, columnIdx) => {
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
      </div>
    )
  }

  if (gameFinished) {
    return (
      <div className="Play">
        <p>Score: {score}</p>
        <p>Timer: {timeDisplay}</p>
        <div className="Play-game-board">
          {gameInstance.current.currentBoard.map((column, columnIdx) => {
            return (
              <div key={columnIdx}>
                {column.slice(0, ROWS).map((letter, rowIdx) => {
                  return (
                    <>
                      {emptySpaces[columnIdx][rowIdx] && 
                        [...Array(emptySpaces[columnIdx][rowIdx])].map((ignore, idx) => {
                          return (
                            <div 
                              className={`
                                Play-empty-bubble-space 
                                ${popCollapse ? 'Play-collapse' : undefined}
                              `} 
                              key={`empty-${columnIdx}${rowIdx}${idx}`}
                            ></div>
                          )
                        })
                      }
                      <div 
                        className=
                          {`
                            Play-letter-bubble 
                            ${primaryPath.has(`${columnIdx}${rowIdx}`) ? 'Play-primary-location' : (
                              secondaryPaths.has(`${columnIdx}${rowIdx}`) ? 'Play-secondary-location' : '')}
                          `}
                        key={`${columnIdx}${rowIdx}`}
                      >
                        {letter}
                      </div>
                    </>
                  )
                })}
              </div>
            )
          })}
        </div>
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