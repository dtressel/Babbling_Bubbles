import './App.css';
import { createBrowserRouter ,RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    loader: null,
    children: [
      {
        path: "home",
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
