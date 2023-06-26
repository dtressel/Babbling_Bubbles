import './App.css';
import { createBrowserRouter ,RouterProvider } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import HowToPlay from './pages/HowToPlay';
import Play from './page/Play';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    loader: null,
    children: [
      {
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
        path: "profile",
        element: <Profile />,
        loader: null,
      },
      {
        path: "leaderboard",
        element: <Leaderboard />,
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
