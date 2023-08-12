import Button from '@mui/material/Button';
import { Link as ReactRouterLink } from "react-router-dom";
import './Home.css';

const Home = () => {
  return (
    <div className="Home">
      <p>Play Babbling Bubbles now!</p>
      <Button
        variant="contained"
        component={ReactRouterLink}
        to="/play"
        sx={{
          background: "linear-gradient(90deg, rgba(9,161,182,1) 0%, rgba(0,212,255,1) 50%, rgba(9,161,182,1) 100%)",
          width: "6.4rem",
          height: "3.2rem",
          borderRadius: "0.5rem"
        }}
      >Play</Button>
    </div>
  )
}

export default Home;