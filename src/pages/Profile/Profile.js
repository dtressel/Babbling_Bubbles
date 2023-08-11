import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import ApiLink from '../../helpers/ApiLink';
import Button from '@mui/material/Button';
import LeaderboardTable from '../Leaderboards/LeaderboardTable';
import './Profile.css';

const leaderboardOrder = [
  "bestPlayScoresSingle",
  "bestWordScores",
  "bestAvgWordScore"
];

const Profile = () => {
  const { currentUser } = useContext(UserContext);
  const { username } = useParams();
  const [userData, setUserData] = useState();
  const [moreStats, setMoreStats] = useState();

  useEffect(() => {
    const getData = async () => {
      let data = await Promise.all([
        ApiLink.getUser(currentUser.userId),
        ApiLink.getMoreStats(currentUser.userId)
      ]);
      setUserData(data[0]);
      setMoreStats(data[1]);
    }
    getData();
  }, [currentUser.userId]);
  console.log(userData);
  console.log(moreStats);

  return (
    <>
      <div className="Profile-card-wrapper">
        <div className="Profile-card rounded-paper">
          <h2>{username}</h2>
          {userData &&
            <>
              {currentUser.userId === userData.userId && <Button variant="outlined">Update Info</Button>}
              {userData.country && <div>{userData.country}</div>}
              <div>Babbler since {userData.dateRegistered}</div>
              {userData.bio && 
                <div className="Profile-about-me Profile-section">
                  <div className="Profile-section-header"><b>About me:</b></div>
                  <div>{userData.bio}</div>
                </div>
              }
              <div className="Profile-stats Profile-section">
                <div className="Profile-section-header"><b>Stats:</b></div>
                <div className="Profile-stat-display">
                  <div>High Score</div>
                  <div>{moreStats.bestPlayScoresSingle[0].score}</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Current 10-Day WMA</div>
                  <div>{userData.curr10Wma}</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Current 100-Day WMA</div>
                  <div>{userData.curr100Wma}</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Best Average Word Score</div>
                  <div>{moreStats.bestAvgWordScore[0].avgWordScore}</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Best Word Found</div>
                  <div>"{moreStats.bestWordScores[0].bestWord}"</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Best Word Score</div>
                  <div>{moreStats.bestWordScores[0].bestWordScore}</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Longest Word</div>
                  <div>"{userData.longestWord}"</div>
                </div>
                <div className="Profile-stat-display">
                  <div>Craziest Word</div>
                  <div>"{userData.craziestWord}"</div>
                </div>
              </div>
            </>
          }
        </div>
      </div>
      {moreStats && 
        <div className="Profile-card-wrapper">
          <div className="Profile-card rounded-paper">
            <div className="Profile-personal-leaderboards">
              <h3 className="Profile-personal-leaderboards-header">Personal Leaderboards:</h3>
              {leaderboardOrder.reduce((accum, leaderboardTitle) => {
                if (moreStats[leaderboardTitle].length) {
                  accum.push(
                    <LeaderboardTable
                      title={leaderboardTitle}
                      columnHeaders={Object.keys(moreStats[leaderboardTitle][0])}
                      rows={moreStats[leaderboardTitle].map(row => Object.values(row))}
                      key={leaderboardTitle}
                    />
                  );
                }
                return accum;
              }, [])}
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default Profile;