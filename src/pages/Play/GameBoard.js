const GameBoard = ({ gameInstance, primaryPath, secondaryPaths, handleBubbleClick, emptySpaces, popCollapse }) => {
  return(
    <div className="Play-game-board">
      {/* for each column on game board */}
      {gameInstance.currentBoard.map((column, columnIdx) => {
        return (
          <div key={`column-${columnIdx}`}>
            {/* for each bubble in column */}
            {column.slice(0, gameInstance.rows).map((letter, rowIdx) => {
              return (
                <div key={`${columnIdx}${rowIdx}`}>
                  {/* Empty space(s) if they exist before this bubble */}
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
                  {/* Bubble */}
                  <div 
                    className=
                      {`
                        Play-letter-bubble 
                        ${letter.length === 3 ? 'Play-triple-bubble' : ''}
                        ${letter.length === 2 ? 'Play-double-bubble' : ''} 
                        ${primaryPath && primaryPath.has(`${columnIdx}${rowIdx}`) ? 'Play-primary-location' :
                          (secondaryPaths && secondaryPaths.has(`${columnIdx}${rowIdx}`) ? 'Play-secondary-location' : '')}
                      `}
                    onClick={handleBubbleClick}
                  >
                    {letter[0]}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default GameBoard