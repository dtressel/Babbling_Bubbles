import NavBar from "../NavBar";
import Footer from "../Footer";
import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";
import './AppLayout.css';

const AppLayout = () => {
  return (
    <>
      <NavBar />
      <Container component="main" maxWidth="xl">
        <Outlet />
      </Container>
      <Footer />
    </>
  )
}

export default AppLayout;