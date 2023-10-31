import { useEffect, useState } from 'react';
import ApiLink from "../../helpers/ApiLink";
import LeaderboardTable from './LeaderboardTable';

const leaderboardOrder = [
  "ttlScore",
  "avgScore",
  "curr20Wma",
  "curr100Wma",
  "peak20Wma",
  "peak100Wma",
  "bstWord",
  "lngWord",
  "crzWord"
];

const Leaderboards = () => {
  const [leaderboards, setLeaderboards] = useState();
  useEffect(() => {
    const getLeaderboardData = async () => {
      const res = await ApiLink.getLeaderboards();
      setLeaderboards(res);
    }
    getLeaderboardData();
  }, []);

  return (
    <>
      <h1>Top Babblers:</h1>
      {leaderboards && leaderboardOrder.reduce((accum, leaderboardTitle) => {
        if (leaderboards[leaderboardTitle]?.solo3.length || leaderboards[leaderboardTitle]?.solo10.length || leaderboards[leaderboardTitle]?.free.length) {
          accum.push(
            <LeaderboardTable
              title={leaderboardTitle}
              data={leaderboards[leaderboardTitle]}
              key={leaderboardTitle}
            />
          );
        }
        return accum;
      }, [])}
    </>
  )
}

export default Leaderboards;