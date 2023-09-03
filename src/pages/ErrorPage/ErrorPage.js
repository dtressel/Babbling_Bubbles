import Button from '@mui/material/Button';
import { Link as ReactRouterLink } from "react-router-dom";
import "./ErrorPage.css";

const ErrorPage = () => {
  return (
    <div className="ErrorPage">
      <h2>Yikes!</h2>
      <p>The page you were trying to reach does not exist or something else went wrong!</p>
      <Button
        className="ErrorPage-home-button"
        variant="contained"
        component={ReactRouterLink}
        to="/"
      >Return Home</Button>
    </div>

  )
}

export default ErrorPage;