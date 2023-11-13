import { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Link as ReactRouterLink } from "react-router-dom";
import UserContext from '../../contexts/UserContext';
import ApiLink from '../../helpers/ApiLink';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LeaderboardTable from '../Leaderboards/LeaderboardTable';
import './Profile.css';

const leaderboardOrder = [
  "ttlScore",
  "avgScore",
  "bstWord",
  "lngWord",
  "crzWord"
];

const gameTypeKey = {
  solo3: '3-minute',
  solo10: '10-minute',
  free: 'free'
}

const Profile = () => {
  const { currentUser, setAdditionalInfo } = useContext(UserContext);
  const { username } = useParams();
  const [profileData, setProfileData] = useState();
  const [gameType, setGameType] = useState();
  const gameTypeChoices = useRef();

  useEffect(() => {
    const getData = async () => {
      let profileData;
      if (username === currentUser.username) {
        profileData = await ApiLink.getProfileData(currentUser.userId);
      } else {
        profileData = await ApiLink.getProfileDataByUsername(username);
      }
      setProfileData(profileData);
      if (username === currentUser.username && (!currentUser.bio || !currentUser.email)) {
        setAdditionalInfo({ bio: profileData.info.bio, email: profileData.info.email });
      }
      const gameTypes = ['solo3', 'solo10', 'free'];
      const numOfPlaysByType = gameTypes.map((gameType)=> {
        return profileData.stats[gameType]?.numOfPlays ?? 0;
      });
      gameTypeChoices.current = gameTypes.filter((purposelyUnused, idx) => {
        return numOfPlaysByType[idx] > 0;
      });
      const maxNumOfPLays = Math.max(...numOfPlaysByType);
      const gameTypeIdx = numOfPlaysByType.findIndex(num => num === maxNumOfPLays);
      setGameType(gameTypes[gameTypeIdx]);
    }

    getData();
  }, [currentUser.userId, currentUser.bio, currentUser.email, setAdditionalInfo, username, currentUser.username]);

  const handleChange = (event) => {
    setGameType(event.target.value);
  };

  return (
    <>
      <div className="Profile-card-wrapper">
        <div className="Profile-card rounded-paper">
          <h2>{username}</h2>
          {profileData &&
            <>
              {+currentUser.userId === +profileData.info.userId && <Button component={ReactRouterLink} variant="outlined" to="/update-user">Update Info</Button>}
              {profileData.info.country && <div>{profileData.info.country}</div>}
              <div>Babbler since {profileData.info.dateRegistered}</div>
              <div>Last active: {profileData.info.lastActive}</div>
              <div>{profileData.info.wordsFound} words found</div>
              {profileData.info.bio && 
                <div className="Profile-about-me Profile-section">
                  <div className="Profile-section-header"><b>About me:</b></div>
                  <div>{profileData.info.bio}</div>
                </div>
              }
              <div className="Profile-stats Profile-section">
                {profileData.stats[gameType] && 
                  <>
                    <div>Stats:</div>
                    <div>
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <Select
                          value={gameType}
                          onChange={handleChange}
                        >
                          {gameTypeChoices.current.map((gameType) => {
                            return <MenuItem value={gameType} key={gameType}>{gameTypeKey[gameType]}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                    </div>
                  </>
                }
                {profileData.leaderboards.ttlScore[gameType][0] && 
                  <div className="Profile-stat-display">
                    <div>High Score</div>
                    <div>{profileData.leaderboards.ttlScore[gameType][0].score}</div>
                  </div>
                }
                {profileData.stats[gameType]?.curr20Wma &&
                  <>
                    <div className="Profile-stat-display">
                      <div>Current 20-Day WMA</div>
                      <div>{profileData.stats[gameType].curr20Wma}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Peak 20-Day WMA</div>
                      <div>{profileData.stats[gameType].peak20Wma}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Date Acheived</div>
                      <div>{profileData.stats[gameType].peak20WmaDate}</div>
                    </div>
                  </>
                }
                {profileData.stats[gameType]?.curr100Wma &&
                  <>
                    <div className="Profile-stat-display">
                      <div>Current 100-Day WMA</div>
                      <div>{profileData.stats[gameType].curr100Wma}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Peak 100-Day WMA</div>
                      <div>{profileData.stats[gameType].peak100Wma}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Date Acheived</div>
                      <div>{profileData.stats[gameType].peak100WmaDate}</div>
                    </div>
                  </>
                }
                {profileData.stats[gameType] &&
                  <>
                    {/* Even with games played, there may not be an average word score because of 15-word threshold */}
                    {profileData.leaderboards.avgScore[gameType][0] && 
                      <div className="Profile-stat-display">
                        <div>Best Average Word Score</div>
                        <div>{profileData.leaderboards.avgScore[gameType][0].score}</div>
                      </div>
                    }
                    <div className="Profile-stat-display">
                      <div>Best Word Found</div>
                      <div>"{profileData.leaderboards.bstWord[gameType][0].word}"</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Best Word Score</div>
                      <div>{profileData.leaderboards.bstWord[gameType][0].score}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Longest Word</div>
                      <div>"{profileData.leaderboards.lngWord[gameType][0].word}"</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Craziest Word</div>
                      <div>"{profileData.leaderboards.crzWord[gameType][0].word}"</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div># of Games Played</div>
                      <div>{profileData.stats[gameType].numOfPlays}</div>
                    </div>
                    <div className="Profile-stat-display">
                      <div>Last Played On</div>
                      <div>{profileData.stats[gameType].lastPlay}</div>
                    </div>
                  </>
                }
              </div>
            </>
          }
        </div>
      </div>
      {(profileData?.leaderboards.ttlScore.solo3[0] || profileData?.leaderboards.ttlScore.solo10[0] || profileData?.leaderboards.ttlScore.free[0]) &&
        <div className="Profile-card-wrapper">
          <div className="Profile-card rounded-paper">
            <div className="Profile-personal-leaderboards">
              <h3 className="Profile-personal-leaderboards-header">Personal Leaderboards:</h3>
              {profileData.leaderboards && leaderboardOrder.reduce((accum, leaderboardTitle) => {
                if (profileData.leaderboards[leaderboardTitle]?.solo3[0] || profileData.leaderboards[leaderboardTitle]?.solo10[0] || profileData.leaderboards[leaderboardTitle]?.free[0]) {
                  accum.push(
                    <LeaderboardTable
                      title={leaderboardTitle}
                      data={profileData.leaderboards[leaderboardTitle]}
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