import NavBar from "../NavBar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";
import UserContext from '../../contexts/UserContext';
import useCurrentUser from "../../hooks/useCurrentUser";
import './AppLayout.css';

const AppLayout = () => {
  const currentUserValueAndMethods = useCurrentUser();

  return (
    <>
      <UserContext.Provider value={currentUserValueAndMethods}>
        <NavBar />
        <Container component="main" maxWidth="xl">
          <Outlet />
        </Container>
      </UserContext.Provider>
      <Footer />
    </>
  )
}

export default AppLayout;