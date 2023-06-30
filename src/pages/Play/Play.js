import { useState } from 'react';
import Button from '@mui/material/Button';
import './Play.css';

const wordDictionary = require('an-array-of-english-words');


function Play() {
  const [notStarted, setNotStarted] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [result, setResult] = useState('');

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
        <p>countdown going</p>
      </div>
    )
  }

  if (gameInProgress) {
    return (
      <div className="Play">
        <p>Game in progress</p>
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
