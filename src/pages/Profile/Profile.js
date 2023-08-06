import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useContext(UserContext);
  const { username } = useParams(); 

  return (
    <div className="Profile-card-wrapper">
      <div className="Profile-card rounded-paper">
        <h3>{username}</h3>
      </div>
    </div>

  )
}

export default Profile;