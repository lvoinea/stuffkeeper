import React from 'react';
import { BrowserRouter, Route, Routes, Redirect } from 'react-router-dom';

import './App.css';
import Login from './components/Login';
import ItemsView from './views/ItemsView';
import StatsView from './views/StatsView';
import NotFoundView from './views/NotFoundView';
import useToken from './hooks/useToken';

function App() {
  const { token, setToken } = useToken();

  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <div className='wrapper'>
      <h1>Application</h1>
      <BrowserRouter>
        <Routes>
          <Route index element={<ItemsView />} />
          <Route path="/items" element={<ItemsView />} />
          <Route path="/stats" element={<StatsView />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
