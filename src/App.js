import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import HowToPlay from './pages/HowToPlay';
import Play from './pages/Play';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboards from './pages/Leaderboards';
import Strategies from './pages/Strategies';
import About from './pages/About';
import ChangePassword from './pages/ChangePassword';
import UpdateUser from './pages/UpdateUser';
import ErrorPage from './pages/ErrorPage';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    loader: null,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: null,
      },
      {
        path: "how-to-play",
        element: <HowToPlay />,
        loader: null,
      },
      {
        path: "play",
        element: <Play />,
        loader: null,
      },
      {
        path: "login",
        element: <Login />,
        loader: null,
      },
      {
        path: "register",
        element: <Register />,
        loader: null,
      },
      {
        path: "babblers/:username",
        element: <Profile />,
        loader: null,
      },
      {
        path: "leaderboards",
        element: <Leaderboards />,
        loader: null,
      },
      {
        path: "strategies",
        element: <Strategies />,
        loader: null,
      },
      {
        path: "about",
        element: <About />,
        loader: null,
      },
      {
        path: "change-password",
        element: <ChangePassword />,
        loader: null,
      },
      {
        path: "update-user",
        element: <UpdateUser />,
        loader: null,
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
