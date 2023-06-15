import { useState } from 'react';
import './App.css';

const wordDictionary = require('an-array-of-english-words');


function App() {
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

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input type='text' onChange={handleChange} value={wordInput} />
        <button type='submit'>check</button>
      </form>
      <div>{result}</div>
    </div>
  );
}

export default App;
