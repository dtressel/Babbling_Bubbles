import BubblesBackground from '../../sharedComponents/BubblesBackground';
import Button from '@mui/material/Button';
import { Link as ReactRouterLink } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div className="Home">
      <BubblesBackground />
      <h3>Play Babblin' Bubbles now!</h3>
      <Button
        className="Home-play-button"
        variant="contained"
        component={ReactRouterLink}
        to="/play"
      >Play</Button>
    </div>
  )
}

export default Home;