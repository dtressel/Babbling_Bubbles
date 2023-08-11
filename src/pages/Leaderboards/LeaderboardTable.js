import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import './Leaderboards.css';

const tableAndColumnTitleKey = {
  bestAvgWordScoreMin15: "Single Game Highest Average Word Score",
  bestAvgWordScore: "Single Game Highest Average Word Score",
  bestCurrent100Wma: "Highest Current 100 WMA",
  bestCurrent10Wma: "Highest Current 10 WMA",
  bestPeak100Wma: "Highest Peak 100 WMA",
  bestPeak10Wma: "Highest Peak 10 WMA",
  bestPlayScoresSingle: "Single Game High Score",
  bestWordScores: "Single Word Highest Score",
  username: "Username",
  avgWordScore: "Avg",
  curr100Wma: "Current 100 WMA",
  curr10Wma: "Current 10 WMA",
  peak100Wma: "Peak 100 WMA",
  peak10Wma: "Peak 10 WMA",
  score: "Score",
  bestWord: "Word",
  bestWordScore: "Score",
  date: "Date"
}

/* columnHeaders is an array, data is an array (for each row) of arrays (2nd level array contains data for each cell) */
const LeaderboardTable = ({ title, columnHeaders, rows }) => {

  return (
    <div>
      <h3>{tableAndColumnTitleKey[title]}</h3>
      <TableContainer component={Paper} className="Leaderboards-table-container">
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {columnHeaders.map((header, idx) => (
                <TableCell align={idx ? (idx === columnHeaders.length - 1 ? "left" : "left") : "left"} key={`${header}-header`}>
                  {tableAndColumnTitleKey[header]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={`row-${row[0]}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                {row.map((cellValue, idx) => (
                  <TableCell align={idx ? (idx === row.length - 1 ? "left" : "left") : "left"} key={`${columnHeaders[idx]}-${row[0]}`}>
                    {cellValue}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default LeaderboardTable;