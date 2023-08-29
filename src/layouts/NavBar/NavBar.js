import { useState, useContext } from "react";
import UserContext from "../../contexts/UserContext";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link as ReactRouterLink } from "react-router-dom";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import './NavBar.css';

const barLinks = ["Play", "Leaderboards"];
const noUserLinks = ["Login", "Register"];
const learnLinks = ["How To Play", "Strategies", "About"];
const pages = ["Play", "Leaderboards", "How To Play", "Strategies", "About"];
const settings = ["Profile", "Change Password"];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElLearn, setAnchorElLearn] = useState(null);

  const { currentUser, logoutUser } = useContext(UserContext);

  const pageToRouteKey = {
    Play: "play",
    Leaderboards: "leaderboards",
    Login: "login",
    Register: "register",
    "How To Play": "how-to-play",
    Strategies: "strategies",
    About: "about",
    Profile: `babblers/${currentUser && currentUser.username}`,
    "Change Password": "change-password"
  }

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleOpenLearnMenu = (event) => {
    setAnchorElLearn(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseLearnMenu = () => {
    setAnchorElLearn(null);
  };

  const handleLogout = () => {
    setAnchorElUser(null);
    logoutUser();
  }

  return (
    // Div to contain whole app bar
    <Box sx={{display: "flex", justifyContent: "center" }}>
      <AppBar
        position="static"
        className="NavBar"
      >
        {/* Container for all app bar content */}
        <Container maxWidth="xl">
          <Toolbar disableGutters className="NavBar-useable-space">

            {/* Left links in desktop mode */}
            <Box className="NavBar-left-links" sx={{ flexGrow: 1, display: { xs: "none", lg: "flex" } }}>
              {barLinks.map((page) => (
                <Button
                  className="NavBar-links"
                  component={ReactRouterLink}
                  to={`/${pageToRouteKey[page]}`}
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, display: "block" }}
                >
                  {page}
                </Button>
              ))}

              {/* Learn button */}
              <Button
                className="NavBar-links"
                key="Learn"
                onClick={handleOpenLearnMenu}
                sx={{ my: 2, display: "flex" }}
              >
                Learn
                <ArrowDropDownIcon />
              </Button>

              {/* Learn menu */}    
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElLearn}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
                open={Boolean(anchorElLearn)}
                onClose={handleCloseLearnMenu}
              >
                {learnLinks.map((link) => (
                  <MenuItem 
                    component={ReactRouterLink} 
                    to={`/${pageToRouteKey[link]}`}
                    key={link} 
                    onClick={handleCloseLearnMenu} 
                  >
                    <Typography textAlign="center">{link}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Hamburger Icon in Mobile Mode */}
            <Box
              className="NavBar-hamburger-wrapper"
              sx={{
                flexGrow: 1,
                display: { xs: "flex", lg: "none" },
              }}
            >
              <IconButton
                className="NavBar-hamburger"
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
              >
                <MenuIcon />
              </IconButton>

              {/* Hamburger Menu */}
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left"
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left"
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", lg: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem 
                    component={ReactRouterLink} 
                    to={`/${pageToRouteKey[page]}`}
                    key={page} 
                    onClick={handleCloseNavMenu}
                  >
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Center Logo */}
            <Box className="NavBar-logo">
              <div className="logo-bubble-1"></div>
              <div className="logo-bubble-2"></div>
              <div className="logo-bubble-3"></div>
              <Typography
                className="NavBar-logo-text"
                variant="h6"
                noWrap
                component={ReactRouterLink}
                to="/"
              >
                Babblin' Bubbles
              </Typography>
            </Box>
              
            {/* User Icon */}
            {currentUser && 
              <Box sx={{ flexGrow: 0 }} className="NavBar-user-icon">
                <Tooltip title="Open User Info">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={currentUser.username.toUpperCase()} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>

                {/* User Menu */}
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right"
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem 
                      component={ReactRouterLink} 
                      to={`/${pageToRouteKey[setting]}`}
                      key={setting} 
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem 
                    component={ReactRouterLink} 
                    to='/'
                    key='Logout'
                    onClick={handleLogout}
                  >
                    <Typography textAlign="center">Logout</Typography>
                </MenuItem>
                </Menu>
              </Box>
            }

            {!currentUser && 
              <>
                {/* Login/Register buttons in desktop mode */}
                <Box className="NavBar-login-reg-container" sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' }}}>
                {noUserLinks.map((page) => (
                  <Button
                    className="NavBar-links"
                    component={ReactRouterLink}
                    to={`/${pageToRouteKey[page]}`}
                    key={page}
                    sx={{ my: 2 }}
                  >
                    {page}
                  </Button>
                ))}
                </Box>

                {/* User Menu tooltip with login/register in mobile mode */}    
                <Box className="NavBar-user-icon" sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
                  <Tooltip title="Click to login">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar src="/static/images/avatar/2.jpg" />
                    </IconButton>
                  </Tooltip>

                  {/* User Menu with login/register in mobile mode */}
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right"
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right"
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    {noUserLinks.map((link) => (
                      <MenuItem 
                        component={ReactRouterLink} 
                        to={`/${pageToRouteKey[link]}`}
                        key={link} 
                        onClick={handleCloseUserMenu}
                      >
                        <Typography textAlign="center">{link}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </>
            }

          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

export default NavBar;