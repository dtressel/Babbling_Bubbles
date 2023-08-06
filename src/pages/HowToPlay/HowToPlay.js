const HowToPlay = () => {
  return (
    <>
      <h2>How To Play</h2>
      <p>The gameplay of Babbling Bubbles is very similar to the well-known game, Boggle. The goal is to find connecting letters in the grid to make words. Each letter in the word you create must be found in the grid and must connect to its following letter in any direction (vertically, horizontally, or diagonally). You may not use a letter in the grid twice for a single word. Only words that are 3 letters and longer count! Enter the word that you find in the text input and press enter to submit.</p>
      <p>Unlike Boggle, when you choose and enter a word, the letters you used pop and disappear! This creates an element of strategy not found in Boggle. New letters bubble up to fill the remaining holes. Often words that you find can be found on the grid in several ways. Each way that a word can be created is called a path. When you enter a word, the letters that will pop are highlighted in green. This is your primary path. Alternate letters that can be used to create the same word are highlighted in grey. To switch primary paths that use some of the grey letters, switch between the various paths by pressing space bar or clicking the "change path" button.</p>
      <p>When you find and enter a word from the grid, you get points, and the goal, of course, is to get the higest score possible! In the standard game, you have 3 minutes to find words!</p>
      <h3>Scoring</h3>
      <p>Each letter has a point value. To calculate the points won for each word found, Babbling Bubbles first adds the point value for each letter. Then, word length bonusses get added. The longer the word, the bigger the bonus! Finally, if you use a special multiplier bubble, the total score will be multiplied by the multiplier. Bubbles bordered with a thin orange border are 2x multipliers. Bubbles bordered with a thick gold border are 3x multipliers. If you use several multipliers for a single word, the multipliers compound! For example, if you use one 2x multiplier and two 3x multipliers in a single word, the word score will be multiplied by 18!!</p>
    </>
  )
}

export default HowToPlay;