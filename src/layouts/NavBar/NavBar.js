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

const barLinks = ["Play", "Leaderboards"];
const noUserLinks = ["Login", "Register"];
const learnLinks = ["How To Play", "Strategies", "About"];
const pages = ["Play", "Leaderboards", "How To Play", "Strategies", "About"];
const settings = ["Stats", "Profile"];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElLearn, setAnchorElLearn] = useState(null);

  const { currentUser, logoutUser } = useContext(UserContext);

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

  return (
    // Div to contain whole app bar
    <Box sx={{display: "flex", justifyContent: "center" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "rgb(61, 133, 198)", borderRadius: "0.15rem", width: "calc(100% - 8px)" }}
      >
        {/* Container for all app bar content */}
        <Container maxWidth="xl">
          <Toolbar disableGutters>

            {/* Left links in desktop mode */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {barLinks.map((page) => (
                <Button
                  component={ReactRouterLink}
                  to={`/${page.toLowerCase().replaceAll(' ', '-')}`}
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              ))}

              {/* Learn button */}
              <Button
                key="Learn"
                onClick={handleOpenLearnMenu}
                sx={{ my: 2, color: "white", display: "flex" }}
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
                    to={`/${link.toLowerCase().replaceAll(' ', '-')}`}
                    key={link} 
                    onClick={handleCloseLearnMenu} 
                  >
                    <Typography textAlign="center">{link}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Center Icon in desktop mode */}
            <Typography
              variant="h6"
              noWrap
              component={ReactRouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
                flexGrow: 2
              }}
            >
              Babbling Bubbles (big)
            </Typography>

            {/* Hamburger Icon in Mobile Mode */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "flex", md: "none" },
              }}
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
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
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem 
                    component={ReactRouterLink} 
                    to={`/${page.toLowerCase().replaceAll(' ', '-')}`}
                    key={page} 
                    onClick={handleCloseNavMenu}
                  >
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Center Icon in mobile mode */}
            <Typography
              variant="h5"
              noWrap
              component={ReactRouterLink}
              to=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none"
              }}
            >
              Babbling Bubbles (small)
            </Typography>
              
            {/* User Icon */}
            {currentUser && 
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open User Info">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
                      to={`/${setting.toLowerCase().replaceAll(' ', '-')}`}
                      key={setting} 
                      onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                  <MenuItem 
                    component={ReactRouterLink} 
                    to={'/logout'}
                    key='Logout'
                    onClick={logoutUser}
                  >
                    <Typography textAlign="center">Logout</Typography>
                </MenuItem>
                </Menu>
              </Box>
            }

            {!currentUser && 
              <>
                {/* Login/Register buttons in desktop mode */}
                <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' }}}>
                {noUserLinks.map((page) => (
                  <Button
                    component={ReactRouterLink}
                    to={`/${page.toLowerCase().replaceAll(' ', '-')}`}
                    key={page}
                    sx={{ my: 2, color: "white" }}
                  >
                    {page}
                  </Button>
                ))}
                </Box>

                <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
                  <Tooltip title="Open User Info">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
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
                        to={`/${link.toLowerCase().replaceAll(' ', '-')}`}
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