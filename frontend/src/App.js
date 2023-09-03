import React, {useEffect} from 'react';
import { useDispatch } from 'react-redux'
import { createBrowserRouter, RouterProvider} from "react-router-dom";

import Root from './components/Root';
import SignOut from './components/SignOut';
import ErrorPage from "./components/ErrorPage";
import ItemsView from './views/Items';
import ItemView from './views/ItemView';
import ItemEdit from './views/ItemEdit';
import StatsView from './views/StatsView';
import AdminView from './views/AdminView';

import {setToken} from './services/store';
import {getToken} from './services/token';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const stored_token = getToken();
    dispatch(setToken(stored_token));
  },[dispatch])

  const router = createBrowserRouter([
  {
    path: "/logout",
    element: <SignOut />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            element: <ItemsView />,
          },
          {
            path: "/items/:id",
            element: <ItemView />,
          },
          {
            path: "/items/:id/edit",
            element: <ItemEdit />,
          },
          {
            path: "/stats",
            element: <StatsView />,
          },
          {
            path: "/admin",
            element: <AdminView />,
          }
        ]
      }
    ]
  }]);

  return <RouterProvider router={router} />

}

export default App;
