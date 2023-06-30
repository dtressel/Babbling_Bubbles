import { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import './Play.css';

const wordDictionary = require('an-array-of-english-words');


function Play() {
  const [notStarted, setNotStarted] = useState(true);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(180);
  const [wordInput, setWordInput] = useState('');
  const [result, setResult] = useState('');

  const intervalId = useRef();
  let timeDisplay;

  if (timer === 0) {
    setGameFinished(true);
    setGameInProgress(false);
    clearInterval(intervalId.current);
    setTimer(null);
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
      intervalId.current = setInterval(() => {
        setTimer((timer) => timer - 1);
        console.log('tick');
      }, 1000);
    }, 3000);
  }

  const handleChange = (evt) => {
    setWordInput(evt.target.value);
  }
  
  const handleSubmit = (evt) => {
    evt.preventDefault();
    setResult(wordDictionary.includes(wordInput) ? "Yes" : "Nope");
    setWordInput('');
  }

  if (notStarted) {
    return (
      <div className="Play">
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
      <div className="Play">
        <p>{countdown}</p>
      </div>
    )
  }

  if (gameInProgress) {
    return (
      <div className="Play">
        <p>Game in progress</p>
        <p>Timer: {timeDisplay}</p>
        <form onSubmit={handleSubmit}>
          <input type='text' onChange={handleChange} value={wordInput} />
          <button type='submit'>check</button>
        </form>
        <div>{result}</div>
      </div>
    )
  }

  if (gameFinished) {
    return (
      <p>Game finished</p>
    )
  }
}

export default Play;
