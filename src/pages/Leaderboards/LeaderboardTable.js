import { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './Leaderboards.css';

const tableAndColumnTitleKey = {
  avgScore: "Single Game Average Word Score",
  curr100Wma: "Current 100 WMA",
  curr20Wma: "Current 20 WMA",
  peak100Wma: "Peak 100 WMA",
  peak20Wma: "Peak 20 WMA",
  ttlScore: "Single Game High Score",
  lngWord: "Longest Word",
  bstWord: "Highest Word Score",
  crzWord: "Craziest Word",
  score: "Score",
  bestWordScore: "Score",
  date: "Date",
  word: "Word",
  username: "User"
}

/* columnHeaders is an array, data is an array (for each row) of arrays (2nd level array contains data for each cell) */
const LeaderboardTable = ({ title, data }) => {
  const [gameType, setGameType] = useState(() => {
    if (data.solo3?.length) return 'solo3';
    if (data.solo10?.length) return 'solo10';
    else return 'free';
  });

  const handleChange = (event) => {
    setGameType(event.target.value);
  };
  // get columnHeaders from data object, without boardState
  const columnHeaders = Object.keys(data[gameType][0]).filter((header) => {
    return header !== 'boardState';
  });
  // get row data in an array format from data object, without boardState
  const rows = data[gameType].map(row => {
    const { boardState, ...rowNoBoardState } = row;
    return Object.values(rowNoBoardState);
  });

  return (
    <div>
      <h3>{tableAndColumnTitleKey[title]}</h3>
      <div>
        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <Select
            value={gameType}
            onChange={handleChange}
          >
            {data.solo3?.length && <MenuItem value='solo3'>3-minute</MenuItem>}
            {data.solo10?.length && <MenuItem value='solo10'>10-minute</MenuItem>}
            {data.free?.length && <MenuItem value='free'>Free play</MenuItem>}
          </Select>
        </FormControl>
      </div>
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
            {rows.map((row, idx) => (
              <TableRow
                key={`row-${row[0]}-${idx}`}
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