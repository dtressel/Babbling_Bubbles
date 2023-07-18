const letterValues = { a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1,
                       j: 8, k: 5, l: 1, m: 3,n: 1, o: 1, p: 3, q: 10, r: 1,
                       s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10 };

const numOfLettersBonus = { 3: 0, 4: 1, 5: 2, 6: 3, 7: 5, 8: 7, 9: 10, 10: 13, 
                            11: 16, 12: 20, 13: 24, 14: 29, 15: 34, 16: 39,
                            17: 45, 18: 50, 19: 55, 20: 60 };

function calcScore(word, currScore) {
  for (const char of word) {
    currScore += letterValues[char];
  }
  currScore += numOfLettersBonus[word.length];
  return currScore;
}

export default calcScore;