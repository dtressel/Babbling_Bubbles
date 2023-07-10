import { NavLink } from "react-router-dom";
import { IconButton } from "@mui/material";
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import './Footer.css';

const Footer = () => {
  return (
    <div className="Footer">
      <div className="Footer-links">
        <NavLink to="/play">Play</NavLink>
        <NavLink to="/leaderboards">Leaderboards</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/how-to-play">How To Play</NavLink>
        <NavLink to="/strategies">Strategies</NavLink>
      </div>
      <div className="Footer-social-links">
        <IconButton href="https://twitter.com/TressCello" target="_blank">
          <TwitterIcon />
        </IconButton>
        <IconButton href="https://www.linkedin.com/in/daniel-tressel/" target="_blank">
          <LinkedInIcon />
        </IconButton>
        <IconButton href="https://github.com/dtressel/Bubbling_Words" target="_blank">
          <GitHubIcon />
        </IconButton>
        <IconButton href="mailto:dtresseldev@gmail.com">
          <EmailIcon />
        </IconButton>
      </div>
      <div className="Footer-copyright">
        <div>&copy; 2023 Daniel Tressel. All rights reserved.</div>
      </div>
    </div>
  )
}

export default Footer;