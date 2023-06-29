import NavBar from "../NavBar/NavBar";
import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";

const AppLayout = () => {
  return (
    <>
      <NavBar />
      <Container component="main" maxWidth="xl">
        <Outlet />
      </Container>
    </>
  )
}

export default AppLayout;