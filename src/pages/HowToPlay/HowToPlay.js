import changePathsDemo from "../../images/change-path-demo.gif";
import './HowToPlay.css';

const HowToPlay = () => {
  return (
    <>
      <h2>How To Play</h2> 
      <div>
        <img className="HowToPlay-change-paths-demo" src={changePathsDemo} alt="Change paths demo" />
        <p>The gameplay of Babbling Bubbles is very similar to the well-known game, Boggle. The goal is to find connecting letters in the grid to make words. Each letter in the word you create must be found in the grid and must connect to its following letter in any direction (vertically, horizontally, or diagonally). You may not use a letter in the grid twice for a single word. Only words that are 3 letters and longer count! Enter the word that you find in the text input and press enter to submit.</p>
        <p>Unlike Boggle, when you choose and enter a word, the letters you used pop and disappear! This creates an element of strategy not found in Boggle. New letters bubble up to fill the remaining holes.</p>
        <p>Often words that you find can be found on the grid in several ways. Each way that a word can be created is called a path. When you enter a word, the letters that will pop are highlighted in green. This is your primary path. Alternate letters that can be used to create the same word are highlighted in grey. To switch primary paths that use some of the grey letters, switch between the various paths by pressing space bar or clicking the "change path" button.</p>
        <p>When you find and enter a word from the grid, you get points, and the goal, of course, is to get the higest score possible! In the standard game, you have 3 minutes to find words!</p>      
      </div>
      <h3>Scoring</h3>
      <p>Each letter has a point value. To calculate the points won for each word found, Babbling Bubbles first adds the point value for each letter. Then, word length bonusses get added. The longer the word, the bigger the bonus! Finally, if you use a special multiplier bubble, the total score will be multiplied by the multiplier. Bubbles bordered with a white border are 2x multipliers. Bubbles bordered with a gold border are 3x multipliers. If you use several multipliers for a single word, the multipliers compound! For example, if you use one 2x multiplier and two 3x multipliers in a single word, the word score will be multiplied by 18!!</p>
      <div className="HowToPlay-tables-container">
        <table>
          <tr>
            <th>Point Values</th>
            <th>Letters</th>
          </tr>
          <tr>
            <td>1</td>
            <td>a, e, i, l, n, o, r, s, t, u</td>
          </tr>        
          <tr>
            <td>2</td>
            <td>d, g</td>
          </tr>
          <tr>
            <td>3</td>
            <td>b, c, m, p</td>
          </tr>
          <tr>
            <td>4</td>
            <td>f, h, v, w, y</td>
          </tr>
          <tr>
            <td>5</td>
            <td>k</td>
          </tr>
          <tr>
            <td>8</td>
            <td>j, x</td>
          </tr>
          <tr>
            <td>10</td>
            <td>q, z</td>
          </tr>
        </table>
        <table>
          <tr>
            <th>Word Length</th>
            <th>Bonus</th>
          </tr>
          <tr>
            <td>3</td>
            <td>0</td>
          </tr>        
          <tr>
            <td>4</td>
            <td>1</td>
          </tr>
          <tr>
            <td>5</td>
            <td>2</td>
          </tr>
          <tr>
            <td>6</td>
            <td>3</td>
          </tr>
          <tr>
            <td>7</td>
            <td>5</td>
          </tr>
          <tr>
            <td>8</td>
            <td>7</td>
          </tr>
          <tr>
            <td>9</td>
            <td>10</td>
          </tr>
          <tr>
            <td>10</td>
            <td>13</td>
          </tr>
          <tr>
            <td>11</td>
            <td>16</td>
          </tr>
          <tr>
            <td>12</td>
            <td>20</td>
          </tr>
          <tr>
            <td>13</td>
            <td>24</td>
          </tr>
          <tr>
            <td>14</td>
            <td>29</td>
          </tr>
          <tr>
            <td>15</td>
            <td>34</td>
          </tr>
          <tr>
            <td>16</td>
            <td>39</td>
          </tr>
          <tr>
            <td>17</td>
            <td>45</td>
          </tr>
          <tr>
            <td>18</td>
            <td>50</td>
          </tr>
          <tr>
            <td>19</td>
            <td>55</td>
          </tr>
          <tr>
            <td>20</td>
            <td>60</td>
          </tr>
        </table>
      </div>
    </>
  )
}

export default HowToPlay;