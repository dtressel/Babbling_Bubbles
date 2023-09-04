import { useEffect, useState } from 'react';
import ApiLink from "../../helpers/ApiLink";
import LeaderboardTable from './LeaderboardTable';

const leaderboardOrder = [
  "bestPlayScoresSingle",
  "bestWordScores",
  "bestAvgWordScoreMin15",
  "bestCurrent100Wma",
  "bestCurrent10Wma",
  "bestPeak100Wma",
  "bestPeak10Wma"
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
        if (leaderboards[leaderboardTitle].length) {
          accum.push(
            <LeaderboardTable
              title={leaderboardTitle}
              columnHeaders={Object.keys(leaderboards[leaderboardTitle][0])}
              rows={leaderboards[leaderboardTitle].map(row => Object.values(row))}
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